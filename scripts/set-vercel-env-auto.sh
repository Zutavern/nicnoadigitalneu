#!/bin/bash

# Automatisiertes Script zum Setzen der Vercel Environment Variables
# Verwendet expect für interaktive Eingaben

set -e

echo "🚀 Setze Environment-Variablen automatisch auf Vercel..."
echo ""

# Prüfe ob .env existiert
if [ ! -f .env ]; then
  echo "❌ .env nicht gefunden!"
  exit 1
fi

# Prüfe ob expect installiert ist
if ! command -v expect &> /dev/null; then
  echo "❌ 'expect' ist nicht installiert!"
  echo "💡 Installiere mit: brew install expect (macOS) oder apt-get install expect (Linux)"
  exit 1
fi

# Lade Variablen
source .env

# Funktion zum Setzen einer Variable
set_var() {
  local var_name=$1
  local var_value=$2
  local env=$3
  
  echo "   🔧 Setze $var_name für $env..."
  
  expect <<EOF
spawn vercel env add $var_name $env
expect {
  "What's the value of" {
    send "$var_value\r"
    expect eof
  }
  "already exists" {
    send "y\r"
    expect "What's the value of"
    send "$var_value\r"
    expect eof
  }
  eof
}
EOF
}

# Setze Variablen für alle Umgebungen
ENVS=("production" "preview" "development")

echo "📋 Setze Variablen..."
for env in "${ENVS[@]}"; do
  echo ""
  echo "🔧 Umgebung: $env"
  
  if [ -n "$DATABASE_URL" ]; then
    set_var "DATABASE_URL" "$DATABASE_URL" "$env"
  fi
  
  if [ -n "$DIRECT_DATABASE_URL" ]; then
    set_var "DIRECT_DATABASE_URL" "$DIRECT_DATABASE_URL" "$env"
  fi
  
  if [ -n "$AUTH_SECRET" ]; then
    set_var "AUTH_SECRET" "$AUTH_SECRET" "$env"
  fi
  
  if [ -n "$NEXTAUTH_URL" ]; then
    set_var "NEXTAUTH_URL" "$NEXTAUTH_URL" "$env"
  fi
done

echo ""
echo "✅ Variablen gesetzt!"
echo ""
echo "⚠️  WICHTIG: 'Build' muss noch aktiviert werden!"
echo "   Gehe zu: https://vercel.com/daniels-projects-c316ea43/nicnoa/settings/environment-variables"
echo "   → Für jede Variable: Edit → Build aktivieren → Save"

