@echo off
REM Claude Code Windows hook wrapper — no nested-quote hell
set PETDECK_URL=http://127.0.0.1:7788/event
if not defined PETDECK_HOOK set PETDECK_HOOK=PreToolUse
node "%~dp0petdeck-hook.mjs"
exit /b 0
