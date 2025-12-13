#!/bin/bash

# Script zum Setzen der Environment-Variablen auf Vercel und Aktivieren für Build
# Verwendet Vercel CLI und API

set -e

echo "🚀 Setze Environment-Variablen auf Vercel und aktiviere für Build..."
echo ""

# Prüfe ob .env existiert
if [ ! -f .env ]; then
  echo "❌ .env nicht gefunden!"
  exit 1
fi

# Lade Variablen aus .env
source .env

# Hole Projekt-ID
echo "🔍 Hole Projekt-Informationen..."
PROJECT_INFO=$(vercel project ls --json 2>/dev/null | jq -r '.projects[] | select(.name == "nicnoa")')
PROJECT_ID=$(echo "$PROJECT_INFO" | jq -r '.id')
ORG_ID=$(echo "$PROJECT_INFO" | jq -r '.orgId')

if [ -z "$PROJECT_ID" ] || [ -z "$ORG_ID" ]; then
  echo "❌ Projekt 'nicnoa' nicht gefunden!"
  exit 1
fi

echo "✅ Projekt-ID: $PROJECT_ID"
echo "✅ Org-ID: $ORG_ID"
echo ""

# Variablen, die gesetzt werden müssen
VARS=(
  "DATABASE_URL"
  "DIRECT_DATABASE_URL"
  "AUTH_SECRET"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "BLOB_READ_WRITE_TOKEN"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "LINKEDIN_CLIENT_ID"
  "LINKEDIN_CLIENT_SECRET"
)

echo "📋 Setze Variablen..."
for var in "${VARS[@]}"; do
  value="${!var}"
  if [ -z "$value" ]; then
    echo "   ⚠️  $var - nicht in .env gefunden, überspringe"
    continue
  fi
  
  echo "   🔧 Setze $var..."
  
  # Setze Variable für alle Umgebungen
  echo "$value" | vercel env add "$var" production preview development 2>&1 | grep -v "Encrypted" || {
    # Falls Variable bereits existiert, aktualisiere sie
    echo "   ⚠️  $var existiert bereits, aktualisiere..."
    echo "$value" | vercel env rm "$var" --yes 2>&1 > /dev/null || true
    echo "$value" | vercel env add "$var" production preview development 2>&1 | grep -v "Encrypted" || true
  }
done

echo ""
echo "✅ Variablen gesetzt!"
echo ""
echo "💡 WICHTIG: Für 'Build' aktivieren über API..."
echo "   Dies erfordert einen VERCEL_TOKEN"
echo ""
echo "🔧 Um Build zu aktivieren, verwende:"
echo "   ./scripts/activate-build-env-vars.sh"
echo ""
echo "   Oder manuell im Dashboard:"
echo "   https://vercel.com/daniels-projects-c316ea43/nicnoa/settings/environment-variables"







