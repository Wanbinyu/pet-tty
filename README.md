# PetDeck / pet-tty

<p align="center">
  <strong>Desktop pet for Claude Code</strong><br/>
  给 Claude Code 用的桌面宠物 · 终端里输入 <code>pettty</code> 即可启动
</p>

[English](#english) · [中文](#中文)

---

## English

**PetDeck** (repo: [`pet-tty`](https://github.com/Wanbinyu/pet-tty)) is a tiny always-on-top desktop pet that shows what your AI coding agent is doing — thinking, reading, editing, waiting for you — without a big dashboard.

### One-command start: `pettty`

Like `claude`, after a one-time install you only type:

```powershell
pettty
```

| Command | What it does |
|--------|----------------|
| `pettty` | Start the pet |
| `pettty dev` | Force `tauri dev` (hot reload) |
| `pettty build` | Build release binary (faster next start) |
| `pettty test` | Send a test status event (pet must be running) |
| `pettty hooks` | Install Claude Code HTTP hooks → `:7788` |
| `pettty health` | Check local bridge |
| `pettty help` | Help |

#### Install the `pettty` command (once)

```powershell
git clone https://github.com/Wanbinyu/pet-tty.git
cd pet-tty
npm install
powershell -ExecutionPolicy Bypass -File scripts/install-pettty.ps1
```

Open a **new** terminal, then:

```powershell
pettty
```

Or without installing to PATH (from the repo folder):

```powershell
npm start
# same as:  node bin/pettty.mjs
```

### Connect Claude Code

1. `pettty` — keep the pet running (bridge on **7788**)
2. `pettty hooks` — write HTTP hooks into Claude settings  
3. Restart Claude Code and chat / use tools  
4. Pet terminal should log `publish seq=…` and `webview.eval ok` / `pettty-ui applied …`  
5. Connection strip + bubble update on the pet

Manual test without Claude:

```powershell
pettty test
```

### Features

- Local HTTP bridge `127.0.0.1:7788`
- HTTP hooks + process presence (`~/.claude/sessions`)
- Multi-session stack
- Sticky tool states (long read/edit won’t flash idle)
- Triple delivery: Tauri emit + ring poll + **webview.eval** inject
- Skins / pixel doll import
- UI: 中文 / English

### Stack

| Piece | Tech |
|------|------|
| Shell | Tauri 2 |
| UI | Vite + TypeScript |
| CLI | `pettty` (Node) |
| Bridge | Rust `tiny_http` |

### Privacy

Runs locally. Hooks only hit `127.0.0.1`. Don’t commit secrets.

### Prerequisites

Node.js 18+, Rust (rustup), WebView2. Windows: MSVC Build Tools (`link.exe`).

---

## 中文

**PetDeck**（仓库：[`pet-tty`](https://github.com/Wanbinyu/pet-tty)）是挂在桌面角落的轻量宠物：用气泡显示 Claude Code 在想什么、读/改哪个文件、是否等你确认。

### 一条命令启动：`pettty`

安装一次后，像 `claude` 一样，在任意终端输入：

```powershell
pettty
```

| 命令 | 作用 |
|------|------|
| `pettty` | 启动桌宠 |
| `pettty dev` | 强制开发模式（热更新） |
| `pettty build` | 编译发布版，之后启动更快 |
| `pettty test` | 发送测试状态（宠物需已打开） |
| `pettty hooks` | 安装 Claude Code HTTP hooks |
| `pettty health` | 检查本机桥接 |
| `pettty help` | 帮助 |

#### 安装 `pettty` 命令（只需一次）

```powershell
git clone https://github.com/Wanbinyu/pet-tty.git
cd pet-tty
npm install
powershell -ExecutionPolicy Bypass -File scripts/install-pettty.ps1
```

**新开一个终端**，然后输入：

```powershell
pettty
```

不装 PATH 时，在仓库目录：

```powershell
npm start
```

### 连接 Claude Code

1. 运行 `pettty`，保持宠物开启（监听 **7788**）
2. 运行 `pettty hooks`
3. **重启 Claude Code**，随便聊一句
4. 宠物终端应出现 `publish seq=…` 和 `pettty-ui applied …`
5. 上方连接条 / 气泡应显示「执行中」等状态

无 Claude 自测：

```powershell
pettty test
```

### 功能摘要

- 本机桥 `127.0.0.1:7788`
- HTTP Hooks + 进程在线检测
- 多会话
- 工具状态粘性
- 三通道刷新 UI：事件 emit + 轮询 + **webview 直注**
- 皮肤 / 像素小人
- 中英双语界面

### 隐私

默认只在本机通信。请勿提交 API Key 或个人会话。

### 环境

Node.js 18+、Rust、WebView2；Windows 需 C++ 生成工具。

---

## Status

| Version | Notes |
|--------|--------|
| **0.3.1** | `pettty` CLI · UI delivery fix (eval + poll) · bilingual README |

Repo: [github.com/Wanbinyu/pet-tty](https://github.com/Wanbinyu/pet-tty)
