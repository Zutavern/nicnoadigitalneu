# NICNOA Datenbank-Dokumentation

## 📊 Database Schema Reference

**Version:** 2.0  
**Datenbank:** PostgreSQL 16  
**ORM:** Prisma 7.1  
**Hosting:** Neon (Serverless)  
**Letzte Aktualisierung:** 19. Dezember 2025

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
12. [Newsletter System](#12-newsletter-system) *(NEU)*
13. [Referral System](#13-referral-system)
14. [Subscription Plans](#14-subscription-plans)
15. [Security & Logging](#15-security--logging)
16. [System-Konfiguration](#16-system-konfiguration)
17. [CMS Tabellen](#17-cms-tabellen)
18. [Homepage Builder](#18-homepage-builder) *(NEU)*
19. [AI System](#19-ai-system) *(NEU)*
20. [Enums](#20-enums)

---

## 1. Übersicht

### Tabellenübersicht

| Bereich | Tabellen | Beschreibung |
|---------|----------|--------------|
| **Auth** | 6 | Benutzer, Sessions, Accounts |
| **Profile** | 4 | User-, Salon-, Stylist-Profile |
| **Salons** | 3 | Salons, Stühle, Mietverträge |
| **Buchungen** | 4 | Termine, Kunden, Services |
| **Zahlungen** | 2 | Payments, Subscription Plans |
| **Messaging** | 4 | Konversationen, Nachrichten |
| **E-Mail** | 3 | Templates, Logs, Newsletter |
| **Referral** | 3 | Empfehlungen, Belohnungen |
| **CMS** | 10+ | Seiten-Konfigurationen |
| **Homepage** | 3 | Homepages, Prompts, Domains |
| **AI** | 2 | Modelle, Usage Logs |

**Gesamt: 55+ Tabellen**

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
| `salutation` | Salutation? | Anrede (NEU) |
| `onboarding_completed` | Boolean | Onboarding abgeschlossen |
| `phone_verified` | Boolean | Telefon verifiziert |
| `two_factor_enabled` | Boolean | 2FA aktiviert |
| `stripe_customer_id` | String? | Stripe Kunden-ID |
| `stripe_subscription_id` | String? | Stripe Abo-ID |
| `stripe_subscription_status` | String? | Abo-Status |
| `stripe_price_id` | String? | Preis-ID |
| `stripe_current_period_end` | DateTime? | Abo-Enddatum |
| `ai_credits_used_eur` | Decimal | Verbrauchte AI-Credits (NEU) |
| `created_at` | DateTime | Erstellungsdatum |
| `updated_at` | DateTime | Aktualisierungsdatum |

**Relationen:**
- `accounts` → Account[]
- `sessions` → Session[]
- `profile` → UserProfile?
- `salonProfile` → SalonProfile?
- `stylistProfile` → StylistProfile?
- `homepages` → Homepage[] (NEU)
- `aiUsageLogs` → AIUsageLog[] (NEU)

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

## 3. Profile

### SalonProfile (salon_profiles)

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
| `description` | Text? | Beschreibung |
| `opening_hours` | JSON? | Öffnungszeiten |
| `amenities` | String[] | Ausstattung |
| `images` | String[] | Bilder-URLs |

### StylistProfile (stylist_profiles)

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

Compliance-Daten für Stuhlmieter (§4 SGB IV).

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | FK → users (unique) |
| **Geschäftsdaten** |
| `company_name` | String? | Firmenname |
| `tax_id` | String? | Steuernummer |
| `vat_id` | String? | USt-ID |
| `business_street` | String? | Geschäftsadresse |
| **Compliance Checks** |
| `own_phone` | Boolean | Eigenes Telefon |
| `own_appointment_book` | Boolean | Eigenes Terminbuch |
| `own_cash_register` | Boolean | Eigene Kasse |
| `own_price_list` | Boolean | Eigene Preisliste |
| `own_branding` | Boolean | Eigene Marke |
| **Dokumente** |
| `master_certificate_url` | String? | Meisterbrief URL |
| `master_certificate_status` | DocumentStatus | Status |
| `business_registration_url` | String? | Gewerbeanmeldung |
| `status_determination_url` | String? | V027 Statusfeststellung |
| **Status** |
| `current_step` | Int | Aktueller Schritt (1-4) |
| `onboarding_status` | OnboardingStatus | Gesamtstatus |

---

## 5. Salons & Stühle

### Salon (salons)

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
| `phone` | String? | Telefon |
| `email` | String? | E-Mail |
| `opening_hours` | JSON? | Öffnungszeiten |
| `amenities` | String[] | Ausstattung |
| `images` | String[] | Bilder-URLs |
| `is_active` | Boolean | Aktiv |
| `is_verified` | Boolean | Verifiziert |

### Chair (chairs)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `salon_id` | UUID | FK → salons |
| `name` | String | Name (z.B. "Platz 1") |
| `daily_rate` | Decimal? | Tagespreis |
| `weekly_rate` | Decimal? | Wochenpreis |
| `monthly_rate` | Decimal? | Monatspreis |
| `amenities` | String[] | Ausstattung |
| `is_available` | Boolean | Verfügbar |

### ChairRental (chair_rentals)

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

---

## 6. Buchungen & Kunden

### Customer (customers)

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

### Booking (bookings)

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
| `status` | BookingStatus | Status |

---

## 7. Bewertungen

### Review (reviews)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `salon_id` | UUID? | FK → salons |
| `stylist_id` | UUID? | Stylist-ID |
| `reviewer_id` | UUID? | FK → users |
| `reviewer_name` | String? | Name (anonym) |
| `rating` | Int | 1-5 Sterne |
| `title` | String? | Titel |
| `comment` | Text? | Kommentar |
| `is_verified` | Boolean | Verifiziert |
| `is_public` | Boolean | Öffentlich |

---

## 8. Zahlungen

### Payment (payments)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `payer_id` | UUID | Zahler-ID |
| `receiver_id` | UUID? | Empfänger-ID |
| `rental_id` | UUID? | FK → chair_rentals |
| `type` | PaymentType | Zahlungstyp |
| `amount` | Decimal | Betrag |
| `currency` | String | Währung (EUR) |
| `status` | PaymentStatus | Status |
| `stripe_payment_intent_id` | String? | Stripe ID |

---

## 9. Messaging

### Conversation (conversations)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `type` | ConversationType | DIRECT, GROUP, SUPPORT |
| `subject` | String? | Betreff |

### Message (messages)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `conversation_id` | UUID | FK → conversations |
| `sender_id` | UUID | FK → users |
| `content` | Text | Nachrichteninhalt |
| `is_system_message` | Boolean | System-Nachricht |

---

## 10. Benachrichtigungen

### Notification (notifications)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | FK → users |
| `type` | NotificationType | Typ |
| `title` | String | Titel |
| `message` | Text | Nachricht |
| `link` | String? | Ziel-URL |
| `is_read` | Boolean | Gelesen |

---

## 11. E-Mail System

### EmailTemplate (email_templates)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `slug` | String | Template-Slug (unique) |
| `name` | String | Anzeigename |
| `subject` | String | Betreffzeile |
| `content` | JSON | Template-Inhalt |
| `category` | String | Kategorie |
| `is_active` | Boolean | Aktiv |
| `is_system` | Boolean | System-Template |

### EmailLog (email_logs)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `template_id` | UUID | FK → email_templates |
| `recipient_email` | String | Empfänger |
| `subject` | String | Betreff |
| `status` | EmailStatus | Status |
| `resend_id` | String? | Resend Message-ID |
| `sent_at` | DateTime? | Gesendet am |
| `delivered_at` | DateTime? | Zugestellt am |
| `opened_at` | DateTime? | Geöffnet am |
| `clicked_at` | DateTime? | Geklickt am |

---

## 12. Newsletter System (NEU)

### Newsletter (newsletters)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `subject` | String | Betreff |
| `preview_text` | String? | Vorschau-Text |
| `content_blocks` | JSON | Editor-Blöcke |
| `status` | NewsletterStatus | DRAFT, SCHEDULED, SENT |
| `segment` | String? | Empfänger-Segment |
| `scheduled_at` | DateTime? | Geplanter Versand |
| `sent_at` | DateTime? | Gesendet am |
| `sent_count` | Int | Anzahl gesendet |
| `open_count` | Int | Anzahl geöffnet |
| `click_count` | Int | Anzahl geklickt |
| `bounce_count` | Int | Anzahl Bounces |
| `created_by_id` | UUID | FK → users |

### Newsletter Block-Typen

| Typ | Beschreibung |
|-----|--------------|
| `TEXT` | Formatierter Text |
| `HEADING` | Überschrift (H1-H3) |
| `IMAGE` | Bild mit Link |
| `BUTTON` | CTA-Button |
| `DIVIDER` | Trennlinie |
| `SPACER` | Abstand |
| `TWO_COLUMN` | Zwei-Spalten Layout |
| `THREE_COLUMN` | Drei-Spalten Layout |
| `SOCIAL_LINKS` | Social Media Icons |
| `QUOTE` | Zitat |
| `LIST` | Liste |
| `VIDEO` | Video-Thumbnail |
| `PRODUCT_CARD` | Produktkarte |
| `COUPON` | Gutschein |
| `PROFILE` | Profilkarte |
| `UNSUBSCRIBE` | Abmelde-Link |

---

## 13. Referral System

### Referral (referrals)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `referrer_id` | UUID | Empfehler-ID |
| `referred_email` | String | Eingeladener |
| `code` | String | Referral-Code (unique) |
| `status` | ReferralStatus | Status |
| `total_revenue` | Decimal | Generierter Umsatz |
| `total_commission` | Decimal | Verdiente Provision |

### ReferralReward (referral_rewards)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | Empfänger-ID |
| `referral_id` | UUID | FK → referrals |
| `reward_type` | String | FREE_MONTH, CREDIT |
| `reward_value` | Decimal | Wert |
| `is_applied` | Boolean | Angewendet |

---

## 14. Subscription Plans

### SubscriptionPlan (subscription_plans)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `name` | String | Planname |
| `slug` | String | URL-Slug (unique) |
| `description` | Text? | Beschreibung |
| `plan_type` | PlanType | SALON_OWNER, STYLIST |
| `price_monthly` | Decimal | Monatspreis |
| `price_quarterly` | Decimal | Quartalspreis |
| `price_six_months` | Decimal | Halbjahrespreis (NEU) |
| `price_yearly` | Decimal | Jahrespreis |
| `stripe_price_monthly` | String? | Stripe Monatspreis-ID |
| `stripe_price_quarterly` | String? | Stripe Quartalspreis-ID |
| `stripe_price_six_months` | String? | Stripe Halbjahrespreis-ID (NEU) |
| `stripe_price_yearly` | String? | Stripe Jahrespreis-ID |
| `stripe_product_id` | String? | Stripe Produkt-ID |
| `features` | String[] | Features |
| `included_ai_credits_eur` | Decimal? | Inklusive AI-Credits (NEU) |
| `max_chairs` | Int? | Max. Stühle |
| `max_bookings` | Int? | Max. Buchungen/Monat |
| `is_active` | Boolean | Aktiv |
| `is_popular` | Boolean | Hervorgehoben |
| `trial_days` | Int | Testphase (Tage) |

---

## 15. Security & Logging

### SecurityLog (security_logs)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID? | FK → users |
| `user_email` | String | E-Mail |
| `event` | SecurityEventType | Event-Typ |
| `status` | SecurityEventStatus | Status |
| `ip_address` | String? | IP-Adresse |
| `user_agent` | Text? | User-Agent |
| `location` | String? | Standort |
| `device` | String? | Gerät |

### ApiKey (api_keys)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `name` | String | Name |
| `key` | String | Gehashter Key (unique) |
| `key_prefix` | String | Prefix |
| `permissions` | String[] | Berechtigungen |
| `is_active` | Boolean | Aktiv |
| `expires_at` | DateTime? | Ablaufdatum |

---

## 16. System-Konfiguration

### PlatformSettings (platform_settings)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | String | "default" |
| `company_name` | String | Firmenname |
| `support_email` | String | Support-E-Mail |
| `default_language` | String | Sprache (de) |
| `currency` | String | Währung (EUR) |
| `logo_url` | String? | Logo-URL |
| `primary_color` | String? | Primärfarbe |
| `use_demo_mode` | Boolean | Demo-Modus aktiv |
| `design_system_preset` | String? | Design-Preset |
| `design_tokens` | Json? | Design-Tokens |

---

## 17. CMS Tabellen

### ProductPageConfig (product_page_config)

Konfiguration der Produkt-Seite.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | String | "default" |
| `hero_type` | String | animated, image, video |
| `hero_layout` | String | split, centered |
| `hero_title` | Text | Haupttitel |
| `cta_primary_text` | String | CTA-Text |
| `show_trust_indicators` | Boolean | Trust anzeigen |

### ProductFeature (product_features)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `title` | String | Feature-Titel |
| `description` | Text | Beschreibung |
| `icon_name` | String | Icon (Lucide) |
| `category` | String | core, communication, etc. |
| `is_highlight` | Boolean | Hervorgehoben |

### BlogPost (blog_posts)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `title` | String | Titel |
| `slug` | String | URL-Slug (unique) |
| `excerpt` | Text? | Kurzfassung |
| `content` | Text | Inhalt (Markdown) |
| `featured_image` | String? | Bild-URL |
| `author_id` | UUID | FK → blog_authors |
| `status` | PostStatus | DRAFT, PUBLISHED |

### BlogAuthor (blog_authors)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `name` | String | Name |
| `slug` | String | URL-Slug (unique) |
| `bio` | Text? | Biografie |
| `avatar` | String? | Avatar-URL |
| `role` | String? | Rolle (z.B. "Gründer") |
| `user_id` | UUID? | FK → users |
| `is_active` | Boolean | Aktiv |

---

## 18. Homepage Builder (NEU)

### Homepage (homepages)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | FK → users |
| `name` | String | Projektname |
| `slug` | String | URL-Slug (unique) |
| `template` | String | Template-Name |
| `design_style` | String | minimalist, modern, etc. |
| `color_scheme` | String | light, dark |
| `pages` | String[] | Aktivierte Seiten |
| `content` | JSON? | Generierter Inhalt |
| `styles` | JSON? | Generierte Styles |
| `contact_data` | JSON? | Kontaktdaten |
| `status` | HomepageStatus | DRAFT, PUBLISHED |
| `published_at` | DateTime? | Veröffentlicht am |
| `custom_domain` | String? | Custom Domain |
| `subdomain` | String? | Subdomain |

### HomepagePrompt (homepage_prompts)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `name` | String | Name |
| `slug` | String | URL-Slug (unique) |
| `description` | Text? | Beschreibung |
| `prompt_template` | Text | Prompt-Template |
| `design_style` | String | Zugehöriger Stil |
| `category` | String | Kategorie |
| `preview_image` | String? | Vorschau-Bild |
| `is_active` | Boolean | Aktiv |
| `is_default` | Boolean | Standard-Prompt |
| `sort_order` | Int | Sortierung |

### HomepageDomain (homepage_domains)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `homepage_id` | UUID | FK → homepages |
| `domain` | String | Domain-Name (unique) |
| `vercel_id` | String? | Vercel Domain-ID |
| `status` | DomainStatus | pending, verified, error |
| `dns_records` | JSON? | DNS-Einträge |
| `ssl_status` | String? | SSL-Status |
| `verified_at` | DateTime? | Verifiziert am |

---

## 19. AI System (NEU)

### AIModel (ai_models)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `name` | String | Anzeigename |
| `provider` | String | openai, anthropic, google |
| `model_id` | String | OpenRouter Model-ID |
| `description` | Text? | Beschreibung |
| `category` | AIModelCategory | GENERAL, CREATIVE, etc. |
| `input_cost_per_1k` | Decimal | Kosten pro 1k Input-Tokens |
| `output_cost_per_1k` | Decimal | Kosten pro 1k Output-Tokens |
| `context_length` | Int? | Max. Kontext-Länge |
| `capabilities` | String[] | text, vision, etc. |
| `is_active` | Boolean | Aktiv |
| `is_default` | Boolean | Standard-Modell |
| `sort_order` | Int | Sortierung |

### AIUsageLog (ai_usage_logs)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | FK → users |
| `model_id` | UUID | FK → ai_models |
| `feature` | String | homepage, newsletter, etc. |
| `input_tokens` | Int | Input-Tokens |
| `output_tokens` | Int | Output-Tokens |
| `cost_eur` | Decimal | Kosten in EUR |
| `request_data` | JSON? | Request-Metadaten |
| `response_data` | JSON? | Response-Metadaten |

---

## 20. Enums

### UserRole
```prisma
enum UserRole {
  ADMIN
  SALON_OWNER
  STYLIST
}
```

### Salutation (NEU)
```prisma
enum Salutation {
  HERR
  FRAU
  DIVERS
  KEINE_ANGABE
}
```

### BillingInterval (NEU)
```prisma
enum BillingInterval {
  MONTHLY
  QUARTERLY
  SIX_MONTHS
  YEARLY
}
```

### HomepageStatus (NEU)
```prisma
enum HomepageStatus {
  DRAFT
  GENERATING
  PUBLISHED
  ARCHIVED
}
```

### DomainStatus (NEU)
```prisma
enum DomainStatus {
  PENDING
  VERIFIED
  ERROR
}
```

### AIModelCategory (NEU)
```prisma
enum AIModelCategory {
  GENERAL
  CREATIVE
  CODE
  REASONING
  VISION
  FAST
}
```

### NewsletterStatus
```prisma
enum NewsletterStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  FAILED
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

### EmailStatus
```prisma
enum EmailStatus {
  PENDING
  SENT
  DELIVERED
  OPENED
  CLICKED
  BOUNCED
  COMPLAINED
  FAILED
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

**Letzte Aktualisierung:** 19. Dezember 2025
