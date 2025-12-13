#!/bin/bash

# Script zum Aktivieren der Environment-Variablen für 'Build' über die Vercel API

set -e

echo "🔧 Aktiviere Environment-Variablen für 'Build' über Vercel API..."
echo ""

# Prüfe ob VERCEL_TOKEN gesetzt ist
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN ist nicht gesetzt!"
  echo "💡 Hole Token: vercel login"
  echo "   Dann: export VERCEL_TOKEN=\$(vercel whoami --token 2>/dev/null || echo '')"
  exit 1
fi

# Hole Projekt-ID
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

# Variablen, die für Build aktiviert werden sollen
VARS=(
  "DATABASE_URL"
  "DIRECT_DATABASE_URL"
  "AUTH_SECRET"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "BLOB_READ_WRITE_TOKEN"
)

echo "📋 Aktiviere Variablen für Build..."
for VAR_NAME in "${VARS[@]}"; do
  echo "   🔧 Aktiviere '$VAR_NAME' für Build..."
  
  # Hole die aktuelle Variable
  VAR_DATA=$(curl -s -X GET \
    "https://api.vercel.com/v9/projects/$PROJECT_ID/env?key=$VAR_NAME&teamId=$ORG_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN")
  
  VAR_ID=$(echo "$VAR_DATA" | jq -r '.envs[0].id // empty')
  
  if [ -z "$VAR_ID" ]; then
    echo "   ⚠️  Variable '$VAR_NAME' nicht gefunden, überspringe"
    continue
  fi
  
  # Hole aktuelle Targets
  CURRENT_TARGETS=$(echo "$VAR_DATA" | jq -r '.envs[0].target[] // []')
  
  # Prüfe ob Build bereits aktiviert ist
  if echo "$CURRENT_TARGETS" | grep -q "build"; then
    echo "   ✅ '$VAR_NAME' ist bereits für Build aktiviert"
    continue
  fi
  
  # Füge Build zu Targets hinzu
  NEW_TARGETS=$(echo "$CURRENT_TARGETS" | jq -s '. + ["build"]')
  
  # Aktualisiere Variable
  UPDATE_RESPONSE=$(curl -s -X PATCH \
    "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$VAR_ID?teamId=$ORG_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"target\": $NEW_TARGETS
    }")
  
  if echo "$UPDATE_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo "   ❌ Fehler beim Aktualisieren von '$VAR_NAME':"
    echo "$UPDATE_RESPONSE" | jq -r '.error.message // .error'
  else
    echo "   ✅ '$VAR_NAME' für Build aktiviert"
  fi
done

echo ""
echo "✅ Fertig!"
echo ""
echo "💡 Starte ein neues Deployment:"
echo "   vercel --prod"









