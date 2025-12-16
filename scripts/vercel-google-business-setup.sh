#!/bin/bash

# =============================================================================
# Google Business Profile API - Vercel Environment Setup
# =============================================================================
# Dieses Script hilft beim Einrichten der Google Business API auf Vercel
# =============================================================================

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║     Google Business Profile API - Vercel Environment Setup          ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Generiere einen zufälligen ENCRYPTION_KEY
GENERATED_KEY=$(openssl rand -hex 32)

echo "📋 Folgende Variablen werden für die Google Business Integration benötigt:"
echo ""
echo "┌─────────────────────────────────────────────────────────────────────────┐"
echo "│ 1. GOOGLE_BUSINESS_CLIENT_ID                                           │"
echo "│    → OAuth 2.0 Client ID aus der Google Cloud Console                 │"
echo "│    → https://console.cloud.google.com/apis/credentials                │"
echo "│                                                                         │"
echo "│ 2. GOOGLE_BUSINESS_CLIENT_SECRET                                       │"
echo "│    → OAuth 2.0 Client Secret aus der Google Cloud Console             │"
echo "│                                                                         │"
echo "│ 3. GOOGLE_BUSINESS_REDIRECT_URI                                        │"
echo "│    → z.B.: https://nicnoa.com/api/auth/google-business/callback       │"
echo "│                                                                         │"
echo "│ 4. ENCRYPTION_KEY                                                       │"
echo "│    → 64-Zeichen Hex-String für Token-Verschlüsselung                  │"
echo "└─────────────────────────────────────────────────────────────────────────┘"
echo ""
echo "🔑 Generierter ENCRYPTION_KEY (kopieren und verwenden):"
echo ""
echo "   $GENERATED_KEY"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Vercel CLI Befehle zum Hinzufügen der Variablen:"
echo ""
echo "   # ENCRYPTION_KEY hinzufügen (generierter Wert oben kopieren):"
echo "   vercel env add ENCRYPTION_KEY production preview"
echo ""
echo "   # Google Business Credentials hinzufügen:"
echo "   vercel env add GOOGLE_BUSINESS_CLIENT_ID production preview"
echo "   vercel env add GOOGLE_BUSINESS_CLIENT_SECRET production preview"
echo "   vercel env add GOOGLE_BUSINESS_REDIRECT_URI production preview"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 Google Cloud Console Setup:"
echo ""
echo "   1. Gehe zu: https://console.cloud.google.com/"
echo "   2. Erstelle ein neues Projekt oder wähle ein bestehendes"
echo "   3. Aktiviere die 'Google Business Profile API'"
echo "   4. Gehe zu 'APIs & Services' → 'Credentials'"
echo "   5. Erstelle eine 'OAuth 2.0 Client ID' (Web Application)"
echo "   6. Füge als Redirect URI hinzu:"
echo "      - https://nicnoa.com/api/auth/google-business/callback"
echo "      - http://localhost:3000/api/auth/google-business/callback (für Dev)"
echo "   7. Kopiere Client ID und Client Secret"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Das System funktioniert auch OHNE diese Variablen!"
echo "   Benutzer sehen dann eine 'Integration wird vorbereitet' Meldung."
echo ""

