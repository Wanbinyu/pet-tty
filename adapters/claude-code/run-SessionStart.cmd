@echo off
set PETDECK_HOOK=SessionStart
set PETDECK_URL=http://127.0.0.1:7788/event
node "%~dp0petdeck-hook.mjs"
exit /b 0
