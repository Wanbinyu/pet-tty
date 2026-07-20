#!/usr/bin/env node
/**
 * pettty — one-command launcher for PetDeck / pet-tty
 *
 * Usage:
 *   pettty              Start the desktop pet
 *   pettty dev          Force npm run tauri dev
 *   pettty test         Send a test event (pet must be running)
 *   pettty hooks        Install Claude Code HTTP hooks
 *   pettty health       Check bridge http://127.0.0.1:7788/health
 *   pettty help
 */

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const isWin = process.platform === "win32";

const args = process.argv.slice(2);
const cmd = (args[0] || "start").toLowerCase();

function log(msg) {
  console.log(msg);
}

function die(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

function exeCandidates() {
  return [
    path.join(ROOT, "src-tauri", "target", "release", isWin ? "petdeck.exe" : "petdeck"),
    path.join(ROOT, "src-tauri", "target", "debug", isWin ? "petdeck.exe" : "petdeck"),
  ];
}

function findBuiltExe() {
  for (const p of exeCandidates()) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function runNpm(npmArgs, opts = {}) {
  const npm = isWin ? "npm.cmd" : "npm";
  const r = spawn(npm, npmArgs, {
    cwd: ROOT,
    stdio: "inherit",
    shell: isWin,
    env: process.env,
    ...opts,
  });
  r.on("exit", (code) => process.exit(code ?? 0));
  return r;
}

function startApp({ forceDev = false } = {}) {
  const exe = forceDev ? null : findBuiltExe();
  if (exe) {
    log(`[pettty] starting ${exe}`);
    log(`[pettty] bridge will listen on http://127.0.0.1:7788`);
    const child = spawn(exe, [], {
      cwd: ROOT,
      stdio: "inherit",
      detached: false,
      env: process.env,
    });
    child.on("exit", (code) => process.exit(code ?? 0));
    return;
  }

  // Prefer tauri dev so UI hot-reloads; needs Node + Rust toolchain
  log("[pettty] no release binary found — running: npm run tauri dev");
  log("[pettty] tip: run  pettty build  once for faster starts");
  log(`[pettty] project: ${ROOT}`);
  runNpm(["run", "tauri", "dev"]);
}

function buildApp() {
  log("[pettty] building release binary…");
  runNpm(["run", "tauri", "build"]);
}

function httpJson(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 7788,
        path: urlPath,
        method,
        headers: data
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(data),
            }
          : {},
        timeout: 3000,
      },
      (res) => {
        let buf = "";
        res.on("data", (c) => (buf += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(buf || "{}") });
          } catch {
            resolve({ status: res.statusCode, json: buf });
          }
        });
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
    if (data) req.write(data);
    req.end();
  });
}

async function health() {
  try {
    const r = await httpJson("GET", "/health");
    log(JSON.stringify(r.json, null, 2));
    process.exit(r.status === 200 ? 0 : 1);
  } catch (e) {
    die(`[pettty] bridge not reachable (is pet running?)\n${e.message || e}`);
  }
}

async function sendTest() {
  const body = {
    schema: "petdeck.event.v1",
    source: "claude-code",
    sessionId: "manual-test",
    sessionLabel: "test",
    ts: new Date().toISOString(),
    state: "editing",
    title: "Editing auth.ts",
    detail: "src/lib/auth.ts",
    progress: { kind: "indeterminate" },
    needsAttention: false,
    stickyMs: 60000,
  };
  try {
    const r = await httpJson("POST", "/event", body);
    log(`[pettty] test event → HTTP ${r.status}`);
    log(JSON.stringify(r.json, null, 2));
    log("[pettty] pet bubble should show 「Editing auth.ts」");
    process.exit(r.status === 200 ? 0 : 1);
  } catch (e) {
    die(`[pettty] failed — start the pet first:  pettty\n${e.message || e}`);
  }
}

function installHooks() {
  const script = path.join(ROOT, "adapters", "claude-code", "fix-hooks.mjs");
  if (!fs.existsSync(script)) die(`[pettty] missing ${script}`);
  const r = spawnSync(process.execPath, [script], {
    cwd: ROOT,
    stdio: "inherit",
  });
  process.exit(r.status ?? 1);
}

function help() {
  log(`
pettty — PetDeck / pet-tty desktop pet for Claude Code

  pettty              Start the pet (release exe if built, else tauri dev)
  pettty dev          Always use npm run tauri dev
  pettty build        Build release binary (faster next start)
  pettty test         Send a test status event (pet must be running)
  pettty hooks        Install Claude Code HTTP hooks → :7788
  pettty health       Check local bridge
  pettty help         This text

中文：
  pettty              启动桌宠
  pettty test         发送测试状态（宠物需已打开）
  pettty hooks        安装 Claude Code hooks
  pettty build        编译发布版，之后启动更快

Install once (Windows):
  powershell -File scripts/install-pettty.ps1

Then open a NEW terminal and type:  pettty
`);
}

switch (cmd) {
  case "start":
  case "run":
  case "open":
    startApp();
    break;
  case "dev":
    startApp({ forceDev: true });
    break;
  case "build":
    buildApp();
    break;
  case "test":
  case "send-test":
    void sendTest();
    break;
  case "hooks":
  case "install-hooks":
    installHooks();
    break;
  case "health":
  case "status":
    void health();
    break;
  case "help":
  case "-h":
  case "--help":
    help();
    break;
  default:
    // unknown first arg → treat whole as start (or show help)
    if (cmd.startsWith("-")) help();
    else {
      log(`[pettty] unknown command: ${cmd}`);
      help();
      process.exit(1);
    }
}
