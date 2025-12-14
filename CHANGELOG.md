# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

---

## [Unreleased]

### Geplant
- Kalender-Integration (Google/Outlook)
- Mobile App (React Native)
- KI-gestützte Terminplanung

---

## [1.3.0] - 2025-12-14

### Hinzugefügt

#### E-Mail Analytics Dashboard
- Vollständiges E-Mail-Analytics-Dashboard unter `/admin/settings/email-analytics`
- Übersichts-Statistiken (Gesendet, Zugestellt, Geöffnet, Geklickt, Bounced)
- Zustellrate, Öffnungsrate, Klickrate, Bounce-Rate Berechnungen
- Tages-Chart für Versand-Verlauf der letzten 30 Tage
- Template-Performance-Statistiken
- Domain-Status-Anzeige mit DNS-Record-Verifizierung
- Live-Liste der zuletzt gesendeten E-Mails
- Resend Konfigurationsstatus-Prüfung
- API-Endpunkt: `/api/admin/email-analytics` - Vollständige Analytics-Daten

#### Resend Webhook Integration
- Webhook-Handler für Resend-Events unter `/api/webhooks/resend`
- Echtzeit-Status-Updates für E-Mails:
  - `email.sent` - E-Mail wurde gesendet
  - `email.delivered` - E-Mail wurde zugestellt
  - `email.opened` - E-Mail wurde geöffnet
  - `email.clicked` - Link wurde geklickt
  - `email.bounced` - E-Mail ist zurückgekommen
  - `email.complained` - Spam-Beschwerde
- Webhook-Verifizierung mit Svix (optional)
- Automatische Datenbank-Updates für EmailLog

### Geändert
- Admin-Sidebar um "E-Mail Analytics" Link erweitert
- E-Mail-System Dokumentation (PRD) um Analytics-Sektion erweitert
- API-Dokumentation um E-Mail Analytics und Webhook-Endpunkte erweitert
- Architektur-Dokumentation um E-Mail Analytics Flow erweitert

### Neue Abhängigkeiten
- `svix` - Webhook-Verifizierung für Resend-Events

---

## [1.2.0] - 2025-12-12

### Hinzugefügt

#### PostHog Analytics Integration
- PostHog Provider für clientseitiges Tracking
- Admin Analytics Dashboard mit interaktiven Charts
- Revenue Analytics mit Umsatzübersichten
- Heatmaps Viewer für UX-Analyse
- Admin-Einstellungen für PostHog-Konfiguration
- API-Endpunkte:
  - `/api/platform/posthog-config` - Öffentliche PostHog-Konfiguration
  - `/api/admin/posthog` - Admin-Konfiguration (GET/PUT)
  - `/api/admin/posthog/test` - Verbindungstest
  - `/api/admin/analytics/posthog` - Analytics-Daten
  - `/api/admin/analytics/revenue` - Revenue-Daten
  - `/api/admin/analytics/heatmaps` - Heatmap-Daten

#### Pusher Real-time Chat System
- Echtzeit-Messaging mit Pusher Channels
- Presence-Kanäle für Online-Status
- Typing-Indicators (Schreibt gerade...)
- Real-time Nachrichtenübermittlung
- Moderne Chat-UI mit Demo-Modus-Unterstützung
- Server- und Client-Bibliotheken (`pusher-server.ts`, `pusher-client.ts`)
- API-Endpunkte:
  - `/api/pusher/config` - Client-Konfiguration
  - `/api/pusher/auth` - Kanal-Authentifizierung
  - `/api/pusher/presence` - Presence-Updates
  - `/api/pusher/typing` - Typing-Events
  - `/api/admin/pusher` - Admin-Konfiguration (GET/PUT/POST)

#### Daily.co Video Calls
- Integrierte Video-Anrufe im Chat
- Server-seitige Daily.co API-Integration
- Video-Anruf nur wenn Empfänger online
- Eingehender Anruf Modal mit Klingelton
- Anruf-Steuerung (Mute, Video, Screenshare)
- Admin kann Video-Calls komplett deaktivieren
- API-Endpunkte:
  - `/api/video-call/config` - Client-Konfiguration
  - `/api/video-call/initiate` - Anruf starten
  - `/api/video-call/accept` - Anruf annehmen
  - `/api/video-call/reject` - Anruf ablehnen
  - `/api/video-call/end` - Anruf beenden
  - `/api/admin/video-call` - Admin-Konfiguration (GET/PUT/POST)

#### Kontaktinfo im Chat
- Kontakt-Sheet mit Benutzer-Stammdaten
- Zeigt Name, E-Mail, Telefon, Stadt, Registrierungsdatum
- Rollenspezifische Informationen (Salon, Stylist)
- Social Media Links und Bio
- Telefon-Button mit `tel:` Link-Integration
- API-Endpunkt: `/api/messages/users/[id]` - Benutzerdetails

#### Magic Link Authentifizierung
- Passwortlose Anmeldung per E-Mail-Link
- Sichere Token-Generierung
- 2FA-Unterstützung für Magic Links
- Neues E-Mail-Template: `MagicLinkEmail`
- API-Endpunkte:
  - `/api/auth/magic-link/send` - Magic Link senden
  - `/api/auth/magic-link/verify` - Link verifizieren
  - `/api/auth/magic-link/complete-2fa` - 2FA nach Magic Link

#### Erweitertes Login-System
- Separates 2FA-Login-Flow
- Verbesserte Auth-Page-Konfiguration
- API-Endpunkte:
  - `/api/auth/login` - Standard-Login
  - `/api/auth/2fa/login-verify` - 2FA bei Login verifizieren
  - `/api/auth-page-config` - Login-Seiten-Konfiguration

#### Sprachen-Management
- Aktive Sprachen API
- Sprachauswahl-Komponente
- API-Endpunkt: `/api/languages/active`

### Geändert
- Datenbank-Schema erweitert:
  - `PlatformSettings`: Neue Felder für Pusher, Daily.co, PostHog
  - `User`: Neue Felder `isOnline`, `lastSeenAt` für Presence
- Admin-Settings Seite um 3 neue Tabs erweitert (Pusher, Daily, PostHog)
- Messaging-Seite komplett überarbeitet mit RealtimeChat-Komponente
- Mock-Daten erweitert für Chat Demo-Modus

### Verbessert
- Test-Button Logik für maskierte API-Keys (Pusher, Daily.co)
- Info-Hinweise wenn API-Keys gespeichert sind
- Hydration-Fehler in Analytics behoben
- SessionProvider-Wrapper Probleme gelöst

### Neue Komponenten
- `src/components/chat/realtime-chat.tsx` - Echtzeit Chat UI
- `src/components/chat/video-call.tsx` - Video Call & Incoming Call Modal
- `src/components/analytics/page-tracker.tsx` - PostHog Page Tracker
- `src/components/providers/posthog-provider.tsx` - PostHog Provider
- `src/components/ui/skeleton.tsx` - Skeleton Loading Component
- `src/components/language-selector.tsx` - Sprach-Auswahl

### Neue Libraries
- `pusher` (Server) & `pusher-js` (Client) - Real-time Messaging
- `@daily-co/daily-js` - Video Calls
- `posthog-js` - Analytics

---

## [1.1.0] - 2025-12-10

### Hinzugefügt

#### Design-System
- Konfigurierbares Design-System mit vordefinierten Presets
- Design-Tokens für Farben, Typografie, Abstände und Schatten
- 3 Standard-Presets: nicnoa-classic, nicnoa-modern, nicnoa-minimal
- Vollständig anpassbare Custom-Tokens
- Admin-Oberfläche für Design-System-Verwaltung
- API-Endpunkte: `/api/platform/design-tokens`, `/api/admin/design-tokens`

#### Produkt-Seite CMS
- Vollständiges CMS für die Produkt-Seite
- `ProductPageConfig` für Hero-Bereich, CTAs, Stats und SEO
- `ProductFeature` Modell für Feature-Karten
- Kategorisierte Features (core, communication, analytics, security)
- Highlight-Features mit besonderer Hervorhebung
- Admin-Dashboard für Produkt-Features unter `/admin/product`
- API-Endpunkte: `/api/product-page-config`, `/api/product-features`

#### Cron-Jobs für E-Mail-Erinnerungen
- `/api/cron/booking-reminders` - Terminerinnerungen (täglich 8:00)
- `/api/cron/daily-summary` - Tägliche Zusammenfassungen (täglich 7:00)
- `/api/cron/rent-reminders` - Mietzahlungs-Erinnerungen (monatlich)
- `/api/cron/rental-ending` - Auslaufende Mietverträge (täglich 9:00)
- `/api/cron/subscription-warnings` - Abo-Warnungen (täglich 10:00)

### Geändert
- Dokumentation vollständig aktualisiert
- API-Dokumentation um 50+ neue Endpunkte erweitert
- Architektur-Dokumentation um Design-System und CMS erweitert
- Datenbank-Dokumentation um ProductFeature und ProductPageConfig erweitert

### Verbessert
- Homepage Hero unterstützt jetzt Design-System-Farben
- Produkt-Seite Hero mit konfigurierbaren Animationsfarben
- E-Mail-Templates nutzen Design-System-Tokens

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
| 1.3.0 | 2025-12-14 | E-Mail Analytics Dashboard, Resend Webhooks |
| 1.2.0 | 2025-12-12 | PostHog Analytics, Pusher Chat, Daily.co Video, Magic Links |
| 1.1.0 | 2025-12-10 | Design-System, Produkt-Seite CMS, Cron-Jobs |
| 1.0.0 | 2025-12-06 | Initial Release |

---

## Mitwirkende

- NICNOA Development Team

---

[Unreleased]: https://github.com/your-org/nicnoa/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/your-org/nicnoa/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/your-org/nicnoa/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/your-org/nicnoa/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/your-org/nicnoa/releases/tag/v1.0.0





