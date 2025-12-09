#!/bin/bash

# Script zum Aktivieren der Environment-Variablen für 'Build' auf Vercel
# WICHTIG: Dies erfordert manuelle Bestätigung für jede Variable

set -e

echo "🔧 Aktiviere Environment-Variablen für 'Build' auf Vercel..."
echo ""
echo "⚠️  WICHTIG: Dies ist ein interaktiver Prozess!"
echo "   Du musst für jede Variable bestätigen, ob sie für 'Build' aktiviert werden soll."
echo ""

# Variablen, die für Build aktiviert werden müssen
BUILD_VARS=(
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

echo "📋 Variablen, die für 'Build' aktiviert werden sollten:"
for var in "${BUILD_VARS[@]}"; do
  echo "   - $var"
done

echo ""
echo "💡 Anleitung:"
echo "   1. Gehe zu: https://vercel.com/daniels-projects-c316ea43/nicnoa/settings/environment-variables"
echo "   2. Für jede Variable: Klicke auf 'Edit'"
echo "   3. Aktiviere das Häkchen bei 'Build'"
echo "   4. Speichere"
echo ""
echo "🔗 Oder verwende die Vercel CLI (interaktiv):"
echo "   vercel env add <NAME>"
echo "   Dann wähle: Production, Preview, Development, Build"
echo ""
echo "⚠️  Hinweis: Die Vercel CLI unterstützt 'Build' nicht direkt als Option."
echo "   Du musst das Dashboard verwenden oder die Vercel API."


