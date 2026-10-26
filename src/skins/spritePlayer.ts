/** PNG player with a shared elapsed-time clock, one-shots and idle reminders.
 * Visual idle never overwrites the underlying Agent task state. */
import type { AgentState } from "../events/types";
import type { SkinMeta, SpriteManifest, SpriteState } from "./types";
import { samplePlayback, sequenceFps } from "./motionPlayback";
import * as spriteStore from "./spriteStore";

export class SpritePlayer {
  private img: HTMLImageElement | null = null;
  private skinId: string | null = null;
  private manifest: SpriteManifest | null = null;
  private state: AgentState = "idle";
  private cache = new Map<string, string[]>();
  private timer: number | null = null;
  private loading = false;
  private paused = false;
  private initialized = false;
  private objectUrls: string[] = [];
  private generation = 0;
  private elapsedMs = 0;
  private startedAt = 0;
  private sequence: string | null = null;
  private transition: Animation | null = null;
  private visibilityChanged = () => {
    if (document.hidden) { this.stopClock(); this.transition?.cancel(); }
    else this.play();
  };

  attach(img: HTMLImageElement) { this.img = img; }

  activate(skin: SkinMeta) {
    if (this.skinId === skin.id) return;
    this.teardown();
    this.skinId = skin.id;
    this.manifest = skin.manifest ?? null;
    if (!this.manifest) return;
    document.addEventListener("visibilitychange", this.visibilityChanged);
    const embedded = Object.values(this.manifest.states).some(s => s?.frames?.length);
    if (embedded) {
      for (const [state, config] of Object.entries(this.manifest.states)) {
        if (config?.frames?.length) this.cache.set(state, config.frames.map(f => f.src));
      }
    } else {
      this.loading = true;
      void this.loadImported(skin.id, this.generation);
    }
  }

  private async loadImported(skinId: string, generation: number) {
    if (!this.manifest) return;
    try {
      await Promise.all(Object.keys(this.manifest.states).map(async state => {
        const blobs = await spriteStore.getFrames(skinId, state);
        if (generation !== this.generation) return;
        const urls = blobs.map(blob => { const url = URL.createObjectURL(blob); this.objectUrls.push(url); return url; });
        this.cache.set(state, urls);
      }));
      if (generation !== this.generation) return;
      this.loading = false; this.play();
    } catch (error) {
      if (generation !== this.generation) return;
      console.warn("[petdeck] sprite frames unavailable", error); this.teardown();
    }
  }

  /** Duplicate notifications must not replay a completed celebration.
   * Explicit user demo clicks can pass restart=true to replay it. */
  setState(state: AgentState, restart = false) {
    if (this.state === state && this.initialized && !restart) return;
    this.stopClock(); this.transition?.cancel();
    this.state = state; this.elapsedMs = 0; this.initialized = false;
    this.play();
  }

  pause() { this.stopClock(); this.paused = true; this.transition?.pause(); }
  resume() {
    if (!this.paused) return;
    this.paused = false;
    if (this.transition?.playState === "paused") this.transition.play();
    this.play();
  }

  private cfgFor(state: AgentState): SpriteState | undefined {
    return this.cache.get(state)?.length ? this.manifest?.states[state] : this.manifest?.states.idle;
  }
  private framesFor(state: AgentState): string[] {
    const exact = this.cache.get(state);
    return exact?.length ? exact : this.cache.get("idle") ?? [];
  }
  private stopClock() {
    if (this.timer === null) return;
    this.elapsedMs += performance.now() - this.startedAt;
    clearInterval(this.timer); this.timer = null;
  }

  private paint(elapsed: number): boolean {
    if (!this.img) return true;
    const actionFrames = this.framesFor(this.state);
    if (!actionFrames.length) { this.img.removeAttribute("src"); return true; }
    const idleFrames = this.cache.get("idle") ?? [];
    const sample = samplePlayback(elapsed, { ...this.cfgFor(this.state), frameCount: actionFrames.length },
      idleFrames.length ? { ...this.manifest?.states.idle, frameCount: idleFrames.length } : undefined);
    const effectiveState = sample.sequence === "idle" || !this.cache.get(this.state)?.length ? "idle" : this.state;
    const frames = sample.sequence === "idle" ? idleFrames : actionFrames;
    const source = frames[sample.frame];
    const hadFrame = !!this.img.getAttribute("src");
    if (this.img.getAttribute("src") !== source) this.img.src = source;
    this.img.dataset.motionState = effectiveState;
    this.img.dataset.motionPhase = sample.sequence;
    if (this.sequence !== effectiveState) {
      this.transition?.cancel();
      if (hadFrame && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        this.transition = this.img.animate([{ opacity: .45 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
      }
      this.sequence = effectiveState;
    }
    return sample.finished;
  }

  private play() {
    if (this.paused || document.hidden || this.loading || !this.img || !this.skinId || this.timer !== null) return;
    this.initialized = true; this.startedAt = performance.now();
    if (this.paint(this.elapsedMs)) return;
    const fps = Math.max(sequenceFps({ ...this.cfgFor(this.state), frameCount: 1 }),
      sequenceFps({ ...this.manifest?.states.idle, frameCount: 1 }));
    this.timer = window.setInterval(() => {
      if (this.paint(this.elapsedMs + performance.now() - this.startedAt)) this.stopClock();
    }, Math.max(16, Math.round(1000 / fps)));
  }

  deactivate() { this.teardown(); }
  private teardown() {
    this.generation++; this.stopClock(); this.transition?.cancel(); this.transition = null;
    document.removeEventListener("visibilitychange", this.visibilityChanged);
    this.objectUrls.forEach(url => URL.revokeObjectURL(url)); this.objectUrls = [];
    this.cache.clear(); this.skinId = null; this.manifest = null;
    this.loading = false; this.paused = false; this.initialized = false;
    this.elapsedMs = 0; this.sequence = null;
    if (this.img) {
      this.img.removeAttribute("src"); delete this.img.dataset.motionState; delete this.img.dataset.motionPhase;
    }
  }
}
export const spritePlayer = new SpritePlayer();
