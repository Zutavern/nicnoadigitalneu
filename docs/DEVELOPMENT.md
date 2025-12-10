# NICNOA Entwickler-Dokumentation

## 🛠 Development Guide

**Version:** 1.1  
**Letzte Aktualisierung:** 10. Dezember 2025

---

## Inhaltsverzeichnis

1. [Voraussetzungen](#1-voraussetzungen)
2. [Installation](#2-installation)
3. [Projektstruktur](#3-projektstruktur)
4. [Entwicklungs-Workflow](#4-entwicklungs-workflow)
5. [Code-Konventionen](#5-code-konventionen)
6. [Testing](#6-testing)
7. [Debugging](#7-debugging)
8. [Häufige Probleme](#8-häufige-probleme)

---

## 1. Voraussetzungen

### Erforderliche Software

| Software | Version | Installation |
|----------|---------|--------------|
| **Node.js** | ≥20.x | [nodejs.org](https://nodejs.org/) |
| **pnpm** | ≥8.x | `npm install -g pnpm` |
| **Git** | ≥2.x | [git-scm.com](https://git-scm.com/) |
| **PostgreSQL** | ≥16 | Lokal oder [Neon](https://neon.tech/) |

### Empfohlene Tools

| Tool | Beschreibung |
|------|--------------|
| **VS Code** | IDE mit Extensions |
| **Prisma Extension** | Syntax Highlighting für Schema |
| **ESLint Extension** | Linting im Editor |
| **Tailwind CSS IntelliSense** | CSS Autocomplete |
| **Thunder Client / Postman** | API Testing |

### VS Code Extensions

```json
{
  "recommendations": [
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

---

## 2. Installation

### Schritt 1: Repository klonen

```bash
git clone https://github.com/your-org/nicnoa.git
cd nicnoa
```

### Schritt 2: Dependencies installieren

```bash
pnpm install
```

### Schritt 3: Umgebungsvariablen

Erstelle eine `.env.local` Datei:

```bash
cp .env.example .env.local
```

Konfiguriere die Variablen:

```env
# Database (Neon empfohlen - auch für lokale Entwicklung)
# Pooled Connection (für Serverless/Runtime)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Direct Connection (für Migrationen/Prisma)
DIRECT_DATABASE_URL="postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Hinweis: Beide URLs sollten auf die gleiche Neon-Datenbank zeigen
# Unterschied: Pooled (mit -pooler) für Production, Direct für Build/Migrationen

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-char-secret-key-here"

# Stripe (Test Keys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@nicnoa.de"

# File Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Optional: Beta-Passwort
BETA_PASSWORD="beta2024"
```

### Schritt 4: Datenbank einrichten

```bash
# Schema auf Datenbank anwenden
npx prisma db push

# Prisma Client generieren
npx prisma generate

# Seed-Daten einfügen
npx prisma db seed
```

### Schritt 5: Entwicklungsserver starten

```bash
pnpm dev
```

Öffne [http://localhost:3000](http://localhost:3000)

---

## 3. Projektstruktur

```
nicnoa/
├── .env.local              # Lokale Umgebungsvariablen
├── .env.example            # Template für Umgebungsvariablen
├── next.config.ts          # Next.js Konfiguration
├── tailwind.config.ts      # Tailwind CSS Konfiguration
├── tsconfig.json           # TypeScript Konfiguration
├── prisma/
│   ├── schema.prisma       # Datenbank-Schema
│   ├── seed.ts             # Seed-Skript
│   └── migrations/         # Migrationshistorie
├── docs/                   # Dokumentation
├── public/                 # Statische Assets
└── src/
    ├── app/                # Next.js App Router
    │   ├── (auth)/         # Auth-Routen (Login, Register)
    │   ├── (dashboard)/    # Dashboard-Routen
    │   │   ├── admin/      # Admin-Bereich
    │   │   ├── salon/      # Salon-Owner-Bereich
    │   │   └── stylist/    # Stylist-Bereich
    │   ├── api/            # API-Routen
    │   ├── layout.tsx      # Root Layout
    │   └── page.tsx        # Landing Page
    ├── components/         # React-Komponenten
    │   ├── ui/             # Shadcn UI Komponenten
    │   ├── admin/          # Admin-spezifisch
    │   └── dashboard/      # Dashboard-spezifisch
    ├── emails/             # E-Mail Templates
    │   ├── components/     # Basis-Komponenten
    │   └── templates/      # 42 E-Mail Templates
    ├── lib/                # Utilities
    │   ├── auth.ts         # NextAuth Konfiguration
    │   ├── prisma.ts       # Prisma Client
    │   ├── stripe.ts       # Stripe Client
    │   ├── email.ts        # E-Mail Service
    │   └── utils.ts        # Hilfsfunktionen
    └── middleware.ts       # Auth & Routing Middleware
```

---

## 4. Entwicklungs-Workflow

### Branch-Strategie

```
main           # Produktion (protected)
├── develop    # Integration
│   ├── feature/xyz    # Neue Features
│   ├── bugfix/xyz     # Bugfixes
│   └── hotfix/xyz     # Kritische Fixes
```

### Neue Feature entwickeln

```bash
# 1. Neuen Branch erstellen
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# 2. Entwickeln und committen
git add .
git commit -m "feat: add my feature"

# 3. Pushen und PR erstellen
git push origin feature/my-feature
```

### Commit-Konventionen

Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Neues Feature
fix: Bugfix
docs: Dokumentation
style: Formatierung (kein Code-Change)
refactor: Code-Refactoring
perf: Performance-Verbesserung
test: Tests hinzufügen/ändern
chore: Build-Prozess/Tools
```

### Datenbank-Änderungen

```bash
# Schema ändern
# -> prisma/schema.prisma bearbeiten

# Migration erstellen (Produktion)
npx prisma migrate dev --name beschreibung

# Nur Schema pushen (Entwicklung)
npx prisma db push

# Prisma Client aktualisieren
npx prisma generate
```

---

## 5. Code-Konventionen

### TypeScript

```typescript
// ✅ Interfaces über Types
interface User {
  id: string
  name: string
  email: string
}

// ✅ Const Maps statt Enums
const UserRole = {
  ADMIN: 'ADMIN',
  SALON_OWNER: 'SALON_OWNER',
  STYLIST: 'STYLIST',
} as const

type UserRole = (typeof UserRole)[keyof typeof UserRole]

// ✅ Early Returns
function processUser(user: User | null) {
  if (!user) return null
  if (!user.email) return null
  
  return user
}
```

### React-Komponenten

```tsx
// ✅ Server Components (Standard)
// app/page.tsx
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// ✅ Client Components (nur wenn nötig)
// components/interactive-button.tsx
'use client'

import { useState } from 'react'

export function InteractiveButton() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### Datei-Benennungen

```
components/
├── user-profile.tsx       # Kebab-case für Dateien
├── UserProfile.tsx        # Alternativ: PascalCase
└── index.ts               # Re-exports

hooks/
├── use-auth.ts            # Hooks mit use- Prefix

lib/
├── prisma.ts              # Lowercase
├── stripe-server.ts       # Kebab-case
```

### API-Routen

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }
    
    const users = await prisma.user.findMany()
    
    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('GET /api/users error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
```

### Styling mit Tailwind

```tsx
// ✅ Utility-First
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-900">Titel</h1>
</div>

// ✅ Mit clsx/cn für bedingte Klassen
import { cn } from '@/lib/utils'

<button
  className={cn(
    'px-4 py-2 rounded-md font-medium',
    isActive && 'bg-blue-500 text-white',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
>
```

---

## 6. Testing

### Prisma Studio

Visueller Datenbank-Editor:

```bash
npx prisma studio
```

Öffnet [http://localhost:5555](http://localhost:5555)

### API Testing mit Thunder Client

1. VS Code Extension installieren
2. Neue Collection erstellen
3. Requests importieren/erstellen

### E-Mail Preview

```bash
# E-Mail-Vorschau starten
pnpm email:dev
```

Öffnet [http://localhost:3001](http://localhost:3001)

---

## 7. Debugging

### Console Logging

```typescript
// Entwicklungs-Logs
if (process.env.NODE_ENV === 'development') {
  console.log('Debug:', data)
}
```

### Prisma Query Logging

```typescript
// lib/prisma.ts
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
})
```

### Next.js Debug Mode

```bash
NODE_OPTIONS='--inspect' pnpm dev
```

Dann in Chrome: `chrome://inspect`

---

## 8. Häufige Probleme

### Problem: "Module not found"

```bash
# Shadcn-Komponente fehlt
pnpm dlx shadcn@latest add <component>

# Node modules neu installieren
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Problem: Prisma Client outdated

```bash
npx prisma generate
```

### Problem: Build-Cache korrupt

```bash
rm -rf .next
pnpm dev
```

### Problem: Hydration Error

```tsx
// ✅ Verwende useEffect für Client-Only Code
'use client'

import { useEffect, useState } from 'react'

export function ClientTime() {
  const [time, setTime] = useState<string>()
  
  useEffect(() => {
    setTime(new Date().toLocaleString())
  }, [])
  
  if (!time) return null
  return <span>{time}</span>
}
```

### Problem: Suspense-Fehler

```tsx
// ✅ Wrappen von useSearchParams
import { Suspense } from 'react'

function PageContent() {
  const searchParams = useSearchParams()
  // ...
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  )
}
```

### Problem: Datenbank-Verbindung

```bash
# Verbindung testen
npx prisma db pull

# Bei Neon: Cold Start abwarten
# Bei lokal: PostgreSQL-Service prüfen
```

---

## Nützliche Befehle

```bash
# Entwicklung
pnpm dev                    # Dev-Server
pnpm build                  # Build
pnpm start                  # Produktions-Server

# Datenbank
npx prisma studio           # DB GUI
npx prisma db push          # Schema pushen
npx prisma db seed          # Seeden
npx prisma generate         # Client generieren
npx prisma migrate dev      # Migration erstellen
npx prisma migrate reset    # DB zurücksetzen

# Seed-Skripte (einzeln)
npx ts-node scripts/seed-design-system.ts  # Design-System seeden
npx ts-node prisma/seed-product-features.ts # Produkt-Features seeden

# Code-Qualität
pnpm lint                   # ESLint
pnpm type-check             # TypeScript

# E-Mails
pnpm email:dev              # Preview Server
```

---

## Design-System

### Presets nutzen

Das Design-System kann über die Admin-Oberfläche oder direkt in der Datenbank konfiguriert werden:

```typescript
// Verfügbare Presets
const presets = [
  'nicnoa-classic',  // Emerald-basiert (Standard)
  'nicnoa-modern',   // Violet-basiert
  'nicnoa-minimal',  // Slate-basiert
  'custom'           // Vollständig anpassbar
]
```

### Design-Tokens anpassen

```typescript
// Beispiel: Custom Tokens
const customTokens = {
  colors: {
    primary: '#10b981',
    secondary: '#3b82f6',
    accent: '#f59e0b'
  },
  borderRadius: {
    small: '0.25rem',
    medium: '0.5rem',
    large: '1rem'
  }
}
```

---

**Bei Fragen:** support@nicnoa.de



