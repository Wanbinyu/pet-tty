# Install `pettty` command for the current user (Windows)
# Usage: powershell -ExecutionPolicy Bypass -File scripts/install-pettty.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $Root "bin\pettty.mjs"))) {
  $Root = Get-Location
}

$BinDir = Join-Path $env:USERPROFILE ".local\bin"
New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

$Launcher = Join-Path $BinDir "pettty.cmd"
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
  Write-Host "ERROR: node not found in PATH. Install Node.js 18+ first." -ForegroundColor Red
  exit 1
}
$Node = $nodeCmd.Source

$mjs = Join-Path $Root "bin\pettty.mjs"
if (-not (Test-Path $mjs)) {
  Write-Host "ERROR: missing $mjs" -ForegroundColor Red
  exit 1
}

# Absolute path launcher so it works from any cwd
@"
@echo off
node "$mjs" %*
"@ | Set-Content -Path $Launcher -Encoding ASCII

Write-Host "[pettty] installed launcher: $Launcher" -ForegroundColor Green
Write-Host "[pettty] project root: $Root"

# Ensure user PATH contains ~/.local/bin
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $userPath) { $userPath = "" }
$parts = $userPath -split ";" | Where-Object { $_ -and $_.Trim() -ne "" }
if ($parts -notcontains $BinDir) {
  $newPath = if ($userPath.Trim().EndsWith(";") -or $userPath -eq "") {
    "$userPath$BinDir"
  } else {
    "$userPath;$BinDir"
  }
  [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
  Write-Host "[pettty] added to User PATH: $BinDir" -ForegroundColor Green
  Write-Host "[pettty] open a NEW terminal, then type:  pettty" -ForegroundColor Cyan
} else {
  Write-Host "[pettty] PATH already contains $BinDir"
  Write-Host "[pettty] type:  pettty" -ForegroundColor Cyan
}

# Current session too
if ($env:Path -notlike "*$BinDir*") {
  $env:Path = "$BinDir;$env:Path"
}

Write-Host ""
Write-Host "Try now in this window:" -ForegroundColor Yellow
Write-Host "  pettty help"
Write-Host "  pettty"
