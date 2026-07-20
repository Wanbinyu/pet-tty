import { loadImage } from "./pixelize";
import { isolateSubject } from "./segment";

export type DollProgress = (stage: string, ratio: number) => void;

export interface DollOptions {
  isolate: boolean;
  width?: number;
  onProgress?: DollProgress;
}

interface ZoneColors {
  hair: string;
  skin: string;
  outline: string;
  clothMain: string;
  clothAccent: string;
  legs: string;
  shoes: string;
  eye: string;
}

type RGB = [number, number, number];

/**
 * Build a chibi pixel doll from photo colors + proportions — not a mosaic.
 * Skin and hair are separated with skin-tone heuristics so hair isn't used as face.
 */
export async function makePixelDollFromImage(
  dataUrl: string,
  options: DollOptions,
): Promise<string> {
  const progress = options.onProgress ?? (() => {});
  progress("load", 0.05);

  let src = dataUrl;
  if (options.isolate) {
    progress("isolate", 0.15);
    try {
      src = await isolateSubject(dataUrl);
    } catch {
      /* keep original */
    }
  }
  progress("analyze", 0.55);

  const img = await loadImage(src);
  const analysis = analyzeReference(img);
  progress("draw", 0.75);

  const w = Math.max(24, Math.min(64, options.width ?? 32));
  const h = Math.round(w * 1.5);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);

  drawChibi(ctx, w, h, analysis.colors, analysis.headRatio);
  progress("done", 1);

  const scale = 4;
  const out = document.createElement("canvas");
  out.width = w * scale;
  out.height = h * scale;
  const octx = out.getContext("2d")!;
  octx.imageSmoothingEnabled = false;
  octx.drawImage(canvas, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}

function analyzeReference(img: HTMLImageElement): {
  colors: ZoneColors;
  headRatio: number;
} {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  const box = contentBox(data, w, h);
  const { minX, minY, maxX, maxY } = box;
  const bh = Math.max(1, maxY - minY + 1);
  const bw = Math.max(1, maxX - minX + 1);
  const midX = (minX + maxX) / 2;

  // --- Head band (top ~34% of subject) ---
  const headY0 = minY;
  const headY1 = minY + Math.floor(bh * 0.34);
  // Face: center of lower head (cheeks), prefer skin-like
  const faceY0 = minY + Math.floor(bh * 0.14);
  const faceY1 = minY + Math.floor(bh * 0.32);
  const faceX0 = midX - bw * 0.18;
  const faceX1 = midX + bw * 0.18;
  // Hair: top crown + side strips, prefer NON-skin
  const hairTop = samplePrefer(
    data,
    w,
    h,
    minX,
    headY0,
    maxX,
    minY + Math.floor(bh * 0.16),
    "nonskin",
  );
  const hairSideL = samplePrefer(
    data,
    w,
    h,
    minX,
    minY + Math.floor(bh * 0.08),
    minX + bw * 0.22,
    headY1,
    "nonskin",
  );
  const hairSideR = samplePrefer(
    data,
    w,
    h,
    maxX - bw * 0.22,
    minY + Math.floor(bh * 0.08),
    maxX,
    headY1,
    "nonskin",
  );
  let hair = pickBest([hairTop, hairSideL, hairSideR], "nonskin") ?? [70, 60, 55];

  let skin =
    samplePrefer(data, w, h, faceX0, faceY0, faceX1, faceY1, "skin") ??
    samplePrefer(
      data,
      w,
      h,
      midX - bw * 0.12,
      minY + bh * 0.18,
      midX + bw * 0.12,
      minY + bh * 0.3,
      "skin",
    ) ??
    [235, 195, 175];

  // If skin still looks like hair (too dark / low chroma), force default skin
  if (!isSkinTone(skin) && isSkinTone(shade(skin, 1.15))) {
    skin = shade(skin, 1.12);
  }
  if (!isSkinTone(skin)) {
    // try wider center lower face
    skin =
      samplePrefer(
        data,
        w,
        h,
        midX - bw * 0.2,
        minY + bh * 0.2,
        midX + bw * 0.2,
        minY + bh * 0.36,
        "skin",
      ) ?? ([235, 195, 175] as RGB);
  }

  // Hair must differ from skin
  if (colorDist(hair, skin) < 35 || isSkinTone(hair)) {
    // re-sample top corners only
    hair =
      samplePrefer(
        data,
        w,
        h,
        minX,
        minY,
        minX + bw * 0.35,
        minY + bh * 0.12,
        "nonskin",
      ) ??
      samplePrefer(
        data,
        w,
        h,
        maxX - bw * 0.35,
        minY,
        maxX,
        minY + bh * 0.12,
        "nonskin",
      ) ??
      shade(skin, 0.45);
  }
  if (colorDist(hair, skin) < 28) {
    hair = shade(hair, 0.55);
  }

  // Body zones
  const cloth =
    samplePrefer(
      data,
      w,
      h,
      midX - bw * 0.25,
      minY + bh * 0.4,
      midX + bw * 0.25,
      minY + bh * 0.68,
      "any",
    ) ?? ([90, 150, 200] as RGB);

  const accent =
    samplePrefer(
      data,
      w,
      h,
      minX + bw * 0.05,
      minY + bh * 0.42,
      minX + bw * 0.28,
      minY + bh * 0.65,
      "any",
    ) ?? shade(cloth, 0.8);

  const legs =
    samplePrefer(
      data,
      w,
      h,
      midX - bw * 0.15,
      minY + bh * 0.7,
      midX + bw * 0.15,
      minY + bh * 0.88,
      "any",
    ) ?? shade(skin, 0.92);

  const shoes =
    samplePrefer(
      data,
      w,
      h,
      midX - bw * 0.2,
      minY + bh * 0.88,
      midX + bw * 0.2,
      maxY,
      "nonskin",
    ) ?? ([45, 42, 48] as RGB);

  // Eyes: darker than skin, not same as hair if possible
  let eye = shade(hair, 0.4);
  if (colorDist(eye, skin) < 40) eye = [40, 50, 60];

  // Head ratio: smaller than before to avoid big square head
  const headRatio = clamp(0.3, 0.26, 0.34);

  return {
    headRatio,
    colors: {
      hair: rgb(hair),
      skin: rgb(skin),
      outline: rgb(shade(hair, 0.32)),
      clothMain: rgb(cloth),
      clothAccent: rgb(accent),
      legs: rgb(isSkinTone(legs) ? legs : shade(skin, 0.9)),
      shoes: rgb(shoes),
      eye: rgb(eye),
    },
  };
}

function contentBox(
  data: Uint8ClampedArray,
  w: number,
  h: number,
): { minX: number; minY: number; maxX: number; maxY: number } {
  let minY = h,
    maxY = 0,
    minX = w,
    maxX = 0;
  let any = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 20) {
        any = true;
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
  }
  if (!any) return { minX: 0, minY: 0, maxX: w - 1, maxY: h - 1 };
  return { minX, minY, maxX, maxY };
}

/** Simple skin-tone heuristic (works for anime + photo-ish) */
function isSkinTone(c: RGB): boolean {
  const [r, g, b] = c;
  // classic: R high, not too blue, not grey
  if (r < 95 || g < 40 || b < 20) return false;
  if (r < g || r < b) return false;
  if (Math.abs(r - g) < 8 && Math.abs(r - b) < 8) return false; // grey
  if (r - g < 8) return false;
  // avoid pure yellow/green
  if (g > r * 0.95 && b < 80) return false;
  // upper bound: very light pink/peach OK
  return r <= 255 && g <= 240 && b <= 220;
}

function samplePrefer(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  mode: "skin" | "nonskin" | "any",
): RGB | null {
  x0 = clamp(Math.floor(x0), 0, w - 1);
  x1 = clamp(Math.floor(x1), 0, w - 1);
  y0 = clamp(Math.floor(y0), 0, h - 1);
  y1 = clamp(Math.floor(y1), 0, h - 1);
  if (x1 < x0 || y1 < y0) return null;

  type Acc = { n: number; r: number; g: number; b: number; score: number };
  const hist = new Map<string, Acc>();

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < 40) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // skip pure white / pure black for clothing samples
      if (r > 250 && g > 250 && b > 250) continue;
      if (r < 12 && g < 12 && b < 12) continue;

      const c: RGB = [r, g, b];
      const skin = isSkinTone(c);
      if (mode === "skin" && !skin) continue;
      if (mode === "nonskin" && skin) continue;

      const key = `${r >> 3},${g >> 3},${b >> 3}`;
      const e = hist.get(key) ?? { n: 0, r: 0, g: 0, b: 0, score: 0 };
      e.n++;
      e.r += r;
      e.g += g;
      e.b += b;
      // prefer more saturated colors for hair/cloth
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      e.score += 1 + sat / 255;
      hist.set(key, e);
    }
  }

  let best: Acc | null = null;
  for (const e of hist.values()) {
    if (!best || e.score > best.score) best = e;
  }
  if (!best || best.n < 3) return null;
  return [
    Math.round(best.r / best.n),
    Math.round(best.g / best.n),
    Math.round(best.b / best.n),
  ];
}

function pickBest(
  list: (RGB | null)[],
  mode: "skin" | "nonskin",
): RGB | null {
  const ok = list.filter((c): c is RGB => {
    if (!c) return false;
    if (mode === "skin") return isSkinTone(c);
    if (mode === "nonskin") return !isSkinTone(c);
    return true;
  });
  if (ok.length === 0) {
    return list.find((c) => c != null) ?? null;
  }
  // prefer higher saturation for hair
  ok.sort((a, b) => sat(b) - sat(a));
  return ok[0];
}

function sat(c: RGB): number {
  return Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]);
}

function colorDist(a: RGB, b: RGB): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function shade(c: RGB, f: number): RGB {
  return [
    clamp(Math.round(c[0] * f), 0, 255),
    clamp(Math.round(c[1] * f), 0, 255),
    clamp(Math.round(c[2] * f), 0, 255),
  ];
}

function rgb(c: RGB): string {
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

/** Rounder chibi head (ellipse mask) + clearer hair layers */
function drawChibi(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  c: ZoneColors,
  headRatio: number,
) {
  const px = (x: number, y: number, col: string, ww = 1, hh = 1) => {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), ww, hh);
  };

  /** fill ellipse with pixel rects */
  const fillEllipse = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    col: string,
  ) => {
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1.05) {
          px(cx + x, cy + y, col);
        }
      }
    }
  };

  const cx = Math.floor(w / 2);
  // Slightly smaller head so it doesn't dominate
  const headH = Math.round(h * Math.min(headRatio, 0.32));
  const headW = Math.round(w * 0.48);
  const headY = Math.round(h * 0.08);
  const headCy = headY + Math.floor(headH / 2);
  const rx = Math.floor(headW / 2);
  const ry = Math.floor(headH / 2);

  // Hair back (larger ellipse)
  fillEllipse(cx, headCy + 1, rx + 2, ry + 2, c.hair);

  // Face (smaller ellipse, skin)
  fillEllipse(cx, headCy + 1, Math.max(3, rx - 1), Math.max(3, ry - 1), c.skin);

  // Bangs: top cap + side locks (hair over face)
  fillEllipse(cx, headY + Math.floor(ry * 0.55), rx + 1, Math.floor(ry * 0.55), c.hair);
  // side hair
  for (let i = 0; i < ry + 2; i++) {
    px(cx - rx - 1, headCy - ry + 2 + i, c.hair, 2, 1);
    px(cx + rx - 1, headCy - ry + 2 + i, c.hair, 2, 1);
  }
  // fringe strands
  px(cx - Math.floor(rx * 0.5), headY + Math.floor(ry * 0.7), c.hair, 2, 3);
  px(cx + Math.floor(rx * 0.2), headY + Math.floor(ry * 0.65), c.hair, 2, 3);

  // Eyes (smaller)
  const eyeY = headCy + 1;
  const eyeS = Math.max(1, Math.floor(w / 18));
  px(cx - Math.floor(rx * 0.35), eyeY, c.eye, eyeS, eyeS + 1);
  px(cx + Math.floor(rx * 0.2), eyeY, c.eye, eyeS, eyeS + 1);
  px(cx - Math.floor(rx * 0.35), eyeY, "#fff", 1, 1);
  px(cx + Math.floor(rx * 0.2), eyeY, "#fff", 1, 1);

  // Blush
  px(cx - Math.floor(rx * 0.45), eyeY + eyeS + 1, "rgba(255,140,140,0.5)", 2, 1);
  px(cx + Math.floor(rx * 0.25), eyeY + eyeS + 1, "rgba(255,140,140,0.5)", 2, 1);

  // Body — narrower than head
  const bodyY = headCy + ry - 1;
  const bodyH = Math.floor(h * 0.26);
  const bodyW = Math.floor(w * 0.36);
  const bodyX = cx - Math.floor(bodyW / 2);
  px(bodyX, bodyY, c.clothMain, bodyW, bodyH);
  px(bodyX, bodyY + Math.floor(bodyH * 0.4), c.clothAccent, bodyW, Math.max(1, Math.floor(bodyH * 0.12)));
  px(bodyX + 1, bodyY, c.skin, bodyW - 2, 2);

  // Arms
  const armW = Math.max(2, Math.floor(w * 0.09));
  const armH = Math.floor(bodyH * 0.8);
  px(bodyX - armW, bodyY + 2, c.clothMain, armW, armH);
  px(bodyX + bodyW, bodyY + 2, c.clothMain, armW, armH);
  px(bodyX - armW, bodyY + armH, c.skin, armW, 2);
  px(bodyX + bodyW, bodyY + armH, c.skin, armW, 2);

  // Skirt
  const skirtY = bodyY + bodyH - 1;
  const skirtH = Math.floor(h * 0.11);
  const skirtW = bodyW + 4;
  px(cx - Math.floor(skirtW / 2), skirtY, c.clothMain, skirtW, skirtH);
  px(cx - Math.floor(skirtW / 2), skirtY + skirtH - 1, c.clothAccent, skirtW, 1);

  // Legs + shoes
  const legY = skirtY + skirtH;
  const legH = Math.floor(h * 0.13);
  const legW = Math.max(2, Math.floor(w * 0.09));
  px(cx - legW - 1, legY, c.legs, legW, legH);
  px(cx + 1, legY, c.legs, legW, legH);
  const shoeH = Math.max(2, Math.floor(h * 0.055));
  px(cx - legW - 2, legY + legH - 1, c.shoes, legW + 2, shoeH);
  px(cx, legY + legH - 1, c.shoes, legW + 2, shoeH);

  // Outline dots on head sides
  px(cx - rx - 1, headCy - 1, c.outline, 1, Math.max(2, Math.floor(ry * 0.6)));
  px(cx + rx, headCy - 1, c.outline, 1, Math.max(2, Math.floor(ry * 0.6)));
}
