#!/bin/bash

# Komplettes Script zum Einrichten aller Environment-Variablen auf Vercel
# Liest aus .env.local und setzt alle Variablen auf Vercel

set -e

echo "🚀 Richte alle Environment-Variablen auf Vercel ein..."
echo ""

# Prüfe ob .env.local existiert
if [ ! -f .env.local ]; then
  echo "❌ .env.local nicht gefunden!"
  echo "💡 Bitte erstelle .env.local mit allen benötigten Variablen"
  exit 1
fi

# Lade Variablen aus .env.local
source .env.local

# Variablen, die gesetzt werden müssen
# ⚠️ Variablen mit "# OPTIONAL" sind optional und das System funktioniert auch ohne sie
VARS_TO_SET=(
  # Core - ERFORDERLICH
  "DATABASE_URL"
  "DIRECT_DATABASE_URL"
  "AUTH_SECRET"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "BLOB_READ_WRITE_TOKEN"
  
  # OAuth Social Login - OPTIONAL
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "LINKEDIN_CLIENT_ID"
  "LINKEDIN_CLIENT_SECRET"
  
  # Google Business Profile API - OPTIONAL
  # System zeigt "wird vorbereitet" Meldung wenn nicht konfiguriert
  "GOOGLE_BUSINESS_CLIENT_ID"
  "GOOGLE_BUSINESS_CLIENT_SECRET"
  "GOOGLE_BUSINESS_REDIRECT_URI"
  "ENCRYPTION_KEY"
  
  # Real-time - OPTIONAL
  "NEXT_PUBLIC_PUSHER_APP_KEY"
  "PUSHER_APP_ID"
  "PUSHER_SECRET"
  "PUSHER_CLUSTER"
  
  # AI Features - OPTIONAL
  "OPENROUTER_API_KEY"
  "OPENROUTER_MODEL"
  
  # Email - OPTIONAL
  "RESEND_API_KEY"
  "EMAIL_FROM"
  
  # Analytics - OPTIONAL
  "NEXT_PUBLIC_POSTHOG_KEY"
  "NEXT_PUBLIC_POSTHOG_HOST"
  
  # Payments - OPTIONAL
  "STRIPE_SECRET_KEY"
  "STRIPE_PUBLISHABLE_KEY"
  "STRIPE_WEBHOOK_SECRET"
)

echo "📋 Variablen, die gesetzt werden:"
for var in "${VARS_TO_SET[@]}"; do
  value="${!var}"
  if [ -z "$value" ]; then
    echo "   ⚠️  $var - NICHT in .env.local gefunden"
  else
    echo "   ✅ $var - vorhanden"
  fi
done

echo ""
echo "💡 WICHTIG: Dieses Script kann die Variablen nicht direkt für 'Build' aktivieren."
echo "   Du musst das Vercel Dashboard verwenden:"
echo "   https://vercel.com/daniels-projects-c316ea43/nicnoa/settings/environment-variables"
echo ""
echo "📋 Für jede Variable:"
echo "   1. Klicke auf 'Edit'"
echo "   2. Aktiviere 'Build'"
echo "   3. Speichere"
echo ""
echo "🔧 Oder verwende die Vercel CLI (interaktiv):"
for var in "${VARS_TO_SET[@]}"; do
  value="${!var}"
  if [ -n "$value" ]; then
    echo ""
    echo "   vercel env add $var"
    echo "   Dann wähle: Production, Preview, Development, Build"
  fi
done









