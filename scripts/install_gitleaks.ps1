# ============================================================
# Install Gitleaks (Windows) via GitHub Releases
# ============================================================

$ErrorActionPreference = 'Stop'

Write-Host "Gitleaks installatie via GitHub releases" -ForegroundColor Cyan

# Maak doelmap aan: ../tools/gitleaks
$dest = Join-Path $PSScriptRoot '..\tools\gitleaks'
New-Item -ItemType Directory -Force -Path $dest | Out-Null

try {
  $release = Invoke-RestMethod -UseBasicParsing -Uri 'https://api.github.com/repos/gitleaks/gitleaks/releases/latest'
} catch {
  Write-Error "Kon GitHub releases niet ophalen."
}

$asset = $release.assets | Where-Object { $_.name -match 'windows.*(x64|amd64).*zip' } | Select-Object -First 1
if (-not $asset) {
  Write-Error "Geen geschikte Windows x64/amd64 asset gevonden in de laatste release."
}

$zipPath = Join-Path $dest $asset.name
Write-Host "Downloaden: $($asset.browser_download_url)" -ForegroundColor Yellow
Invoke-WebRequest -UseBasicParsing -Uri $asset.browser_download_url -OutFile $zipPath

Write-Host "Uitpakken naar: $dest" -ForegroundColor Yellow
Expand-Archive -Path $zipPath -DestinationPath $dest -Force

$exe = Get-ChildItem $dest -Filter 'gitleaks*.exe' -Recurse | Select-Object -First 1
if (-not $exe) {
  Write-Error "gitleaks.exe niet gevonden na uitpakken."
}

Write-Host "Gevonden: $($exe.FullName)" -ForegroundColor Green
& $exe.FullName version

Write-Host "Gebruik: & \"$($exe.FullName)\" detect --source . --redact --report-path gitleaks_report.json" -ForegroundColor Cyan