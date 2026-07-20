# 如何把 PetDeck 接到 Claude / 其它工具

## 整体结构（一直如此）

```
  Claude 终端 / Grok / 脚本 / 单步演示
           │
           │  POST http://127.0.0.1:7788/event
           ▼
        PetDeck（必须开着）
           │
           ├─ 气泡显示状态
           ├─ 左键拖动
           └─ 右键换肤 / 设置
```

**桌宠是独立窗口**：连上工具后，拖动、换肤、导入都照常可用。  
工具只负责「推送状态」，不控制窗口。

---

## `send-test-event.ps1` 是干什么的？

它是**假数据测试**，模拟 Claude 发了一条状态，用来确认「桥通不通」。

### 怎么执行

1. **先开 PetDeck**（`npm run tauri dev`）
2. 打开 PowerShell：

```powershell
cd G:\skill\petdeck\adapters\claude-code
.\send-test-event.ps1 -State thinking -Title "测试"
```

或用通用脚本：

```powershell
cd G:\skill\petdeck\adapters
.\send-event.ps1 -Source claude-code -State editing -Title "改文件" -Detail "a.ts"
.\send-event.ps1 -Source grok -State thinking -Title "Grok 思考中"
```

气泡变了 = 连接正常。  
**这不是连上 Claude 本尊**，只是测通道。

---

## 真·连 Claude 终端（推荐 HTTP hooks，延迟更低）

### 一键安装 / 修复

```powershell
node G:\skill\petdeck\adapters\claude-code\fix-hooks.mjs
```

会：

1. 备份 `~/.claude/settings.json`
2. 写入 **type: http** hooks：Claude 直接 POST 到 `http://127.0.0.1:7788/hooks/claude`
3. **不再每次启动 node**（之前慢的主因之一）

### 多终端

多个 Claude 会话都会推到同一只宠：

- **主气泡** = 最近活跃的会话  
- **下方额外卡片** = 其它仍在干活的会话  
- 标题带 `[短session]` 区分

### 你要做的

1. PetDeck 保持运行  
2. **完全退出再打开** Claude Code 终端  
3. 让 Claude 做点事（例如改一个文件）  
4. 看桌宠气泡是否更新  

Inspector 里会显示 `● 实时：claude-code`。

### 卸载 hooks

用安装时生成的备份文件改回，或手动删掉 settings 里的 `"hooks"` 字段。

---

## 连 Grok / 其它工具

目前没有官方 Grok 插件，但**协议已通用**：

| 工具 | 做法 |
|------|------|
| Claude Code | hooks（上面） |
| 任意脚本 | `send-event.ps1 -Source grok ...` |
| Cursor / 自建 | POST JSON 到 `/event` |
| 以后 | 可再做专用适配器 |

`state` 取值：`idle` `thinking` `tool_call` `editing` `waiting_user` `running_tests` `success` `error`

---

## 常见问题

| 现象 | 处理 |
|------|------|
| 脚本 FAIL | 先开 PetDeck，再 `Invoke-RestMethod http://127.0.0.1:7788/health` |
| Claude 不推状态 | 重装 hooks + 重启 Claude；确认 node 在 PATH |
| **读文件很久桌宠一直空闲** | 多数不是「检测不到」：hooks 已 200，但 UI 曾 **几秒后自动回待命**。已改为工具进行中保持忙碌直到 PostToolUse。**请重启 PetDeck** |
| 只想玩桌宠 | 不必接 Claude，演示/换肤即可 |
| 只聊「你好」 | 不调工具时主要靠 UserPromptSubmit；应用工具时才有 Reading/Editing |

### 怎么确认 hooks 真的打到了

Claude 会话日志里若有：

`hook_success` … `exitCode":200` … `7788/hooks/claude`

说明 **HTTP 已成功**。若宠仍空闲，是 UI 显示逻辑问题（已修自动清状态）。
