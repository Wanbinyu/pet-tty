@echo off
REM Windows shim: pettty → node bin/pettty.mjs
setlocal
set "SCRIPT_DIR=%~dp0"
node "%SCRIPT_DIR%pettty.mjs" %*
exit /b %ERRORLEVEL%
