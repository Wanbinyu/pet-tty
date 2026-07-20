import { createEvent, type AgentEvent } from "./types";

const SESSION = "demo-session";

/** Demo timeline for GIF / manual playback (Claude Code flavor). */
export function buildDemoEvents(): AgentEvent[] {
  return [
    createEvent({
      source: "claude-code",
      sessionId: SESSION,
      state: "idle",
      title: "Ready",
      detail: "Waiting for a task…",
    }),
    createEvent({
      source: "claude-code",
      sessionId: SESSION,
      state: "thinking",
      title: "Planning refactor",
      detail: "Reading src/auth and test layout…",
      progress: { kind: "indeterminate" },
    }),
    createEvent({
      source: "claude-code",
      sessionId: SESSION,
      state: "editing",
      title: "Editing auth.ts",
      detail: "src/lib/auth.ts",
      progress: { kind: "ratio", value: 0.35 },
    }),
    createEvent({
      source: "claude-code",
      sessionId: SESSION,
      state: "tool_call",
      title: "Running shell",
      detail: "npm test -- auth",
      progress: { kind: "indeterminate" },
    }),
    createEvent({
      source: "claude-code",
      sessionId: SESSION,
      state: "running_tests",
      title: "Tests running",
      detail: "12 tests…",
      progress: { kind: "ratio", value: 0.7 },
    }),
    createEvent({
      source: "claude-code",
      sessionId: SESSION,
      state: "error",
      title: "Test failed",
      detail: "auth.spec.ts · expected 401",
      needsAttention: true,
    }),
    createEvent({
      source: "claude-code",
      sessionId: SESSION,
      state: "thinking",
      title: "Fixing assertion",
      detail: "Adjusting status code expectation…",
      progress: { kind: "indeterminate" },
    }),
    createEvent({
      source: "claude-code",
      sessionId: SESSION,
      state: "editing",
      title: "Patching auth.spec.ts",
      detail: "src/lib/auth.spec.ts",
      progress: { kind: "ratio", value: 0.9 },
    }),
    createEvent({
      source: "claude-code",
      sessionId: SESSION,
      state: "waiting_user",
      title: "Permission needed",
      detail: "Allow write to package-lock.json?",
      needsAttention: true,
    }),
    createEvent({
      source: "claude-code",
      sessionId: SESSION,
      state: "running_tests",
      title: "Re-running tests",
      detail: "npm test -- auth",
      progress: { kind: "indeterminate" },
    }),
    createEvent({
      source: "claude-code",
      sessionId: SESSION,
      state: "success",
      title: "All green",
      detail: "12/12 passed · session done",
      progress: { kind: "ratio", value: 1 },
    }),
    createEvent({
      source: "claude-code",
      sessionId: SESSION,
      state: "idle",
      title: "Ready",
      detail: "Waiting for the next task…",
    }),
  ];
}
