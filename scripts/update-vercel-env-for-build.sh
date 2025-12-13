#!/bin/bash
# Script zum Aktivieren von DATABASE_URL und DIRECT_DATABASE_URL für Build auf Vercel
# 
# WICHTIG: Dieses Script ist interaktiv und erfordert manuelle Eingabe
# Während des Prompts "Build" zusätzlich zu "Production" auswählen

set -e

echo "🔧 Vercel Environment-Variablen für Build aktivieren"
echo ""
echo "⚠️  Dieses Script ist interaktiv"
echo "   Während jedes Prompts:"
echo "   1. Bestehenden Wert beibehalten (Enter drücken)"
echo "   2. Environments auswählen: Production UND Build (beide!)"
echo ""

# Prüfe ob .env.local existiert
if [ ! -f .env.local ]; then
  echo "❌ .env.local nicht gefunden"
  echo "   Führe zuerst aus: vercel env pull .env.local"
  exit 1
fi

echo "📋 Aktualisiere DATABASE_URL..."
echo "   → Wähle: Production, Build (beide!)"
echo ""
vercel env update DATABASE_URL production

echo ""
echo "📋 Aktualisiere DIRECT_DATABASE_URL..."
echo "   → Wähle: Production, Build (beide!)"
echo ""
vercel env update DIRECT_DATABASE_URL production

echo ""
echo "✅ Fertig! Prüfe die Konfiguration:"
echo ""
vercel env ls | grep -E "DATABASE_URL|DIRECT_DATABASE_URL" | grep -v "nicnoa_"

echo ""
echo "📋 Sollte jetzt 'Production, Build' zeigen (nicht nur 'Production')"
echo ""
echo "🚀 Nächstes Deployment wird automatisch Build-Variablen verwenden"








