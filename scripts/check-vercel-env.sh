#!/bin/bash

# Script zum Prüfen und Vergleichen der Vercel Environment Variables

set -e

echo "🔍 Prüfe Vercel Environment Variables..."
echo ""

# Liste alle Variablen
echo "📋 Alle Vercel Environment Variables:"
vercel env ls 2>&1 | head -50

echo ""
echo "🔍 Prüfe spezifische Variablen:"
echo ""

# Prüfe wichtige Variablen
REQUIRED_VARS=(
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

echo "✅ Benötigte Variablen:"
for var in "${REQUIRED_VARS[@]}"; do
  if vercel env ls 2>&1 | grep -q "^[[:space:]]*${var}[[:space:]]"; then
    echo "   ✅ $var - vorhanden"
  else
    echo "   ❌ $var - FEHLT!"
  fi
done

echo ""
echo "💡 Hinweis: Prüfe im Vercel Dashboard, ob die Variablen für 'Build' aktiviert sind!"
echo "   https://vercel.com/daniels-projects-c316ea43/nicnoa/settings/environment-variables"









