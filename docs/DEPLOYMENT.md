# NICNOA Deployment Guide

## 🚀 Deployment-Dokumentation

**Version:** 1.0  
**Letzte Aktualisierung:** 6. Dezember 2025

---

## Inhaltsverzeichnis

1. [Übersicht](#1-übersicht)
2. [Voraussetzungen](#2-voraussetzungen)
3. [Vercel Deployment](#3-vercel-deployment)
4. [Neon PostgreSQL Setup](#4-neon-postgresql-setup)
5. [Vercel Blob Storage](#5-vercel-blob-storage)
6. [Stripe Konfiguration](#6-stripe-konfiguration)
7. [Resend E-Mail Setup](#7-resend-e-mail-setup)
8. [Umgebungsvariablen](#8-umgebungsvariablen)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Monitoring & Logs](#10-monitoring--logs)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Übersicht

### Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUKTION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│   │   Vercel     │    │    Neon      │    │   Resend     │      │
│   │   Hosting    │───>│  PostgreSQL  │    │   E-Mail     │      │
│   │   (Edge)     │    │  (Serverless)│    │              │      │
│   └──────────────┘    └──────────────┘    └──────────────┘      │
│          │                                       ▲               │
│          │            ┌──────────────┐           │               │
│          └───────────>│ Vercel Blob  │───────────┘               │
│                       │   Storage    │                           │
│                       └──────────────┘                           │
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐                          │
│   │   Stripe     │    │   GitHub     │                          │
│   │  Payments    │    │    Repo      │                          │
│   │              │    │   (CI/CD)    │                          │
│   └──────────────┘    └──────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Deployment-Flow

```
Git Push → GitHub → Vercel Build → Deploy to Edge
                         │
                         ├── Prisma Generate
                         ├── Next.js Build
                         └── Static Optimization
```

---

## 2. Voraussetzungen

### Accounts erstellen

| Service | URL | Beschreibung |
|---------|-----|--------------|
| **Vercel** | [vercel.com](https://vercel.com) | Hosting |
| **Neon** | [neon.tech](https://neon.tech) | PostgreSQL |
| **Stripe** | [stripe.com](https://stripe.com) | Zahlungen |
| **Resend** | [resend.com](https://resend.com) | E-Mails |
| **GitHub** | [github.com](https://github.com) | Repository |

### CLI Tools

```bash
# Vercel CLI
npm install -g vercel

# Verifizieren
vercel --version
```

---

## 3. Vercel Deployment

### Schritt 1: Projekt verbinden

```bash
# Im Projektverzeichnis
vercel

# Prompts beantworten:
# ? Set up and deploy? Yes
# ? Which scope? your-team
# ? Link to existing project? No
# ? Project name? nicnoa
# ? Directory? ./
```

### Schritt 2: Framework-Einstellungen

Vercel erkennt Next.js automatisch. Falls nicht:

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && next build",
  "installCommand": "pnpm install"
}
```

### Schritt 3: Produktions-Deployment

```bash
# Preview Deployment
vercel

# Produktion
vercel --prod
```

### Schritt 4: Custom Domain (optional)

```bash
# Domain hinzufügen
vercel domains add nicnoa.de

# SSL wird automatisch konfiguriert
```

---

## 4. Neon PostgreSQL Setup

### Schritt 1: Projekt erstellen

1. Öffne [console.neon.tech](https://console.neon.tech)
2. "New Project" klicken
3. Name: `nicnoa-production`
4. Region: `eu-central-1` (Frankfurt)

### Schritt 2: Connection String kopieren

```
# Pooled Connection (empfohlen für Serverless)
postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Direct Connection (für Migrationen)
postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### Schritt 3: Schema deployen

```bash
# Umgebungsvariable setzen
export DATABASE_URL="postgresql://..."

# Schema pushen
npx prisma db push

# Seed-Daten (optional)
npx prisma db seed
```

### Schritt 4: Branching (optional)

Neon unterstützt Database Branching:

```bash
# Branch für Preview Deployments
# Automatisch in Vercel-Integration möglich
```

---

## 5. Vercel Blob Storage

### Schritt 1: Store erstellen

1. Öffne [Vercel Dashboard](https://vercel.com/dashboard)
2. Project → Storage → Create Store
3. Type: Blob Store
4. Name: `nicnoa-blob`

### Schritt 2: Token kopieren

```
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### Schritt 3: Verwendung im Code

```typescript
import { put, del, list } from '@vercel/blob'

// Upload
const { url } = await put('documents/file.pdf', file, {
  access: 'public',
})

// Löschen
await del(url)

// Auflisten
const { blobs } = await list()
```

---

## 6. Stripe Konfiguration

### Schritt 1: API Keys

1. Öffne [Stripe Dashboard](https://dashboard.stripe.com)
2. Developers → API Keys
3. Kopiere `Publishable key` und `Secret key`

### Schritt 2: Webhook einrichten

1. Developers → Webhooks → Add endpoint
2. URL: `https://nicnoa.vercel.app/api/stripe/webhook`
3. Events auswählen:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

### Schritt 3: Webhook Secret

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Schritt 4: Produkte erstellen

```bash
# Oder via Dashboard:
# Products → Add product → Add price
```

---

## 7. Resend E-Mail Setup

### Schritt 1: Domain verifizieren

1. Öffne [Resend Dashboard](https://resend.com/domains)
2. Add Domain: `nicnoa.de`
3. DNS Records hinzufügen:

```
# MX Record
mail.nicnoa.de → feedback-smtp.eu-west-1.amazonses.com

# TXT Records (DKIM, SPF)
# → Aus Resend Dashboard kopieren
```

### Schritt 2: API Key erstellen

1. API Keys → Create API Key
2. Permission: Sending access

```
RESEND_API_KEY=re_...
```

### Schritt 3: Absender konfigurieren

```env
RESEND_FROM_EMAIL=noreply@nicnoa.de
```

---

## 8. Umgebungsvariablen

### Vercel Environment Variables

```bash
# Via CLI
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add STRIPE_SECRET_KEY
# ...

# Oder via Dashboard:
# Project → Settings → Environment Variables
```

### Vollständige Liste

| Variable | Beschreibung | Umgebung |
|----------|--------------|----------|
| `DATABASE_URL` | Neon Pooled Connection | Production |
| `DIRECT_DATABASE_URL` | Neon Direct Connection | Production |
| `NEXTAUTH_URL` | App URL | Production |
| `NEXTAUTH_SECRET` | Auth Secret (32+ Zeichen) | All |
| `STRIPE_SECRET_KEY` | Stripe Secret Key | Production |
| `STRIPE_WEBHOOK_SECRET` | Webhook Secret | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Public Key | All |
| `RESEND_API_KEY` | Resend API Key | Production |
| `RESEND_FROM_EMAIL` | Absender-E-Mail | All |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Token | Production |

### Secret generieren

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## 9. CI/CD Pipeline

### Automatisches Deployment

Vercel deployed automatisch bei:

- **Push to main** → Production
- **Push to branch** → Preview
- **Pull Request** → Preview mit Kommentar

### Build-Konfiguration

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### Umgebungsspezifische Builds

```bash
# In Vercel: Environment Variables pro Branch
# Production: main
# Preview: develop, feature/*
```

---

## 10. Monitoring & Logs

### Vercel Analytics

1. Project → Analytics
2. Web Vitals aktivieren
3. Audience aktivieren (optional)

### Vercel Logs

```bash
# Runtime Logs
vercel logs --follow

# Build Logs
# → Im Dashboard unter Deployments
```

### Error Tracking (optional)

```bash
# Sentry Integration
pnpm add @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  })
}
```

---

## 11. Troubleshooting

### Problem: Build schlägt fehl

```bash
# Prisma Client fehlt
# → build Script prüfen: "prisma generate && next build"

# Module nicht gefunden
# → pnpm install neu ausführen
```

### Problem: Datenbank-Verbindung

```bash
# Connection String prüfen
npx prisma db pull

# Neon Cold Start
# → Verbindung nach ~5min Inaktivität kann langsam sein
# → Connection Pooling aktivieren
```

### Problem: Stripe Webhook

```bash
# Webhook URL prüfen
curl -X POST https://nicnoa.vercel.app/api/stripe/webhook

# Webhook Secret verifizieren
# → In Stripe Dashboard → Webhook → Signing secret
```

### Problem: E-Mails werden nicht gesendet

```bash
# API Key prüfen
# Domain verifiziert?
# SPF/DKIM Records korrekt?
```

### Rollback

```bash
# Vorheriges Deployment wiederherstellen
vercel rollback

# Spezifische Version
vercel rollback [deployment-url]
```

### Logs prüfen

```bash
# Letzte 100 Zeilen
vercel logs --follow

# Spezifisches Deployment
vercel logs [deployment-url]
```

---

## Checkliste für Go-Live

- [ ] Alle Umgebungsvariablen gesetzt
- [ ] Datenbank-Schema deployed
- [ ] Stripe Webhook konfiguriert
- [ ] E-Mail Domain verifiziert
- [ ] Custom Domain verbunden
- [ ] SSL aktiv
- [ ] Analytics aktiviert
- [ ] Error Tracking eingerichtet
- [ ] Backup-Strategie definiert
- [ ] Monitoring Alerts konfiguriert

---

**Support:** support@nicnoa.de

