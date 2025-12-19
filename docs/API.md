# NICNOA API Dokumentation

## 📡 REST API Reference

**Version:** 1.4  
**Base URL:** `https://nicnoa.vercel.app/api`  
**Authentifizierung:** NextAuth.js Session Cookie  
**Letzte Aktualisierung:** 18. Dezember 2025

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
17. [**Newsletter APIs**](#165-newsletter-apis) *(NEU)*
18. [Webhooks](#17-webhooks)
19. [Error Handling](#18-error-handling)

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

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "perPage": 20,
    "totalPages": 8
  }
}
```

### GET /api/admin/salons
Alle Salons auflisten.

### GET /api/admin/stylists
Alle Stylisten auflisten.

### GET /api/admin/revenue
Umsatzstatistiken.

**Query Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `period` | string | `day`, `week`, `month`, `year` |

### GET /api/admin/subscriptions
Abo-Übersicht.

### GET /api/admin/onboarding
Alle Onboarding-Anträge.

### GET /api/admin/onboarding/[id]
Details eines Onboarding-Antrags.

### PUT /api/admin/onboarding/[id]
Onboarding-Status aktualisieren.

**Request Body:**
```json
{
  "status": "APPROVED",
  "adminNotes": "Alle Dokumente geprüft"
}
```

### GET /api/admin/settings
Plattform-Einstellungen abrufen.

### PUT /api/admin/settings
Plattform-Einstellungen aktualisieren.

### GET /api/admin/security/logs
Security-Logs abrufen.

### GET /api/admin/security/sessions
Aktive Sessions abrufen.

### DELETE /api/admin/security/sessions/[id]
Session beenden.

### GET /api/admin/security/api-keys
API-Keys auflisten.

### POST /api/admin/security/api-keys
Neuen API-Key erstellen.

### DELETE /api/admin/security/api-keys/[id]
API-Key widerrufen.

### GET /api/admin/email-templates
Alle E-Mail-Templates auflisten.

### GET /api/admin/email-templates/[id]
Einzelnes E-Mail-Template abrufen.

### PUT /api/admin/email-templates/[id]
E-Mail-Template aktualisieren.

### POST /api/admin/email-templates/preview
Template-Vorschau generieren.

### POST /api/admin/email-templates/send-test
Test-E-Mail senden.

### GET /api/admin/plans
Abo-Pläne auflisten.

### POST /api/admin/plans
Neuen Abo-Plan erstellen.

### PUT /api/admin/plans/[id]
Abo-Plan aktualisieren.

### GET /api/admin/referrals
Referral-Analytics.

---

## 3. Salon APIs

### GET /api/salon/stats
Dashboard-Statistiken für Salon-Besitzer.

**Response:**
```json
{
  "totalChairs": 5,
  "occupiedChairs": 3,
  "monthlyRevenue": 3500,
  "bookingsToday": 12,
  "averageRating": 4.8
}
```

### GET /api/salon/bookings
Termine im Salon.

**Query Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `date` | string | Datum (ISO 8601) |
| `stylistId` | string | Filter nach Stylist |
| `status` | string | Filter nach Status |

### GET /api/salon/stylists
Mieter im Salon.

### GET /api/salon/customers
Kunden im Salon.

### GET /api/salon/revenue
Umsatzübersicht.

### GET /api/salon/invoices
Rechnungen.

### GET /api/salon/reviews
Salon-Bewertungen.

### GET /api/salon/analytics
Erweiterte Analytics.

### GET /api/salon/settings
Salon-Einstellungen.

### PUT /api/salon/settings
Einstellungen aktualisieren.

---

## 4. Stylist APIs

### GET /api/stylist/stats
Dashboard-Statistiken für Stylisten.

**Response:**
```json
{
  "monthlyEarnings": 2500,
  "bookingsThisMonth": 45,
  "customerCount": 120,
  "averageRating": 4.9,
  "upcomingBookings": 8
}
```

### GET /api/stylist/bookings
Eigene Termine.

### POST /api/stylist/bookings
Neuen Termin erstellen.

**Request Body:**
```json
{
  "customerId": "uuid",
  "serviceId": "uuid",
  "startTime": "2025-01-15T10:00:00Z",
  "endTime": "2025-01-15T11:00:00Z",
  "notes": "Färbung gewünscht"
}
```

### GET /api/stylist/profile
Eigenes Profil.

### PUT /api/stylist/profile
Profil aktualisieren.

### GET /api/stylist/earnings
Einnahmen-Übersicht.

### GET /api/stylist/invoices
Eigene Rechnungen.

### GET /api/stylist/reviews
Stylist-Bewertungen.

### GET /api/stylist/analytics
Performance-Analytics.

### GET /api/stylist/availability
Verfügbarkeit.

### PUT /api/stylist/availability
Verfügbarkeit aktualisieren.

### GET /api/stylist/workspace
Arbeitsplatz-Details.

### GET /api/stylist/find-salon
Verfügbare Salons suchen.

### GET /api/stylist/customers
Eigene Kunden.

### POST /api/stylist/customers
Neuen Kunden anlegen.

### GET /api/stylist/settings
Stylist-Einstellungen.

### PUT /api/stylist/settings
Einstellungen aktualisieren.

---

## 5. User APIs

### GET /api/user/subscription
Eigenes Abo-Details.

**Response:**
```json
{
  "plan": "PROFESSIONAL",
  "status": "active",
  "currentPeriodEnd": "2025-02-01T00:00:00Z",
  "cancelAtPeriodEnd": false
}
```

### GET /api/user/referral
Eigene Referral-Statistiken.

---

## 6. Messaging APIs

### GET /api/messages/conversations
Alle Konversationen.

### POST /api/messages/conversations
Neue Konversation starten.

**Request Body:**
```json
{
  "participantIds": ["uuid1", "uuid2"],
  "type": "DIRECT",
  "subject": "Terminanfrage"
}
```

### GET /api/messages/conversations/[id]
Nachrichten einer Konversation.

### POST /api/messages/conversations/[id]
Neue Nachricht senden.

**Request Body:**
```json
{
  "content": "Hallo, ich hätte eine Frage..."
}
```

### PUT /api/messages/conversations/[id]/read
Konversation als gelesen markieren.

### GET /api/messages/users
Verfügbare Chat-Partner.

---

## 7. Notification APIs

### GET /api/notifications
Eigene Benachrichtigungen.

**Query Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `unread` | boolean | Nur ungelesene |
| `limit` | number | Anzahl (default: 20) |

### PUT /api/notifications/[id]/read
Benachrichtigung als gelesen markieren.

### POST /api/notifications/mark-all-read
Alle als gelesen markieren.

### GET /api/notifications/unread-count
Anzahl ungelesener Benachrichtigungen.

---

## 8. Stripe APIs

### POST /api/stripe/create-checkout
Checkout-Session erstellen.

**Request Body:**
```json
{
  "planId": "uuid",
  "interval": "MONTHLY",
  "successUrl": "/dashboard?success=true",
  "cancelUrl": "/pricing"
}
```

**Response:**
```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/stripe/portal
Kundenportal-Session erstellen.

### POST /api/stripe/webhook
Stripe Webhooks (intern).

---

## 9. Onboarding APIs

### POST /api/onboarding/basic
Basis-Onboarding speichern.

**Request Body:**
```json
{
  "yearsExperience": 5,
  "skills": [
    { "serviceId": "uuid", "rating": 4 }
  ],
  "phone": "+49123456789",
  "city": "Berlin",
  "bio": "Erfahrener Colorist...",
  "instagramUrl": "https://instagram.com/..."
}
```

### GET /api/onboarding/stylist
Stylist-Onboarding-Status.

### POST /api/onboarding/stylist
Compliance-Onboarding speichern.

### POST /api/onboarding/stylist/complete
Onboarding abschließen.

### POST /api/onboarding/documents/upload
Dokument hochladen.

**Request:** `multipart/form-data`
- `file`: Document file
- `type`: `masterCertificate`, `businessRegistration`, etc.

---

## 10. Referral APIs

### POST /api/referral/track
Referral-Link tracken.

**Request Body:**
```json
{
  "code": "REF123ABC"
}
```

### POST /api/referral/validate
Referral-Code validieren.

---

## 11. CMS APIs

### Homepage

#### GET /api/homepage-config
Homepage-Konfiguration abrufen.

#### GET /api/admin/homepage-config
Homepage-Konfiguration für Admin abrufen.

#### PUT /api/admin/homepage-config
Homepage-Konfiguration aktualisieren.

#### POST /api/admin/homepage-config/upload
Hero-Bild hochladen.

---

### Produkt-Seite

#### GET /api/product-page-config
Produkt-Seiten-Konfiguration abrufen.

#### GET /api/admin/product-config
Produkt-Seiten-Konfiguration für Admin abrufen.

#### PUT /api/admin/product-config
Produkt-Seiten-Konfiguration aktualisieren.

#### POST /api/admin/product-config/upload
Hero-Medien für Produkt-Seite hochladen.

---

### Produkt-Features

#### GET /api/product-features
Öffentliche Produkt-Features auflisten.

**Query Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `category` | string | Filter nach Kategorie (core, communication, analytics, security) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Terminkalender",
      "description": "Digitaler Kalender mit...",
      "iconName": "Calendar",
      "category": "core",
      "isHighlight": true
    }
  ]
}
```

#### GET /api/product-features/admin
Alle Produkt-Features für Admin (inkl. inaktive).

#### POST /api/product-features/admin
Neues Produkt-Feature erstellen.

**Request Body:**
```json
{
  "title": "Neues Feature",
  "description": "Feature-Beschreibung",
  "iconName": "Star",
  "category": "core",
  "isHighlight": false
}
```

#### PUT /api/product-features/[id]
Produkt-Feature aktualisieren.

#### DELETE /api/product-features/[id]
Produkt-Feature löschen.

---

### Partner

#### GET /api/partners
Öffentliche Partner auflisten.

#### GET /api/partner-page-config
Partner-Seiten-Konfiguration abrufen.

#### GET /api/admin/partners
Alle Partner für Admin.

#### POST /api/admin/partners
Neuen Partner erstellen.

#### POST /api/admin/partners/upload-logo
Partner-Logo hochladen.

#### GET /api/admin/partner-page-config
Partner-Seiten-Konfiguration für Admin.

#### PUT /api/admin/partner-page-config
Partner-Seiten-Konfiguration aktualisieren.

---

### Presse

#### GET /api/press
Öffentliche Presse-Artikel auflisten.

#### GET /api/press-page-config
Presse-Seiten-Konfiguration abrufen.

#### GET /api/admin/press
Alle Presse-Artikel für Admin.

#### POST /api/admin/press
Neuen Presse-Artikel erstellen.

#### GET /api/admin/press-page-config
Presse-Seiten-Konfiguration für Admin.

#### PUT /api/admin/press-page-config
Presse-Seiten-Konfiguration aktualisieren.

---

### FAQs

#### GET /api/faqs
Öffentliche FAQs auflisten.

**Query Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `role` | string | Filter nach Rolle (STYLIST, SALON_OWNER) |

#### GET /api/homepage-faqs
FAQs für Homepage (showOnHomepage: true).

#### GET /api/faq-page-config
FAQ-Seiten-Konfiguration abrufen.

#### GET /api/admin/faqs
Alle FAQs für Admin.

#### POST /api/admin/faqs
Neues FAQ erstellen.

#### GET /api/admin/faq-page-config
FAQ-Seiten-Konfiguration für Admin.

#### PUT /api/admin/faq-page-config
FAQ-Seiten-Konfiguration aktualisieren.

---

### Testimonials

#### GET /api/testimonials
Öffentliche Testimonials auflisten.

#### GET /api/admin/testimonials
Alle Testimonials für Admin.

#### POST /api/admin/testimonials
Neues Testimonial erstellen.

#### POST /api/admin/testimonials/upload-image
Testimonial-Bild hochladen.

---

### Blog

#### GET /api/blog/posts
Veröffentlichte Blog-Posts auflisten.

#### GET /api/blog/posts/[slug]
Einzelnen Blog-Post abrufen.

#### GET /api/admin/blog/posts
Alle Blog-Posts für Admin.

#### POST /api/admin/blog/posts
Neuen Blog-Post erstellen.

#### PUT /api/admin/blog/posts/[id]
Blog-Post aktualisieren.

#### POST /api/admin/blog/posts/upload-image
Blog-Bild hochladen.

#### GET /api/admin/blog/authors
Blog-Autoren auflisten.

#### GET /api/admin/blog/categories
Blog-Kategorien auflisten.

#### GET /api/admin/blog/tags
Blog-Tags auflisten.

---

### Jobs (Karriere)

#### GET /api/jobs
Aktive Stellenanzeigen auflisten.

#### GET /api/jobs/[slug]
Einzelne Stellenanzeige abrufen.

#### POST /api/jobs/apply
Bewerbung einreichen.

**Request:** `multipart/form-data`
- `jobId`: Job-ID (optional für Initiativbewerbung)
- `firstName`, `lastName`, `email`, `phone`
- `coverLetter`: Anschreiben
- `cv`: PDF-Datei

#### GET /api/admin/jobs
Alle Stellenanzeigen für Admin.

#### POST /api/admin/jobs
Neue Stellenanzeige erstellen.

---

### Über uns

#### GET /api/about-us-page-config
Über-uns-Seiten-Konfiguration abrufen.

#### GET /api/approach-cards
Approach-Karten für Über-uns-Seite.

#### GET /api/admin/about-us-page-config
Über-uns-Konfiguration für Admin.

#### PUT /api/admin/about-us-page-config
Über-uns-Konfiguration aktualisieren.

#### POST /api/admin/about-us-page-config/upload-image
Team-Bilder hochladen.

#### GET /api/admin/approach-cards
Alle Approach-Karten für Admin.

#### POST /api/admin/approach-cards
Neue Approach-Karte erstellen.

---

## 12. Platform APIs

### Design-System

#### GET /api/platform/design-tokens
Öffentliche Design-Tokens abrufen.

**Response:**
```json
{
  "preset": "nicnoa-classic",
  "tokens": {
    "colors": {
      "primary": "#10b981",
      "secondary": "#3b82f6",
      "accent": "#f59e0b"
    },
    "typography": {
      "fontFamily": "Inter, sans-serif"
    },
    "borderRadius": {
      "small": "0.25rem",
      "medium": "0.5rem",
      "large": "1rem"
    }
  }
}
```

#### GET /api/admin/design-tokens
Design-Tokens für Admin (inkl. alle Presets).

#### PUT /api/admin/design-tokens
Design-Tokens aktualisieren.

**Request Body:**
```json
{
  "preset": "nicnoa-modern",
  "customTokens": {
    "colors": {
      "primary": "#8b5cf6"
    }
  }
}
```

---

### Platform-Einstellungen

#### GET /api/platform/primary-color
Primärfarbe der Plattform abrufen.

#### GET /api/platform/password-protection-status
Beta-Passwortschutz-Status.

---

### Error Messages

#### GET /api/error-messages/[type]
Fehlermeldungen nach Typ abrufen.

**Path Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `type` | string | Error-Typ (404, 500, 403, etc.) |

#### GET /api/admin/error-messages
Alle Fehlermeldungen für Admin.

#### POST /api/admin/error-messages
Neue Fehlermeldung erstellen.

#### PUT /api/admin/error-messages/[id]
Fehlermeldung aktualisieren.

---

## 13. Real-time APIs (Pusher)

### Konfiguration

#### GET /api/pusher/config
Pusher-Konfiguration für Client abrufen.

**Response:**
```json
{
  "enabled": true,
  "key": "abc123",
  "cluster": "eu"
}
```

### Authentifizierung

#### POST /api/pusher/auth
Kanal-Authentifizierung für Pusher.

**Request Body:**
```json
{
  "socket_id": "123.456",
  "channel_name": "presence-conversation-uuid"
}
```

**Response:**
```json
{
  "auth": "abc123:signature",
  "channel_data": "{\"user_id\":\"uuid\",\"user_info\":{\"name\":\"Max\",\"role\":\"STYLIST\"}}"
}
```

### Presence

#### POST /api/pusher/presence
Presence-Status aktualisieren.

**Request Body:**
```json
{
  "status": "online"
}
```

### Typing

#### POST /api/pusher/typing
Typing-Event senden.

**Request Body:**
```json
{
  "conversationId": "uuid",
  "isTyping": true
}
```

### Admin

#### GET /api/admin/pusher
Pusher-Konfiguration für Admin abrufen.

**Response:**
```json
{
  "pusherAppId": "123456",
  "pusherKey": "abc123",
  "pusherCluster": "eu",
  "pusherEnabled": true,
  "hasSecret": true
}
```

#### PUT /api/admin/pusher
Pusher-Konfiguration aktualisieren.

**Request Body:**
```json
{
  "pusherAppId": "123456",
  "pusherKey": "abc123",
  "pusherSecret": "secret",
  "pusherCluster": "eu",
  "pusherEnabled": true
}
```

#### POST /api/admin/pusher
Pusher-Verbindung testen.

**Response:**
```json
{
  "success": true,
  "message": "Verbindung erfolgreich!"
}
```

---

## 14. Video Call APIs (Daily.co)

### Konfiguration

#### GET /api/video-call/config
Daily.co-Konfiguration für Client abrufen.

**Response:**
```json
{
  "enabled": true,
  "domain": "nicnoa"
}
```

### Anruf-Management

#### POST /api/video-call/initiate
Video-Anruf starten.

**Request Body:**
```json
{
  "calleeId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "roomUrl": "https://nicnoa.daily.co/call-123",
  "token": "eyJ...",
  "roomName": "call-123"
}
```

#### POST /api/video-call/accept
Eingehenden Anruf annehmen.

**Request Body:**
```json
{
  "callerId": "uuid",
  "roomName": "call-123"
}
```

#### POST /api/video-call/reject
Eingehenden Anruf ablehnen.

**Request Body:**
```json
{
  "callerId": "uuid",
  "roomName": "call-123"
}
```

#### POST /api/video-call/end
Aktiven Anruf beenden.

**Request Body:**
```json
{
  "participantId": "uuid",
  "roomName": "call-123"
}
```

### Admin

#### GET /api/admin/video-call
Daily.co-Konfiguration für Admin abrufen.

**Response:**
```json
{
  "dailyApiKey": "***masked***",
  "dailyDomain": "nicnoa",
  "dailyEnabled": true
}
```

#### PUT /api/admin/video-call
Daily.co-Konfiguration aktualisieren.

**Request Body:**
```json
{
  "dailyApiKey": "your-api-key",
  "dailyDomain": "nicnoa",
  "dailyEnabled": true
}
```

#### POST /api/admin/video-call
Daily.co-Verbindung testen.

**Response:**
```json
{
  "success": true,
  "message": "Verbindung erfolgreich!"
}
```

---

## 15. Analytics APIs (PostHog)

### Öffentlich

#### GET /api/platform/posthog-config
PostHog-Konfiguration für Client abrufen.

**Response:**
```json
{
  "enabled": true,
  "key": "phc_xxx",
  "host": "https://eu.posthog.com"
}
```

### Admin

#### GET /api/admin/posthog
PostHog-Konfiguration für Admin abrufen.

**Response:**
```json
{
  "posthogProjectKey": "phc_xxx",
  "posthogHost": "https://eu.posthog.com",
  "posthogEnabled": true
}
```

#### PUT /api/admin/posthog
PostHog-Konfiguration aktualisieren.

**Request Body:**
```json
{
  "posthogProjectKey": "phc_xxx",
  "posthogHost": "https://eu.posthog.com",
  "posthogEnabled": true
}
```

#### POST /api/admin/posthog/test
PostHog-Verbindung testen.

**Response:**
```json
{
  "success": true,
  "message": "Verbindung erfolgreich!"
}
```

### Analytics-Daten

#### GET /api/admin/analytics/posthog
PostHog Analytics-Daten abrufen.

**Query Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `period` | string | `day`, `week`, `month` |

**Response:**
```json
{
  "visitors": 1500,
  "pageViews": 5000,
  "sessions": 2000,
  "avgSessionDuration": 180,
  "topPages": [...],
  "topReferrers": [...]
}
```

#### GET /api/admin/analytics/revenue
Revenue Analytics abrufen.

**Query Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `period` | string | `day`, `week`, `month`, `year` |

**Response:**
```json
{
  "totalRevenue": 50000,
  "mrr": 5000,
  "arr": 60000,
  "churnRate": 2.5,
  "revenueByPlan": [...],
  "revenueHistory": [...]
}
```

#### GET /api/admin/analytics/heatmaps
Heatmap-Daten abrufen.

**Query Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `page` | string | URL-Pfad (z.B. `/`, `/preise`) |

**Response:**
```json
{
  "clicks": [...],
  "scrollDepth": 75,
  "rageclicks": 5
}
```

---

## 16. E-Mail Analytics APIs

### Übersicht

E-Mail Analytics bietet umfassende Einblicke in den E-Mail-Versand, Zustellraten, Öffnungen, Klicks und Domain-Status.

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
  "dailyStats": [
    {
      "date": "2025-12-10",
      "sent": 45,
      "delivered": 43,
      "opened": 22,
      "clicked": 8,
      "bounced": 1
    }
  ],
  "templateStats": [
    {
      "templateId": "uuid",
      "templateName": "Willkommen",
      "sent": 250,
      "delivered": 245,
      "opened": 180,
      "clicked": 65
    }
  ],
  "domains": [
    {
      "id": "uuid",
      "name": "nicnoa.de",
      "status": "verified",
      "region": "eu-west-1",
      "createdAt": "2025-01-01T00:00:00Z",
      "records": [
        {
          "type": "MX",
          "name": "@",
          "value": "mx.resend.com",
          "status": "verified"
        },
        {
          "type": "TXT",
          "name": "@",
          "value": "v=spf1 include:resend.com ~all",
          "status": "verified"
        }
      ]
    }
  ],
  "recentEmails": [
    {
      "id": "uuid",
      "to": "user@example.com",
      "subject": "Willkommen bei NICNOA",
      "status": "delivered",
      "createdAt": "2025-12-14T10:30:00Z",
      "deliveredAt": "2025-12-14T10:30:05Z",
      "openedAt": "2025-12-14T11:15:00Z"
    }
  ]
}
```

**Response bei nicht konfiguriertem Resend (200):**
```json
{
  "isConfigured": false,
  "message": "Resend ist nicht konfiguriert. Bitte konfigurieren Sie die Resend-Integration in den Einstellungen.",
  "configUrl": "/admin/settings/integrations"
}
```

---

## 16.5 Newsletter APIs

### GET /api/admin/newsletter
Alle Newsletter auflisten.

**Query Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `status` | string | Filter: DRAFT, SCHEDULED, SENT |
| `search` | string | Suche nach Titel |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "subject": "Monatlicher Newsletter",
      "status": "DRAFT",
      "sentCount": 0,
      "openCount": 0,
      "clickCount": 0,
      "createdAt": "2025-12-18T10:00:00Z"
    }
  ]
}
```

### POST /api/admin/newsletter
Neuen Newsletter erstellen.

**Request Body:**
```json
{
  "subject": "Willkommens-Newsletter",
  "previewText": "Entdecken Sie unsere neuen Services...",
  "contentBlocks": [
    {
      "id": "block-1",
      "type": "HEADING",
      "content": "Willkommen!",
      "headingLevel": "h1"
    },
    {
      "id": "block-2",
      "type": "TEXT",
      "content": "Vielen Dank für Ihre Anmeldung..."
    }
  ],
  "segment": "ALL"
}
```

### GET /api/admin/newsletter/:id
Einzelnen Newsletter laden.

### PUT /api/admin/newsletter/:id
Newsletter aktualisieren.

### DELETE /api/admin/newsletter/:id
Newsletter löschen.

### POST /api/admin/newsletter/:id/send
Newsletter an Empfänger versenden.

**Request Body:**
```json
{
  "segment": "ALL",
  "scheduledAt": null
}
```

**Response:**
```json
{
  "success": true,
  "sentCount": 150,
  "message": "Newsletter wurde an 150 Empfänger gesendet"
}
```

### POST /api/admin/newsletter/:id/send-test
Test-E-Mail versenden (mit automatischem Fallback auf Resend Test-Domain).

**Request Body:**
```json
{
  "email": "test@example.com",
  "contentBlocks": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test-E-Mail wurde an test@example.com gesendet",
  "usedTestDomain": true
}
```

### POST /api/admin/newsletter/upload
Bilder für Newsletter zu Vercel Blob hochladen.

**Request:** `multipart/form-data`
| Field | Typ | Beschreibung |
|-------|-----|--------------|
| `file` | File | Bilddatei (max. 5MB) |

**Response:**
```json
{
  "url": "https://blob.vercel-storage.com/...",
  "filename": "image.jpg"
}
```

### GET /api/admin/newsletter/base-template
Branding-Informationen für den Editor laden.

**Response:**
```json
{
  "branding": {
    "logoUrl": "https://...",
    "primaryColor": "#10b981",
    "companyName": "NICNOA",
    "footerText": "© 2025 NICNOA. Alle Rechte vorbehalten.",
    "websiteUrl": "https://www.nicnoa.online"
  }
}
```

### Newsletter Block-Typen

| Typ | Beschreibung | Felder |
|-----|--------------|--------|
| `TEXT` | Formatierter Text | content, textAlign, fontSize |
| `HEADING` | Überschrift | content, headingLevel (h1-h3) |
| `IMAGE` | Bild | imageUrl, altText, linkUrl |
| `BUTTON` | CTA-Button | buttonText, buttonUrl, buttonColor |
| `DIVIDER` | Trennlinie | - |
| `SPACER` | Abstand | spacerSize (small/medium/large) |
| `TWO_COLUMN` | Zwei-Spalten | columnWidths, childBlocks |
| `THREE_COLUMN` | Drei-Spalten | columnWidths, childBlocks |
| `SOCIAL_LINKS` | Social Icons | socialLinks[] |
| `QUOTE` | Zitat | quoteText, authorName |
| `LIST` | Liste | listItems[], listStyle |
| `VIDEO` | Video | videoUrl, posterImageUrl |
| `PRODUCT_CARD` | Produktkarte | productName, productPrice, imageUrl |
| `COUPON` | Gutschein | couponCode, description |
| `PROFILE` | Profilkarte | profileName, profileImageUrl |
| `UNSUBSCRIBE` | Abmelde-Link | unsubscribeText, unsubscribeLinkText |

---

## 17. Webhooks

### POST /api/webhooks/resend
Resend Webhook Handler für E-Mail-Events.

**Unterstützte Events:**
| Event | Beschreibung | Aktion |
|-------|--------------|--------|
| `email.sent` | E-Mail wurde gesendet | Status → SENT |
| `email.delivered` | E-Mail wurde zugestellt | Status → DELIVERED, deliveredAt setzen |
| `email.delivery_delayed` | Zustellung verzögert | Warnung loggen |
| `email.bounced` | E-Mail ist zurückgekommen | Status → BOUNCED |
| `email.complained` | Spam-Beschwerde | Status → COMPLAINED |
| `email.opened` | E-Mail wurde geöffnet | openedAt setzen |
| `email.clicked` | Link wurde geklickt | clickedAt setzen |

**Request Body (von Resend):**
```json
{
  "type": "email.delivered",
  "created_at": "2025-12-14T10:30:05Z",
  "data": {
    "email_id": "re_123abc",
    "from": "noreply@nicnoa.de",
    "to": ["user@example.com"],
    "subject": "Willkommen bei NICNOA",
    "created_at": "2025-12-14T10:30:00Z"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "processed": true
}
```

**Webhook-Verifizierung:**
- Header: `svix-id`, `svix-timestamp`, `svix-signature`
- Verwendet Svix für Signatur-Validierung (optional konfigurierbar)

**Setup:**
1. Webhook-URL bei Resend konfigurieren: `https://nicnoa.vercel.app/api/webhooks/resend`
2. Webhook-Secret in Admin-Einstellungen speichern
3. Events auswählen: `email.*`

---

## 18. Error Handling

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

### Häufige Fehlercodes

| Code | Beschreibung |
|------|--------------|
| `AUTH_REQUIRED` | Authentifizierung erforderlich |
| `INVALID_ROLE` | Falsche Benutzerrolle |
| `NOT_FOUND` | Ressource nicht gefunden |
| `VALIDATION_ERROR` | Validierung fehlgeschlagen |
| `DUPLICATE_ENTRY` | Duplikat existiert bereits |
| `STRIPE_ERROR` | Stripe-Fehler |

---

## Rate Limiting

API-Anfragen sind auf **100 Requests pro Minute** pro IP begrenzt.

**Response bei Überschreitung (429):**
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

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

Die Plattform nutzt Vercel Cron-Jobs für automatisierte Aufgaben:

### GET /api/cron/booking-reminders
Sendet Terminerinnerungen 24h vor Terminen.

**Cron:** `0 8 * * *` (täglich 8:00 Uhr)

### GET /api/cron/daily-summary
Sendet tägliche Zusammenfassungen an Salons.

**Cron:** `0 7 * * *` (täglich 7:00 Uhr)

### GET /api/cron/rent-reminders
Sendet Mietzahlungs-Erinnerungen.

**Cron:** `0 9 1 * *` (monatlich am 1.)

### GET /api/cron/rental-ending
Benachrichtigt über auslaufende Mietverträge.

**Cron:** `0 9 * * *` (täglich 9:00 Uhr)

### GET /api/cron/subscription-warnings
Warnt vor ablaufenden Abonnements.

**Cron:** `0 10 * * *` (täglich 10:00 Uhr)

---

**Letzte Aktualisierung:** 14. Dezember 2025





