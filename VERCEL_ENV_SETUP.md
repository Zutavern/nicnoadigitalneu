# Vercel Environment-Variablen Setup

## Problem
DATABASE_URL und DIRECT_DATABASE_URL sind aktuell nur für "Production" (Runtime) aktiviert, nicht für "Build".

## Lösung

### Option 1: Über Vercel Dashboard (Empfohlen)

1. Öffne: https://vercel.com/dashboard
2. Projekt "nicnoa" auswählen
3. Settings → Environment Variables
4. Für jede Variable:
   - `DATABASE_URL` → Bearbeiten → ✅ "Build" aktivieren
   - `DIRECT_DATABASE_URL` → Bearbeiten → ✅ "Build" aktivieren
5. Speichern

### Option 2: Über CLI

```bash
# DATABASE_URL für Build aktivieren
vercel env update DATABASE_URL production
# Während des Prompts:
# - Value: (bestehenden Wert beibehalten)
# - Environments: Production, Build (beide auswählen!)

# DIRECT_DATABASE_URL für Build aktivieren
vercel env update DIRECT_DATABASE_URL production
# Während des Prompts:
# - Value: (bestehenden Wert beibehalten)
# - Environments: Production, Build (beide auswählen!)
```

## Prüfung

```bash
# Prüfe ob Build aktiviert ist
vercel env ls | grep DATABASE_URL
# Sollte "Production, Build" zeigen (nicht nur "Production")
```

## Nach dem Update

1. Neues Deployment triggern (Push zu main)
2. Build-Logs prüfen ob sync-db.ts erfolgreich läuft
3. APIs testen ob Daten geladen werden
