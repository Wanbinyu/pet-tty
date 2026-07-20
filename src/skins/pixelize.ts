import type { PixelizeOptions } from "./types";

export type PixelQuality = "fine" | "standard" | "chunky";

export const QUALITY_PRESETS: Record<
  PixelQuality,
  { size: number; colors: number; upscale: number }
> = {
  /** denser grid, more colors — closer to illustration */
  fine: { size: 64, colors: 32, upscale: 3 },
  standard: { size: 40, colors: 16, upscale: 4 },
  chunky: { size: 24, colors: 10, upscale: 5 },
};

/**
 * Downsample + palette reduction. Preserves alpha (transparent stays transparent).
 */
export async function pixelizeDataUrl(
  dataUrl: string,
  options: PixelizeOptions & { upscale?: number },
): Promise<string> {
  const img = await loadImage(dataUrl);
  const size = Math.max(8, Math.min(128, Math.round(options.size)));
  const colors = Math.max(2, Math.min(64, Math.round(options.colors)));
  const upscale = Math.max(2, Math.min(8, options.upscale ?? 4));

  const aspect = img.height / img.width || 1;
  const w = size;
  const h = Math.max(8, Math.round(size * aspect));

  const small = document.createElement("canvas");
  small.width = w;
  small.height = h;
  const sctx = small.getContext("2d", { willReadFrequently: true })!;
  sctx.imageSmoothingEnabled = true;
  sctx.clearRect(0, 0, w, h);
  sctx.drawImage(img, 0, 0, w, h);

  const imageData = sctx.getImageData(0, 0, w, h);
  quantizeInPlace(imageData, colors);
  sctx.putImageData(imageData, 0, 0);

  const display = document.createElement("canvas");
  display.width = w * upscale;
  display.height = h * upscale;
  const dctx = display.getContext("2d")!;
  dctx.imageSmoothingEnabled = false;
  dctx.clearRect(0, 0, display.width, display.height);
  dctx.drawImage(small, 0, 0, display.width, display.height);

  return display.toDataURL("image/png");
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Fit image into square canvas (keeps transparency). */
export async function normalizeImport(
  dataUrl: string,
  maxSide = 320,
): Promise<string> {
  const img = await loadImage(dataUrl);
  const side = Math.min(maxSide, Math.max(img.width, img.height, 64));
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, side, side);

  const scale = Math.min(side / img.width, side / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (side - dw) / 2;
  const dy = (side - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
  return canvas.toDataURL("image/png");
}

function quantizeInPlace(imageData: ImageData, maxColors: number) {
  const { data } = imageData;
  const pixels: number[][] = [];

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 16) {
      data[i] = data[i + 1] = data[i + 2] = 0;
      data[i + 3] = 0;
      continue;
    }
    pixels.push([data[i], data[i + 1], data[i + 2], i, a]);
  }

  if (pixels.length === 0) return;

  const buckets = medianCut(pixels, maxColors);
  const palette = buckets.map((b) => averageColor(b));

  for (const p of pixels) {
    const idx = p[3];
    const nearest = nearestColor(p[0], p[1], p[2], palette);
    data[idx] = nearest[0];
    data[idx + 1] = nearest[1];
    data[idx + 2] = nearest[2];
    data[idx + 3] = p[4]; // preserve alpha
  }
}

type Pixel = number[]; // [r,g,b,index,a?]

function medianCut(pixels: Pixel[], maxColors: number): Pixel[][] {
  let buckets: Pixel[][] = [pixels];
  while (buckets.length < maxColors) {
    buckets.sort((a, b) => channelRange(b) - channelRange(a));
    const largest = buckets.shift();
    if (!largest || largest.length < 2) {
      if (largest) buckets.push(largest);
      break;
    }
    const ch = dominantChannel(largest);
    largest.sort((a, b) => a[ch] - b[ch]);
    const mid = Math.floor(largest.length / 2);
    buckets.push(largest.slice(0, mid), largest.slice(mid));
  }
  return buckets;
}

function channelRange(pixels: Pixel[]): number {
  let rMin = 255,
    rMax = 0,
    gMin = 255,
    gMax = 0,
    bMin = 255,
    bMax = 0;
  for (const p of pixels) {
    rMin = Math.min(rMin, p[0]);
    rMax = Math.max(rMax, p[0]);
    gMin = Math.min(gMin, p[1]);
    gMax = Math.max(gMax, p[1]);
    bMin = Math.min(bMin, p[2]);
    bMax = Math.max(bMax, p[2]);
  }
  return Math.max(rMax - rMin, gMax - gMin, bMax - bMin);
}

function dominantChannel(pixels: Pixel[]): 0 | 1 | 2 {
  let rMin = 255,
    rMax = 0,
    gMin = 255,
    gMax = 0,
    bMin = 255,
    bMax = 0;
  for (const p of pixels) {
    rMin = Math.min(rMin, p[0]);
    rMax = Math.max(rMax, p[0]);
    gMin = Math.min(gMin, p[1]);
    gMax = Math.max(gMax, p[1]);
    bMin = Math.min(bMin, p[2]);
    bMax = Math.max(bMax, p[2]);
  }
  const rr = rMax - rMin;
  const gg = gMax - gMin;
  const bb = bMax - bMin;
  if (rr >= gg && rr >= bb) return 0;
  if (gg >= rr && gg >= bb) return 1;
  return 2;
}

function averageColor(pixels: Pixel[]): [number, number, number] {
  let r = 0,
    g = 0,
    b = 0;
  for (const p of pixels) {
    r += p[0];
    g += p[1];
    b += p[2];
  }
  const n = pixels.length;
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

function nearestColor(
  r: number,
  g: number,
  b: number,
  palette: [number, number, number][],
): [number, number, number] {
  let best = palette[0];
  let bestD = Infinity;
  for (const c of palette) {
    const d =
      (c[0] - r) * (c[0] - r) +
      (c[1] - g) * (c[1] - g) +
      (c[2] - b) * (c[2] - b);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}
