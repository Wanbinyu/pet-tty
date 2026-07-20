import { loadImage } from "./pixelize";

/**
 * Isolate subject (person / mascot) onto transparent background.
 * 1) Prefer @imgly/background-removal when available (better person cutout).
 * 2) Fallback: local edge-sampling + largest opaque component (good for clean BGs).
 * 3) If image already has transparency, keep alpha and just crop to content.
 */

export async function isolateSubject(dataUrl: string): Promise<string> {
  // Prefer ML cutout when the package is installed & models can load
  try {
    const cut = await removeBackgroundImgly(dataUrl);
    if (cut) return cut;
  } catch (e) {
    console.warn("[petdeck] ML background removal failed, using local fallback", e);
  }
  return isolateSubjectLocal(dataUrl);
}

async function removeBackgroundImgly(dataUrl: string): Promise<string | null> {
  // Dynamic import so the app still runs if the dep is missing
  const mod = await import("@imgly/background-removal");
  const blob = await mod.removeBackground(dataUrl, {
    // Smaller model for desktop pet use
    model: "isnet_fp16",
    output: { format: "image/png", quality: 0.9 },
  });
  return await blobToDataUrl(blob);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("blob read failed"));
    r.readAsDataURL(blob);
  });
}

/** Offline fallback: key out border-like colors + keep largest blob */
export async function isolateSubjectLocal(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const { data } = imageData;

  // If already mostly transparent, crop to alpha bounds only
  let transparent = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 16) transparent++;
  }
  const total = data.length / 4;
  if (transparent / total > 0.15) {
    return cropToAlpha(canvas, imageData);
  }

  // Sample border pixels as background palette
  const samples: number[][] = [];
  const step = Math.max(1, Math.floor(Math.min(w, h) / 40));
  for (let x = 0; x < w; x += step) {
    pushRgb(samples, data, x, 0, w);
    pushRgb(samples, data, x, h - 1, w);
  }
  for (let y = 0; y < h; y += step) {
    pushRgb(samples, data, 0, y, w);
    pushRgb(samples, data, w - 1, y, w);
  }
  const bg = average(samples);
  // Threshold: relative to image contrast
  const thr = 42;

  const mask = new Uint8Array(total);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const d = dist(data[i], data[i + 1], data[i + 2], bg);
      // also treat very bright near-white corners as bg for anime arts
      const nearWhite =
        data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245;
      mask[y * w + x] = d > thr && !nearWhite ? 1 : 0;
    }
  }

  // Keep largest connected component (4-connected)
  const keep = largestComponent(mask, w, h);
  for (let p = 0; p < total; p++) {
    if (!keep[p]) {
      const i = p * 4;
      data[i + 3] = 0;
    }
  }
  // Soft edge: erode single-pixel noise already handled by component
  ctx.putImageData(imageData, 0, 0);
  return cropToAlpha(canvas, imageData);
}

function pushRgb(
  out: number[][],
  data: Uint8ClampedArray,
  x: number,
  y: number,
  w: number,
) {
  const i = (y * w + x) * 4;
  out.push([data[i], data[i + 1], data[i + 2]]);
}

function average(samples: number[][]): [number, number, number] {
  let r = 0,
    g = 0,
    b = 0;
  for (const s of samples) {
    r += s[0];
    g += s[1];
    b += s[2];
  }
  const n = Math.max(1, samples.length);
  return [r / n, g / n, b / n];
}

function dist(r: number, g: number, b: number, bg: [number, number, number]) {
  const dr = r - bg[0];
  const dg = g - bg[1];
  const db = b - bg[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function largestComponent(mask: Uint8Array, w: number, h: number): Uint8Array {
  const n = w * h;
  const seen = new Uint8Array(n);
  const keep = new Uint8Array(n);
  let best: number[] = [];
  const qx = new Int32Array(n);
  const qy = new Int32Array(n);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const start = y * w + x;
      if (!mask[start] || seen[start]) continue;
      let head = 0;
      let tail = 0;
      qx[tail] = x;
      qy[tail] = y;
      tail++;
      seen[start] = 1;
      const comp: number[] = [];
      while (head < tail) {
        const cx = qx[head];
        const cy = qy[head];
        head++;
        const ci = cy * w + cx;
        comp.push(ci);
        const nbs = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1],
        ];
        for (const [nx, ny] of nbs) {
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const ni = ny * w + nx;
          if (!mask[ni] || seen[ni]) continue;
          seen[ni] = 1;
          qx[tail] = nx;
          qy[tail] = ny;
          tail++;
        }
      }
      if (comp.length > best.length) best = comp;
    }
  }
  for (const i of best) keep[i] = 1;
  return keep;
}

function cropToAlpha(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
): string {
  const { data, width: w, height: h } = imageData;
  let minX = w,
    minY = h,
    maxX = 0,
    maxY = 0;
  let any = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 16) {
        any = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (!any) return canvas.toDataURL("image/png");

  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  const octx = out.getContext("2d")!;
  octx.drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
  return out.toDataURL("image/png");
}
