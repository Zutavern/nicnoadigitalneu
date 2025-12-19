# NICNOA Platform

<div align="center">
  <img src="public/logo.png" alt="NICNOA Logo" width="200" />
  
  **Die SaaS-Plattform für die moderne Friseurbranche**
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-7.1-2D3748?logo=prisma)](https://www.prisma.io/)
  [![Stripe](https://img.shields.io/badge/Stripe-Embedded_Checkout-635BFF?logo=stripe)](https://stripe.com/)
  [![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)
</div>

---

## 📋 Inhaltsverzeichnis

- [Über das Projekt](#-über-das-projekt)
- [Features](#-features)
- [Neue Features (Dezember 2024)](#-neue-features-dezember-2024)
- [Tech Stack](#-tech-stack)
- [Schnellstart](#-schnellstart)
- [Projektstruktur](#-projektstruktur)
- [Dokumentation](#-dokumentation)
- [Umgebungsvariablen](#-umgebungsvariablen)
- [Skripte](#-skripte)
- [Deployment](#-deployment)
- [Lizenz](#-lizenz)

---

## 🎯 Über das Projekt

**NICNOA** ist eine B2B SaaS-Plattform, die Salon-Besitzer und selbstständige Stuhlmieter (Stylisten) zusammenbringt. Die Plattform ermöglicht:

- 💺 **Stuhlvermietung**: Salon-Besitzer vermieten Arbeitsplätze an selbstständige Friseure
- 📅 **Terminbuchung**: Stylisten verwalten ihre Kundentermine digital
- ✅ **Compliance**: Rechtssichere Dokumentation der Selbstständigkeit (§4 SGB IV)
- 💳 **Abrechnung**: Automatisierte Zahlungsabwicklung via Stripe
- 📊 **Analytics**: Umfassende Einblicke in Umsatz und Performance
- 🌐 **Homepage-Builder**: Individuelle Webseiten für Stylisten und Salons

---

## 🆕 Neue Features (Dezember 2024)

### 💳 Stripe Embedded Checkout
- **Integrierter Checkout** direkt in der App (kein Redirect zu Stripe)
- **Stripe Link** aktiviert – 1-Klick-Checkout für wiederkehrende Kunden
- **SetupIntent/PaymentIntent** Handling für Trial-Perioden
- **SEPA Lastschrift** Support für deutsche Kunden
- Unterstützte Zahlungsmethoden: Karte, Link, SEPA Debit

### 🏠 Homepage-Builder
- **AI-gestützte Generierung** von professionellen Homepages
- **10+ Design-Vorlagen** mit verschiedenen Layouts
- **Drag & Drop Editor** für Anpassungen
- **Custom Domain** Support (Vercel DNS Integration)
- **SEO-optimiert** mit automatischen Meta-Tags
- Für Stylisten UND Salon-Besitzer verfügbar

### 📧 Newsletter-Builder (komplett neu)
- **Custom Drag & Drop Editor** (kein externes iframe)
- **20+ Block-Typen**: Text, Bild, Button, Video, Social Links, Divider, etc.
- **Live-Vorschau** für Desktop & Mobile
- **↩️ Undo/Redo** mit vollständiger History
- **💾 Auto-Save** alle 30 Sekunden
- **📧 Test-E-Mail** Versand vor dem Launch
- **⏰ Scheduling** für automatischen Versand
- **🎯 Personalisierung** mit Tokens ({{name}}, {{email}}, {{anrede}})
- **📊 Analytics** via Resend Webhooks (Opens, Clicks, Bounces)
- **5 professionelle Vorlagen** als Startpunkt

### 🤖 AI-Modell-Verwaltung
- **OpenRouter Integration** mit 100+ AI-Modellen
- **Pay-per-Use** Abrechnung für AI-Features
- **Modell-Kategorien**: General, Creative, Code, Reasoning, Vision
- **Admin-Dashboard** zur Modell-Verwaltung
- **Usage Tracking** mit Credit-System

### 🌐 Google Business Integration
- **Profil-Management** direkt aus dem Dashboard
- **Posts erstellen** für Google Business
- **Foto-Upload** und Verwaltung
- **Insights & Analytics** Übersicht
- **Profil-Score** mit Verbesserungsvorschlägen

### 🔧 Technische Verbesserungen
- **Next.js 16** mit Turbopack Support
- **Proxy-basiertes Routing** (ersetzt deprecated Middleware)
- **Verbesserte Auth-Session** mit ActiveSession Tracking
- **Stripe Plan Sync** – automatische Synchronisation mit Stripe Products

---

## ✨ Features

### Für Salon-Besitzer
- 🏢 Salon-Profil mit Bildern und Ausstattung
- 💺 Stuhlverwaltung mit flexiblen Mietpreisen
- 👥 Übersicht über alle Mieter
- 📈 Umsatz- und Belegungsstatistiken
- 💰 Automatische Mietabrechnung
- ⭐ Bewertungsmanagement
- 🏠 **NEU: Eigene Homepage mit Custom Domain**
- 🌐 **NEU: Google Business Integration**

### Für Stuhlmieter (Stylisten)
- 👤 Professionelles Stylist-Profil
- 📅 Digitaler Terminkalender
- 👥 Kundenverwaltung
- 💵 Einnahmen-Tracking
- 🔍 Salon-Finder
- 📱 Mobile-optimiert
- 🏠 **NEU: Eigene Homepage mit Custom Domain**
- 🌐 **NEU: Google Business Integration**

### Für Admins
- 👥 Benutzerverwaltung
- 🔐 Onboarding-Prüfung
- 📊 Plattform-Analytics mit PostHog
- 💳 Abo-Verwaltung mit Stripe Sync
- 📧 E-Mail-Template-Editor
- 📰 Newsletter-Builder (Drag & Drop)
- 🤖 **NEU: AI-Modell-Verwaltung**
- 🏠 **NEU: Homepage-Prompts verwalten**
- 🔒 Security-Dashboard
- 🎨 Design-System mit konfigurierbaren Presets
- 📝 CMS für alle Marketing-Seiten
- 💬 Echtzeit-Chat mit Pusher
- 📹 Video Calls mit Daily.co
- 📈 Revenue Analytics & Heatmaps

---

## 🛠 Tech Stack

### Frontend
| Technologie | Version | Verwendung |
|-------------|---------|------------|
| [Next.js](https://nextjs.org/) | 16.0.7 | React Framework (Turbopack) |
| [React](https://react.dev/) | 19.0.0 | UI Library |
| [TypeScript](https://www.typescriptlang.org/) | 5.7.3 | Type Safety |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.1 | Styling |
| [Shadcn/UI](https://ui.shadcn.com/) | Latest | Komponenten |
| [Framer Motion](https://www.framer.com/motion/) | 12.4.7 | Animationen |
| [Recharts](https://recharts.org/) | 3.5.1 | Charts |

### Backend
| Technologie | Version | Verwendung |
|-------------|---------|------------|
| [Prisma](https://www.prisma.io/) | 7.1.0 | ORM |
| [NextAuth.js](https://next-auth.js.org/) | 5.0.0-beta.30 | Authentifizierung |
| [PostgreSQL](https://www.postgresql.org/) | 16 | Datenbank |
| [Stripe](https://stripe.com/) | 20.0.0 | Zahlungen & Embedded Checkout |
| [Resend](https://resend.com/) | 6.5.2 | E-Mails & Newsletter |
| [OpenRouter](https://openrouter.ai/) | Latest | AI-Modelle |

### Real-time & Analytics
| Technologie | Version | Verwendung |
|-------------|---------|------------|
| [Pusher](https://pusher.com/) | 6.x | Real-time Messaging |
| [Daily.co](https://daily.co/) | Latest | Video Calls |
| [PostHog](https://posthog.com/) | 1.x | Product Analytics |

### Infrastruktur
| Service | Verwendung |
|---------|------------|
| [Vercel](https://vercel.com/) | Hosting, Deployment & DNS |
| [Neon](https://neon.tech/) | PostgreSQL Database |
| [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) | File Storage |
| [Pusher](https://pusher.com/) | WebSocket Server |
| [Daily.co](https://daily.co/) | Video Infrastructure |
| [PostHog](https://posthog.com/) | Analytics Platform |

---

## 🚀 Schnellstart

### Voraussetzungen

- **Node.js** 20.x oder höher
- **pnpm** 8.x oder höher
- **PostgreSQL** 16 (lokal oder via Neon)
- **Git**

### Installation

```bash
# Repository klonen
git clone https://github.com/your-org/nicnoa.git
cd nicnoa

# Dependencies installieren
pnpm install

# Umgebungsvariablen konfigurieren
cp .env.example .env.local

# Datenbank initialisieren
npx prisma db push
npx prisma db seed

# Entwicklungsserver starten
pnpm dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

### Demo-Zugänge (Seed-Daten)

| Rolle | E-Mail | Passwort |
|-------|--------|----------|
| Admin | admin@nicnoa.de | admin123 |
| Salon-Besitzer | salon@test.de | test123 |
| Stylist | stylist@test.de | test123 |

---

## 📁 Projektstruktur

```
nicnoa/
├── docs/                      # Dokumentation
│   ├── ARCHITECTURE.md        # System-Architektur
│   ├── API.md                 # API-Dokumentation
│   ├── DATABASE.md            # Datenbank-Schema
│   ├── REALTIME.md            # Real-time Features
│   ├── DEVELOPMENT.md         # Entwickler-Guide
│   └── DEPLOYMENT.md          # Deployment-Anleitung
├── prisma/
│   ├── schema.prisma          # Datenbank-Schema
│   ├── seed.ts                # Seed-Daten
│   ├── seed-stripe-plans.ts   # Stripe Plans Seed
│   ├── seed-v0-models.ts      # AI Modelle Seed
│   └── migrations/            # Migrationen
├── scripts/
│   └── sync-stripe-plans.ts   # Stripe Sync Script
├── public/                    # Statische Assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Auth-Seiten
│   │   ├── (dashboard)/       # Dashboard-Bereiche
│   │   │   ├── admin/         # Admin-Dashboard
│   │   │   │   ├── ai-models/ # AI-Modell-Verwaltung
│   │   │   │   ├── marketing/ # Newsletter & mehr
│   │   │   │   └── settings/  # Homepage-Builder Settings
│   │   │   ├── salon/         # Salon-Owner-Dashboard
│   │   │   │   ├── checkout/  # Embedded Checkout
│   │   │   │   └── marketing/ # Homepage & Google Business
│   │   │   └── stylist/       # Stylist-Dashboard
│   │   │       ├── checkout/  # Embedded Checkout
│   │   │       └── marketing/ # Homepage & Google Business
│   │   └── api/               # API Routes (140+ Endpunkte)
│   │       ├── stripe/        # Checkout & Payments
│   │       ├── homepage/      # Homepage-Builder APIs
│   │       ├── domains/       # Domain Management
│   │       └── admin/         # Admin APIs
│   ├── components/            # React-Komponenten
│   │   ├── ui/                # Shadcn UI
│   │   ├── checkout/          # Stripe Checkout
│   │   ├── homepage-builder/  # Homepage Editor
│   │   ├── newsletter-builder/# Newsletter Editor
│   │   └── domains/           # Domain Management
│   ├── emails/                # E-Mail-Templates
│   │   ├── components/        # Layout-Komponenten
│   │   └── templates/         # 45+ E-Mail-Templates
│   └── lib/                   # Utilities & Configs
│       ├── auth.ts            # NextAuth Config
│       ├── prisma.ts          # Prisma Client
│       ├── stripe/            # Stripe Services
│       │   ├── index.ts       # Stripe Client
│       │   ├── stripe-service.ts
│       │   ├── appearance.ts  # Checkout Appearance
│       │   └── metered-billing.ts
│       ├── homepage-builder/  # Homepage Helpers
│       ├── newsletter-builder/# Newsletter Helpers
│       ├── vercel/            # Vercel API (Domains)
│       └── google-business/   # Google Business API
├── src/proxy.ts               # Auth Proxy (Next.js 16)
├── .env.example               # Env Template
├── next.config.ts             # Next.js Config
├── tailwind.config.ts         # Tailwind Config
└── tsconfig.json              # TypeScript Config
```

---

## 📚 Dokumentation

| Dokument | Beschreibung |
|----------|--------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System-Architektur, Design-System & CMS |
| [API.md](docs/API.md) | REST API Dokumentation (140+ Endpunkte) |
| [DATABASE.md](docs/DATABASE.md) | Datenbank-Schema & Relationen (55+ Tabellen) |
| [REALTIME.md](docs/REALTIME.md) | Real-time Chat, Video Calls & Analytics |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | Entwickler-Setup & Guidelines |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment-Anleitung |

---

## 🔐 Umgebungsvariablen

Erstelle eine `.env.local` Datei basierend auf `.env.example`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# Authentication (NextAuth.js)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
AUTH_SECRET="your-auth-secret"

# Stripe Payments
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@nicnoa.de"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="..."

# AI (OpenRouter)
OPENROUTER_API_KEY="sk-or-..."

# Vercel API (für Domains)
VERCEL_API_TOKEN="..."
VERCEL_TEAM_ID="team_..."

# Google Business
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

Siehe [DEVELOPMENT.md](docs/DEVELOPMENT.md) für Details.

---

## 📜 Skripte

```bash
# Entwicklung
pnpm dev              # Dev-Server starten (Port 3000)
pnpm build            # Produktions-Build
pnpm start            # Produktions-Server

# Datenbank
pnpm db:push          # Schema auf DB anwenden
pnpm db:seed          # Seed-Daten einfügen
pnpm db:studio        # Prisma Studio öffnen
pnpm db:generate      # Prisma Client generieren

# Stripe
npx tsx scripts/sync-stripe-plans.ts  # Plans mit Stripe synchronisieren

# Code-Qualität
pnpm lint             # ESLint ausführen
pnpm type-check       # TypeScript prüfen
pnpm format           # Prettier ausführen

# E-Mails
pnpm email:dev        # E-Mail Preview Server
```

---

## 🌐 Deployment

### Vercel (Empfohlen)

```bash
# Vercel CLI installieren
npm i -g vercel

# Deployment
vercel

# Produktions-Deployment
vercel --prod

# Deployment-Status prüfen
vercel ls
```

### Umgebungsvariablen auf Vercel setzen

```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add AUTH_SECRET
vercel env add STRIPE_SECRET_KEY
vercel env add OPENROUTER_API_KEY
# ... weitere Variablen
```

Siehe [DEPLOYMENT.md](docs/DEPLOYMENT.md) für detaillierte Anleitungen.

---

## 💳 Stripe Checkout Integration

### Embedded Checkout Flow

```
Benutzer wählt Plan → API erstellt Intent → Embedded Form → Zahlung
                                ↓
                    PaymentIntent (sofortige Zahlung)
                    SetupIntent (Trial-Periode)
```

### Aktivierte Zahlungsmethoden

| Methode | Beschreibung |
|---------|--------------|
| **Card** | Kredit-/Debitkarten (Visa, Mastercard, etc.) |
| **Link** | Stripe 1-Klick-Checkout (Netzwerk-weite gespeicherte Daten) |
| **SEPA Debit** | Lastschrift für deutsche Kunden |

### Link-Vorteile
- 🚀 Schnellerer Checkout für wiederkehrende Kunden
- 🌐 Zugriff auf das gesamte Stripe-Link-Netzwerk
- 📈 ~10-15% höhere Conversion-Rate

---

## 🔗 Links

- **Produktion**: [nicnoa.vercel.app](https://nicnoa.vercel.app)
- **Dokumentation**: [/docs](./docs)
- **Issue Tracker**: [GitHub Issues](https://github.com/your-org/nicnoa/issues)

---

## 📄 Lizenz

Dieses Projekt ist proprietär und urheberrechtlich geschützt.  
© 2025 NICNOA & CO. DIGITAL. Alle Rechte vorbehalten.

---

<div align="center">
  Made with ❤️ in Deutschland
  
  **Version 2.0** | Dezember 2024
</div>
