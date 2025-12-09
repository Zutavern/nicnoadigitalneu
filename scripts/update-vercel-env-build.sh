#!/bin/bash
# Script zum Aktivieren von Build-Target für Environment-Variablen über Vercel API

echo "🔧 Aktiviere Build-Target für DATABASE_URL und DIRECT_DATABASE_URL"
echo ""

# Hole Token aus Vercel Config
VERCEL_TOKEN=""
VERCEL_CONFIG="$HOME/.vercel"

if [ -f "$VERCEL_CONFIG/auth.json" ]; then
    VERCEL_TOKEN=$(cat "$VERCEL_CONFIG/auth.json" | jq -r '.token // empty' 2>/dev/null)
fi

if [ -z "$VERCEL_TOKEN" ] || [ "$VERCEL_TOKEN" = "null" ]; then
    echo "❌ Vercel Token nicht gefunden"
    echo "   Bitte führe aus: vercel login"
    exit 1
fi

# Hole Projekt-ID
PROJECT_ID=$(vercel ls --json 2>/dev/null | jq -r '.[0].projectId' 2>/dev/null)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
    echo "❌ Projekt-ID nicht gefunden"
    exit 1
fi

echo "✅ Token gefunden"
echo "✅ Projekt-ID: $PROJECT_ID"
echo ""

# Hole Environment-Variablen
ENV_LIST=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v10/projects/$PROJECT_ID/env")

DATABASE_URL_ID=$(echo "$ENV_LIST" | jq -r '.envs[] | select(.key=="DATABASE_URL" and (.target[] | contains("production"))) | .id' | head -1)
DIRECT_DATABASE_URL_ID=$(echo "$ENV_LIST" | jq -r '.envs[] | select(.key=="DIRECT_DATABASE_URL" and (.target[] | contains("production"))) | .id' | head -1)

if [ -z "$DATABASE_URL_ID" ] || [ -z "$DIRECT_DATABASE_URL_ID" ]; then
    echo "❌ Environment-Variable IDs nicht gefunden"
    echo "ENV_LIST:"
    echo "$ENV_LIST" | jq -r '.envs[] | select(.key=="DATABASE_URL" or .key=="DIRECT_DATABASE_URL")' 2>/dev/null
    exit 1
fi

echo "✅ IDs gefunden:"
echo "   DATABASE_URL: $DATABASE_URL_ID"
echo "   DIRECT_DATABASE_URL: $DIRECT_DATABASE_URL_ID"
echo ""

# Aktualisiere DATABASE_URL
echo "🔧 Aktualisiere DATABASE_URL für Build..."
RESULT1=$(curl -s -X PATCH "https://api.vercel.com/v10/projects/$PROJECT_ID/env/$DATABASE_URL_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"target":["production","build"]}')

if echo "$RESULT1" | jq -e '.error' >/dev/null 2>&1; then
    echo "❌ Fehler: $(echo "$RESULT1" | jq -r '.error.message')"
else
    echo "✅ DATABASE_URL aktualisiert"
    echo "   Targets: $(echo "$RESULT1" | jq -r '.target | join(", ")')"
fi

echo ""

# Aktualisiere DIRECT_DATABASE_URL
echo "🔧 Aktualisiere DIRECT_DATABASE_URL für Build..."
RESULT2=$(curl -s -X PATCH "https://api.vercel.com/v10/projects/$PROJECT_ID/env/$DIRECT_DATABASE_URL_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"target":["production","build"]}')

if echo "$RESULT2" | jq -e '.error' >/dev/null 2>&1; then
    echo "❌ Fehler: $(echo "$RESULT2" | jq -r '.error.message')"
else
    echo "✅ DIRECT_DATABASE_URL aktualisiert"
    echo "   Targets: $(echo "$RESULT2" | jq -r '.target | join(", ")')"
fi

echo ""
echo "✅ Fertig! Prüfe die Konfiguration:"
vercel env ls | grep -E "^ DATABASE_URL|^ DIRECT_DATABASE_URL" | head -2
