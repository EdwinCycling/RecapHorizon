#!/bin/bash
# ============================================================
# Reset git repository + scan for API keys using Gitleaks
# ============================================================

# Stop bij fouten
set -e

# Stap 1 — Controleer of Gitleaks is geïnstalleerd
if ! command -v gitleaks &> /dev/null
then
    echo "⚠️  Gitleaks is niet geïnstalleerd. Installeer via:"
    echo "   brew install gitleaks   # macOS"
    echo "   choco install gitleaks  # Windows"
    echo "   of download van https://github.com/gitleaks/gitleaks "
    exit 1
fi

# Stap 2 — Bevestig voordat we de geschiedenis wissen
echo "⚠️  Dit script gaat ALLE Git-geschiedenis wissen."
read -p "Weet je het zeker? (type 'JA' om door te gaan): " confirm
if [ "$confirm" != "JA" ]; then
    echo "❌ Geannuleerd."
    exit 1
fi

# Stap 3 — Verwijder .git map en herinitialiseer
echo "🧹 Verwijderen oude git geschiedenis..."
rm -rf .git
git init
git add .
git commit -m "Clean start: geschiedenis verwijderd en repo opgeschoond"
git branch -M main

# Stap 4 — Remote opnieuw koppelen
read -p "Voer je remote repo URL in (bv. https://github.com/bedrijf/app.git):  " repo_url
git remote add origin "$repo_url"
git push -f origin main

# Stap 5 — Gitleaks scan uitvoeren
echo "🔍 Scannen op secrets..."
gitleaks detect --source . --redact --report-path gitleaks_report.json

echo "✅ Klaar!"
echo "Rapport opgeslagen in: ./gitleaks_report.json"
echo "Controleer of alle API keys ongeldig zijn gemaakt in hun bronplatforms."

# gebruik:
# chmod +x scripts/reset_and_scan.sh
# ./scripts/reset_and_scan.sh