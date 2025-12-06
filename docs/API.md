# NICNOA API Dokumentation

## 📡 REST API Reference

**Version:** 1.0  
**Base URL:** `https://nicnoa.vercel.app/api`  
**Authentifizierung:** NextAuth.js Session Cookie

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
11. [Error Handling](#11-error-handling)

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

## 11. Error Handling

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

**Letzte Aktualisierung:** 6. Dezember 2025

