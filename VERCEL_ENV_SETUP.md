# Vercel Environment Variables Setup

## 🚨 KRITISCHES PROBLEM

Die Datenbank funktioniert lokal, aber nicht auf Vercel, weil die Environment-Variablen **nicht für 'Build' aktiviert** sind!

## 📋 Benötigte Environment-Variablen

### ✅ Database (KRITISCH für Build!)
- `DATABASE_URL` - **MUSS für Build aktiviert sein!**
- `DIRECT_DATABASE_URL` - **MUSS für Build aktiviert sein!**

### ✅ NextAuth
- `AUTH_SECRET` oder `NEXTAUTH_SECRET` - **MUSS für Build aktiviert sein!**
- `NEXTAUTH_URL` - **MUSS für Build aktiviert sein!**

### ✅ OAuth (Optional, aber empfohlen)
- `GOOGLE_CLIENT_ID` - **FEHLT auf Vercel!**
- `GOOGLE_CLIENT_SECRET` - **FEHLT auf Vercel!**
- `LINKEDIN_CLIENT_ID` - **FEHLT auf Vercel!**
- `LINKEDIN_CLIENT_SECRET` - **FEHLT auf Vercel!**

### ✅ Vercel Blob
- `BLOB_READ_WRITE_TOKEN` - **FEHLT auf Vercel!** (aktuell: `blob_READ_WRITE_TOKEN` - falscher Name!)

## 🔧 Lösung: Environment-Variablen für 'Build' aktivieren

### Schritt 1: Gehe zum Vercel Dashboard
https://vercel.com/daniels-projects-c316ea43/nicnoa/settings/environment-variables

### Schritt 2: Für jede Variable 'Build' aktivieren

Für **jede** der folgenden Variablen:
1. Klicke auf **"Edit"** (oder das Stift-Symbol)
2. Aktiviere das Häkchen bei **"Build"**
3. Klicke auf **"Save"**

**KRITISCH - Diese müssen für Build aktiviert sein:**
- ✅ `DATABASE_URL`
- ✅ `DIRECT_DATABASE_URL`
- ✅ `AUTH_SECRET`
- ✅ `NEXTAUTH_SECRET`
- ✅ `NEXTAUTH_URL`

**Optional, aber empfohlen:**
- `BLOB_READ_WRITE_TOKEN` (korrigiere zuerst den Namen!)

## 🔧 Fehlende Variablen setzen

### BLOB_READ_WRITE_TOKEN korrigieren

1. Gehe zu: https://vercel.com/daniels-projects-c316ea43/nicnoa/settings/environment-variables
2. Finde `blob_READ_WRITE_TOKEN`
3. Klicke auf "Edit"
4. Kopiere den Wert
5. Lösche `blob_READ_WRITE_TOKEN`
6. Erstelle neue Variable `BLOB_READ_WRITE_TOKEN` mit dem kopierten Wert
7. Aktiviere für: Production, Preview, Development, **Build**

### OAuth Variablen setzen

Falls du OAuth verwendest, setze diese Variablen:

```bash
# Google OAuth
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET

# LinkedIn OAuth
vercel env add LINKEDIN_CLIENT_ID
vercel env add LINKEDIN_CLIENT_SECRET
```

**WICHTIG:** Wähle für alle: Production, Preview, Development, **Build**

## 📋 Prüfen ob alles korrekt ist

### Lokal prüfen:
```bash
./scripts/check-vercel-env.sh
```

### Vercel prüfen:
```bash
vercel env ls
```

### Prüfe ob Variablen für Build aktiviert sind:
1. Gehe zum Dashboard
2. Prüfe jede Variable einzeln
3. Stelle sicher, dass "Build" aktiviert ist

## 🚀 Nach dem Setup

1. **Neues Deployment starten:**
   ```bash
   vercel --prod
   ```

2. **Prüfe die Build-Logs:**
   ```bash
   vercel logs <deployment-url>
   ```

3. **Prüfe ob die Datenbank funktioniert:**
   - Gehe zur Production-URL
   - Prüfe ob die App lädt
   - Prüfe ob API-Routes funktionieren

## ⚠️ WICHTIGE HINWEISE

1. **Build vs. Runtime:**
   - Variablen für "Build" sind während des Builds verfügbar (z.B. `prisma generate`)
   - Variablen für "Production/Preview/Development" sind nur zur Laufzeit verfügbar

2. **DATABASE_URL während Build:**
   - Wird benötigt für `prisma generate` und `prisma db push`
   - Ohne Build-Aktivierung schlägt der Build fehl!

3. **Sicherheit:**
   - Alle Variablen sind verschlüsselt
   - Nur für Build aktivieren, wenn wirklich nötig
   - Für sensible Daten: Nur Production/Preview, nicht Development

## 📞 Hilfe

Falls Probleme auftreten:
1. Prüfe die Build-Logs: `vercel logs <deployment-url>`
2. Prüfe die Environment-Variablen: `vercel env ls`
3. Prüfe ob alle Variablen für Build aktiviert sind (Dashboard)
