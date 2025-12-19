# NICNOA API Dokumentation

## 📡 REST API Reference

**Version:** 2.0  
**Base URL:** `https://nicnoa.vercel.app/api`  
**Authentifizierung:** NextAuth.js Session Cookie  
**Letzte Aktualisierung:** 19. Dezember 2025

---

## Inhaltsverzeichnis

1. [Authentifizierung](#1-authentifizierung)
2. [Admin APIs](#2-admin-apis)
3. [Salon APIs](#3-salon-apis)
4. [Stylist APIs](#4-stylist-apis)
5. [User APIs](#5-user-apis)
6. [Messaging APIs](#6-messaging-apis)
7. [Notification APIs](#7-notification-apis)
8. [Stripe APIs](#8-stripe-apis)
9. [Onboarding APIs](#9-onboarding-apis)
10. [Referral APIs](#10-referral-apis)
11. [CMS APIs](#11-cms-apis)
12. [Platform APIs](#12-platform-apis)
13. [Real-time APIs (Pusher)](#13-real-time-apis-pusher)
14. [Video Call APIs (Daily.co)](#14-video-call-apis-dailyco)
15. [Analytics APIs (PostHog)](#15-analytics-apis-posthog)
16. [E-Mail Analytics APIs](#16-e-mail-analytics-apis)
17. [Newsletter APIs](#17-newsletter-apis)
18. [**Homepage Builder APIs**](#18-homepage-builder-apis) *(NEU)*
19. [**Domain APIs**](#19-domain-apis) *(NEU)*
20. [**AI Model APIs**](#20-ai-model-apis) *(NEU)*
21. [Webhooks](#21-webhooks)
22. [Error Handling](#22-error-handling)

---

## 1. Authentifizierung

### POST /api/auth/register
Neuen Benutzer registrieren.

**Request Body:**
```json
{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "password": "securePassword123",
  "role": "STYLIST"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "Max Mustermann",
    "email": "max@example.com",
    "role": "STYLIST"
  }
}
```

### POST /api/auth/signin
Login via NextAuth.js Credentials Provider.

---

## 2. Admin APIs

### GET /api/admin/stats
Dashboard-Statistiken für Admins.

**Response:**
```json
{
  "totalUsers": 150,
  "totalSalons": 25,
  "totalStylists": 100,
  "monthlyRevenue": 15000,
  "pendingOnboardings": 5,
  "activeSubscriptions": 80
}
```

### GET /api/admin/users
Alle Benutzer auflisten.

**Query Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `page` | number | Seitennummer (default: 1) |
| `limit` | number | Einträge pro Seite (default: 20) |
| `role` | string | Filter nach Rolle |
| `search` | string | Suche nach Name/E-Mail |

### GET /api/admin/salons
Alle Salons auflisten.

### GET /api/admin/stylists
Alle Stylisten auflisten.

### GET /api/admin/revenue
Umsatzstatistiken.

### GET /api/admin/subscriptions
Abo-Übersicht.

### AI Models (NEU)

#### GET /api/admin/ai-models
Alle AI-Modelle auflisten.

**Response:**
```json
{
  "models": [
    {
      "id": "uuid",
      "name": "GPT-4o",
      "provider": "openai",
      "modelId": "gpt-4o",
      "category": "GENERAL",
      "inputCostPer1k": 0.005,
      "outputCostPer1k": 0.015,
      "isActive": true,
      "isDefault": true
    }
  ]
}
```

#### POST /api/admin/ai-models
Neues AI-Modell erstellen.

#### PUT /api/admin/ai-models/[id]
AI-Modell aktualisieren.

#### DELETE /api/admin/ai-models/[id]
AI-Modell löschen.

### Plans Sync (NEU)

#### POST /api/admin/plans/sync-stripe
Pläne mit Stripe Products synchronisieren.

**Response:**
```json
{
  "success": true,
  "synced": 3,
  "message": "3 Pläne erfolgreich synchronisiert"
}
```

#### POST /api/admin/plans/seed
Initiale Pläne in die Datenbank einfügen.

### Homepage Prompts (NEU)

#### GET /api/admin/homepage-prompts
Alle Homepage-Prompts auflisten.

#### POST /api/admin/homepage-prompts
Neuen Homepage-Prompt erstellen.

#### PUT /api/admin/homepage-prompts/[id]
Homepage-Prompt aktualisieren.

#### DELETE /api/admin/homepage-prompts/[id]
Homepage-Prompt löschen.

---

## 3. Salon APIs

### GET /api/salon/stats
Dashboard-Statistiken für Salon-Besitzer.

### GET /api/salon/bookings
Termine im Salon.

### GET /api/salon/settings
Salon-Einstellungen.

### PUT /api/salon/settings
Einstellungen aktualisieren.

---

## 4. Stylist APIs

### GET /api/stylist/stats
Dashboard-Statistiken für Stylisten.

### GET /api/stylist/bookings
Eigene Termine.

### GET /api/stylist/settings
Stylist-Einstellungen.

### PUT /api/stylist/settings
Einstellungen aktualisieren.

---

## 5. User APIs

### GET /api/user/subscription
Eigenes Abo-Details.

### POST /api/user/subscription
Subscription erstellen (mit Stripe Checkout).

**Request Body:**
```json
{
  "planId": "uuid",
  "interval": "MONTHLY"
}
```

**Response:**
```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

### GET /api/user/usage
AI-Credit-Verbrauch abrufen.

**Response:**
```json
{
  "totalCreditsEur": 10.00,
  "usedCreditsEur": 3.50,
  "remainingCreditsEur": 6.50,
  "usageHistory": [...]
}
```

### GET /api/user/branding
Branding-Informationen des Benutzers.

---

## 6. Messaging APIs

### GET /api/messages/conversations
Alle Konversationen.

### POST /api/messages/conversations
Neue Konversation starten.

### GET /api/messages/conversations/[id]
Nachrichten einer Konversation.

### POST /api/messages/conversations/[id]
Neue Nachricht senden.

---

## 7. Notification APIs

### GET /api/notifications
Eigene Benachrichtigungen.

### PUT /api/notifications/[id]/read
Benachrichtigung als gelesen markieren.

### POST /api/notifications/mark-all-read
Alle als gelesen markieren.

---

## 8. Stripe APIs

### Embedded Checkout (NEU)

#### POST /api/stripe/create-embedded-checkout
Embedded Checkout Session erstellen (ohne Redirect).

**Request Body:**
```json
{
  "planId": "uuid",
  "interval": "MONTHLY"
}
```

**Response:**
```json
{
  "clientSecret": "cs_..._secret_...",
  "sessionId": "cs_..."
}
```

#### POST /api/stripe/create-checkout-intent
PaymentIntent oder SetupIntent für Custom Checkout erstellen.

**Request Body:**
```json
{
  "planId": "uuid",
  "interval": "MONTHLY",
  "userType": "STYLIST"
}
```

**Response:**
```json
{
  "clientSecret": "pi_..._secret_...",
  "subscriptionId": "sub_...",
  "type": "payment"
}
```

**Response (bei Trial):**
```json
{
  "clientSecret": "seti_..._secret_...",
  "subscriptionId": "sub_...",
  "type": "setup"
}
```

#### GET /api/stripe/checkout-status
Checkout-Session-Status prüfen.

**Query Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `session_id` | string | Stripe Session ID |

**Response:**
```json
{
  "status": "complete",
  "customerEmail": "max@example.com",
  "planName": "Pro"
}
```

### Legacy Checkout

#### POST /api/stripe/create-checkout
Redirect-basierte Checkout-Session erstellen.

#### POST /api/stripe/portal
Kundenportal-Session erstellen.

#### POST /api/stripe/webhook
Stripe Webhooks (intern).

---

## 9. Onboarding APIs

### POST /api/onboarding/basic
Basis-Onboarding speichern.

### GET /api/onboarding/stylist
Stylist-Onboarding-Status.

### POST /api/onboarding/stylist
Compliance-Onboarding speichern.

### POST /api/onboarding/stylist/complete
Onboarding abschließen.

### GET /api/onboarding/stylist/status
Aktuellen Onboarding-Status abrufen.

### POST /api/onboarding/salon
Salon-Onboarding speichern.

---

## 10. Referral APIs

### POST /api/referral/track
Referral-Link tracken.

### POST /api/referral/validate
Referral-Code validieren.

---

## 11. CMS APIs

### Homepage Config

#### GET /api/homepage-config
Homepage-Konfiguration abrufen.

#### GET /api/admin/homepage-config
Homepage-Konfiguration für Admin abrufen.

#### PUT /api/admin/homepage-config
Homepage-Konfiguration aktualisieren.

### Blog

#### GET /api/blog/posts
Veröffentlichte Blog-Posts auflisten.

#### GET /api/blog/posts/[slug]
Einzelnen Blog-Post abrufen.

#### GET /api/admin/blog/authors
Blog-Autoren auflisten.

### FAQs

#### GET /api/faqs
Öffentliche FAQs auflisten.

#### GET /api/homepage-faqs
FAQs für Homepage.

### Testimonials

#### GET /api/testimonials
Öffentliche Testimonials auflisten.

---

## 12. Platform APIs

### GET /api/platform/design-tokens
Öffentliche Design-Tokens abrufen.

### GET /api/platform/primary-color
Primärfarbe der Plattform abrufen.

### GET /api/plans/[planId]
Plan-Details abrufen.

**Response:**
```json
{
  "plan": {
    "id": "uuid",
    "name": "Pro",
    "slug": "pro",
    "priceMonthly": 29.99,
    "priceQuarterly": 79.99,
    "priceSixMonths": 149.99,
    "priceYearly": 279.99,
    "features": ["Feature 1", "Feature 2"],
    "trialDays": 14,
    "includedAiCreditsEur": 10
  }
}
```

---

## 13. Real-time APIs (Pusher)

### GET /api/pusher/config
Pusher-Konfiguration für Client abrufen.

### POST /api/pusher/auth
Kanal-Authentifizierung für Pusher.

### POST /api/pusher/presence
Presence-Status aktualisieren.

### POST /api/pusher/typing
Typing-Event senden.

---

## 14. Video Call APIs (Daily.co)

### GET /api/video-call/config
Daily.co-Konfiguration für Client abrufen.

### POST /api/video-call/initiate
Video-Anruf starten.

### POST /api/video-call/accept
Eingehenden Anruf annehmen.

### POST /api/video-call/reject
Eingehenden Anruf ablehnen.

### POST /api/video-call/end
Aktiven Anruf beenden.

---

## 15. Analytics APIs (PostHog)

### GET /api/platform/posthog-config
PostHog-Konfiguration für Client abrufen.

### GET /api/admin/analytics/posthog
PostHog Analytics-Daten abrufen.

### GET /api/admin/analytics/revenue
Revenue Analytics abrufen.

### GET /api/admin/analytics/heatmaps
Heatmap-Daten abrufen.

---

## 16. E-Mail Analytics APIs

### GET /api/admin/email-analytics
Vollständige E-Mail-Analytics-Daten abrufen.

**Response:**
```json
{
  "isConfigured": true,
  "stats": {
    "total": 1250,
    "sent": 1200,
    "delivered": 1150,
    "opened": 580,
    "clicked": 230,
    "bounced": 25,
    "complained": 5,
    "deliveryRate": 95.83,
    "openRate": 50.43,
    "clickRate": 20.0,
    "bounceRate": 2.08
  },
  "dailyStats": [...],
  "templateStats": [...],
  "domains": [...],
  "recentEmails": [...]
}
```

---

## 17. Newsletter APIs

### GET /api/admin/newsletter
Alle Newsletter auflisten.

### POST /api/admin/newsletter
Neuen Newsletter erstellen.

### GET /api/admin/newsletter/:id
Einzelnen Newsletter laden.

### PUT /api/admin/newsletter/:id
Newsletter aktualisieren.

### DELETE /api/admin/newsletter/:id
Newsletter löschen.

### POST /api/admin/newsletter/:id/send
Newsletter an Empfänger versenden.

### POST /api/admin/newsletter/:id/send-test
Test-E-Mail versenden.

### POST /api/admin/newsletter/upload
Bilder für Newsletter hochladen.

### GET /api/admin/newsletter/base-template
Branding-Informationen für den Editor laden.

### GET /api/admin/newsletter/templates
Newsletter-Vorlagen auflisten.

---

## 18. Homepage Builder APIs (NEU)

### Homepage Management

#### GET /api/homepage
Alle Homepages des Benutzers auflisten.

**Response:**
```json
{
  "homepages": [
    {
      "id": "uuid",
      "name": "Mein Salon",
      "slug": "mein-salon",
      "status": "DRAFT",
      "template": "modern",
      "createdAt": "2025-12-19T10:00:00Z"
    }
  ]
}
```

#### POST /api/homepage
Neue Homepage erstellen.

**Request Body:**
```json
{
  "name": "Mein Salon",
  "template": "modern",
  "designStyle": "minimalist",
  "colorScheme": "light",
  "pages": ["home", "services", "gallery", "contact"]
}
```

#### GET /api/homepage/[id]
Homepage-Details abrufen.

#### PUT /api/homepage/[id]
Homepage aktualisieren.

#### DELETE /api/homepage/[id]
Homepage löschen.

### AI Generation

#### POST /api/homepage/[id]/generate
Homepage-Inhalt mit AI generieren.

**Request Body:**
```json
{
  "promptId": "uuid",
  "customPrompt": "Optional: Zusätzliche Anweisungen"
}
```

**Response:**
```json
{
  "success": true,
  "generatedContent": {
    "pages": [...],
    "styles": {...}
  },
  "tokensUsed": 1500,
  "costEur": 0.02
}
```

#### GET /api/homepage/[id]/prompt
Aktuellen Generierungs-Prompt abrufen.

#### PUT /api/homepage/[id]/prompt
Generierungs-Prompt aktualisieren.

### Publishing

#### POST /api/homepage/[id]/publish
Homepage veröffentlichen.

**Request Body:**
```json
{
  "customDomain": "www.mein-salon.de"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://mein-salon.nicnoa.online",
  "customDomain": "www.mein-salon.de"
}
```

### Homepage Prompts (Public)

#### GET /api/homepage-prompts
Verfügbare Homepage-Prompts für den Benutzer.

---

## 19. Domain APIs (NEU)

### Domain Management

#### GET /api/domains
Alle Domains des Benutzers auflisten.

**Response:**
```json
{
  "domains": [
    {
      "id": "uuid",
      "domain": "www.mein-salon.de",
      "status": "verified",
      "vercelId": "dom_...",
      "createdAt": "2025-12-19T10:00:00Z"
    }
  ]
}
```

#### POST /api/domains
Neue Domain hinzufügen.

**Request Body:**
```json
{
  "domain": "www.mein-salon.de",
  "homepageId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "domain": {
    "id": "uuid",
    "domain": "www.mein-salon.de",
    "status": "pending",
    "dnsRecords": [
      {
        "type": "CNAME",
        "name": "www",
        "value": "cname.vercel-dns.com"
      }
    ]
  }
}
```

#### GET /api/domains/[id]
Domain-Details abrufen.

#### DELETE /api/domains/[id]
Domain entfernen.

### Domain Verification

#### GET /api/domains/check
Domain-Verfügbarkeit prüfen.

**Query Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `domain` | string | Domain-Name |

**Response:**
```json
{
  "available": true,
  "domain": "mein-salon.de",
  "price": {
    "registration": 12.99,
    "renewal": 14.99
  }
}
```

#### POST /api/domains/purchase
Domain kaufen (via Vercel).

**Request Body:**
```json
{
  "domain": "mein-salon.de",
  "homepageId": "uuid"
}
```

---

## 20. AI Model APIs (NEU)

### GET /api/admin/ai-models
Alle AI-Modelle auflisten.

**Response:**
```json
{
  "models": [
    {
      "id": "uuid",
      "name": "GPT-4o",
      "provider": "openai",
      "modelId": "gpt-4o",
      "category": "GENERAL",
      "description": "Bestes Allround-Modell",
      "inputCostPer1k": 0.005,
      "outputCostPer1k": 0.015,
      "contextLength": 128000,
      "isActive": true,
      "isDefault": true,
      "capabilities": ["text", "vision", "function_calling"]
    }
  ]
}
```

### POST /api/admin/ai-models
Neues AI-Modell hinzufügen.

**Request Body:**
```json
{
  "name": "Claude 3.5 Sonnet",
  "provider": "anthropic",
  "modelId": "claude-3-5-sonnet",
  "category": "GENERAL",
  "inputCostPer1k": 0.003,
  "outputCostPer1k": 0.015,
  "isActive": true
}
```

### PUT /api/admin/ai-models/[id]
AI-Modell aktualisieren.

### DELETE /api/admin/ai-models/[id]
AI-Modell löschen.

### AI Model Categories

| Kategorie | Beschreibung |
|-----------|--------------|
| `GENERAL` | Allgemeine Aufgaben |
| `CREATIVE` | Kreative Texte |
| `CODE` | Code-Generierung |
| `REASONING` | Komplexe Logik |
| `VISION` | Bildverarbeitung |
| `FAST` | Schnelle Antworten |

---

## 21. Webhooks

### POST /api/webhooks/stripe
Stripe Webhook Handler.

**Unterstützte Events:**
| Event | Aktion |
|-------|--------|
| `checkout.session.completed` | Abo aktivieren |
| `customer.subscription.created` | Abo in DB speichern |
| `customer.subscription.updated` | Status aktualisieren |
| `customer.subscription.deleted` | Abo deaktivieren |
| `invoice.paid` | Zahlung bestätigen |
| `invoice.payment_failed` | Warnung senden |

### POST /api/webhooks/resend
Resend Webhook Handler für E-Mail-Events.

**Unterstützte Events:**
| Event | Beschreibung |
|-------|--------------|
| `email.sent` | E-Mail gesendet |
| `email.delivered` | E-Mail zugestellt |
| `email.opened` | E-Mail geöffnet |
| `email.clicked` | Link geklickt |
| `email.bounced` | E-Mail zurückgekommen |
| `email.complained` | Spam-Beschwerde |

---

## 22. Error Handling

### Standard-Fehlerformat

```json
{
  "error": "Fehlermeldung",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes

| Code | Bedeutung |
|------|-----------|
| 200 | Erfolg |
| 201 | Erstellt |
| 400 | Ungültige Anfrage |
| 401 | Nicht authentifiziert |
| 403 | Keine Berechtigung |
| 404 | Nicht gefunden |
| 409 | Konflikt |
| 422 | Validierungsfehler |
| 429 | Rate Limit überschritten |
| 500 | Server-Fehler |

---

## Rate Limiting

API-Anfragen sind auf **100 Requests pro Minute** pro IP begrenzt.

---

## Paginierung

Listenendpunkte unterstützen Paginierung:

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "perPage": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Cron-Jobs

| Endpunkt | Cron | Beschreibung |
|----------|------|--------------|
| `/api/cron/booking-reminders` | `0 8 * * *` | Terminerinnerungen |
| `/api/cron/daily-summary` | `0 7 * * *` | Tägliche Zusammenfassungen |
| `/api/cron/rent-reminders` | `0 9 1 * *` | Mietzahlungs-Erinnerungen |
| `/api/cron/rental-ending` | `0 9 * * *` | Auslaufende Mietverträge |
| `/api/cron/subscription-warnings` | `0 10 * * *` | Ablaufende Abonnements |

---

**Letzte Aktualisierung:** 19. Dezember 2025
