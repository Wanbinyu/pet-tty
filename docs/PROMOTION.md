# 推广文案 / Promotion Copy

现成可发的文案,按渠道分。**发之前务必先录一个 15-30 秒演示 gif**(桌宠对 Claude 状态的反应),那是转化率最高的素材。录完存成 `docs/demo.gif` 并把 README 顶部的演示位取消注释。

仓库链接统一用:`https://github.com/Wanbinyu/pet-tty`

---

## 1. Show HN（英文）

**Title:**
```
Show HN: PetDeck – a desktop pet that shows what Claude Code is doing
```

**Body:**
```
Hi HN — I built a tiny always-on-top desktop pet that visualizes what your AI coding agent is up to: thinking, reading a file, editing, running tests, or waiting for you to confirm. No dashboard, no terminal-staring — just a glance at the corner of your screen.

How it works: Claude Code's hooks fire into a local HTTP bridge (Rust, 127.0.0.1:7788), and the pet reflects the state via a status bubble + the character's animation. Everything runs locally — nothing leaves your machine.

What's in it:
- Multi-session stack (several Claude terminals at once)
- Sticky tool states (a long read/edit won't flash back to idle)
- Skins: built-in vector characters, or import DyberPet-format animated mods (PNG sequence frames), or synthesize actions from a single image
- Bilingual UI (中文 / English)

Windows for now (Tauri 2 transparent always-on-top window). Open source: https://github.com/Wanbinyu/pet-tty

I'd love feedback on two things:
1. Would multi-agent support (Codex CLI, Gemini CLI, Cursor) be worth building?
2. Transparent-window drag smoothness on Windows — any Tauri/Electron folks with tips beyond pausing render loops mid-drag?

Install: clone, npm install, then `pettty`.
```

---

## 2. Reddit r/ClaudeAI（英文，短）

**Title:**
```
I made a desktop pet that reacts to Claude Code's state (thinking/editing/waiting/success)
```

**Body:**
```
She tilts her head when Claude thinks, types along when it edits, cheers when it's done, and waves when it needs you. 100% local (Tauri + Rust bridge, no cloud). You can import DyberPet animated character mods or generate a sprite from a single image. Windows, open source.

Demo gif in the comments. Repo: https://github.com/Wanbinyu/pet-tty

What character would you want as a skin?
```

---

## 3. X / Twitter（英文，短）

```
Built a desktop pet for Claude Code — she tilts her head when Claude thinks, types along when it edits, and cheers when it's done. 100% local, no cloud. Open source: https://github.com/Wanbinyu/pet-tty #ClaudeCode #DevTools
```
（配演示 gif 或短视频。）

---

## 4. 掘金 / 知乎（中文，长文）

**标题：**
```
给 Claude Code 做了个桌面女仆——你的 AI 程序员在干嘛，她替它告诉你
```

**正文：**
```
用 Claude Code 写代码时，我总忍不住切回终端看它跑到哪一步了：是在思考、在读文件、在改代码，还是在等我确认。于是做了 PetDeck——一个挂在桌面角落的小桌宠，用气泡和动作实时显示 Claude Code 的状态，瞄一眼就行，不用盯终端。

她思考时歪头，改文件时跟着敲，跑完会跳一下，等你确认时招手。多个 Claude 终端同时开也能各自显示。

技术上：Tauri 2 + Rust 本地桥（127.0.0.1:7788），Claude 的 hooks 把状态推给桥，桌宠再反映出来。全程本地，不上云，不传任何数据。

皮肤可以换：内置原创角色（女仆、橘喵、机器人），也能导入 DyberPet 格式的动画模组（流萤、纳西妲那些，PNG 序列帧），或者拿一张图自动抠图+合成动作。版权角色由用户自己下载导入，仓库不托管。

目前 Windows，开源：https://github.com/Wanbinyu/pet-tty

想听大家的：要是再加 Codex CLI / Gemini CLI 支持会有人用吗？以及透明窗拖拽顺滑这块有没有更好的招。

安装：clone → npm install → pettty。
```

---

## 5. B 站视频简介（中文，短）

```
给 Claude Code 做的桌面桌宠：思考时歪头、改代码时跟着敲、搞定会跳一下、等你确认会招手。全程本地，不上云。支持导入 DyberPet 动画模组（流萤等）或从单张图生成动作，也能换内置女仆/猫/机器人。

开源：github.com/Wanbinyu/pet-tty
安装：clone → npm install → pettty

#ClaudeCode #AI编程 #桌宠 #程序员桌面 #效率工具
```

---

## 6. V2EX / 即刻（中文，短）

```
分享个给 Claude Code 做的桌面桌宠（Tauri，本地运行）：用气泡+动作显示 Claude 在想/读/改/等你，不用盯终端。可导入 DyberPet 动画模组或从单张图合成动作，内置女仆/猫/机器人。Windows，开源：https://github.com/Wanbinyu/pet-tty
```

---

## 发布前 checklist

- [ ] 录演示 gif（15-30s），存 `docs/demo.gif`，取消 README 顶部演示位注释。
- [ ] GitHub 仓库设置里加 topics：`claude-code` `desktop-pet` `tauri` `ai-coding` `codex` `windows` `rust`。
- [ ] 加 LICENSE 文件（建议 MIT），license 徽章才会显示正常。
- [ ] 截几张皮肤/状态图放 `docs/` 或 issue 里，文案里引用。
- [ ] 发 Release（`pettty build` 出 exe，挂到 GitHub Releases），让非开发者也能用。
```
