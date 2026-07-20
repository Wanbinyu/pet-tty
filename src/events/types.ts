/** PetDeck internal agent event protocol (petdeck.event.v1) */

export type AgentState =
  | "idle"
  | "thinking"
  | "tool_call"
  | "editing"
  | "waiting_user"
  | "running_tests"
  | "success"
  | "error";

export type ProgressKind = "none" | "indeterminate" | "ratio";

export interface AgentProgress {
  kind: ProgressKind;
  /** 0..1 when kind === "ratio" */
  value?: number;
}

export interface AgentEvent {
  schema: "petdeck.event.v1";
  source: string;
  sessionId: string;
  ts: string;
  state: AgentState;
  title: string;
  detail?: string;
  progress?: AgentProgress;
  needsAttention?: boolean;
  /** How long UI should hold this state before auto-idle (ms). 0 = use defaults. */
  stickyMs?: number;
  /** Short label for multi-session UI */
  sessionLabel?: string;
}

export function createEvent(
  partial: Omit<AgentEvent, "schema" | "ts"> & { ts?: string },
): AgentEvent {
  return {
    schema: "petdeck.event.v1",
    ts: partial.ts ?? new Date().toISOString(),
    progress: partial.progress ?? { kind: "none" },
    needsAttention: partial.needsAttention ?? false,
    ...partial,
  };
}
