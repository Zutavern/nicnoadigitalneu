# Contributing to NICNOA

Vielen Dank für dein Interesse, zu NICNOA beizutragen! 🎉

## Inhaltsverzeichnis

- [Code of Conduct](#code-of-conduct)
- [Wie kann ich beitragen?](#wie-kann-ich-beitragen)
- [Entwicklungsumgebung](#entwicklungsumgebung)
- [Pull Request Prozess](#pull-request-prozess)
- [Coding Guidelines](#coding-guidelines)
- [Commit Convention](#commit-convention)

---

## Code of Conduct

Dieses Projekt und alle Beteiligten verpflichten sich zu einem respektvollen und inklusiven Umgang. Bitte lies unseren [Code of Conduct](CODE_OF_CONDUCT.md) bevor du beiträgst.

---

## Wie kann ich beitragen?

### 🐛 Bugs melden

1. Prüfe, ob der Bug bereits gemeldet wurde
2. Erstelle ein neues Issue mit:
   - Klare Beschreibung des Problems
   - Schritte zur Reproduktion
   - Erwartetes vs. tatsächliches Verhalten
   - Screenshots (falls hilfreich)
   - Browser/OS/Node Version

### 💡 Features vorschlagen

1. Prüfe, ob das Feature bereits vorgeschlagen wurde
2. Erstelle ein Issue mit:
   - Klare Beschreibung des Features
   - Use Case / Motivation
   - Mögliche Implementierung (optional)

### 🔧 Code beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Implementiere deine Änderungen
4. Schreibe/Update Tests (falls nötig)
5. Erstelle einen Pull Request

---

## Entwicklungsumgebung

### Voraussetzungen

- Node.js ≥ 20.x
- pnpm ≥ 8.x
- PostgreSQL ≥ 16 (oder Neon Account)

### Setup

```bash
# Repository klonen
git clone https://github.com/your-org/nicnoa.git
cd nicnoa

# Dependencies installieren
pnpm install

# Umgebungsvariablen konfigurieren
cp .env.example .env.local

# Datenbank einrichten
npx prisma db push
npx prisma db seed

# Entwicklungsserver starten
pnpm dev
```

### Nützliche Befehle

```bash
pnpm dev          # Dev-Server
pnpm build        # Produktions-Build
pnpm lint         # ESLint
pnpm type-check   # TypeScript prüfen
pnpm db:studio    # Prisma Studio
pnpm email:dev    # E-Mail Preview
```

---

## Pull Request Prozess

### 1. Branch erstellen

```bash
git checkout develop
git pull origin develop
git checkout -b feature/mein-feature
```

### 2. Änderungen committen

```bash
git add .
git commit -m "feat: add my feature"
```

### 3. Branch pushen

```bash
git push origin feature/mein-feature
```

### 4. Pull Request erstellen

1. Öffne GitHub und erstelle einen PR
2. Fülle das PR-Template aus
3. Verlinke relevante Issues
4. Warte auf Review

### PR Checkliste

- [ ] Code folgt den Coding Guidelines
- [ ] Commits folgen der Commit Convention
- [ ] Alle Tests bestehen
- [ ] Keine Linting-Fehler
- [ ] Dokumentation aktualisiert (falls nötig)
- [ ] Screenshots beigefügt (bei UI-Änderungen)

---

## Coding Guidelines

### TypeScript

```typescript
// ✅ Interfaces über Types
interface User {
  id: string
  name: string
}

// ✅ Const Maps statt Enums
const Status = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const

// ✅ Early Returns
function process(data: Data | null) {
  if (!data) return null
  return transform(data)
}
```

### React

```tsx
// ✅ Server Components (Standard)
export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}

// ✅ Client Components nur wenn nötig
'use client'

import { useState } from 'react'

export function Interactive() {
  const [state, setState] = useState(false)
  return <button onClick={() => setState(!state)} />
}
```

### Styling

```tsx
// ✅ Tailwind mit cn() für bedingte Klassen
import { cn } from '@/lib/utils'

<div className={cn(
  'p-4 rounded-lg',
  isActive && 'bg-blue-500',
  isDisabled && 'opacity-50'
)} />
```

### Datei-Benennung

```
components/user-profile.tsx    # Kebab-case
hooks/use-auth.ts              # use- Prefix
lib/prisma.ts                  # Lowercase
```

---

## Commit Convention

Wir nutzen [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Beschreibung |
|------|--------------|
| `feat` | Neues Feature |
| `fix` | Bugfix |
| `docs` | Dokumentation |
| `style` | Formatierung (kein Code-Change) |
| `refactor` | Refactoring |
| `perf` | Performance-Verbesserung |
| `test` | Tests |
| `chore` | Build/Tools |

### Beispiele

```bash
feat(auth): add two-factor authentication
fix(booking): resolve timezone issue in calendar
docs: update API documentation
refactor(dashboard): simplify stats calculation
```

### Breaking Changes

```bash
feat(api)!: change response format

BREAKING CHANGE: API responses now use camelCase
```

---

## Branch-Strategie

```
main              # Produktion (protected)
├── develop       # Integration
│   ├── feature/* # Neue Features
│   ├── bugfix/*  # Bugfixes
│   └── hotfix/*  # Kritische Fixes
```

---

## Fragen?

Bei Fragen erstelle ein Issue oder kontaktiere uns unter support@nicnoa.de.

Vielen Dank für deinen Beitrag! 🙏











