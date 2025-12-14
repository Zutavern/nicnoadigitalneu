# PRD: E-Mail & Benachrichtigungs-System

## 📋 Product Requirements Document

**Version:** 1.2  
**Datum:** 14. Dezember 2025  
**Status:** Implementiert  
**Autor:** NICNOA Development Team

---

## 1. Übersicht

### 1.1 Produktvision
Ein vollständiges E-Mail- und Benachrichtigungssystem, das personalisierte Kommunikation zwischen der NICNOA-Plattform und allen Benutzerrollen (Admin, Salon-Besitzer, Stuhlmieter) ermöglicht.

### 1.2 Ziele
- **Transaktionale E-Mails**: Automatische E-Mails bei wichtigen Events
- **Admin-Verwaltung**: Template-Editor mit Live-Preview
- **Multi-Rollen-Support**: Differenzierte Kommunikation je nach Benutzerrolle
- **Skalierbarkeit**: Resend als zuverlässiger E-Mail-Provider
- **Personalisierung**: Anpassbare Templates mit Variablen

---

## 2. Benutzerrollen & E-Mail-Matrix

### 2.1 Rollen-Übersicht

| Rolle | Code | Beschreibung |
|-------|------|--------------|
| **Admin** | `ADMIN` | Plattform-Administrator |
| **Salon-Besitzer** | `SALON_OWNER` | Betreibt Salon, vermietet Stühle |
| **Stuhlmieter** | `STYLIST` | Mietet Stuhl, arbeitet selbstständig |

### 2.2 E-Mail-Zuweisung nach Rolle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          E-MAIL ZUWEISUNG                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────┐                        │
│  │  ADMIN   │    │ SALON_OWNER  │    │   STYLIST   │                        │
│  └────┬─────┘    └──────┬───────┘    └──────┬──────┘                        │
│       │                 │                   │                                │
│       ▼                 ▼                   ▼                                │
│  ┌────────────┐   ┌────────────┐     ┌────────────┐                         │
│  │ Onboarding │   │ Buchungen  │     │ Buchungen  │                         │
│  │ Submitted  │   │ Bestätigt  │     │ Bestätigt  │                         │
│  └────────────┘   └────────────┘     └────────────┘                         │
│                   ┌────────────┐     ┌────────────┐                         │
│                   │ Neue       │     │ Onboarding │                         │
│                   │ Mietanfrage│     │ Status     │                         │
│                   └────────────┘     └────────────┘                         │
│                   ┌────────────┐     ┌────────────┐                         │
│                   │ Zahlung    │     │ Zahlung    │                         │
│                   │ erhalten   │     │ fällig     │                         │
│                   └────────────┘     └────────────┘                         │
│                                                                              │
│  GEMEINSAM für alle Rollen:                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │  Welcome   │ │  Password  │ │  Abo-      │ │   Neue     │               │
│  │  E-Mail    │ │  Reset     │ │  Status    │ │  Nachricht │               │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Detaillierte E-Mail-Matrix

| Template | Admin | Salon-Besitzer | Stuhlmieter | Trigger |
|----------|:-----:|:--------------:|:-----------:|---------|
| **AUTH** |
| `welcome` | ✅ | ✅ | ✅ | Nach Registrierung |
| `email-verification` | ✅ | ✅ | ✅ | Nach Registrierung |
| `password-reset` | ✅ | ✅ | ✅ | Passwort vergessen |
| **ONBOARDING** |
| `onboarding-submitted` | ✅ | ❌ | ❌ | Stylist reicht Antrag ein |
| `onboarding-approved` | ❌ | ❌ | ✅ | Admin genehmigt |
| `onboarding-rejected` | ❌ | ❌ | ✅ | Admin lehnt ab |
| **SUBSCRIPTION** |
| `subscription-activated` | ❌ | ✅ | ✅ | Abo startet |
| `subscription-renewed` | ❌ | ✅ | ✅ | Auto-Verlängerung |
| `subscription-expiring` | ❌ | ✅ | ✅ | 7 Tage vor Ablauf |
| `subscription-expired` | ❌ | ✅ | ✅ | Abo abgelaufen |
| `payment-failed` | ❌ | ✅ | ✅ | Zahlung fehlgeschlagen |
| `invoice-receipt` | ❌ | ✅ | ✅ | Nach Zahlung |
| **BOOKING** |
| `booking-confirmation` | ❌ | ✅ | ✅ | Termin bestätigt |
| `booking-reminder` | ❌ | ✅ | ✅ | 24h vor Termin |
| `booking-cancelled` | ❌ | ✅ | ✅ | Termin storniert |
| **REFERRAL** |
| `referral-invitation` | ❌ | ✅ | ✅ | Einladung versendet |
| `referral-success` | ❌ | ✅ | ✅ | Empfehlung erfolgreich |
| **SYSTEM** |
| `new-message` | ✅ | ✅ | ✅ | Neue Nachricht |

---

## 3. Spezifische Templates für Rollen

### 3.1 Zusätzliche Templates für Salon-Besitzer

| Template-Slug | Beschreibung | Trigger |
|---------------|--------------|---------|
| `new-rental-request` | Neue Mietanfrage für einen Stuhl | Stylist bewirbt sich |
| `rental-accepted` | Mietvertrag wurde akzeptiert | Salon-Besitzer bestätigt |
| `rental-ending-soon` | Mietvertrag endet bald | 30 Tage vor Ende |
| `payment-received` | Mietzahlung eingegangen | Zahlung verbucht |
| `new-review-salon` | Neue Salon-Bewertung | Kunde bewertet |
| `chair-vacancy` | Stuhl ist wieder frei | Mietvertrag endet |
| `monthly-summary` | Monatliche Zusammenfassung | 1. des Monats |

### 3.2 Zusätzliche Templates für Stuhlmieter

| Template-Slug | Beschreibung | Trigger |
|---------------|--------------|---------|
| `rental-application-sent` | Bewerbung verschickt | Stylist bewirbt sich |
| `rental-approved` | Bewerbung angenommen | Salon-Besitzer bestätigt |
| `rental-rejected` | Bewerbung abgelehnt | Salon-Besitzer lehnt ab |
| `rent-payment-due` | Miete fällig | 3 Tage vor Fälligkeit |
| `rent-payment-overdue` | Miete überfällig | Nach Fälligkeitsdatum |
| `new-review-stylist` | Neue Stylist-Bewertung | Kunde bewertet |
| `customer-no-show` | Kunde nicht erschienen | Termin verpasst |
| `weekly-summary` | Wöchentliche Zusammenfassung | Montags |

### 3.3 Zusätzliche Templates für Admin

| Template-Slug | Beschreibung | Trigger |
|---------------|--------------|---------|
| `daily-summary` | Täglicher Report | Täglich 8:00 |
| `security-alert` | Sicherheitswarnung | Verdächtige Aktivität |
| `new-user-registered` | Neuer Benutzer | Nach Registrierung |
| `high-churn-alert` | Hohe Abwanderung | Algorithmus-basiert |
| `payment-dispute` | Zahlungsstreit | Stripe Webhook |

---

## 4. Datenfluss-Architektur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         E-MAIL SYSTEM ARCHITEKTUR                            │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   TRIGGER    │
                              │   EVENTS     │
                              └──────┬───────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   API Route   │           │ Stripe        │           │   Cron Job    │
│   (Benutzer-  │           │ Webhook       │           │   (Scheduled) │
│   Aktionen)   │           │               │           │               │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                                    ▼
                         ┌──────────────────┐
                         │   EMAIL SERVICE  │
                         │   (src/lib/      │
                         │    email.ts)     │
                         └────────┬─────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
                ▼                 ▼                 ▼
        ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
        │ Load Template │ │ Get Platform  │ │ Get User      │
        │ from DB       │ │ Settings      │ │ Preferences   │
        └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
                │                 │                 │
                └─────────────────┼─────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  RENDER EMAIL    │
                         │  (React Email)   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     RESEND       │
                         │   (Provider)     │
                         └────────┬─────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
                ▼                 ▼                 ▼
        ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
        │   EmailLog    │ │   Webhook     │ │   Empfänger   │
        │   (DB)        │ │   (Status)    │ │   Inbox       │
        └───────────────┘ └───────────────┘ └───────────────┘
```

---

## 5. Template-Struktur

### 5.1 Basis-Layout

```tsx
// src/emails/components/EmailLayout.tsx
<Html>
  <Head />
  <Preview>{preview}</Preview>
  <Body>
    <Container>
      {/* Header mit Logo */}
      <Section>
        <Img src={logoUrl} alt="NICNOA" />
      </Section>
      
      {/* Content Card */}
      <Section className="content-card">
        {children}
      </Section>
      
      {/* Footer */}
      <Section>
        <Text>{footerText}</Text>
        <Links to settings, impressum, datenschutz />
      </Section>
    </Container>
  </Body>
</Html>
```

### 5.2 Content-Struktur (JSON)

```json
{
  "headline": "Willkommen bei NICNOA!",
  "body": "Hallo {{name}}, ...",
  "buttonText": "Zum Dashboard",
  "buttonUrl": "{{dashboardUrl}}",
  "footer": "Bei Fragen kontaktiere uns..."
}
```

### 5.3 Verfügbare Variablen

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `{{name}}` | Benutzername | Max Mustermann |
| `{{email}}` | E-Mail-Adresse | max@beispiel.de |
| `{{salonName}}` | Name des Salons | Salon Elegance |
| `{{stylistName}}` | Name des Stylisten | Anna Beispiel |
| `{{bookingDate}}` | Datum des Termins | 15.12.2025 |
| `{{bookingTime}}` | Uhrzeit | 14:00 |
| `{{serviceName}}` | Dienstleistung | Damenschnitt |
| `{{amount}}` | Betrag | 89,00 € |
| `{{invoiceNumber}}` | Rechnungsnummer | INV-2024-001 |
| `{{resetUrl}}` | Passwort-Reset-Link | https://... |
| `{{dashboardUrl}}` | Dashboard-Link | https://... |
| `{{referralCode}}` | Empfehlungscode | MAXM2024 |
| `{{expirationDate}}` | Ablaufdatum | 22.12.2025 |
| `{{planName}}` | Abo-Plan | Premium |

---

## 6. Benachrichtigungen (In-App)

### 6.1 NotificationType Enum

```prisma
enum NotificationType {
  ONBOARDING_SUBMITTED   // → Admin
  ONBOARDING_APPROVED    // → Stylist
  ONBOARDING_REJECTED    // → Stylist
  NEW_MESSAGE            // → Alle
  DOCUMENT_UPLOADED      // → Admin
  DOCUMENT_APPROVED      // → Stylist
  DOCUMENT_REJECTED      // → Stylist
  SUBSCRIPTION_EXPIRING  // → Salon/Stylist
  SUBSCRIPTION_EXPIRED   // → Salon/Stylist
  SYSTEM_ALERT           // → Alle
  WELCOME                // → Alle
  
  // NEU hinzuzufügen:
  NEW_BOOKING            // → Stylist
  BOOKING_CANCELLED      // → Stylist/Kunde
  NEW_RENTAL_REQUEST     // → Salon Owner
  RENTAL_APPROVED        // → Stylist
  PAYMENT_RECEIVED       // → Salon Owner
  RENT_DUE               // → Stylist
  NEW_REVIEW             // → Salon/Stylist
}
```

### 6.2 Notification-Einstellungen pro Rolle

```typescript
// StylistProfile Notification Settings
interface StylistNotificationSettings {
  emailNotifications: boolean    // Allgemeine E-Mails
  smsNotifications: boolean      // SMS (Premium)
  bookingReminders: boolean      // Terminerinnerungen
  marketingEmails: boolean       // Marketing
  newBookingAlert: boolean       // Neue Buchung
  cancellationAlert: boolean     // Stornierung
  reviewAlert: boolean           // Neue Bewertung
}

// SalonProfile Notification Settings
interface SalonNotificationSettings {
  emailNotifications: boolean    // Allgemeine E-Mails
  smsNotifications: boolean      // SMS (Premium)
  bookingReminders: boolean      // Terminerinnerungen
  marketingEmails: boolean       // Marketing
  // Zusätzlich für Salons:
  rentalRequests: boolean        // Neue Mietanfragen
  paymentAlerts: boolean         // Zahlungsbenachrichtigungen
  occupancyReports: boolean      // Auslastungsberichte
}
```

---

## 7. Implementierungsplan für neue Templates

### Phase 1: Basis (✅ IMPLEMENTIERT)
- 18 Core-Templates (Auth, Onboarding, Subscription, Booking, Referral, System)
- Admin Template Editor mit Live-Preview
- Resend Integration

### Phase 2: Rollen-spezifische Templates
| Priorität | Template | Aufwand |
|-----------|----------|---------|
| 🔴 Hoch | `new-rental-request` | 2h |
| 🔴 Hoch | `rental-approved` | 2h |
| 🔴 Hoch | `rent-payment-due` | 2h |
| 🟡 Mittel | `payment-received` | 2h |
| 🟡 Mittel | `new-review-salon` | 2h |
| 🟡 Mittel | `new-review-stylist` | 2h |
| 🟢 Niedrig | `monthly-summary` | 4h |
| 🟢 Niedrig | `weekly-summary` | 4h |

### Phase 3: Automatisierung (✅ IMPLEMENTIERT)
- ✅ Cron-Jobs für scheduled E-Mails
- ✅ Webhook-Integration für Tracking (öffnen, klicken)
- ✅ Vollständiges Analytics-Dashboard
- ❌ A/B-Testing für Templates (geplant)

---

## 8. Technische Spezifikation

### 8.1 Datenbankmodelle

```prisma
model EmailTemplate {
  id              String   @id @db.Uuid
  slug            String   @unique         // "welcome"
  name            String                   // "Willkommen"
  description     String?                  
  subject         String                   // "Willkommen, {{name}}!"
  content         Json                     // { headline, body, ... }
  category        String                   // "auth", "booking", etc.
  primaryColor    String?                  // Override
  logoUrl         String?                  // Override
  isActive        Boolean  @default(true)
  isSystem        Boolean  @default(false) // Nicht löschbar
  
  sentEmails      EmailLog[]
}

model EmailLog {
  id              String      @id @db.Uuid
  templateId      String      @db.Uuid
  userId          String?     @db.Uuid
  recipientEmail  String
  recipientName   String?
  subject         String
  status          EmailStatus // PENDING, SENT, FAILED, etc.
  errorMessage    String?
  resendId        String?     // Resend Message ID
  sentAt          DateTime?
  deliveredAt     DateTime?
  openedAt        DateTime?
  clickedAt       DateTime?
  metadata        Json?
  createdAt       DateTime
}

enum EmailStatus {
  PENDING
  SENT
  FAILED
  BOUNCED
  DELIVERED
  OPENED
  CLICKED
}
```

### 8.2 API-Endpunkte

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/admin/email-templates` | Alle Templates |
| POST | `/api/admin/email-templates` | Neues Template |
| GET | `/api/admin/email-templates/[id]` | Einzelnes Template |
| PUT | `/api/admin/email-templates/[id]` | Template aktualisieren |
| DELETE | `/api/admin/email-templates/[id]` | Template löschen |
| POST | `/api/admin/email-templates/preview` | Preview generieren |
| POST | `/api/admin/email-templates/send-test` | Test-E-Mail senden |

### 8.3 Email Service API

```typescript
// Einzelne E-Mail senden
await sendEmail({
  to: 'user@example.com',
  toName: 'Max Mustermann',
  templateSlug: 'welcome',
  data: { userName: 'Max' },
  userId: 'uuid-here'
})

// Helper-Funktionen
await emails.sendWelcome(to, userName, userId)
await emails.sendPasswordReset(to, userName, resetUrl)
await emails.sendBookingConfirmation(to, userName, stylistName, ...)
```

---

## 9. E-Mail Analytics (✅ IMPLEMENTIERT)

### 9.1 Analytics-Dashboard

Das Admin-Dashboard unter `/admin/settings/email-analytics` bietet:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       E-MAIL ANALYTICS DASHBOARD                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    RESEND KONFIGURATIONSSTATUS                         │ │
│  │  ✅ Resend ist konfiguriert und aktiv                                  │ │
│  │  Domain: nicnoa.de (verified) | Region: eu-west-1                     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  TOTAL   │  │ DELIVERED│  │  OPENED  │  │ CLICKED  │  │ BOUNCED  │      │
│  │   1250   │  │   1150   │  │   580    │  │   230    │  │    25    │      │
│  │          │  │  92.0%   │  │  50.4%   │  │  39.7%   │  │   2.0%   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │              VERSAND-VERLAUF (letzte 30 Tage)                          │ │
│  │  ████████████████████████████████████████████████████████████████      │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│  │  ─ Gesendet  ─ Zugestellt  ─ Geöffnet  ─ Geklickt                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────┐  ┌────────────────────────────────────┐ │
│  │       DOMAIN-STATUS            │  │      TEMPLATE-PERFORMANCE          │ │
│  │                                │  │                                    │ │
│  │  nicnoa.de                     │  │  1. Willkommen       52% Öffnung   │ │
│  │  ✅ MX Record                  │  │  2. Buchung bestätigt 48% Öffnung  │ │
│  │  ✅ SPF Record                 │  │  3. Passwort Reset   45% Öffnung   │ │
│  │  ✅ DKIM Record                │  │  4. Abo-Erinnerung   38% Öffnung   │ │
│  │  ✅ DMARC Record               │  │  5. Neue Nachricht   35% Öffnung   │ │
│  └────────────────────────────────┘  └────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                     LETZTE E-MAILS                                     │ │
│  │  ────────────────────────────────────────────────────────────────────  │ │
│  │  user@example.com  | Willkommen        | ✅ Zugestellt | 10:30        │ │
│  │  max@test.de       | Buchung bestätigt | 👁 Geöffnet   | 10:25        │ │
│  │  info@salon.de     | Neue Nachricht    | ⏳ Gesendet   | 10:20        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 E-Mail-Metriken

| Metrik | Formel | Ziel | Beschreibung |
|--------|--------|------|--------------|
| **Zustellrate** | Delivered / Sent × 100 | >95% | Erfolgreich zugestellt |
| **Öffnungsrate** | Opened / Delivered × 100 | >35% | E-Mail geöffnet (Tracking-Pixel) |
| **Klickrate** | Clicked / Opened × 100 | >15% | Link in E-Mail geklickt |
| **Bounce-Rate** | Bounced / Sent × 100 | <2% | Hard/Soft Bounces |
| **Beschwerde-Rate** | Complained / Sent × 100 | <0.1% | Als Spam markiert |

### 9.3 Webhook-Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RESEND WEBHOOK FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    Resend                     NICNOA Webhook                    Datenbank
       │                           │                                │
       │  email.sent               │                                │
       │──────────────────────────>│  Status → SENT                 │
       │                           │───────────────────────────────>│
       │                           │                                │
       │  email.delivered          │                                │
       │──────────────────────────>│  Status → DELIVERED            │
       │                           │  deliveredAt = timestamp       │
       │                           │───────────────────────────────>│
       │                           │                                │
       │  email.opened             │                                │
       │──────────────────────────>│  openedAt = timestamp          │
       │                           │───────────────────────────────>│
       │                           │                                │
       │  email.clicked            │                                │
       │──────────────────────────>│  clickedAt = timestamp         │
       │                           │  + clicked link URL            │
       │                           │───────────────────────────────>│
       │                           │                                │
       │  email.bounced            │                                │
       │──────────────────────────>│  Status → BOUNCED              │
       │                           │  + bounce reason               │
       │                           │───────────────────────────────>│
       │                           │                                │
```

### 9.4 Domain-Verifizierung

Die Analytics-Seite zeigt den Status aller verifizierten Domains:

| Record-Typ | Zweck | Status |
|------------|-------|--------|
| **MX** | E-Mail-Routing | ✅ Verifiziert |
| **SPF** | Sender-Authentifizierung | ✅ Verifiziert |
| **DKIM** | E-Mail-Signatur | ✅ Verifiziert |
| **DMARC** | Policy-Enforcement | ✅ Verifiziert |

### 9.5 Analytics-Features

| Feature | Beschreibung | Status |
|---------|--------------|--------|
| **Übersichts-Statistiken** | Gesamtzahlen für alle E-Mail-Metriken | ✅ |
| **Tages-Charts** | Versand-Verlauf der letzten 30 Tage | ✅ |
| **Template-Performance** | Öffnungs-/Klickraten pro Template | ✅ |
| **Domain-Status** | DNS-Record-Verifizierung | ✅ |
| **Letzte E-Mails** | Live-Liste der zuletzt gesendeten E-Mails | ✅ |
| **Resend API-Status** | Konfigurationsprüfung mit Hinweis | ✅ |
| **Webhook-Handler** | Echtzeit-Status-Updates | ✅ |

### 9.6 API-Endpunkte

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/admin/email-analytics` | Vollständige Analytics-Daten |
| POST | `/api/webhooks/resend` | Webhook-Handler für Resend-Events |

---

## 10. Sicherheit & Compliance

### 10.1 DSGVO-Konformität
- Double-Opt-In für Marketing-E-Mails
- Einfaches Abmelden (Unsubscribe-Link)
- Datenminimierung in E-Mails
- Aufbewahrungsfrist für Logs (90 Tage)

### 10.2 Technische Sicherheit
- DKIM/SPF/DMARC konfiguriert
- TLS-Verschlüsselung
- Keine sensiblen Daten in E-Mails
- Rate-Limiting für E-Mail-Versand

---

## 11. Anhang

### 11.1 Ordnerstruktur

```
src/
├── emails/
│   ├── components/
│   │   ├── EmailLayout.tsx      # Basis-Layout
│   │   └── EmailButton.tsx      # Button-Komponente
│   └── templates/
│       ├── WelcomeEmail.tsx
│       ├── PasswordResetEmail.tsx
│       ├── BookingConfirmationEmail.tsx
│       └── ... (18 Templates)
├── lib/
│   └── email.ts                 # Email Service
└── app/
    ├── api/admin/email-templates/
    │   ├── route.ts
    │   ├── [id]/route.ts
    │   ├── preview/route.ts
    │   └── send-test/route.ts
    └── (dashboard)/admin/
        └── email-templates/
            └── page.tsx         # Admin Editor
```

### 11.2 Umgebungsvariablen

```env
# Resend (E-Mail Provider)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@nicnoa.de

# Optional: Webhook für Tracking
RESEND_WEBHOOK_SECRET=whsec_xxxxx
```

---

**Dokumentation gepflegt von:** NICNOA Development Team  
**Letzte Aktualisierung:** 14. Dezember 2025





