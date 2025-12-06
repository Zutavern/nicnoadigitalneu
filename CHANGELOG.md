# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

---

## [Unreleased]

### Geplant
- Cron-Jobs für E-Mail-Erinnerungen
- Echtzeit-Benachrichtigungen (WebSocket)
- Kalender-Integration (Google/Outlook)
- Mobile App (React Native)

---

## [1.0.0] - 2025-12-06

### 🎉 Initial Release

Die erste vollständige Version der NICNOA-Plattform.

### Hinzugefügt

#### Authentifizierung & Benutzer
- NextAuth.js v5 Integration mit Credentials Provider
- Rollenbasierte Zugriffskontrolle (Admin, Salon-Owner, Stylist)
- Middleware für geschützte Routen
- Zwei-Faktor-Authentifizierung (Vorbereitung)

#### Onboarding
- Basis-Onboarding für Stylisten (Profil, Skills, Kontakt)
- Compliance-Onboarding mit Dokumenten-Upload
- Selbstständigkeits-Checkliste (§4 SGB IV)
- Admin-Review-Workflow für Onboarding-Anträge

#### Dashboards
- **Admin Dashboard**
  - Benutzer-, Salon- und Stylist-Verwaltung
  - Umsatz- und Abonnement-Übersicht
  - Onboarding-Review
  - Security-Dashboard mit Logs und API-Keys
  - E-Mail-Template-Editor
  - Abo-Plan-Verwaltung
  - Referral-Analytics

- **Salon-Owner Dashboard**
  - Terminübersicht und Kalender
  - Mieter-Verwaltung
  - Kunden-Verwaltung
  - Umsatz-Analytics
  - Rechnungen
  - Bewertungen

- **Stylist Dashboard**
  - Terminkalender
  - Kundenmanagement
  - Einnahmen-Tracking
  - Salon-Finder
  - Verfügbarkeitsmanagement
  - Profil-Bearbeitung

#### Messaging & Benachrichtigungen
- In-App Messaging System
- Benachrichtigungszentrale
- E-Mail-Benachrichtigungen (42 Templates)
- Unread-Counter in Navigation

#### E-Mail-System
- Integration mit Resend
- React Email Templates
- Admin Template-Editor mit Live-Preview
- E-Mail-Logging und Tracking
- Kategorisierte Templates:
  - Auth (Welcome, Password Reset, Verification)
  - Onboarding (Submitted, Approved, Rejected)
  - Subscriptions (Activated, Renewed, Expiring, etc.)
  - Bookings (Confirmation, Reminder, Cancelled)
  - Referrals (Invitation, Success)
  - Rentals (Request, Accepted, Payment Due)
  - Reviews und Summaries

#### Zahlungen (Stripe)
- Subscription-Management
- Checkout-Integration
- Kundenportal
- Webhook-Handler
- Abo-Pläne für Salon-Owner und Stylisten
- Preisgestaltung (Monatlich, Quartalsweise, Jährlich)

#### Referral-System
- Persönliche Referral-Codes
- Cookie-basiertes Attribution-Tracking
- Belohnungssystem (Free Month, Credits)
- Separate Programme für Salon-Owner und Stylisten
- Admin-Analytics Dashboard

#### File Storage
- Vercel Blob Integration
- Dokumenten-Upload für Onboarding
- Bild-Upload für Profile und Salons

#### Demo-Modus
- Toggle in Admin-Einstellungen
- Mock-Daten für alle Dashboards
- Funktioniert ohne Stripe-Keys

#### Marketing-Seiten
- Landing Page mit Hero, Features, Testimonials
- Preise-Seite
- FAQ
- Über uns
- Impressum & Datenschutz
- Beta-Programm

### Technologie-Stack
- Next.js 16.0.7
- React 19.0.0
- TypeScript 5.7.3
- Prisma 7.1.0
- NextAuth.js 5.0.0-beta.30
- Tailwind CSS 3.4.1
- Shadcn/UI
- Framer Motion 12.4.7
- Stripe 20.0.0
- Resend 6.5.2
- React Email 5.0.5

### Infrastruktur
- Vercel Deployment
- Neon PostgreSQL (Serverless)
- Vercel Blob Storage
- GitHub CI/CD

---

## Versionshistorie

| Version | Datum | Beschreibung |
|---------|-------|--------------|
| 1.0.0 | 2025-12-06 | Initial Release |

---

## Mitwirkende

- NICNOA Development Team

---

[Unreleased]: https://github.com/your-org/nicnoa/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-org/nicnoa/releases/tag/v1.0.0


