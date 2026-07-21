/** Import a DyberPet character folder as a PetDeck sprite skin.
 *
 * DyberPet characters ship as `action/<action>_<N>.png` PNG sequences plus an
 * `act_conf.json`. We discover actions purely from filename prefixes (robust to
 * unknown act_conf schemas), map them to PetDeck agent states by keyword,
 * downscale each frame, and store blobs in IndexedDB. The returned SkinMeta
 * keeps only frame counts in its manifest; the heavy blobs never touch
 * localStorage or the git repo. */
import type { AgentState } from "../events/types";
import type { SkinMeta, SpriteManifest, SpriteState } from "./types";
import * as spriteStore from "./spriteStore";

const MAX_HEIGHT = 180;
const DEFAULT_FPS = 12;

/** DyberPet action-name keyword -> PetDeck state. First hit wins (in state
 *  order below). Used to auto-suggest a mapping at import time. */
const STATE_KEYWORDS: Partial<Record<AgentState, string[]>> = {
  idle: ["stand", "idle", "standby", "default", "relax", "sleep"],
  thinking: ["cast", "skill", "magic", "think", "study", "read", "charge"],
  tool_call: ["walk", "move", "run", "attack", "work", "fish", "gather"],
  editing: ["sit", "draw", "write", "craft", "build", "cook"],
  waiting_user: ["wave", "greet", "hello", "beckon", "call", "invite"],
  running_tests: ["dash", "sprint", "rush", "fishing"],
  success: ["patpat", "happy", "cheer", "joy", "win", "laugh", "dance", "celebrate"],
  error: ["cry", "sad", "fail", "hurt", "angry", "down", "loss"],
};

/** State priority for auto-mapping (idle first so it's the safe fallback). */
const STATE_ORDER: AgentState[] = [
  "idle",
  "success",
  "error",
  "thinking",
  "tool_call",
  "editing",
  "waiting_user",
  "running_tests",
];

export interface DiscoveredAction {
  name: string;
  count: number;
}

/** Group PNG files by action prefix (`<action>_<N>.png`), frames sorted by N. */
export function discoverActions(files: File[]): Map<string, File[]> {
  const map = new Map<string, File[]>();
  for (const f of files) {
    const path = f.webkitRelativePath || f.name;
    if (!/\.png$/i.test(path)) continue;
    const base = path.split(/[\\/]/).pop() ?? path;
    const m = base.match(/^(.+?)_(\d+)\.png$/i);
    if (!m) continue;
    const action = m[1];
    const arr = map.get(action) ?? [];
    arr.push(f);
    map.set(action, arr);
  }
  for (const [action, arr] of map) {
    arr.sort((a, b) => frameIndex(a) - frameIndex(b));
    map.set(action, arr);
  }
  return map;
}

function frameIndex(f: File): number {
  const m = f.name.match(/_(\d+)\.png$/i);
  return m ? Number(m[1]) : 0;
}

/** Best-effort auto-mapping of discovered actions to agent states. */
export function defaultMapping(
  actions: string[],
): Partial<Record<AgentState, string>> {
  const mapping: Partial<Record<AgentState, string>> = {};
  const lower = actions.map((a) => a.toLowerCase());
  for (const st of STATE_ORDER) {
    const kws = STATE_KEYWORDS[st] ?? [];
    let hit = lower.find((a) => kws.includes(a));
    if (!hit) hit = lower.find((a) => kws.some((k) => a.includes(k)));
    if (hit) mapping[st] = actions[lower.indexOf(hit)];
  }
  return mapping;
}

/** Try to read the character display name from pet_conf.json. */
export async function readCharName(files: File[]): Promise<string | null> {
  const f = files.find((x) =>
    /pet_conf\.json$/i.test(x.webkitRelativePath || x.name),
  );
  if (!f) return null;
  try {
    const obj = JSON.parse(await f.text()) as Record<string, unknown>;
    const cand = (obj.name ?? obj.Name ?? (obj.character as any)?.name) as
      | string
      | undefined;
    return cand && typeof cand === "string" ? cand : null;
  } catch {
    return null;
  }
}

/** First frame src for a skin-picker preview (data URL for builtin, object URL
 *  loaded from IDB for imported). Null if no frames are available. */
export async function firstFrameSrc(skin: SkinMeta): Promise<string | null> {
  const m = skin.manifest;
  if (!m) return null;
  const embedded =
    m.states.idle?.frames?.[0]?.src ??
    Object.values(m.states).find((s) => s?.frames?.length)?.frames?.[0]?.src;
  if (embedded) return embedded;
  const stateKey = m.states.idle ? "idle" : Object.keys(m.states)[0];
  if (!stateKey) return null;
  const blobs = await spriteStore.getFrames(skin.id, stateKey);
  if (!blobs.length) return null;
  return URL.createObjectURL(blobs[0]);
}

export interface BuildProgress {
  ratio: number;
  label: string;
}

/** Build a sprite skin from files + a state->action mapping.
 *  Downscale frames, store blobs in IDB, return the SkinMeta (manifest holds
 *  only frame counts). */
export async function buildSpriteSkin(
  files: File[],
  mapping: Partial<Record<AgentState, string>>,
  name: string,
  onProgress?: (p: BuildProgress) => void,
): Promise<SkinMeta> {
  const actions = discoverActions(files);
  const skinId = `sprite-${Date.now().toString(36)}`;
  const states: Partial<Record<string, SpriteState>> = {};

  const planned: Array<{ state: AgentState; action: string; frames: File[] }> =
    [];
  for (const st of Object.keys(mapping) as AgentState[]) {
    const action = mapping[st];
    if (!action) continue;
    const frames = actions.get(action);
    if (!frames || !frames.length) continue;
    planned.push({ state: st, action, frames });
  }

  // guarantee idle exists (player falls back to it for unmapped states)
  if (!planned.some((p) => p.state === "idle")) {
    const first = actions.keys().next();
    if (!first.done) {
      planned.unshift({
        state: "idle",
        action: first.value,
        frames: actions.get(first.value)!,
      });
    }
  }

  const totalFrames = planned.reduce((n, p) => n + p.frames.length, 0) || 1;
  let done = 0;

  for (const { state, action, frames } of planned) {
    const blobs: Blob[] = [];
    for (const f of frames) {
      blobs.push(await downscale(f, MAX_HEIGHT));
      done++;
      onProgress?.({
        ratio: done / totalFrames,
        label: `${action} ${done}/${totalFrames}`,
      });
    }
    await spriteStore.saveFrames(skinId, state, blobs);
    states[state] = {
      frameCount: blobs.length,
      fps: DEFAULT_FPS,
      loop: true,
    };
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

async function downscale(file: File, maxH: number): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxH / img.naturalHeight);
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("canvas 2d unavailable");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob>((resolve, reject) =>
      c.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
        "image/png",
      ),
    );
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}
