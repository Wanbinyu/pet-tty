# Diagnose PetDeck <-> Claude connection
Write-Host "=== 1) PetDeck bridge ===" -ForegroundColor Cyan
try {
  $h = Invoke-RestMethod http://127.0.0.1:7788/health
  Write-Host "  OK  bridge up on port $($h.port)" -ForegroundColor Green
} catch {
  Write-Host "  FAIL  PetDeck not running — start: cd G:\skill\petdeck; npm run tauri dev" -ForegroundColor Red
  exit 1
}

Write-Host "=== 2) Hook files ===" -ForegroundColor Cyan
$hook = "G:\skill\petdeck\adapters\claude-code\petdeck-hook.mjs"
$cmd  = "G:\skill\petdeck\adapters\claude-code\run-PreToolUse.cmd"
if (Test-Path $hook) { Write-Host "  OK  $hook" -ForegroundColor Green } else { Write-Host "  FAIL missing hook mjs" -ForegroundColor Red }
if (Test-Path $cmd)  { Write-Host "  OK  $cmd" -ForegroundColor Green } else { Write-Host "  FAIL missing run-PreToolUse.cmd — run: node fix-hooks.mjs" -ForegroundColor Red }

Write-Host "=== 3) Claude settings hooks ===" -ForegroundColor Cyan
$sp = Join-Path $env:USERPROFILE ".claude\settings.json"
if (-not (Test-Path $sp)) {
  Write-Host "  FAIL no settings.json" -ForegroundColor Red
  exit 1
}
$j = Get-Content $sp -Raw | ConvertFrom-Json
if (-not $j.hooks) {
  Write-Host "  FAIL no hooks in settings — run: node fix-hooks.mjs" -ForegroundColor Red
  exit 1
}
Write-Host "  OK  phases: $($j.hooks.PSObject.Properties.Name -join ', ')" -ForegroundColor Green
Write-Host "  OK  PreToolUse matcher=$($j.hooks.PreToolUse[0].matcher)" -ForegroundColor Green

Write-Host "=== 4) Send fake Claude event ===" -ForegroundColor Cyan
$payload = '{"hook_event_name":"PreToolUse","tool_name":"Edit","tool_input":{"file_path":"verify.ts"},"session_id":"verify"}'
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $cmd
$psi.RedirectStandardInput = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
$p = [Diagnostics.Process]::Start($psi)
$p.StandardInput.WriteLine($payload)
$p.StandardInput.Close()
$p.WaitForExit(8000)
if ($p.ExitCode -eq 0) {
  Write-Host "  OK  hook ran (exit 0) — pet should show Editing verify.ts" -ForegroundColor Green
} else {
  Write-Host "  FAIL hook exit $($p.ExitCode)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== What you should do ===" -ForegroundColor Cyan
Write-Host "1. Keep PetDeck window open"
Write-Host "2. FULLY quit Claude Code (close all terminals)"
Write-Host "3. Start Claude again"
Write-Host "4. Type any message so it uses a tool (e.g. read a file)"
Write-Host "5. Pet bubble should update; double-click pet → see Live: claude-code"
Write-Host ""
Write-Host "Note: Claude does NOT print 'connected to pet' in the terminal."
Write-Host "Connection is silent hooks — you only SEE it on the pet."
