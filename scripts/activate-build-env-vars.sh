#!/bin/bash

# Script zum Aktivieren der Environment-Variablen für Build über Vercel API
# Benötigt: Account-Token vom Dashboard (https://vercel.com/account/tokens)

set -e

PROJECT_ID="prj_x1OEzPaqiG3zstwvGJja0cM8UxIX"
ORG_ID="team_oQlTAXAjO0OlbvODLUcyeZeF"

echo "🔧 Aktiviere Environment-Variablen für Build..."
echo ""

# Prüfe ob Token gesetzt ist
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN nicht gesetzt!"
  echo ""
  echo "📋 So erstellst du ein Token:"
  echo "   1. Öffne: https://vercel.com/account/tokens"
  echo "   2. Klicke auf 'Create Token'"
  echo "   3. Gib einen Namen ein (z.B. 'Build Env Vars')"
  echo "   4. Kopiere das Token"
  echo ""
  echo "💡 Dann führe aus:"
  echo "   export VERCEL_TOKEN='dein-token-hier'"
  echo "   ./scripts/activate-build-env-vars.sh"
  exit 1
fi

echo "✅ Token gefunden"
echo ""

# Hole alle Environment-Variablen
echo "🔍 Hole Environment-Variablen..."
ENV_LIST=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v10/projects/$PROJECT_ID/env")

# Finde IDs für DATABASE_URL und DIRECT_DATABASE_URL (Production)
DATABASE_URL_ID=$(echo "$ENV_LIST" | jq -r '.envs[] | select(.key=="DATABASE_URL" and (.target[] | contains("production"))) | .id' | head -1)
DIRECT_DATABASE_URL_ID=$(echo "$ENV_LIST" | jq -r '.envs[] | select(.key=="DIRECT_DATABASE_URL" and (.target[] | contains("production"))) | .id' | head -1)

if [ -z "$DATABASE_URL_ID" ] || [ "$DATABASE_URL_ID" = "null" ]; then
  echo "❌ DATABASE_URL (Production) nicht gefunden"
  exit 1
fi

if [ -z "$DIRECT_DATABASE_URL_ID" ] || [ "$DIRECT_DATABASE_URL_ID" = "null" ]; then
  echo "❌ DIRECT_DATABASE_URL (Production) nicht gefunden"
  exit 1
fi

echo "✅ DATABASE_URL ID: $DATABASE_URL_ID"
echo "✅ DIRECT_DATABASE_URL ID: $DIRECT_DATABASE_URL_ID"
echo ""

# Aktualisiere DATABASE_URL für Build
echo "🔧 Aktualisiere DATABASE_URL für Build..."
RESULT=$(curl -s -X PATCH \
  "https://api.vercel.com/v10/projects/$PROJECT_ID/env/$DATABASE_URL_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target":["production","preview","development","build"]}')

if echo "$RESULT" | jq -e '.target[] | select(. == "build")' > /dev/null 2>&1; then
  echo "✅ DATABASE_URL: Build aktiviert"
else
  echo "❌ Fehler beim Aktualisieren von DATABASE_URL"
  echo "$RESULT" | jq '.' 2>/dev/null || echo "$RESULT"
  exit 1
fi

# Aktualisiere DIRECT_DATABASE_URL für Build
echo "🔧 Aktualisiere DIRECT_DATABASE_URL für Build..."
RESULT=$(curl -s -X PATCH \
  "https://api.vercel.com/v10/projects/$PROJECT_ID/env/$DIRECT_DATABASE_URL_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target":["production","preview","development","build"]}')

if echo "$RESULT" | jq -e '.target[] | select(. == "build")' > /dev/null 2>&1; then
  echo "✅ DIRECT_DATABASE_URL: Build aktiviert"
else
  echo "❌ Fehler beim Aktualisieren von DIRECT_DATABASE_URL"
  echo "$RESULT" | jq '.' 2>/dev/null || echo "$RESULT"
  exit 1
fi

echo ""
echo "✅ Fertig! Beide Variablen sind jetzt für Build aktiviert."
echo ""
echo "💡 Prüfe im Dashboard:"
echo "   https://vercel.com/daniels-projects-c316ea43/nicnoa/settings/environment-variables"
echo ""
echo "🚀 Starte einen neuen Deployment, um die Änderungen zu testen."









