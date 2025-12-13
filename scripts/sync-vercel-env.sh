#!/bin/bash

# Script zum Synchronisieren der Environment-Variablen zwischen lokal und Vercel

set -e

echo "🔍 Synchronisiere Environment-Variablen mit Vercel..."
echo ""

# Prüfe ob .env.local existiert
if [ ! -f .env.local ]; then
  echo "❌ .env.local nicht gefunden!"
  echo "💡 Bitte erstelle .env.local mit allen benötigten Variablen"
  exit 1
fi

echo "📋 Benötigte Variablen:"
REQUIRED_VARS=(
  "DATABASE_URL"
  "DIRECT_DATABASE_URL"
  "AUTH_SECRET"
  "NEXTAUTH_URL"
  "BLOB_READ_WRITE_TOKEN"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "LINKEDIN_CLIENT_ID"
  "LINKEDIN_CLIENT_SECRET"
)

echo ""
echo "🔍 Prüfe welche Variablen lokal vorhanden sind:"
for var in "${REQUIRED_VARS[@]}"; do
  if grep -q "^${var}=" .env.local; then
    echo "   ✅ $var - lokal vorhanden"
  else
    echo "   ⚠️  $var - lokal NICHT gefunden"
  fi
done

echo ""
echo "💡 WICHTIG: Für Vercel müssen die Variablen für 'Build' aktiviert sein!"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Prüfe im Vercel Dashboard, ob alle Variablen für 'Build' aktiviert sind"
echo "   2. Falls nicht, aktiviere sie manuell im Dashboard"
echo "   3. Oder verwende: vercel env add <NAME> --scope production preview development"
echo ""
echo "🔗 Dashboard: https://vercel.com/daniels-projects-c316ea43/nicnoa/settings/environment-variables"







