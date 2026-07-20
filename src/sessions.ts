import type { AgentEvent } from "./events/types";

export interface SessionSlot {
  id: string;
  label: string;
  source: string;
  event: AgentEvent;
  updatedAt: number;
}

const MAX_SESSIONS = 6;
const STALE_MS = 3 * 60_000;

/** Active AI sessions keyed by sessionId */
const map = new Map<string, SessionSlot>();

export function upsertSession(event: AgentEvent): SessionSlot[] {
  const id = event.sessionId || "default";
  const label =
    (event as AgentEvent & { sessionLabel?: string }).sessionLabel ||
    shortLabel(id);
  map.set(id, {
    id,
    label,
    source: event.source,
    event,
    updatedAt: Date.now(),
  });
  prune();
  return listSessions();
}

export function listSessions(): SessionSlot[] {
  prune();
  return [...map.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function primarySession(): SessionSlot | null {
  const list = listSessions();
  return list[0] ?? null;
}

export function markIdle(sessionId: string, idleEvent: AgentEvent) {
  const cur = map.get(sessionId);
  if (!cur) return listSessions();
  map.set(sessionId, {
    ...cur,
    event: idleEvent,
    updatedAt: Date.now(),
  });
  return listSessions();
}

function prune() {
  const now = Date.now();
  for (const [k, v] of map) {
    if (now - v.updatedAt > STALE_MS && v.event.state === "idle") {
      map.delete(k);
    }
  }
  // Cap count — drop oldest idle first
  if (map.size > MAX_SESSIONS) {
    const sorted = [...map.entries()].sort(
      (a, b) => a[1].updatedAt - b[1].updatedAt,
    );
    while (map.size > MAX_SESSIONS && sorted.length) {
      const [k] = sorted.shift()!;
      map.delete(k);
    }
  }
}

function shortLabel(id: string): string {
  const cleaned = id.replace(/[^a-zA-Z0-9]/g, "");
  return cleaned.slice(-6) || "sess";
}
