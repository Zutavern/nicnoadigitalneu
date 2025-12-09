#!/bin/bash
# Automatisches Update der Vercel Environment-Variablen für Build
# Liest Werte aus .env.local und aktualisiert sie

set -e

if [ ! -f .env.local ]; then
  echo "❌ .env.local nicht gefunden"
  exit 1
fi

# Lese Werte aus .env.local
DATABASE_URL=$(grep "^DATABASE_URL=" .env.local | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
DIRECT_DATABASE_URL=$(grep "^DIRECT_DATABASE_URL=" .env.local | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DATABASE_URL" ] || [ -z "$DIRECT_DATABASE_URL" ]; then
  echo "❌ DATABASE_URL oder DIRECT_DATABASE_URL nicht in .env.local gefunden"
  exit 1
fi

echo "🔧 Aktualisiere DATABASE_URL für Production + Build..."
echo "$DATABASE_URL" | vercel env update DATABASE_URL production <<EOF
$DATABASE_URL
production,build
EOF

echo ""
echo "🔧 Aktualisiere DIRECT_DATABASE_URL für Production + Build..."
echo "$DIRECT_DATABASE_URL" | vercel env update DIRECT_DATABASE_URL production <<EOF
$DIRECT_DATABASE_URL
production,build
EOF

echo ""
echo "✅ Fertig!"
