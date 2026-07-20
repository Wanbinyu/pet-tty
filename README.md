# PetDeck / pet-tty

<p align="center">
  <strong>Desktop pet for Claude Code</strong><br/>
  给 Claude Code 用的桌面宠物：气泡状态、多会话、像素皮肤
</p>

[English](#english) · [中文](#中文)

---

## English

**PetDeck** (repo: `pet-tty`) is a tiny always-on-top desktop pet that shows what your AI coding agent is doing — thinking, reading files, editing, waiting for you, success/error — without opening a big dashboard.

### Why

When Claude Code is working hard, you often only see a terminal. PetDeck turns those hooks into a **pixel pet + bubble**: glanceable status while you stay in flow.

### Features

- **Claude Code bridge** — local HTTP server on `127.0.0.1:7788`
- **HTTP hooks** — low-latency `POST /hooks/claude` (recommended)
- **Process presence** — detects live Claude sessions under `~/.claude/sessions`
- **Multi-session** — several terminals at once; primary bubble + stack cards
- **Sticky tool states** — long reads/edits stay “busy” until done (not cleared after a few seconds)
- **Reliable UI updates** — Tauri events **plus** ring-buffer poll (emit drop-safe)
- **Skins** — built-in pixel pets; import image / pixel-doll from photo
- **Bilingual UI** — 中文 / English (right-click menu)
- **Demo player** — try the full UX without Claude

### Quick start

**Prerequisites:** Node.js 18+, Rust (rustup), WebView2 (Windows). On Windows also need MSVC Build Tools (`link.exe`).

```powershell
git clone https://github.com/Wanbinyu/pet-tty.git
cd pet-tty
npm install
npm run tauri dev
```

Optional frontend-only preview (no always-on-top / no bridge):

```bash
npm run dev
```

### Connect Claude Code

1. Keep **PetDeck running** (bridge listens on port **7788**).
2. Install HTTP hooks (from repo root):

```powershell
node adapters/claude-code/fix-hooks.mjs
```

3. Restart Claude Code, then chat or run a tool.  
   PetDeck terminal should log `[petdeck-bridge] claude-hook …` and the **pet bubble / connection strip** should update.

Manual test event (no Claude needed):

```powershell
powershell -File adapters/claude-code/send-test-event.ps1
```

More detail: [`adapters/claude-code/README.md`](./adapters/claude-code/README.md) · [`docs/CONNECT.md`](./docs/CONNECT.md)

### Stack

| Piece | Tech |
|------|------|
| Shell | Tauri 2 |
| UI | Vite + TypeScript |
| Bridge | Rust `tiny_http` → `127.0.0.1:7788` |
| Protocol | `petdeck.event.v1` |

### Project layout

```
petdeck/  (this repo = pet-tty)
├── src/                    # UI
│   ├── events/             # protocol + demo player
│   ├── skins/              # presets, pixel doll, import
│   └── main.ts
├── adapters/claude-code/   # hooks installer + test scripts
├── docs/                   # connection notes
└── src-tauri/              # Rust: bridge, presence watch
```

### Privacy

- Runs **locally**. Hooks post only to `127.0.0.1`.
- Do **not** commit secrets, API keys, or personal session dumps.
- Custom skins are stored in local storage on your machine.

### License

Personal / experimental project. Use at your own risk. Not affiliated with Anthropic.

---

## 中文

**PetDeck**（仓库名：`pet-tty`）是一款轻量桌面宠物：挂在角落置顶显示，用气泡告诉你 Claude Code 正在想什么、读哪个文件、改哪段代码、是否在等你确认——不用开大面板。

### 为什么做

Claude 在干活时，你往往只能盯着终端。PetDeck 把 Hook / 进程检测变成**像素宠物 + 状态条**，一眼知道 Agent 忙不忙，不打断你的心流。

### 功能

- **Claude 本地桥接** — `127.0.0.1:7788`
- **HTTP Hooks** — 推荐 `POST /hooks/claude`，延迟低
- **进程在线检测** — 扫描 `~/.claude/sessions` 判断 Claude 是否在跑
- **多会话** — 多个终端同时开；主气泡 + 侧边会话卡片
- **工具状态粘性** — 长时间 Read/Edit 不会几秒就变回空闲
- **双通道刷新 UI** — Tauri 事件 + 事件环缓冲轮询（终端有日志、界面不闪的问题已针对修复）
- **皮肤** — 内置像素风；可导入图片 / 照片生成像素小人
- **中英双语** — 右键菜单切换
- **演示播放** — 不接 Claude 也能看完整动效

### 快速开始

**环境：** Node.js 18+、Rust、WebView2；Windows 需安装 VS C++ 生成工具（`link.exe`）。

```powershell
git clone https://github.com/Wanbinyu/pet-tty.git
cd pet-tty
npm install
npm run tauri dev
```

仅前端预览（无置顶、无桥接）：

```bash
npm run dev
```

### 连接 Claude Code

1. **先启动 PetDeck**（确保 7788 端口在听）。
2. 安装 HTTP hooks：

```powershell
node adapters/claude-code/fix-hooks.mjs
```

3. **重启 Claude Code**，随便聊一句或触发工具。  
   Pet 终端应出现 `[petdeck-bridge] claude-hook …`，界面上方的**连接条 / 气泡**应同步变化。

无 Claude 时自测：

```powershell
powershell -File adapters/claude-code/send-test-event.ps1
```

详见：[`adapters/claude-code/README.md`](./adapters/claude-code/README.md) · [`docs/CONNECT.md`](./docs/CONNECT.md)

### 技术栈

| 部分 | 技术 |
|------|------|
| 壳 | Tauri 2 |
| 界面 | Vite + TypeScript |
| 桥 | Rust `tiny_http` → `127.0.0.1:7788` |
| 协议 | `petdeck.event.v1` |

### 隐私说明

- 默认只在本机通信，Hook 打到 `127.0.0.1`。
- 请勿把 API Key、个人会话内容提交进仓库。
- 自定义皮肤保存在本机本地存储。

### 许可

个人/实验项目，按需自用，风险自负。与 Anthropic 无关。

---

## Status

| Version | Notes |
|--------|--------|
| **0.3.x** | M1 UI + M2 skins + M3 Claude bridge, multi-session, conn panel |

Issues & PRs welcome on [github.com/Wanbinyu/pet-tty](https://github.com/Wanbinyu/pet-tty).
