/** Singleton sprite frame player.
 *
 * Drives the `#pet-sprite` <img>: cycles PNG frames for the current agent
 * state at the manifest's fps, swaps sequences on state change, and manages
 * object URLs for imported (IndexedDB-backed) skins. Builtin skins embed
 * frames as data URLs in the manifest, so no IDB access is needed for them.
 *
 * Lifecycle: `render.applySkinToDom` calls `activate(skin)` + `setState(state)`
 * on every event; both are idempotent and cheap when nothing changed. */
import type { AgentState } from "../events/types";
import type { SkinMeta, SpriteManifest, SpriteState } from "./types";
import * as spriteStore from "./spriteStore";

const DEFAULT_FPS = 12;

class SpritePlayer {
  private img: HTMLImageElement | null = null;
  private skinId: string | null = null;
  private manifest: SpriteManifest | null = null;
  private state: AgentState = "idle";
  /** resolved frame srcs per state (data URLs for builtin, object URLs for imported) */
  private cache = new Map<string, string[]>();
  private idx = 0;
  private timer: number | null = null;
  private loading = false;
  private objectUrls: string[] = [];

  attach(img: HTMLImageElement) {
    this.img = img;
  }

  /** Switch to a skin. No-op if already active. Tears down any prior skin. */
  activate(skin: SkinMeta) {
    if (this.skinId === skin.id) return;
    this.teardown();
    this.skinId = skin.id;
    this.manifest = skin.manifest ?? null;
    if (!this.manifest) return;

    const hasEmbedded = Object.values(this.manifest.states).some(
      (s) => s?.frames && s.frames.length > 0,
    );
    if (hasEmbedded) {
      // builtin: frames are data URLs, ready immediately
      for (const [st, s] of Object.entries(this.manifest.states)) {
        if (s?.frames && s.frames.length) {
          this.cache.set(st, s.frames.map((f) => f.src));
        }
      }
    } else {
      // imported: preload all states' blobs from IDB into object URLs
      this.loading = true;
      void this.loadImported(skin.id);
    }
  }

  private async loadImported(skinId: string) {
    if (!this.manifest) return;
    const entries = Object.keys(this.manifest.states);
    await Promise.all(
      entries.map(async (st) => {
        const blobs = await spriteStore.getFrames(skinId, st);
        const urls = blobs.map((b) => {
          const u = URL.createObjectURL(b);
          this.objectUrls.push(u);
          return u;
        });
        this.cache.set(st, urls);
      }),
    );
    this.loading = false;
    if (this.skinId === skinId) this.play();
  }

  /** Switch the playing sequence to a new agent state. No-op if unchanged. */
  setState(state: AgentState) {
    if (this.state === state && this.timer !== null) return;
    this.state = state;
    this.play();
  }

  private cfgFor(state: AgentState): SpriteState | undefined {
    if (!this.manifest) return undefined;
    return this.manifest.states[state] ?? this.manifest.states.idle;
  }

  private framesFor(state: AgentState): string[] {
    // exact state, else fall back to idle so every state always has frames
    return this.cache.get(state) ?? this.cache.get("idle") ?? [];
  }

  private play() {
    if (!this.img || !this.skinId || this.loading) return;
    const frames = this.framesFor(this.state);
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (!frames.length) {
      this.img.removeAttribute("src");
      return;
    }
    this.idx = 0;
    this.img.src = frames[0];
    if (frames.length === 1) return; // static
    const cfg = this.cfgFor(this.state);
    const fps = cfg?.fps ?? DEFAULT_FPS;
    const loop = cfg?.loop ?? true;
    const interval = Math.max(16, Math.round(1000 / fps));
    this.timer = window.setInterval(() => {
      this.idx++;
      if (this.idx >= frames.length) {
        if (loop) this.idx = 0;
        else {
          this.idx = frames.length - 1;
          return;
        }
      }
      if (this.img) this.img.src = frames[this.idx];
    }, interval);
  }

  /** Stop playing and release all resources (called when leaving a sprite skin). */
  deactivate() {
    this.teardown();
  }

  private teardown() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.objectUrls.forEach((u) => URL.revokeObjectURL(u));
    this.objectUrls = [];
    this.cache.clear();
    this.skinId = null;
    this.manifest = null;
    this.loading = false;
    this.idx = 0;
    if (this.img) this.img.removeAttribute("src");
  }
}

export const spritePlayer = new SpritePlayer();
