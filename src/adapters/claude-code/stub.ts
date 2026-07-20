/**
 * Claude Code adapter status (bridge is started by Tauri Rust side).
 */

export const CLAUDE_ADAPTER_ID = "claude-code";
export const DEFAULT_BRIDGE = "http://127.0.0.1:7788";

export interface ClaudeAdapterStatus {
  id: typeof CLAUDE_ADAPTER_ID;
  connected: boolean;
  message: string;
  bridgeUrl?: string;
}

let lastBridgeOk: boolean | null = null;
let lastBridgeError: string | null = null;

export function setBridgeStatus(ok: boolean, error?: string) {
  lastBridgeOk = ok;
  lastBridgeError = error ?? null;
}

export function getClaudeAdapterStatus(): ClaudeAdapterStatus {
  if (lastBridgeOk === true) {
    return {
      id: CLAUDE_ADAPTER_ID,
      connected: true,
      bridgeUrl: DEFAULT_BRIDGE,
      message:
        "Bridge OK · http://127.0.0.1:7788 — install Claude hooks or run send-test-event.ps1",
    };
  }
  if (lastBridgeOk === false) {
    return {
      id: CLAUDE_ADAPTER_ID,
      connected: false,
      message: `Bridge failed: ${lastBridgeError ?? "port busy?"}`,
    };
  }
  return {
    id: CLAUDE_ADAPTER_ID,
    connected: false,
    message:
      "Starting bridge… Keep PetDeck open; hooks POST to :7788/event",
  };
}
