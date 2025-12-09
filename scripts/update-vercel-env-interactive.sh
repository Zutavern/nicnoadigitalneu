#!/bin/bash
# Interaktives Script zum Aktivieren von DATABASE_URL für Build auf Vercel
# 
# Führt vercel env update aus und zeigt klare Anweisungen

set -e

echo "🔧 Vercel Environment-Variablen für Build aktivieren"
echo ""
echo "📋 Dieses Script führt interaktive Prompts aus"
echo "   Bitte folge den Anweisungen:"
echo ""

if [ ! -f .env.local ]; then
  echo "❌ .env.local nicht gefunden"
  echo "   Führe zuerst aus: vercel env pull .env.local"
  exit 1
fi

echo "1️⃣  Aktualisiere DATABASE_URL..."
echo "   → Wenn nach Wert gefragt wird: Enter drücken (bestehenden Wert behalten)"
echo "   → Wenn nach Environments gefragt wird: 'production,build' eingeben"
echo ""
read -p "Drücke Enter um fortzufahren..."
vercel env update DATABASE_URL production

echo ""
echo "2️⃣  Aktualisiere DIRECT_DATABASE_URL..."
echo "   → Wenn nach Wert gefragt wird: Enter drücken (bestehenden Wert behalten)"
echo "   → Wenn nach Environments gefragt wird: 'production,build' eingeben"
echo ""
read -p "Drücke Enter um fortzufahren..."
vercel env update DIRECT_DATABASE_URL production

echo ""
echo "✅ Fertig! Prüfe die Konfiguration:"
echo ""
vercel env ls | grep -E "^ DATABASE_URL|^ DIRECT_DATABASE_URL" | head -2

echo ""
echo "📋 Sollte jetzt 'Production, Build' zeigen"
echo "   Falls nicht, wiederhole den Vorgang und wähle 'build' zusätzlich"


