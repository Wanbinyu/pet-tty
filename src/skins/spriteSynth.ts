/** Synthesize an animated sprite skin from a single image.
 *
 * A single imported image has no action frames, so we bake per-state motion
 * (breathing / tilt / hop / shake / sway) into PNG sequences by transforming
 * the source image across N frames per agent state. The result is a sprite
 * skin (blobs in IndexedDB) that animates like a DyberPet mod, letting any
 * image character "do actions" per Claude state.
 *
 * Best with a transparent-background character PNG; a rectangular photo will
 * bounce as a rectangle (isolate it first if needed). */
import type { AgentState } from "../events/types";
import type { SkinMeta, SpriteManifest, SpriteState } from "./types";
import { loadImage } from "./pixelize";
import * as spriteStore from "./spriteStore";

const TAU = Math.PI * 2;
const CANVAS_W = 180;
const CANVAS_H = 240;
const FIT_H = 0.52; // character fills ~3/5 of the frame so it stays clear of the bubble

interface Motion {
  sx: number;
  sy: number;
  rot: number; // degrees
  dx: number;
  dy: number;
}
type MotionFn = (t: number) => Motion;

/** Per-state motion, parameterized by t in [0, 1) across the loop. */
const MOTIONS: Record<AgentState, MotionFn> = {
  idle: (t) => ({ sx: 1, sy: 1 + Math.sin(t * TAU) * 0.03, rot: 0, dx: 0, dy: 0 }),
  thinking: (t) => ({ sx: 1, sy: 1, rot: Math.sin(t * TAU) * 5, dx: 0, dy: Math.sin(t * TAU) * -2 }),
  tool_call: (t) => ({ sx: 1, sy: 1, rot: Math.sin(t * TAU * 2) * 2, dx: 0, dy: -Math.abs(Math.sin(t * TAU)) * 3 }),
  editing: (t) => ({ sx: 1, sy: 1, rot: Math.sin(t * TAU) * 3, dx: Math.sin(t * TAU) * 2, dy: 0 }),
  waiting_user: (t) => ({ sx: 1, sy: 1, rot: 0, dx: Math.sin(t * TAU) * 6, dy: 0 }),
  running_tests: (t) => ({ sx: 1, sy: 1, rot: 0, dx: 0, dy: -Math.abs(Math.sin(t * TAU * 2)) * 4 }),
  success: (t) => {
    const hop = Math.sin(t * Math.PI) * 16;
    const squash = t < 0.15 || t > 0.85 ? 1.06 : 1; // squash at launch/land
    return { sx: 2 - squash, sy: squash, rot: 0, dx: 0, dy: -hop };
  },
  error: (t) => ({ sx: 1, sy: 1, rot: 0, dx: Math.sin(t * TAU * 3) * 5, dy: 0 }),
};

const FRAMES: Record<AgentState, number> = {
  idle: 4,
  thinking: 4,
  tool_call: 4,
  editing: 4,
  waiting_user: 4,
  running_tests: 4,
  success: 5,
  error: 4,
};

const FPS: Record<AgentState, number> = {
  idle: 6,
  thinking: 6,
  tool_call: 9,
  editing: 8,
  waiting_user: 5,
  running_tests: 11,
  success: 8,
  error: 12,
};

const STATE_ORDER: AgentState[] = [
  "idle",
  "thinking",
  "tool_call",
  "editing",
  "waiting_user",
  "running_tests",
  "success",
  "error",
];

export interface SynthProgress {
  ratio: number;
  label: string;
}

/** Build an animated sprite skin from a single image by baking per-state
 *  motion into PNG frame sequences. Stores frames in IndexedDB. */
export async function synthesizeSpriteFromImage(
  dataUrl: string,
  name: string,
  onProgress?: (p: SynthProgress) => void,
): Promise<SkinMeta> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(
    CANVAS_W / Math.max(1, img.naturalWidth),
    (CANVAS_H * FIT_H) / Math.max(1, img.naturalHeight),
  );
  const drawW = Math.max(1, Math.round(img.naturalWidth * scale));
  const drawH = Math.max(1, Math.round(img.naturalHeight * scale));
  const pivotX = CANVAS_W / 2;
  const pivotY = CANVAS_H; // feet at the very bottom (moved down ~10 from the old 8px margin)

  const skinId = `synth-${Date.now().toString(36)}`;
  const states: Partial<Record<string, SpriteState>> = {};
  const totalFrames = STATE_ORDER.reduce((n, s) => n + FRAMES[s], 0);
  let done = 0;

  for (const st of STATE_ORDER) {
    const n = FRAMES[st];
    const fn = MOTIONS[st];
    const blobs: Blob[] = [];
    for (let i = 0; i < n; i++) {
      const t = n > 1 ? i / n : 0;
      const blob = await drawFrame(img, drawW, drawH, pivotX, pivotY, fn(t));
      blobs.push(blob);
      done++;
      onProgress?.({ ratio: done / totalFrames, label: `${st} ${done}/${totalFrames}` });
    }
    await spriteStore.saveFrames(skinId, st, blobs);
    states[st] = { frameCount: blobs.length, fps: FPS[st], loop: true };
  }

  const manifest: SpriteManifest = { states };
  return {
    id: skinId,
    nameEn: name,
    nameZh: name,
    kind: "sprite",
    builtin: false,
    manifest,
    createdAt: new Date().toISOString(),
  };
}

async function drawFrame(
  img: HTMLImageElement,
  drawW: number,
  drawH: number,
  pivotX: number,
  pivotY: number,
  m: Motion,
): Promise<Blob> {
  const c = document.createElement("canvas");
  c.width = CANVAS_W;
  c.height = CANVAS_H;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("canvas 2d unavailable");
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.save();
  // pivot at the character's feet (bottom-center); apply motion around it
  ctx.translate(pivotX + m.dx, pivotY + m.dy);
  ctx.rotate((m.rot * Math.PI) / 180);
  ctx.scale(m.sx, m.sy);
  ctx.drawImage(img, -drawW / 2, -drawH, drawW, drawH);
  ctx.restore();
  return new Promise<Blob>((resolve, reject) =>
    c.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png",
    ),
  );
}
