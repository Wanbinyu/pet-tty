# Install PetDeck hooks into Claude Code user settings.
# Usage (PetDeck + Claude both on this machine):
#   powershell -ExecutionPolicy Bypass -File G:\skill\petdeck\adapters\claude-code\install-claude-hooks.ps1

$ErrorActionPreference = "Stop"

$hookJs = (Resolve-Path (Join-Path $PSScriptRoot "petdeck-hook.mjs")).Path
# Claude hooks prefer forward slashes on Windows
$hookJsUnix = $hookJs -replace "\\", "/"
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) {
  Write-Host "ERROR: node not found in PATH. Install Node.js first."
  exit 1
}

$settingsPath = Join-Path $env:USERPROFILE ".claude\settings.json"
if (-not (Test-Path $settingsPath)) {
  New-Item -ItemType Directory -Force -Path (Split-Path $settingsPath) | Out-Null
  "{}" | Set-Content -Path $settingsPath -Encoding utf8
}

# Backup (never print file contents — may contain secrets)
$bak = "$settingsPath.petdeck-bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $settingsPath $bak -Force
Write-Host "Backup: $bak"

$raw = Get-Content -Raw -Path $settingsPath
if ([string]::IsNullOrWhiteSpace($raw)) { $raw = "{}" }
$settings = $raw | ConvertFrom-Json

function New-HookEntry([string]$phase) {
  # Windows-safe: set env then run node; stdin still comes from Claude
  $cmd = "cmd /c `"set PETDECK_HOOK=$phase&& set PETDECK_URL=http://127.0.0.1:7788/event&& node `"$hookJsUnix`"`""
  return [pscustomobject]@{
    matcher = ""
    hooks   = @(
      [pscustomobject]@{
        type    = "command"
        command = $cmd
      }
    )
  }
}

$hooks = [pscustomobject]@{
  PreToolUse   = @((New-HookEntry "PreToolUse"))
  PostToolUse  = @((New-HookEntry "PostToolUse"))
  Notification = @((New-HookEntry "Notification"))
  Stop         = @((New-HookEntry "Stop"))
}

# Attach / replace PetDeck hooks block
$settings | Add-Member -NotePropertyName hooks -NotePropertyValue $hooks -Force

# Write without BOM issues
$json = $settings | ConvertTo-Json -Depth 20
[System.IO.File]::WriteAllText($settingsPath, $json)

Write-Host ""
Write-Host "OK: PetDeck hooks installed into Claude settings."
Write-Host "  settings: $settingsPath"
Write-Host "  hook:     $hookJsUnix"
Write-Host "  node:     $node"
Write-Host ""
Write-Host "Next:"
Write-Host "  1) Keep PetDeck running (npm run tauri dev)"
Write-Host "  2) Fully quit and reopen Claude Code terminal"
Write-Host "  3) Ask Claude to edit a file — pet bubble should update"
Write-Host ""
Write-Host "Test bridge only (no Claude):"
Write-Host "  .\send-test-event.ps1 -State thinking -Title 'hello'"
