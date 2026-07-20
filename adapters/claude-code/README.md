# Claude Code → PetDeck

PetDeck listens on **`http://127.0.0.1:7788`** while the app is running.

## 1. Start PetDeck

```powershell
cd G:\skill\petdeck
npm run tauri dev
```

Check bridge:

```powershell
Invoke-RestMethod http://127.0.0.1:7788/health
```

## 2. Manual test (no Claude)

```powershell
cd G:\skill\petdeck\adapters\claude-code
.\send-test-event.ps1 -State thinking -Title "Planning" -Detail "demo"
.\send-test-event.ps1 -State waiting_user -Title "Permission needed" -Detail "Allow write?"
.\send-test-event.ps1 -State success -Title "Done"
```

The pet bubble should update.

## 3. Install Claude Code hooks

1. Open Claude Code **settings** JSON (user or project).
2. Merge hooks from [`install-hooks.example.json`](./install-hooks.example.json).
3. **Fix the path** to `petdeck-hook.mjs` if your clone is not `G:/skill/petdeck/...`.
4. Ensure `node` is on PATH.
5. Restart Claude Code / reload settings.

Hook script: [`petdeck-hook.mjs`](./petdeck-hook.mjs)

- Reads hook JSON from **stdin**
- Maps tool phases → `petdeck.event.v1`
- POSTs to the bridge
- Always exits **0** (never blocks the agent)

### Env vars

| Var | Default |
|-----|---------|
| `PETDECK_URL` | `http://127.0.0.1:7788/event` |
| `PETDECK_HOOK` | set per hook entry (`PreToolUse`, …) |

## 4. Event shape

See `src/events/types.ts` — fields: `state`, `title`, `detail`, `needsAttention`, `progress`.

## Troubleshooting

| Symptom | Check |
|---------|--------|
| No change on pet | PetDeck running? `health` OK? |
| Hook errors | Run `node petdeck-hook.mjs` with sample JSON on stdin |
| Port in use | Only one PetDeck instance; port **7788** |
| Claude schema differs | Open hook logs / adjust `mapHook` in `petdeck-hook.mjs` |

Claude Code hook field names vary by version — the mapper accepts several aliases.
