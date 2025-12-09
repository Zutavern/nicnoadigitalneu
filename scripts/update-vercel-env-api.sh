#!/bin/bash
# Script zum Aktivieren von Build-Umgebung für Environment-Variablen
# Verwendet Vercel API direkt

echo "⚠️  Vercel CLI unterstützt 'build' nicht direkt als Environment"
echo "   Build ist eine Option, die über das Dashboard aktiviert werden muss"
echo ""
echo "📋 Lösung:"
echo "   1. Öffne: https://vercel.com/dashboard"
echo "   2. Projekt 'nicnoa' → Settings → Environment Variables"
echo "   3. DATABASE_URL → Bearbeiten → ✅ 'Build' aktivieren"
echo "   4. DIRECT_DATABASE_URL → Bearbeiten → ✅ 'Build' aktivieren"
echo ""
echo "💡 Oder verwende die Vercel API mit einem Token:"
echo "   curl -X PATCH https://api.vercel.com/v10/projects/.../env/... \\"
echo "     -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "     -d '{\"target\":[\"production\",\"build\"]}'"
