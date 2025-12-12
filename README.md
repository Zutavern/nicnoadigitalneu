# NICNOA Platform

<div align="center">
  <img src="public/logo.png" alt="NICNOA Logo" width="200" />
  
  **Die SaaS-Plattform für die moderne Friseurbranche**
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-7.1-2D3748?logo=prisma)](https://www.prisma.io/)
  [![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)
</div>

---

## 📋 Inhaltsverzeichnis

- [Über das Projekt](#-über-das-projekt)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Schnellstart](#-schnellstart)
- [Projektstruktur](#-projektstruktur)
- [Dokumentation](#-dokumentation)
- [Umgebungsvariablen](#-umgebungsvariablen)
- [Skripte](#-skripte)
- [Deployment](#-deployment)
- [Mitwirken](#-mitwirken)
- [Lizenz](#-lizenz)

---

## 🎯 Über das Projekt

**NICNOA** ist eine B2B SaaS-Plattform, die Salon-Besitzer und selbstständige Stuhlmieter (Stylisten) zusammenbringt. Die Plattform ermöglicht:

- 💺 **Stuhlvermietung**: Salon-Besitzer vermieten Arbeitsplätze an selbstständige Friseure
- 📅 **Terminbuchung**: Stylisten verwalten ihre Kundentermine digital
- ✅ **Compliance**: Rechtssichere Dokumentation der Selbstständigkeit (§4 SGB IV)
- 💳 **Abrechnung**: Automatisierte Zahlungsabwicklung via Stripe
- 📊 **Analytics**: Umfassende Einblicke in Umsatz und Performance

---

## ✨ Features

### Für Salon-Besitzer
- 🏢 Salon-Profil mit Bildern und Ausstattung
- 💺 Stuhlverwaltung mit flexiblen Mietpreisen
- 👥 Übersicht über alle Mieter
- 📈 Umsatz- und Belegungsstatistiken
- 💰 Automatische Mietabrechnung
- ⭐ Bewertungsmanagement

### Für Stuhlmieter (Stylisten)
- 👤 Professionelles Stylist-Profil
- 📅 Digitaler Terminkalender
- 👥 Kundenverwaltung
- 💵 Einnahmen-Tracking
- 🔍 Salon-Finder
- 📱 Mobile-optimiert

### Für Admins
- 👥 Benutzerverwaltung
- 🔐 Onboarding-Prüfung
- 📊 Plattform-Analytics mit PostHog
- 💳 Abo-Verwaltung
- 📧 E-Mail-Template-Editor
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
| [Next.js](https://nextjs.org/) | 16.0.7 | React Framework |
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
| [Stripe](https://stripe.com/) | 20.0.0 | Zahlungen |
| [Resend](https://resend.com/) | 6.5.2 | E-Mails |

### Real-time & Analytics
| Technologie | Version | Verwendung |
|-------------|---------|------------|
| [Pusher](https://pusher.com/) | 6.x | Real-time Messaging |
| [Daily.co](https://daily.co/) | Latest | Video Calls |
| [PostHog](https://posthog.com/) | 1.x | Product Analytics |

### Infrastruktur
| Service | Verwendung |
|---------|------------|
| [Vercel](https://vercel.com/) | Hosting & Deployment |
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
│   ├── DEVELOPMENT.md         # Entwickler-Guide
│   ├── DEPLOYMENT.md          # Deployment-Anleitung
│   └── PRD-*.md               # Product Requirements
├── prisma/
│   ├── schema.prisma          # Datenbank-Schema
│   ├── seed.ts                # Seed-Daten
│   └── migrations/            # Migrationen
├── public/                    # Statische Assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Auth-Seiten
│   │   ├── (dashboard)/       # Dashboard-Bereiche
│   │   │   ├── admin/         # Admin-Dashboard
│   │   │   ├── salon/         # Salon-Owner-Dashboard
│   │   │   └── stylist/       # Stylist-Dashboard
│   │   └── api/               # API Routes (100+ Endpunkte)
│   ├── components/            # React-Komponenten
│   │   ├── ui/                # Shadcn UI
│   │   ├── admin/             # Admin-Komponenten
│   │   └── dashboard/         # Dashboard-Komponenten
│   ├── emails/                # E-Mail-Templates
│   │   ├── components/        # Layout-Komponenten
│   │   └── templates/         # 45+ E-Mail-Templates
│   └── lib/                   # Utilities & Configs
│       ├── auth.ts            # NextAuth Config
│       ├── prisma.ts          # Prisma Client
│       ├── stripe.ts          # Stripe Client
│       └── email.ts           # E-Mail Service
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
| [API.md](docs/API.md) | REST API Dokumentation (130+ Endpunkte) |
| [DATABASE.md](docs/DATABASE.md) | Datenbank-Schema & Relationen (50+ Tabellen) |
| [REALTIME.md](docs/REALTIME.md) | Real-time Chat, Video Calls & Analytics |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | Entwickler-Setup & Guidelines |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment-Anleitung |
| [PRD-Email-Notification-System.md](docs/PRD-Email-Notification-System.md) | E-Mail System PRD |

---

## 🔐 Umgebungsvariablen

Erstelle eine `.env.local` Datei basierend auf `.env.example`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# Authentication (NextAuth.js)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Stripe Payments
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@nicnoa.de"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="..."

# Beta-Passwort (optional)
BETA_PASSWORD="..."
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
```

### Umgebungsvariablen auf Vercel setzen

```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add STRIPE_SECRET_KEY
# ... weitere Variablen
```

Siehe [DEPLOYMENT.md](docs/DEPLOYMENT.md) für detaillierte Anleitungen.

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
</div>
