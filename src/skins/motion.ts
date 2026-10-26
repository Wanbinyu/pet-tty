import type { AgentState } from "../events/types";

export const MOTION_STATES: AgentState[] = ["idle", "thinking", "tool_call", "editing", "waiting_user", "running_tests", "success", "error"];
export const FRAME_COUNT = 24;
export const MOTION_FPS = 24;
export type PartSlot = "arm" | "legLeft" | "legRight";
export interface PartRegion {
  /** Normalized source-image rectangle and pivot; supplied by a human, never inferred. */
  x: number; y: number; w: number; h: number; px: number; py: number;
  confirmed: boolean;
}
export interface MotionRig {
  capability: "unknown" | "none" | "manual";
  parts: Partial<Record<PartSlot, PartRegion>>;
}
export const EMPTY_RIG: MotionRig = { capability: "unknown", parts: {} };
const TAU = Math.PI * 2;

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
    case "idle": return { sx: 1, sy: 1 + s * .025, rot: 0, dx: 0, dy: 0 };
    case "thinking": return { sx: 1, sy: 1, rot: s * 5, dx: 0, dy: -s * 2 };
    case "tool_call": return { sx: 1, sy: 1, rot: s * 2, dx: s * 8, dy: -Math.abs(s) * 3 };
    case "editing": return { sx: 1, sy: 1, rot: s * 3, dx: s * 2, dy: 0 };
    case "waiting_user": return { sx: 1, sy: 1, rot: s * 5, dx: s * 4, dy: -Math.abs(s) * 3 };
    case "running_tests": return { sx: 1, sy: 1, rot: 0, dx: s * 12, dy: -Math.abs(Math.sin(t * TAU * 2)) * 4 };
    case "success": {
      // Continuous grounded compression -> flight -> grounded landing -> rest.
      const compression = t < .2 ? Math.sin(t / .2 * Math.PI)
        : t > .8 ? Math.sin((t - .8) / .2 * Math.PI) : 0;
      const flight = t >= .2 && t <= .8 ? Math.sin((t - .2) / .6 * Math.PI) : 0;
      return { sx: 1 + compression * .16 - flight * .04,
        sy: 1 - compression * .16 + flight * .04, rot: 0, dx: 0, dy: -flight * 22 };
    }
    case "error": return { sx: 1, sy: 1, rot: 0, dx: Math.sin(t * TAU * 3) * 5, dy: 0 };
  }
}

export function partAngle(slot: PartSlot, state: AgentState, t: number): number {
  if (slot === "arm" && state === "waiting_user") return -45 + Math.cos(t * TAU) * 40;
  if (slot !== "arm" && (state === "tool_call" || state === "running_tests")) {
    return Math.sin(t * TAU * 2) * (slot === "legLeft" ? 22 : -22);
  }
  return 0;
}

export function describeMotion(state: AgentState, rig: MotionRig): string {
  const parts = activeParts(rig);
  if (state === "waiting_user") return parts.some(([s]) => s === "arm")
    ? "局部挥手 · 已确认手臂绕关节旋转" : "整图摇摆 + 轻跳 · 未启用局部手臂";
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
  constructor(image: HTMLImageElement, rig: MotionRig = EMPTY_RIG) {
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
  draw(canvas: HTMLCanvasElement, state: AgentState, t: number) {
    const ctx = canvas.getContext("2d")!;
    const { width: w, height: h } = this.base;
    const m = motionFor(state, t);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.scale(canvas.width / 180, canvas.height / 240);
    ctx.translate(90 + m.dx, 232 + m.dy);
    ctx.rotate(m.rot * Math.PI / 180); ctx.scale(m.sx * this.scale, m.sy * this.scale);
    ctx.translate(-w / 2, -h); ctx.drawImage(this.base, 0, 0);
    for (const { slot, p, canvas: layer } of this.layers) {
      ctx.save(); ctx.translate(p.px * w, p.py * h);
      ctx.rotate(partAngle(slot, state, t) * Math.PI / 180);
      ctx.translate(-p.px * w, -p.py * h); ctx.drawImage(layer, 0, 0); ctx.restore();
    }
    ctx.restore();
  }
  dispose() {
    this.base.width = this.base.height = 0;
    for (const layer of this.layers) layer.canvas.width = layer.canvas.height = 0;
    this.layers = [];
  }
}
