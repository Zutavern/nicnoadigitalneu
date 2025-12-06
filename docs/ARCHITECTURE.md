# NICNOA Platform Architektur

## 📐 System-Architektur Dokumentation

**Version:** 1.0  
**Datum:** 6. Dezember 2025  
**Status:** Produktiv

---

## 1. Systemübersicht

### 1.1 Plattform-Vision

NICNOA ist eine B2B SaaS-Plattform für die Friseurbranche, die Salon-Besitzer und selbstständige Stuhlmieter (Stylisten) zusammenbringt. Die Plattform ermöglicht:

- **Stuhlvermietung**: Salon-Besitzer vermieten Arbeitsplätze
- **Terminbuchung**: Stylisten verwalten ihre Kundentermine
- **Compliance**: Rechtssichere Dokumentation der Selbstständigkeit
- **Abrechnung**: Automatisierte Zahlungsabwicklung via Stripe

### 1.2 High-Level Architektur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NICNOA PLATFORM                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                                 ┌───────────────┐
                                 │   FRONTEND    │
                                 │   (Next.js)   │
                                 │               │
                                 │  - App Router │
                                 │  - RSC        │
                                 │  - Shadcn UI  │
                                 └───────┬───────┘
                                         │
                                         │ HTTPS
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
                 ▼                       ▼                       ▼
        ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
        │  API ROUTES   │       │  AUTH (v5)    │       │   STATIC      │
        │  /api/*       │       │  NextAuth     │       │   ASSETS      │
        │               │       │               │       │               │
        │  - REST APIs  │       │  - Credentials│       │  - Images     │
        │  - Webhooks   │       │  - Sessions   │       │  - Uploads    │
        │  - Middleware │       │  - JWT        │       │               │
        └───────┬───────┘       └───────┬───────┘       └───────┬───────┘
                │                       │                       │
                └───────────────────────┼───────────────────────┘
                                        │
                                        ▼
                              ┌───────────────────┐
                              │    PRISMA ORM     │
                              │                   │
                              │  - Type-safe      │
                              │  - Migrations     │
                              │  - Relations      │
                              └─────────┬─────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
           ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
           │   NEON DB     │   │ VERCEL BLOB   │   │    STRIPE     │
           │  (PostgreSQL) │   │  (Storage)    │   │  (Payments)   │
           │               │   │               │   │               │
           │  - Users      │   │  - Documents  │   │  - Subscript. │
           │  - Salons     │   │  - Images     │   │  - Invoices   │
           │  - Bookings   │   │  - Uploads    │   │  - Webhooks   │
           └───────────────┘   └───────────────┘   └───────────────┘
                    │
                    │
                    ▼
           ┌───────────────┐
           │    RESEND     │
           │   (E-Mails)   │
           │               │
           │  - Transact.  │
           │  - Templates  │
           │  - Tracking   │
           └───────────────┘
```

---

## 2. Technologie-Stack

### 2.1 Frontend

| Technologie | Version | Verwendung |
|-------------|---------|------------|
| **Next.js** | 16.0.7 | Framework |
| **React** | 19.0.0 | UI Library |
| **TypeScript** | 5.7.3 | Typisierung |
| **Tailwind CSS** | 3.4.1 | Styling |
| **Shadcn/UI** | Latest | Komponenten |
| **Framer Motion** | 12.4.7 | Animationen |
| **Recharts** | 3.5.1 | Charts |
| **React Hook Form** | 7.54.2 | Formulare |
| **Zod** | 3.24.2 | Validierung |

### 2.2 Backend

| Technologie | Version | Verwendung |
|-------------|---------|------------|
| **Prisma** | 7.1.0 | ORM |
| **NextAuth.js** | 5.0.0-beta.30 | Authentifizierung |
| **PostgreSQL** | 16 | Datenbank |
| **Neon** | Serverless | DB Hosting |
| **Stripe** | 20.0.0 | Zahlungen |
| **Resend** | 6.5.2 | E-Mail |
| **React Email** | 5.0.5 | E-Mail Templates |

### 2.3 Infrastruktur

| Service | Verwendung |
|---------|------------|
| **Vercel** | Hosting & Deployment |
| **Neon** | PostgreSQL Database |
| **Vercel Blob** | File Storage |
| **Stripe** | Payment Processing |
| **Resend** | Transactional Email |
| **GitHub** | Version Control |

---

## 3. Datenbank-Architektur

### 3.1 Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATENBANK SCHEMA                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    USER      │────<│   ACCOUNT    │     │   SESSION    │>────┐
│              │     │  (OAuth)     │     │              │     │
│ id           │     └──────────────┘     └──────────────┘     │
│ email        │                                               │
│ password     │──────────────────────────────────────────────┘
│ role         │
│ stripeId     │
└──────┬───────┘
       │
       │ 1:1
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│ UserProfile  ││ SalonProfile ││StylistProfile││StylistOnboard│
│              ││              ││              ││              │
│ phone        ││ salonName    ││ experience   ││ companyName  │
│ address      ││ chairCount   ││ skills       ││ taxId        │
│ bio          ││ notifyPrefs  ││ portfolio    ││ documents    │
└──────────────┘└──────────────┘└──────────────┘└──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    SALON     │────<│    CHAIR     │────<│ CHAIR_RENTAL │
│              │     │              │     │              │
│ name         │     │ name         │     │ stylistId    │
│ address      │     │ dailyRate    │     │ startDate    │
│ images[]     │     │ monthlyRate  │     │ monthlyRent  │
│ amenities[]  │     │ isAvailable  │     │ status       │
└──────────────┘     └──────────────┘     └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   CUSTOMER   │────<│   BOOKING    │────<│   SERVICE    │
│              │     │              │     │              │
│ firstName    │     │ startTime    │     │ name         │
│ lastName     │     │ endTime      │     │ category     │
│ phone        │     │ price        │     │ description  │
│ notes        │     │ status       │     │ sortOrder    │
└──────────────┘     └──────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   PAYMENT    │     │    REVIEW    │     │ NOTIFICATION │
│              │     │              │     │              │
│ type         │     │ rating       │     │ type         │
│ amount       │     │ comment      │     │ title        │
│ status       │     │ isVerified   │     │ message      │
│ stripeId     │     │ salonId      │     │ isRead       │
└──────────────┘     └──────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ CONVERSATION │────<│   MESSAGE    │     │EMAIL_TEMPLATE│
│              │     │              │     │              │
│ type         │     │ content      │     │ slug         │
│ subject      │     │ senderId     │     │ subject      │
│ participants │     │ attachments  │     │ content      │
└──────────────┘     └──────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  REFERRAL    │     │REFERRAL_     │     │ SUBSCRIPTION │
│              │     │REWARD        │     │ _PLAN        │
│ referrerId   │     │              │     │              │
│ referredId   │     │ rewardType   │     │ name         │
│ status       │     │ rewardValue  │     │ priceMonthly │
│ commission   │     │ isApplied    │     │ features[]   │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 3.2 Wichtige Relationen

| Relation | Typ | Beschreibung |
|----------|-----|--------------|
| User → Salon | 1:N | Ein Benutzer kann mehrere Salons besitzen |
| Salon → Chair | 1:N | Ein Salon hat mehrere Stühle |
| Chair → ChairRental | 1:N | Ein Stuhl kann mehrfach vermietet werden |
| User → Booking | 1:N | Ein Stylist hat viele Buchungen |
| User → Customer | 1:N | Ein Stylist hat viele Kunden |
| Conversation → Message | 1:N | Eine Konversation hat viele Nachrichten |

---

## 4. Authentifizierung & Autorisierung

### 4.1 NextAuth.js v5 Konfiguration

```typescript
// src/lib/auth.ts
export const { auth, signIn, signOut, handlers } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      authorize: async (credentials) => {
        // Validierung & Authentifizierung
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => { ... },
    session: async ({ session, token }) => { ... },
  },
})
```

### 4.2 Rollenbasierte Zugriffskontrolle (RBAC)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ROLLEN-HIERARCHIE                               │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────┐
                              │  ADMIN   │
                              │          │
                              │ ✓ Alles  │
                              └────┬─────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                     ▼                           ▼
              ┌────────────┐              ┌────────────┐
              │SALON_OWNER │              │  STYLIST   │
              │            │              │            │
              │ ✓ Salons   │              │ ✓ Profil   │
              │ ✓ Stühle   │              │ ✓ Termine  │
              │ ✓ Mieter   │              │ ✓ Kunden   │
              │ ✓ Umsätze  │              │ ✓ Bewertg. │
              └────────────┘              └────────────┘
```

### 4.3 Middleware-Schutz

```typescript
// src/middleware.ts
export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // Admin-Routen
  if (pathname.startsWith('/admin')) {
    if (req.auth?.user?.role !== 'ADMIN') {
      return redirect('/dashboard')
    }
  }
  
  // Salon-Routen
  if (pathname.startsWith('/salon')) {
    if (req.auth?.user?.role !== 'SALON_OWNER') {
      return redirect('/dashboard')
    }
  }
  
  // Stylist-Routen
  if (pathname.startsWith('/stylist')) {
    if (req.auth?.user?.role !== 'STYLIST') {
      return redirect('/dashboard')
    }
  }
})
```

---

## 5. API-Architektur

### 5.1 API-Struktur

```
src/app/api/
├── auth/
│   └── register/route.ts        # Registrierung
├── admin/
│   ├── users/route.ts           # Benutzerverwaltung
│   ├── salons/route.ts          # Salonverwaltung
│   ├── stylists/route.ts        # Stylistenverwaltung
│   ├── stats/route.ts           # Dashboard-Statistiken
│   ├── revenue/route.ts         # Umsatzberichte
│   ├── subscriptions/route.ts   # Abo-Verwaltung
│   ├── settings/route.ts        # Plattform-Einstellungen
│   ├── security/                # Sicherheit
│   │   ├── logs/route.ts
│   │   ├── sessions/route.ts
│   │   └── api-keys/route.ts
│   ├── email-templates/         # E-Mail Templates
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   ├── preview/route.ts
│   │   └── send-test/route.ts
│   ├── onboarding/              # Onboarding-Prüfung
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── referrals/route.ts       # Empfehlungen
├── salon/
│   ├── stats/route.ts           # Salon-Statistiken
│   ├── bookings/route.ts        # Terminverwaltung
│   ├── stylists/route.ts        # Mieter im Salon
│   ├── customers/route.ts       # Kundenverwaltung
│   ├── revenue/route.ts         # Umsätze
│   ├── invoices/route.ts        # Rechnungen
│   ├── reviews/route.ts         # Bewertungen
│   ├── analytics/route.ts       # Analytics
│   └── settings/route.ts        # Einstellungen
├── stylist/
│   ├── stats/route.ts           # Stylist-Statistiken
│   ├── bookings/route.ts        # Termine
│   ├── profile/route.ts         # Profil
│   ├── earnings/route.ts        # Einnahmen
│   ├── invoices/route.ts        # Rechnungen
│   ├── reviews/route.ts         # Bewertungen
│   ├── analytics/route.ts       # Analytics
│   └── settings/route.ts        # Einstellungen
├── user/
│   ├── subscription/route.ts    # Eigenes Abo
│   └── referral/route.ts        # Empfehlungen
├── stripe/
│   ├── create-checkout/route.ts # Checkout starten
│   ├── portal/route.ts          # Kundenportal
│   └── webhook/route.ts         # Stripe Webhooks
├── messages/
│   ├── conversations/route.ts
│   └── users/route.ts
├── notifications/
│   ├── route.ts
│   ├── [id]/read/route.ts
│   ├── mark-all-read/route.ts
│   └── unread-count/route.ts
├── onboarding/
│   ├── basic/route.ts           # Basis-Onboarding
│   ├── stylist/                 # Compliance-Onboarding
│   │   ├── route.ts
│   │   └── complete/route.ts
│   └── documents/
│       └── upload/route.ts
└── referral/
    ├── track/route.ts           # Link-Tracking
    └── validate/route.ts        # Code validieren
```

### 5.2 API-Response-Format

```typescript
// Erfolg
{
  success: true,
  data: { ... }
}

// Fehler
{
  error: "Fehlermeldung",
  code: "ERROR_CODE",  // optional
  details: { ... }     // optional
}

// Paginiert
{
  data: [...],
  pagination: {
    total: 100,
    page: 1,
    perPage: 10,
    totalPages: 10
  }
}
```

---

## 6. Frontend-Architektur

### 6.1 Ordnerstruktur

```
src/
├── app/
│   ├── (auth)/              # Auth-Layouts
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/         # Dashboard-Layouts
│   │   ├── admin/           # Admin-Bereich
│   │   ├── salon/           # Salon-Besitzer
│   │   ├── stylist/         # Stuhlmieter
│   │   └── dashboard/       # Gemeinsame Seiten
│   ├── (marketing)/         # Marketing-Seiten
│   │   ├── page.tsx         # Landing Page
│   │   ├── preise/
│   │   └── uber-uns/
│   ├── onboarding/          # Onboarding-Flow
│   │   ├── page.tsx
│   │   └── stylist/
│   ├── api/                 # API Routes
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                  # Shadcn UI
│   ├── admin/               # Admin-Komponenten
│   ├── dashboard/           # Dashboard-Komponenten
│   └── auth/                # Auth-Komponenten
├── emails/
│   ├── components/          # E-Mail-Layouts
│   └── templates/           # E-Mail-Templates
├── lib/
│   ├── prisma.ts           # DB Client
│   ├── auth.ts             # NextAuth Config
│   ├── email.ts            # E-Mail Service
│   ├── stripe.ts           # Stripe Client
│   ├── notifications.ts    # Notification Helper
│   ├── mock-data.ts        # Demo-Daten
│   └── utils.ts            # Utilities
└── hooks/                   # Custom Hooks
```

### 6.2 Komponenten-Hierarchie

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         KOMPONENTEN-STRUKTUR                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │  RootLayout  │
                              │              │
                              │ ThemeProvider│
                              │ SessionProv. │
                              │ Toaster      │
                              └──────┬───────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
     │  AuthLayout   │     │ DashLayout    │     │ Marketing     │
     │               │     │               │     │ Layout        │
     │  - Login      │     │  - Sidebar    │     │               │
     │  - Register   │     │  - Header     │     │  - Navbar     │
     │  - Reset      │     │  - Content    │     │  - Footer     │
     └───────────────┘     └───────┬───────┘     └───────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
           ▼                       ▼                       ▼
    ┌────────────┐          ┌────────────┐          ┌────────────┐
    │AdminSidebar│          │SalonSidebar│          │StylistSide │
    │            │          │            │          │ bar        │
    │ - Users    │          │ - Bookings │          │ - Calendar │
    │ - Salons   │          │ - Stylists │          │ - Profile  │
    │ - Revenue  │          │ - Revenue  │          │ - Earnings │
    └────────────┘          └────────────┘          └────────────┘
```

---

## 7. Zahlungsintegration (Stripe)

### 7.1 Subscription-Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STRIPE SUBSCRIPTION FLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

    Benutzer                    NICNOA                      Stripe
       │                          │                           │
       │  1. Wählt Plan           │                           │
       │─────────────────────────>│                           │
       │                          │                           │
       │                          │  2. Create Checkout       │
       │                          │  Session                  │
       │                          │──────────────────────────>│
       │                          │                           │
       │                          │  3. Session URL           │
       │                          │<──────────────────────────│
       │                          │                           │
       │  4. Redirect to Stripe   │                           │
       │<─────────────────────────│                           │
       │                          │                           │
       │─────────────────────────────────────────────────────>│
       │                    5. Zahlung                        │
       │<─────────────────────────────────────────────────────│
       │                                                      │
       │                          │  6. Webhook: checkout.    │
       │                          │  session.completed        │
       │                          │<──────────────────────────│
       │                          │                           │
       │                          │  7. Update User DB        │
       │                          │  - stripeCustomerId       │
       │                          │  - stripeSubscriptionId   │
       │                          │  - status: active         │
       │                          │                           │
       │  8. Redirect to          │                           │
       │  Success Page            │                           │
       │<─────────────────────────│                           │
       │                          │                           │
```

### 7.2 Webhook-Events

| Event | Aktion |
|-------|--------|
| `checkout.session.completed` | Abo aktivieren, Welcome E-Mail |
| `customer.subscription.created` | Abo in DB speichern |
| `customer.subscription.updated` | Status aktualisieren |
| `customer.subscription.deleted` | Abo deaktivieren |
| `invoice.paid` | Zahlung bestätigen |
| `invoice.payment_failed` | Warnung senden |

---

## 8. E-Mail-System

### 8.1 E-Mail-Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              E-MAIL FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    Trigger Event              Email Service              Resend
         │                          │                       │
         │  1. Event auslösen       │                       │
         │  (z.B. Registrierung)    │                       │
         │─────────────────────────>│                       │
         │                          │                       │
         │                          │  2. Template laden    │
         │                          │  (aus DB)             │
         │                          │                       │
         │                          │  3. Variablen         │
         │                          │  ersetzen             │
         │                          │                       │
         │                          │  4. HTML rendern      │
         │                          │  (React Email)        │
         │                          │                       │
         │                          │  5. E-Mail senden     │
         │                          │──────────────────────>│
         │                          │                       │
         │                          │  6. Message ID        │
         │                          │<──────────────────────│
         │                          │                       │
         │                          │  7. Log erstellen     │
         │                          │  (EmailLog)           │
         │                          │                       │
```

### 8.2 Template-Kategorien

| Kategorie | Templates | Trigger |
|-----------|-----------|---------|
| **Auth** | welcome, email-verification, password-reset | Registrierung, Passwort |
| **Onboarding** | submitted, approved, rejected | Onboarding-Status |
| **Subscription** | activated, renewed, expiring, expired, payment-failed, invoice | Stripe Webhooks |
| **Booking** | confirmation, reminder, cancelled | Terminaktionen |
| **Referral** | invitation, success | Empfehlungsprogramm |
| **System** | new-message | Messaging |

---

## 9. Monitoring & Logging

### 9.1 Security Logs

```prisma
model SecurityLog {
  id        String              @id @db.Uuid
  userId    String?             @db.Uuid
  userEmail String
  event     SecurityEventType   // LOGIN, LOGOUT, PASSWORD_CHANGED, ...
  status    SecurityEventStatus // SUCCESS, FAILED, WARNING
  ipAddress String?
  userAgent String?
  location  String?
  device    String?
  metadata  Json?
  createdAt DateTime
}
```

### 9.2 Email Logs

```prisma
model EmailLog {
  id             String      @id @db.Uuid
  templateId     String      @db.Uuid
  userId         String?     @db.Uuid
  recipientEmail String
  subject        String
  status         EmailStatus // PENDING, SENT, FAILED, DELIVERED, ...
  resendId       String?
  sentAt         DateTime?
  deliveredAt    DateTime?
  openedAt       DateTime?
  clickedAt      DateTime?
  metadata       Json?
}
```

---

## 10. Demo-Modus

### 10.1 Funktionsweise

```typescript
// src/lib/mock-data.ts
export async function isDemoModeActive(): Promise<boolean> {
  const settings = await prisma.platformSettings.findFirst()
  return settings?.useDemoMode ?? true
}

// In API Routes
export async function GET() {
  if (await isDemoModeActive()) {
    return NextResponse.json(getMockData())
  }
  // Echte Daten laden...
}
```

### 10.2 Betroffene APIs

- `/api/stylist/stats`
- `/api/salon/stats`
- `/api/admin/revenue`
- `/api/admin/subscriptions`
- `/api/user/subscription`
- `/api/user/referral`

---

## 11. Deployment

### 11.1 Umgebungsvariablen

```env
# Database (Neon)
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_URL="https://nicnoa.vercel.app"
NEXTAUTH_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@nicnoa.de"

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="..."
```

### 11.2 CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEPLOYMENT PIPELINE                                │
└─────────────────────────────────────────────────────────────────────────────┘

    Git Push                  GitHub                    Vercel
        │                       │                         │
        │  1. Push to main      │                         │
        │──────────────────────>│                         │
        │                       │                         │
        │                       │  2. Trigger Build       │
        │                       │────────────────────────>│
        │                       │                         │
        │                       │                         │  3. npm install
        │                       │                         │  4. prisma generate
        │                       │                         │  5. next build
        │                       │                         │
        │                       │  6. Deploy              │
        │                       │<────────────────────────│
        │                       │                         │
        │  7. Production URL    │                         │
        │<──────────────────────│                         │
        │                       │                         │
```

---

## 12. Nächste Schritte

### 12.1 Kurzfristig (Phase 4)
- [ ] Cron-Jobs für E-Mail-Erinnerungen
- [ ] Stripe Produkte/Preise synchronisieren
- [ ] Zusätzliche rollen-spezifische E-Mail-Templates

### 12.2 Mittelfristig (Phase 5)
- [ ] Echtzeit-Benachrichtigungen (WebSocket)
- [ ] Kalender-Integration (Google/Outlook)
- [ ] Mobile App (React Native)

### 12.3 Langfristig (Phase 6)
- [ ] KI-gestützte Terminplanung
- [ ] Multi-Sprachen-Support
- [ ] White-Label für große Ketten

---

**Dokumentation gepflegt von:** NICNOA Development Team  
**Letzte Aktualisierung:** 6. Dezember 2025


