/**
 * Install PetDeck as Claude Code **HTTP hooks** (fast — no node spawn per tool).
 * Claude POSTs native hook JSON → PetDeck maps & shows multi-session status.
 *
 * Usage: node fix-hooks.mjs
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const settingsPath = path.join(os.homedir(), ".claude", "settings.json");
const BASE = "http://127.0.0.1:7788/hooks/claude";

function httpHook(phase) {
  return {
    // omit matcher / use * = all tools (docs: "*", "", or omitted)
    matcher: "*",
    hooks: [
      {
        type: "http",
        url: `${BASE}?phase=${encodeURIComponent(phase)}`,
        timeout: 3,
        // no async needed — HTTP is already non-blocking on errors
      },
    ],
  };
}

const settingsDir = path.dirname(settingsPath);
if (!fs.existsSync(settingsDir)) fs.mkdirSync(settingsDir, { recursive: true });

let settings = {};
if (fs.existsSync(settingsPath)) {
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, "utf8") || "{}");
  } catch (e) {
    console.error("Parse settings failed:", e.message);
    process.exit(1);
  }
}

const bak = `${settingsPath}.petdeck-http-${Date.now()}`;
if (fs.existsSync(settingsPath)) {
  fs.copyFileSync(settingsPath, bak);
  console.log("Backup:", bak);
}

settings.hooks = {
  // When you press Enter (including "你好" with no tools)
  UserPromptSubmit: [httpHook("UserPromptSubmit")],
  // When Claude uses tools
  PreToolUse: [httpHook("PreToolUse")],
  PostToolUse: [httpHook("PostToolUse")],
  PostToolUseFailure: [httpHook("PostToolUseFailure")],
  // When a turn ends
  Stop: [httpHook("Stop")],
  Notification: [httpHook("Notification")],
  SessionStart: [httpHook("SessionStart")],
  SessionEnd: [httpHook("SessionEnd")],
};

fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf8");

console.log("OK: Claude → PetDeck HTTP hooks installed");
console.log("  settings:", settingsPath);
console.log("  endpoint:", BASE);
console.log("  events: PreToolUse, PostToolUse, PostToolUseFailure, Notification, Stop, UserPromptSubmit, SessionStart");
console.log("");
console.log("IMPORTANT:");
console.log("  1) PetDeck must be running (listens on :7788)");
console.log("  2) FULLY quit all Claude Code windows, then reopen");
console.log("  3) Send a message / let Claude use a tool — pet updates without spawning node");
console.log("  4) Multi-session: each Claude session_id gets its own status card");
