# NICNOA Datenbank-Dokumentation

## 📊 Database Schema Reference

**Version:** 1.1  
**Datenbank:** PostgreSQL 16  
**ORM:** Prisma 7.1  
**Hosting:** Neon (Serverless)

---

## Inhaltsverzeichnis

1. [Übersicht](#1-übersicht)
2. [Benutzer & Authentifizierung](#2-benutzer--authentifizierung)
3. [Profile](#3-profile)
4. [Onboarding & Compliance](#4-onboarding--compliance)
5. [Salons & Stühle](#5-salons--stühle)
6. [Buchungen & Kunden](#6-buchungen--kunden)
7. [Bewertungen](#7-bewertungen)
8. [Zahlungen](#8-zahlungen)
9. [Messaging](#9-messaging)
10. [Benachrichtigungen](#10-benachrichtigungen)
11. [E-Mail System](#11-e-mail-system)
12. [Referral System](#12-referral-system)
13. [Subscription Plans](#13-subscription-plans)
14. [Security & Logging](#14-security--logging)
15. [System-Konfiguration](#15-system-konfiguration)
16. [Produkt-Seite CMS](#16-produkt-seite-cms)
17. [Enums](#17-enums)

---

## 1. Übersicht

### Entity Relationship Diagram (Vereinfacht)

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│   User   │────<│   Account    │     │   Session    │
│          │     │   (OAuth)    │     │              │
│ id       │     └──────────────┘     └──────────────┘
│ email    │
│ password │
│ role     │──────────────────────────────────────────┐
└────┬─────┘                                          │
     │                                                │
     │ 1:1                                            │
     ├──────────────┬──────────────┬──────────────┐   │
     │              │              │              │   │
     ▼              ▼              ▼              ▼   │
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│UserProf. │ │SalonProf.│ │StylistPr.│ │Onboarding│  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘  │
                                                      │
┌──────────┐     ┌──────────┐     ┌──────────┐       │
│  Salon   │────<│  Chair   │────<│ChairRent.│<──────┘
└────┬─────┘     └──────────┘     └──────────┘
     │
     │ 1:N
     ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Customer │────<│ Booking  │────<│ Service  │
└──────────┘     └──────────┘     └──────────┘
```

### Tabellenübersicht

| Tabelle | Beschreibung | Zeilen (ca.) |
|---------|--------------|--------------|
| `users` | Alle Benutzer | ~500 |
| `salons` | Friseur-Salons | ~100 |
| `chairs` | Mietbare Stühle | ~300 |
| `chair_rentals` | Mietverträge | ~200 |
| `bookings` | Kundentermine | ~5.000 |
| `customers` | Kunden der Stylisten | ~2.000 |
| `notifications` | Benachrichtigungen | ~10.000 |
| `messages` | Chat-Nachrichten | ~20.000 |

---

## 2. Benutzer & Authentifizierung

### User (users)

Zentrale Benutzertabelle für alle Rollen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `name` | String? | Anzeigename |
| `email` | String | E-Mail (unique) |
| `email_verified` | DateTime? | Verifizierungsdatum |
| `image` | String? | Profilbild-URL |
| `password` | String? | Gehashtes Passwort |
| `role` | UserRole | ADMIN, SALON_OWNER, STYLIST |
| `onboarding_completed` | Boolean | Onboarding abgeschlossen |
| `two_factor_enabled` | Boolean | 2FA aktiviert |
| `stripe_customer_id` | String? | Stripe Kunden-ID |
| `stripe_subscription_id` | String? | Stripe Abo-ID |
| `stripe_subscription_status` | String? | Abo-Status |
| `stripe_price_id` | String? | Preis-ID |
| `stripe_current_period_end` | DateTime? | Abo-Enddatum |
| `created_at` | DateTime | Erstellungsdatum |
| `updated_at` | DateTime | Aktualisierungsdatum |

**Relationen:**
- `accounts` → Account[] (OAuth)
- `sessions` → Session[]
- `profile` → UserProfile?
- `salonProfile` → SalonProfile?
- `stylistProfile` → StylistProfile?
- `stylistOnboarding` → StylistOnboarding?
- `ownedSalons` → Salon[]
- `customers` → Customer[]
- `bookings` → Booking[]
- `notifications` → Notification[]

### Account (accounts)

OAuth-Provider Verknüpfungen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | FK → users |
| `type` | String | oauth, email, etc. |
| `provider` | String | google, github, etc. |
| `provider_account_id` | String | Provider-spezifische ID |
| `access_token` | String? | OAuth Access Token |
| `refresh_token` | String? | OAuth Refresh Token |
| `expires_at` | Int? | Token-Ablauf (Unix) |

### Session (sessions)

Aktive Benutzersitzungen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `session_token` | String | Session Token (unique) |
| `user_id` | UUID | FK → users |
| `expires` | DateTime | Ablaufdatum |

---

## 3. Profile

### UserProfile (user_profiles)

Allgemeines Benutzerprofil.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | FK → users (unique) |
| `phone` | String? | Telefonnummer |
| `street` | String? | Straße |
| `city` | String? | Stadt |
| `zip_code` | String? | PLZ |
| `country` | String? | Land |
| `bio` | Text? | Biografie |

### SalonProfile (salon_profiles)

Profil für Salon-Besitzer.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | FK → users (unique) |
| `salon_name` | String | Salonname |
| `street` | String? | Straße |
| `city` | String? | Stadt |
| `zip_code` | String? | PLZ |
| `phone` | String? | Telefon |
| `website` | String? | Website |
| `employee_count` | Int? | Mitarbeiteranzahl |
| `chair_count` | Int? | Stuhlanzahl |
| `salon_size` | Int? | Größe in m² |
| `description` | Text? | Beschreibung |
| `opening_hours` | JSON? | Öffnungszeiten |
| `amenities` | String[] | Ausstattung |
| `images` | String[] | Bilder-URLs |
| `email_notifications` | Boolean | E-Mail-Benachrichtigungen |
| `sms_notifications` | Boolean | SMS-Benachrichtigungen |

### StylistProfile (stylist_profiles)

Profil für Stuhlmieter.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | FK → users (unique) |
| `years_experience` | Int? | Jahre Erfahrung |
| `specialties` | String[] | Spezialisierungen |
| `certifications` | String[] | Zertifikate |
| `portfolio` | String[] | Portfolio-URLs |
| `hourly_rate` | Decimal? | Stundensatz |
| `availability` | JSON? | Verfügbarkeit |
| `bio` | Text? | Biografie |
| `instagram_url` | String? | Instagram |
| `tiktok_url` | String? | TikTok |
| `website_url` | String? | Website |

---

## 4. Onboarding & Compliance

### StylistOnboarding (stylist_onboardings)

Compliance-Daten für Stuhlmieter.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | FK → users (unique) |
| **Geschäftsdaten** |
| `company_name` | String? | Firmenname |
| `tax_id` | String? | Steuernummer |
| `vat_id` | String? | USt-ID |
| `business_street` | String? | Geschäftsadresse |
| `business_city` | String? | Stadt |
| `business_zip_code` | String? | PLZ |
| **Compliance Checks** |
| `own_phone` | Boolean | Eigenes Telefon |
| `own_appointment_book` | Boolean | Eigenes Terminbuch |
| `own_cash_register` | Boolean | Eigene Kasse |
| `own_price_list` | Boolean | Eigene Preisliste |
| `own_branding` | Boolean | Eigene Marke |
| `compliance_confirmed_at` | DateTime? | Compliance bestätigt |
| **Dokumente** |
| `master_certificate_url` | String? | Meisterbrief URL |
| `master_certificate_status` | DocumentStatus | Status |
| `business_registration_url` | String? | Gewerbeanmeldung |
| `business_registration_status` | DocumentStatus | Status |
| `liability_insurance_url` | String? | Haftpflichtversicherung |
| `liability_insurance_status` | DocumentStatus | Status |
| `status_determination_url` | String? | Statusfeststellung (V027) |
| `status_determination_status` | DocumentStatus | Status |
| `crafts_chamber_url` | String? | Handwerkskammer |
| `crafts_chamber_status` | DocumentStatus | Status |
| **Finale Bestätigung** |
| `self_employment_declaration` | Boolean | Selbstständigkeitserklärung |
| `declaration_signed_at` | DateTime? | Unterschriftsdatum |
| **Status** |
| `current_step` | Int | Aktueller Schritt (1-4) |
| `onboarding_status` | OnboardingStatus | Gesamtstatus |
| `admin_notes` | Text? | Admin-Notizen |
| `reviewed_at` | DateTime? | Prüfungsdatum |
| `reviewed_by` | UUID? | Admin-ID |

---

## 5. Salons & Stühle

### Salon (salons)

Friseur-Salons.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `owner_id` | UUID | FK → users |
| `name` | String | Salonname |
| `slug` | String | URL-Slug (unique) |
| `description` | Text? | Beschreibung |
| `street` | String | Straße |
| `city` | String | Stadt |
| `zip_code` | String | PLZ |
| `country` | String | Land |
| `phone` | String? | Telefon |
| `email` | String? | E-Mail |
| `website` | String? | Website |
| `opening_hours` | JSON? | Öffnungszeiten |
| `amenities` | String[] | Ausstattung |
| `images` | String[] | Bilder-URLs |
| `chair_count` | Int | Anzahl Stühle |
| `salon_size` | Int? | Größe in m² |
| `is_active` | Boolean | Aktiv |
| `is_verified` | Boolean | Verifiziert |

**Indexes:** `owner_id`, `city`, `(is_active, is_verified)`

### Chair (chairs)

Mietbare Arbeitsplätze.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `salon_id` | UUID | FK → salons |
| `name` | String | Name (z.B. "Platz 1") |
| `description` | Text? | Beschreibung |
| `daily_rate` | Decimal? | Tagespreis |
| `weekly_rate` | Decimal? | Wochenpreis |
| `monthly_rate` | Decimal? | Monatspreis |
| `amenities` | String[] | Ausstattung |
| `images` | String[] | Bilder-URLs |
| `is_available` | Boolean | Verfügbar |
| `is_active` | Boolean | Aktiv |

### ChairRental (chair_rentals)

Mietverträge.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `chair_id` | UUID | FK → chairs |
| `stylist_id` | UUID | Mieter-ID |
| `start_date` | Date | Startdatum |
| `end_date` | Date? | Enddatum |
| `monthly_rent` | Decimal | Monatsmiete |
| `deposit` | Decimal? | Kaution |
| `status` | RentalStatus | Status |
| `contract_url` | String? | Vertrags-URL |
| `notes` | Text? | Notizen |

---

## 6. Buchungen & Kunden

### Customer (customers)

Kunden der Stylisten.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `stylist_id` | UUID | FK → users |
| `first_name` | String | Vorname |
| `last_name` | String | Nachname |
| `email` | String? | E-Mail |
| `phone` | String? | Telefon |
| `notes` | Text? | Notizen |
| `is_active` | Boolean | Aktiv |

**Unique:** `(stylist_id, email)`

### Booking (bookings)

Kundentermine.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `stylist_id` | UUID | FK → users |
| `customer_id` | UUID? | FK → customers |
| `service_id` | UUID? | FK → services |
| `start_time` | DateTime | Startzeit |
| `end_time` | DateTime | Endzeit |
| `title` | String | Titel |
| `notes` | Text? | Notizen |
| `price` | Decimal? | Preis |
| `is_paid` | Boolean | Bezahlt |
| `status` | BookingStatus | Status |

**Indexes:** `stylist_id`, `customer_id`, `(start_time, end_time)`, `status`

### Service (services)

Dienstleistungen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `category_id` | UUID | FK → service_categories |
| `name` | String | Name |
| `slug` | String | URL-Slug (unique) |
| `description` | Text? | Beschreibung |
| `sort_order` | Int | Sortierung |
| `is_active` | Boolean | Aktiv |

### ServiceCategory (service_categories)

Dienstleistungskategorien.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `name` | String | Name |
| `slug` | String | URL-Slug (unique) |
| `description` | Text? | Beschreibung |
| `icon` | String? | Icon-Name |
| `color` | String? | Farbe |
| `sort_order` | Int | Sortierung |
| `is_active` | Boolean | Aktiv |

---

## 7. Bewertungen

### Review (reviews)

Bewertungen für Salons und Stylisten.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `salon_id` | UUID? | FK → salons |
| `stylist_id` | UUID? | Stylist-ID |
| `reviewer_id` | UUID? | FK → users |
| `reviewer_name` | String? | Name (anonym) |
| `reviewer_email` | String? | E-Mail |
| `rating` | Int | 1-5 Sterne |
| `title` | String? | Titel |
| `comment` | Text? | Kommentar |
| `is_verified` | Boolean | Verifiziert |
| `is_public` | Boolean | Öffentlich |

---

## 8. Zahlungen

### Payment (payments)

Alle Zahlungstransaktionen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `payer_id` | UUID | Zahler-ID |
| `receiver_id` | UUID? | Empfänger-ID |
| `rental_id` | UUID? | FK → chair_rentals |
| `type` | PaymentType | Zahlungstyp |
| `amount` | Decimal | Betrag |
| `currency` | String | Währung (EUR) |
| `description` | String? | Beschreibung |
| `period_start` | Date? | Periodenbeginn |
| `period_end` | Date? | Periodenende |
| `due_date` | Date? | Fälligkeitsdatum |
| `paid_at` | DateTime? | Bezahlt am |
| `status` | PaymentStatus | Status |
| `stripe_payment_intent_id` | String? | Stripe ID |
| `invoice_url` | String? | Rechnungs-URL |

---

## 9. Messaging

### Conversation (conversations)

Chat-Konversationen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `type` | ConversationType | DIRECT, GROUP, SUPPORT |
| `subject` | String? | Betreff |

### ConversationParticipant (conversation_participants)

Teilnehmer einer Konversation.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `conversation_id` | UUID | FK → conversations |
| `user_id` | UUID | FK → users |
| `role` | ParticipantRole | ADMIN, MODERATOR, MEMBER |
| `last_read_at` | DateTime? | Zuletzt gelesen |
| `joined_at` | DateTime | Beigetreten |

**Unique:** `(conversation_id, user_id)`

### Message (messages)

Chat-Nachrichten.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `conversation_id` | UUID | FK → conversations |
| `sender_id` | UUID | FK → users |
| `content` | Text | Nachrichteninhalt |
| `is_system_message` | Boolean | System-Nachricht |
| `edited_at` | DateTime? | Bearbeitet am |

### MessageAttachment (message_attachments)

Anhänge zu Nachrichten.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `message_id` | UUID | FK → messages |
| `file_name` | String | Dateiname |
| `file_url` | String | Datei-URL |
| `file_type` | String | MIME-Type |
| `file_size` | Int | Dateigröße (Bytes) |

---

## 10. Benachrichtigungen

### Notification (notifications)

System-Benachrichtigungen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | FK → users |
| `type` | NotificationType | Benachrichtigungstyp |
| `title` | String | Titel |
| `message` | Text | Nachricht |
| `link` | String? | Ziel-URL |
| `is_read` | Boolean | Gelesen |
| `metadata` | JSON? | Zusätzliche Daten |

**Indexes:** `(user_id, is_read)`, `(user_id, created_at)`

---

## 11. E-Mail System

### EmailTemplate (email_templates)

E-Mail-Vorlagen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `slug` | String | Template-Slug (unique) |
| `name` | String | Anzeigename |
| `description` | Text? | Beschreibung |
| `subject` | String | Betreffzeile |
| `content` | JSON | Template-Inhalt |
| `primary_color` | String? | Primärfarbe |
| `logo_url` | String? | Logo-URL |
| `category` | String | Kategorie |
| `is_active` | Boolean | Aktiv |
| `is_system` | Boolean | System-Template |

### EmailLog (email_logs)

E-Mail-Versandprotokoll.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `template_id` | UUID | FK → email_templates |
| `user_id` | UUID? | FK → users |
| `recipient_email` | String | Empfänger-E-Mail |
| `recipient_name` | String? | Empfänger-Name |
| `subject` | String | Betreffzeile |
| `status` | EmailStatus | Versandstatus |
| `error_message` | Text? | Fehlermeldung |
| `resend_id` | String? | Resend Message-ID |
| `sent_at` | DateTime? | Gesendet am |
| `delivered_at` | DateTime? | Zugestellt am |
| `opened_at` | DateTime? | Geöffnet am |
| `clicked_at` | DateTime? | Geklickt am |
| `metadata` | JSON? | Zusätzliche Daten |

---

## 12. Referral System

### Referral (referrals)

Empfehlungen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `referrer_id` | UUID | Empfehler-ID |
| `referrer_email` | String | Empfehler-E-Mail |
| `referrer_role` | String | Empfehler-Rolle |
| `referred_email` | String | Eingeladener E-Mail |
| `referred_id` | UUID? | Eingeladener-ID |
| `referred_name` | String? | Eingeladener Name |
| `referred_role` | String? | Eingeladener Rolle |
| `code` | String | Referral-Code (unique) |
| `status` | ReferralStatus | Status |
| `invited_at` | DateTime | Eingeladen am |
| `registered_at` | DateTime? | Registriert am |
| `converted_at` | DateTime? | Konvertiert am |
| `rewarded_at` | DateTime? | Belohnt am |
| `expires_at` | DateTime | Läuft ab am |
| `total_revenue` | Decimal | Generierter Umsatz |
| `total_commission` | Decimal | Verdiente Provision |
| `commission_rate` | Decimal | Provisionssatz |

### ReferralReward (referral_rewards)

Belohnungen für Empfehlungen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | Empfänger-ID |
| `referral_id` | UUID | FK → referrals |
| `reward_type` | String | FREE_MONTH, CREDIT, etc. |
| `reward_value` | Decimal | Wert |
| `description` | String | Beschreibung |
| `is_applied` | Boolean | Angewendet |
| `applied_at` | DateTime? | Angewendet am |
| `stripe_coupon_id` | String? | Stripe Coupon |

### UserReferralProfile (user_referral_profiles)

Referral-Profil pro Benutzer.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | FK → users (unique) |
| `user_role` | String | Benutzerrolle |
| `referral_code` | String | Persönlicher Code (unique) |
| `total_referrals` | Int | Gesamt-Empfehlungen |
| `successful_referrals` | Int | Erfolgreiche Empfehlungen |
| `total_earnings` | Decimal | Gesamt-Verdienst |
| `pending_rewards` | Int | Ausstehende Belohnungen |
| `total_referred_revenue` | Decimal | Generierter Umsatz |
| `total_clicks` | Int | Link-Klicks |
| `commission_rate` | Decimal | Provisionssatz |

---

## 13. Subscription Plans

### SubscriptionPlan (subscription_plans)

Abo-Pläne.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `name` | String | Planname |
| `slug` | String | URL-Slug (unique) |
| `description` | Text? | Beschreibung |
| `plan_type` | PlanType | SALON_OWNER, STYLIST |
| `price_monthly` | Decimal | Monatspreis |
| `price_quarterly` | Decimal | Quartalspreis |
| `price_yearly` | Decimal | Jahrespreis |
| `stripe_price_monthly` | String? | Stripe Monatspreis-ID |
| `stripe_price_quarterly` | String? | Stripe Quartalspreis-ID |
| `stripe_price_yearly` | String? | Stripe Jahrespreis-ID |
| `stripe_product_id` | String? | Stripe Produkt-ID |
| `features` | String[] | Features |
| `max_chairs` | Int? | Max. Stühle |
| `max_bookings` | Int? | Max. Buchungen/Monat |
| `max_customers` | Int? | Max. Kunden |
| `is_active` | Boolean | Aktiv |
| `is_popular` | Boolean | Hervorgehoben |
| `trial_days` | Int | Testphase (Tage) |

---

## 14. Security & Logging

### SecurityLog (security_logs)

Sicherheitsprotokolle.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID? | FK → users |
| `user_email` | String | E-Mail |
| `event` | SecurityEventType | Event-Typ |
| `status` | SecurityEventStatus | Status |
| `message` | Text? | Nachricht |
| `ip_address` | String? | IP-Adresse |
| `user_agent` | Text? | User-Agent |
| `location` | String? | Standort |
| `device` | String? | Gerät |
| `metadata` | JSON? | Zusätzliche Daten |

### ApiKey (api_keys)

API-Schlüssel.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `name` | String | Name |
| `key` | String | Gehashter Key (unique) |
| `key_prefix` | String | Prefix (erste 8 Zeichen) |
| `permissions` | String[] | Berechtigungen |
| `is_active` | Boolean | Aktiv |
| `is_test_mode` | Boolean | Testmodus |
| `last_used_at` | DateTime? | Zuletzt verwendet |
| `usage_count` | Int | Nutzungszähler |
| `expires_at` | DateTime? | Ablaufdatum |
| `created_by_id` | UUID | Ersteller-ID |

### ActiveSession (active_sessions)

Erweiterte Session-Verfolgung.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | FK → users |
| `session_token` | String | Token (unique) |
| `ip_address` | String? | IP-Adresse |
| `user_agent` | Text? | User-Agent |
| `device` | String? | Gerät |
| `browser` | String? | Browser |
| `os` | String? | Betriebssystem |
| `location` | String? | Standort |
| `is_active` | Boolean | Aktiv |
| `last_active_at` | DateTime | Zuletzt aktiv |
| `expires_at` | DateTime | Ablaufdatum |

---

## 15. System-Konfiguration

### PlatformSettings (platform_settings)

Globale Plattform-Einstellungen (Singleton).

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | String | "default" |
| `company_name` | String | Firmenname |
| `support_email` | String | Support-E-Mail |
| `support_phone` | String? | Support-Telefon |
| `default_language` | String | Sprache (de) |
| `timezone` | String | Zeitzone |
| `currency` | String | Währung (EUR) |
| `logo_url` | String? | Logo-URL |
| `favicon_url` | String? | Favicon-URL |
| `primary_color` | String? | Primärfarbe |
| `trial_days` | Int | Standard-Testphase |
| `smtp_*` | String? | SMTP-Konfiguration |
| `email_*` | String? | E-Mail-Branding |
| `use_demo_mode` | Boolean | Demo-Modus aktiv |
| `demo_mode_message` | String? | Demo-Nachricht |
| `design_system_preset` | String? | Design-System Preset (nicnoa-classic, nicnoa-modern, etc.) |
| `design_tokens` | Json? | Benutzerdefinierte Design-Tokens |

---

## 16. Produkt-Seite CMS

### ProductFeature (product_features)

Produkt-Features für die Produkt-Seite.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `title` | String | Feature-Titel |
| `description` | Text | Feature-Beschreibung |
| `icon_name` | String | Icon-Name (Lucide Icons) |
| `category` | String | Kategorie (core, communication, analytics, security) |
| `is_active` | Boolean | Aktiv |
| `is_highlight` | Boolean | Hervorgehoben anzeigen |
| `sort_order` | Int | Sortierung |

**Indexes:** `(category, is_active, sort_order)`, `(is_active, sort_order)`

### ProductPageConfig (product_page_config)

Konfiguration der Produkt-Seite (Singleton mit ID "default").

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | String | "default" |
| **Hero-Einstellungen** |
| `hero_type` | String | "animated", "image", "video", "code" |
| `hero_layout` | String | "split", "centered", "fullscreen" |
| `hero_image_url` | Text? | Hero-Bild URL |
| `hero_video_url` | Text? | Hero-Video URL |
| `hero_badge_text` | String? | Badge-Text |
| `hero_title` | Text | Haupttitel |
| `hero_title_highlight` | String? | Hervorgehobener Text |
| `hero_description` | Text? | Beschreibung |
| **CTA-Buttons** |
| `cta_primary_text` | String | Primärer Button-Text |
| `cta_primary_link` | String | Primärer Button-Link |
| `cta_secondary_text` | String? | Sekundärer Button-Text |
| `cta_secondary_link` | String? | Sekundärer Button-Link |
| `show_secondary_cta` | Boolean | Sekundären CTA anzeigen |
| **Trust Indicators** |
| `show_trust_indicators` | Boolean | Trust-Indikatoren anzeigen |
| `trust_indicator_1` | String? | Trust-Indikator 1 |
| `trust_indicator_2` | String? | Trust-Indikator 2 |
| `trust_indicator_3` | String? | Trust-Indikator 3 |
| **Animation** |
| `animation_enabled` | Boolean | Animationen aktiviert |
| `particles_enabled` | Boolean | Partikel aktiviert |
| `use_design_system_colors` | Boolean | Design-System-Farben verwenden |
| `gradient_colors` | String? | Gradient-Farben (kommasepariert) |
| **Features-Section** |
| `features_section_title` | String? | Features-Abschnittstitel |
| `features_section_description` | Text? | Features-Beschreibung |
| `show_feature_categories` | Boolean | Kategorien anzeigen |
| **Stats** |
| `show_stats` | Boolean | Stats anzeigen |
| `stat_1_label` | String? | Stat 1 Label |
| `stat_1_value` | String? | Stat 1 Wert |
| `stat_2_label` | String? | Stat 2 Label |
| `stat_2_value` | String? | Stat 2 Wert |
| `stat_3_label` | String? | Stat 3 Label |
| `stat_3_value` | String? | Stat 3 Wert |
| **Bottom CTA** |
| `bottom_cta_title` | String? | CTA-Titel |
| `bottom_cta_description` | Text? | CTA-Beschreibung |
| `bottom_cta_button_text` | String? | CTA-Button-Text |
| `bottom_cta_button_link` | String? | CTA-Button-Link |
| **SEO** |
| `meta_title` | String? | Meta-Titel |
| `meta_description` | String? | Meta-Beschreibung |
| `og_image` | Text? | Open-Graph-Bild |

---

## 17. Enums

### UserRole
```prisma
enum UserRole {
  ADMIN
  SALON_OWNER
  STYLIST
}
```

### DocumentStatus
```prisma
enum DocumentStatus {
  PENDING
  UPLOADED
  APPROVED
  REJECTED
}
```

### OnboardingStatus
```prisma
enum OnboardingStatus {
  IN_PROGRESS
  PENDING_REVIEW
  APPROVED
  REJECTED
}
```

### RentalStatus
```prisma
enum RentalStatus {
  PENDING
  ACTIVE
  CANCELLED
  COMPLETED
  EXPIRED
}
```

### BookingStatus
```prisma
enum BookingStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

### PaymentStatus
```prisma
enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
  REFUNDED
}
```

### NotificationType
```prisma
enum NotificationType {
  ONBOARDING_SUBMITTED
  ONBOARDING_APPROVED
  ONBOARDING_REJECTED
  NEW_MESSAGE
  DOCUMENT_UPLOADED
  DOCUMENT_APPROVED
  DOCUMENT_REJECTED
  SUBSCRIPTION_EXPIRING
  SUBSCRIPTION_EXPIRED
  SYSTEM_ALERT
  WELCOME
}
```

### ReferralStatus
```prisma
enum ReferralStatus {
  PENDING
  REGISTERED
  CONVERTED
  REWARDED
  EXPIRED
  CANCELLED
}
```

---

**Letzte Aktualisierung:** 10. Dezember 2025





