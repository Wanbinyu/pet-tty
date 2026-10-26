/** Shared clock for live previews and baked frames. Agent state stays unchanged
 * when a visual celebration ends; only the displayed sequence returns to idle. */
export interface SequenceTiming {
  frameCount: number;
  fps?: number;
  loop?: boolean;
  returnToIdle?: boolean;
  repeatAfterMs?: number;
}
export interface PlaybackSample { sequence: "action" | "idle"; frame: number; finished: boolean }
export const sequenceFps = (sequence: SequenceTiming) => Number.isFinite(sequence.fps) && sequence.fps! > 0
  ? Math.min(60, sequence.fps!) : 12;

export function samplePlayback(elapsedMs: number, action: SequenceTiming, idle?: SequenceTiming): PlaybackSample {
  const count = Math.max(1, action.frameCount);
  const duration = count / sequenceFps(action) * 1000;
  let elapsed = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
  if (action.loop !== false) return { sequence: "action", frame: Math.floor(elapsed / duration * count) % count, finished: count === 1 };
  const rest = action.returnToIdle && idle && idle.frameCount > 0 ? idle : undefined;
  const delay = action.repeatAfterMs;
  const repeat = rest && Number.isFinite(delay) && delay! >= 1000 ? Math.min(delay!, 60000) : 0;
  if (repeat) elapsed %= duration + repeat;
  if (elapsed < duration) return { sequence: "action", frame: Math.min(count - 1, Math.floor(elapsed / duration * count)), finished: false };
  if (rest) return { sequence: "idle", frame: Math.floor((elapsed - duration) / 1000 * sequenceFps(rest)) % rest.frameCount,
    finished: rest.frameCount === 1 && !repeat };
  return { sequence: "action", frame: count - 1, finished: true };
}
