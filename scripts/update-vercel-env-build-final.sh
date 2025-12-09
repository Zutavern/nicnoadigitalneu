#!/bin/bash
# Finales Script - verwendet vercel env update mit interaktiver Eingabe

echo "🔧 Aktiviere Build-Target für Environment-Variablen"
echo ""
echo "⚠️  Dies erfordert interaktive Eingabe"
echo "   Bitte folge den Anweisungen:"
echo ""

echo "1️⃣  DATABASE_URL aktualisieren:"
echo "   → Wert: Enter (bestehenden Wert behalten)"
echo "   → Environments: production,build (beide eingeben!)"
echo ""
read -p "Drücke Enter um fortzufahren..."
vercel env update DATABASE_URL production

echo ""
echo "2️⃣  DIRECT_DATABASE_URL aktualisieren:"
echo "   → Wert: Enter (bestehenden Wert behalten)"
echo "   → Environments: production,build (beide eingeben!)"
echo ""
read -p "Drücke Enter um fortzufahren..."
vercel env update DIRECT_DATABASE_URL production

echo ""
echo "✅ Fertig! Prüfe:"
vercel env ls | grep -E "^ DATABASE_URL|^ DIRECT_DATABASE_URL" | head -2
