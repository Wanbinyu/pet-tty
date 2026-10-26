import type { AgentState } from "../events/types";
import type { SequenceTiming } from "./motionPlayback";

export const MOTION_STATES: AgentState[] = ["idle", "thinking", "tool_call", "editing", "waiting_user", "running_tests", "success", "error"];
export const MOTION_FPS = 24;
export type MotionIntensity = "gentle" | "standard" | "lively";
export const MOTION_CONFIG: Record<AgentState, SequenceTiming> = {
  idle: { frameCount: 48, fps: MOTION_FPS, loop: true },
  thinking: { frameCount: 48, fps: MOTION_FPS, loop: true },
  tool_call: { frameCount: 24, fps: MOTION_FPS, loop: true },
  editing: { frameCount: 48, fps: MOTION_FPS, loop: true },
  waiting_user: { frameCount: 48, fps: MOTION_FPS, loop: false, returnToIdle: true, repeatAfterMs: 8000 },
  running_tests: { frameCount: 24, fps: MOTION_FPS, loop: true },
  success: { frameCount: 36, fps: MOTION_FPS, loop: false, returnToIdle: true },
  error: { frameCount: 24, fps: MOTION_FPS, loop: false, returnToIdle: true },
};
export const TOTAL_MOTION_FRAMES = MOTION_STATES.reduce((sum, state) => sum + MOTION_CONFIG[state].frameCount, 0);
export type PartSlot = "arm" | "legLeft" | "legRight";
export interface PartRegion {
  /** Normalized source-image rectangle and pivot; supplied by a human, never inferred. */
  x: number; y: number; w: number; h: number; px: number; py: number;
  confirmed: boolean;
}
export interface MotionRig {
  capability: "unknown" | "none" | "manual";
  parts: Partial<Record<PartSlot, PartRegion>>;
  intensity?: MotionIntensity;
}
export const EMPTY_RIG: MotionRig = { capability: "unknown", parts: {} };
const TAU = Math.PI * 2;
export const smoothStep = (value: number) => { const x = Math.max(0, Math.min(1, value)); return x * x * (3 - 2 * x); };

export function validPart(p: PartRegion | undefined): p is PartRegion {
  return !!p && p.confirmed && [p.x, p.y, p.w, p.h, p.px, p.py].every(Number.isFinite)
    && p.x >= 0 && p.y >= 0 && p.w >= .01 && p.h >= .01
    && p.x + p.w <= 1.000001 && p.y + p.h <= 1.000001
    && p.px >= p.x && p.px <= p.x + p.w && p.py >= p.y && p.py <= p.y + p.h;
}

export function activeParts(rig: MotionRig): [PartSlot, PartRegion][] {
  if (rig.capability !== "manual") return [];
  const parts = (Object.entries(rig.parts) as [PartSlot, PartRegion][]).filter(([, p]) => validPart(p));
  // Overlapping cutouts would duplicate pixels. Reject both and use whole-image motion.
  return parts.filter(([slot, p]) => !parts.some(([other, q]) => other !== slot
    && p.x < q.x + q.w && p.x + p.w > q.x && p.y < q.y + q.h && p.y + p.h > q.y));
}

export function motionFor(state: AgentState, t: number) {
  const s = Math.sin(t * TAU);
  switch (state) {
    case "idle": return { sx: 1, sy: 1 + (1 - Math.cos(t * TAU)) * .009, rot: 0, dx: 0, dy: 0 };
    case "thinking": return { sx: 1, sy: 1, rot: s * 3, dx: 0, dy: -(1 - Math.cos(t * TAU)) * .8 };
    case "tool_call": return { sx: 1, sy: 1, rot: s * 2, dx: s * 8, dy: -Math.abs(s) * 3 };
    case "editing": return { sx: 1, sy: 1, rot: s * 3, dx: s * 2, dy: 0 };
    case "waiting_user": return { sx: 1, sy: 1, rot: s * 1.5, dx: s * 1.5, dy: -(Math.sin(t * Math.PI) ** 2) * 2 };
    case "running_tests": return { sx: 1, sy: 1, rot: 0, dx: s * 12, dy: -Math.abs(Math.sin(t * TAU * 2)) * 4 };
    case "success": {
      // Continuous grounded compression -> flight -> grounded landing -> rest.
      const compression = t < .2 ? Math.sin(t / .2 * Math.PI) ** 2
        : t > .8 ? Math.sin((t - .8) / .2 * Math.PI) ** 2 * .65 : 0;
      const flight = t >= .2 && t <= .8 ? Math.sin((t - .2) / .6 * Math.PI) ** 2 : 0;
      return { sx: 1 + compression * .16 - flight * .04,
        sy: 1 - compression * .16 + flight * .04, rot: 0, dx: 0, dy: -flight * 22 };
    }
    case "error": return { sx: 1, sy: 1, rot: 0, dx: Math.sin(t * TAU * 3) * 5 * (1 - t) ** 2, dy: 0 };
  }
}

export function partAngle(slot: PartSlot, state: AgentState, t: number): number {
  if (slot === "arm" && state === "waiting_user") {
    if (t < .2) return -50 * smoothStep(t / .2);
    if (t > .75) return -50 * (1 - smoothStep((t - .75) / .25));
    const wave = (t - .2) / .55;
    return -50 - Math.sin(wave * TAU * 2) * Math.sin(wave * Math.PI) ** 2 * 20;
  }
  if (slot !== "arm" && (state === "tool_call" || state === "running_tests")) {
    return Math.sin(t * TAU * 2) * (slot === "legLeft" ? 22 : -22);
  }
  return 0;
}

export interface MotionPose { sx: number; sy: number; rot: number; dx: number; dy: number; arm: number; legLeft: number; legRight: number }
export function poseFor(state: AgentState, t: number, intensity: MotionIntensity = "standard"): MotionPose {
  const amount = intensity === "gentle" ? .55 : intensity === "lively" ? 1.3 : 1;
  const m = motionFor(state, t);
  return { sx: 1 + (m.sx - 1) * amount, sy: 1 + (m.sy - 1) * amount,
    rot: m.rot * amount, dx: m.dx * amount, dy: m.dy * amount,
    arm: partAngle("arm", state, t) * amount, legLeft: partAngle("legLeft", state, t) * amount, legRight: partAngle("legRight", state, t) * amount };
}
export function blendPose(from: MotionPose, to: MotionPose, progress: number): MotionPose {
  const amount = smoothStep(progress);
  return Object.fromEntries(Object.entries(to).map(([key, value]) => [key, from[key as keyof MotionPose] + (value - from[key as keyof MotionPose]) * amount])) as unknown as MotionPose;
}

export function describeMotion(state: AgentState, rig: MotionRig): string {
  const parts = activeParts(rig);
  if (state === "waiting_user") return parts.some(([s]) => s === "arm")
    ? "局部挥手 · 抬手 → 轻挥两下 → 收手 → 呼吸等待" : "整图摇摆 + 轻跳 · 未启用局部手臂";
  if (state === "tool_call" || state === "running_tests") return parts.some(([s]) => s !== "arm")
    ? "局部摆腿 + 往返位移 · 单图步态示意" : "整图往返位移 + 起伏 · 无独立步态";
  return { idle: "脚底锚定 · 轻微呼吸", thinking: "整图倾斜 · 思考", editing: "整图轻摆 · 编辑",
    success: "压扁蓄力 → 拉伸腾空 → 落地压扁", error: "整图短促抖动 · 错误提示" }[state];
}

/** Cached rectangular cutouts, shared by preview and PNG baking.
 * No reconstruction of pixels hidden behind limbs. Use isolated limbs only. */
export class MotionRenderer {
  private base: HTMLCanvasElement;
  private layers: { slot: PartSlot; p: PartRegion; canvas: HTMLCanvasElement }[] = [];
  private scale: number;
  private intensity: MotionIntensity;
  constructor(image: HTMLImageElement, rig: MotionRig = EMPTY_RIG) {
    this.intensity = rig.intensity ?? "standard";
    const factor = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
    this.base = document.createElement("canvas");
    this.base.width = Math.max(1, Math.round(image.naturalWidth * factor));
    this.base.height = Math.max(1, Math.round(image.naturalHeight * factor));
    const { width: w, height: h } = this.base;
    const ctx = this.base.getContext("2d")!;
    ctx.drawImage(image, 0, 0, w, h);
    for (const [slot, p] of activeParts(rig)) {
      const layer = document.createElement("canvas");
      layer.width = w; layer.height = h;
      const lc = layer.getContext("2d")!;
      lc.save(); lc.beginPath(); lc.rect(p.x * w, p.y * h, p.w * w, p.h * h); lc.clip();
      lc.drawImage(image, 0, 0, w, h); lc.restore();
      ctx.clearRect(p.x * w, p.y * h, p.w * w, p.h * h);
      this.layers.push({ slot, p, canvas: layer });
    }
    this.scale = Math.min(156 / w, 125 / h);
  }
  draw(canvas: HTMLCanvasElement, state: AgentState, t: number, transition?: { from: MotionPose; progress: number }): MotionPose {
    const ctx = canvas.getContext("2d")!;
    const { width: w, height: h } = this.base;
    const target = poseFor(state, t, this.intensity);
    const m = transition ? blendPose(transition.from, target, transition.progress) : target;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.scale(canvas.width / 180, canvas.height / 240);
    ctx.translate(90 + m.dx, 232 + m.dy);
    ctx.rotate(m.rot * Math.PI / 180); ctx.scale(m.sx * this.scale, m.sy * this.scale);
    ctx.translate(-w / 2, -h); ctx.drawImage(this.base, 0, 0);
    for (const { slot, p, canvas: layer } of this.layers) {
      ctx.save(); ctx.translate(p.px * w, p.py * h);
      ctx.rotate(m[slot] * Math.PI / 180);
      ctx.translate(-p.px * w, -p.py * h); ctx.drawImage(layer, 0, 0); ctx.restore();
    }
    ctx.restore();
    return m;
  }
  dispose() {
    this.base.width = this.base.height = 0;
    for (const layer of this.layers) layer.canvas.width = layer.canvas.height = 0;
    this.layers = [];
  }
}
