import { loadImage, quantizeInPlace } from "./pixelize";
import { isolateSubject } from "./segment";

export type DollProgress = (stage: string, ratio: number) => void;

export interface DollOptions {
  isolate: boolean;
  width?: number;
  onProgress?: DollProgress;
}

interface ContentBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Turn a photo into a faithful pixel character.
 *
 * The old implementation sampled a few colors and redrew every person with the
 * same doll template. This pipeline keeps the isolated silhouette, hairstyle,
 * clothes and pose, then applies a restrained palette and hand-pixelled outline.
 */
export async function makePixelDollFromImage(
  dataUrl: string,
  options: DollOptions,
): Promise<string> {
  const progress = options.onProgress ?? (() => {});
  progress("load", 0.05);

  let src = dataUrl;
  if (options.isolate) {
    progress("isolate", 0.14);
    try {
      src = await isolateSubject(dataUrl);
    } catch {
      // A detailed pixel treatment is still useful when segmentation is not
      // available, so keep the original image as a graceful fallback.
    }
  }

  progress("analyze", 0.56);
  const img = await loadImage(src);
  const source = readSource(img);
  const box = contentBox(source.data.data, source.canvas.width, source.canvas.height);

  const gridW = clamp(Math.round(options.width ?? 64), 24, 128);
  const gridH = Math.round(gridW * 1.48);
  const small = document.createElement("canvas");
  small.width = gridW;
  small.height = gridH;
  const ctx = small.getContext("2d", { willReadFrequently: true })!;
  ctx.clearRect(0, 0, gridW, gridH);

  const srcW = Math.max(1, box.maxX - box.minX + 1);
  const srcH = Math.max(1, box.maxY - box.minY + 1);
  const insetX = Math.max(2, Math.round(gridW * 0.055));
  const insetTop = Math.max(2, Math.round(gridH * 0.035));
  const insetBottom = Math.max(3, Math.round(gridH * 0.055));
  const scale = Math.min(
    (gridW - insetX * 2) / srcW,
    (gridH - insetTop - insetBottom) / srcH,
  );
  const dw = Math.max(1, Math.round(srcW * scale));
  const dh = Math.max(1, Math.round(srcH * scale));
  const dx = Math.round((gridW - dw) / 2);
  const dy = gridH - insetBottom - dh;

  // A smoothed reduction retains facial and clothing information before the
  // palette is deliberately snapped to pixel-art colors.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    source.canvas,
    box.minX,
    box.minY,
    srcW,
    srcH,
    dx,
    dy,
    dw,
    dh,
  );

  progress("draw", 0.76);
  const pixels = ctx.getImageData(0, 0, gridW, gridH);
  normalizeAlpha(pixels);
  const paletteSize = gridW >= 112 ? 56 : gridW >= 88 ? 40 : gridW >= 56 ? 30 : gridW >= 36 ? 20 : 12;
  quantizeInPlace(pixels, paletteSize);
  addPixelOutline(pixels, gridW, gridH);
  addSelectiveDetail(pixels, gridW, gridH);
  ctx.putImageData(pixels, 0, 0);

  // Keep every source pixel crisp in the stored skin. The pet renderer can
  // scale this PNG down without destroying the authored pixel grid.
  const upscale = gridW >= 56 ? 3 : gridW >= 36 ? 4 : 5;
  const out = document.createElement("canvas");
  out.width = gridW * upscale;
  out.height = gridH * upscale;
  const outCtx = out.getContext("2d")!;
  outCtx.imageSmoothingEnabled = false;
  outCtx.clearRect(0, 0, out.width, out.height);
  outCtx.drawImage(small, 0, 0, out.width, out.height);

  progress("done", 1);
  return out.toDataURL("image/png");
}

function readSource(img: HTMLImageElement): {
  canvas: HTMLCanvasElement;
  data: ImageData;
} {
  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;
  const maxSide = 720;
  const scale = Math.min(1, maxSide / Math.max(naturalW, naturalH));
  const w = Math.max(1, Math.round(naturalW * scale));
  const h = Math.max(1, Math.round(naturalH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  unsharpMask(data, 2, 0.8); // sharpen blurry sources before pixelization
  ctx.putImageData(data, 0, 0);
  return { canvas, data };
}

/** Unsharp mask: sharpened = original + amount * (original - blurred).
 *  Helps blurry source photos keep edges and facial detail after pixelization. */
function unsharpMask(image: ImageData, radius: number, amount: number) {
  if (radius < 1) return;
  const blurred = boxBlur(image.data, image.width, image.height, radius);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue; // skip transparent
    for (let c = 0; c < 3; c++) {
      const v = data[i + c] + amount * (data[i + c] - blurred[i + c]);
      data[i + c] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
}

/** Separable box blur (radius = window half-size). Returns a new RGBA buffer. */
function boxBlur(
  src: Uint8ClampedArray,
  w: number,
  h: number,
  radius: number,
): Uint8ClampedArray {
  const horiz = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0, cnt = 0;
      for (let dx = -radius; dx <= radius; dx++) {
        const xx = x + dx;
        if (xx < 0 || xx >= w) continue;
        const i = (row + xx) * 4;
        r += src[i]; g += src[i + 1]; b += src[i + 2]; a += src[i + 3]; cnt++;
      }
      const oi = (row + x) * 4;
      horiz[oi] = r / cnt; horiz[oi + 1] = g / cnt; horiz[oi + 2] = b / cnt; horiz[oi + 3] = a / cnt;
    }
  }
  const out = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0, cnt = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        const i = (yy * w + x) * 4;
        r += horiz[i]; g += horiz[i + 1]; b += horiz[i + 2]; a += horiz[i + 3]; cnt++;
      }
      const oi = (y * w + x) * 4;
      out[oi] = r / cnt; out[oi + 1] = g / cnt; out[oi + 2] = b / cnt; out[oi + 3] = a / cnt;
    }
  }
  return out;
}

function contentBox(
  data: Uint8ClampedArray,
  w: number,
  h: number,
): ContentBox {
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] < 28) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return { minX: 0, minY: 0, maxX: w - 1, maxY: h - 1 };
  }

  const padX = Math.max(1, Math.round((maxX - minX + 1) * 0.025));
  const padY = Math.max(1, Math.round((maxY - minY + 1) * 0.02));
  return {
    minX: clamp(minX - padX, 0, w - 1),
    minY: clamp(minY - padY, 0, h - 1),
    maxX: clamp(maxX + padX, 0, w - 1),
    maxY: clamp(maxY + padY, 0, h - 1),
  };
}

function normalizeAlpha(image: ImageData) {
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 42) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    } else {
      // Pixel characters read more cleanly with decisive alpha steps.
      data[i + 3] = a < 150 ? 190 : 255;
    }
  }
}

function addPixelOutline(image: ImageData, w: number, h: number) {
  const src = new Uint8ClampedArray(image.data);
  const { data } = image;
  const neighbors = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1],
  ] as const;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (src[i + 3] !== 0) continue;

      let rr = 0;
      let gg = 0;
      let bb = 0;
      let count = 0;
      for (const [ox, oy] of neighbors) {
        const nx = x + ox;
        const ny = y + oy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const ni = (ny * w + nx) * 4;
        if (src[ni + 3] < 150) continue;
        rr += src[ni];
        gg += src[ni + 1];
        bb += src[ni + 2];
        count++;
      }
      if (count === 0) continue;

      const localR = rr / count;
      const localG = gg / count;
      const localB = bb / count;
      data[i] = Math.round(localR * 0.22 + 12);
      data[i + 1] = Math.round(localG * 0.22 + 15);
      data[i + 2] = Math.round(localB * 0.24 + 22);
      data[i + 3] = 255;
    }
  }
}

/** Add sparse dark pixels at strong internal boundaries without tracing every
 * photographic edge. This keeps eyes, hair locks and clothing seams legible. */
function addSelectiveDetail(image: ImageData, w: number, h: number) {
  const src = new Uint8ClampedArray(image.data);
  const { data } = image;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      if (src[i + 3] < 240) continue;
      const right = i + 4;
      const down = i + w * 4;
      if (src[right + 3] < 240 || src[down + 3] < 240) continue;

      const edge = Math.max(colorDelta(src, i, right), colorDelta(src, i, down));
      if (edge < 86 || (x + y) % 3 !== 0) continue;

      const lum = luminance(src[i], src[i + 1], src[i + 2]);
      const otherLum = Math.min(
        luminance(src[right], src[right + 1], src[right + 2]),
        luminance(src[down], src[down + 1], src[down + 2]),
      );
      if (lum > otherLum + 10) continue;

      data[i] = Math.round(data[i] * 0.58);
      data[i + 1] = Math.round(data[i + 1] * 0.58);
      data[i + 2] = Math.round(data[i + 2] * 0.62);
    }
  }
}

function colorDelta(data: Uint8ClampedArray, a: number, b: number): number {
  const dr = data[a] - data[b];
  const dg = data[a + 1] - data[b + 1];
  const db = data[a + 2] - data[b + 2];
  return Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11);
}

function luminance(r: number, g: number, b: number): number {
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
