# ============================================================
# Reset git repository + scan for API keys using Gitleaks (PowerShell)
# ============================================================

$ErrorActionPreference = 'Stop'

# Stap 1 — Controleer of Gitleaks is geïnstalleerd
if (-not (Get-Command gitleaks -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Gitleaks is niet geïnstalleerd. Installeer via:" -ForegroundColor Yellow
    Write-Host "   winget install --id zricethezav.Gitleaks -e   # Windows (Winget)"
    Write-Host "   choco install gitleaks                        # Windows (Chocolatey)"
    Write-Host "   of download van https://github.com/gitleaks/gitleaks"
    exit 1
}

# Stap 2 — Bevestig voordat we de geschiedenis wissen
Write-Host "⚠️  Dit script gaat ALLE Git-geschiedenis wissen." -ForegroundColor Yellow
$confirm = Read-Host "Weet je het zeker? (type 'JA' om door te gaan)"
if ($confirm -ne 'JA') {
    Write-Host "❌ Geannuleerd." -ForegroundColor Red
    exit 1
}

# Stap 3 — Verwijder .git map en herinitialiseer
Write-Host "🧹 Verwijderen oude git geschiedenis..." -ForegroundColor Cyan
if (Test-Path .git) { Remove-Item -Recurse -Force .git }
git init
git add .
git commit -m "Clean start: geschiedenis verwijderd en repo opgeschoond"
git branch -M main

# Stap 4 — Remote opnieuw koppelen
$repo_url = Read-Host "Voer je remote repo URL in (bv. https://github.com/bedrijf/app.git)"
git remote add origin $repo_url
git push -f origin main

# Stap 5 — Gitleaks scan uitvoeren
Write-Host "🔍 Scannen op secrets..." -ForegroundColor Cyan
gitleaks detect --source . --redact --report-path gitleaks_report.json

Write-Host "✅ Klaar!" -ForegroundColor Green
Write-Host "Rapport opgeslagen in: ./gitleaks_report.json"
Write-Host "Controleer of alle API keys ongeldig zijn gemaakt in hun bronplatforms."

# gebruik:
# powershell -ExecutionPolicy Bypass -File .\scripts\reset_and_scan.ps1