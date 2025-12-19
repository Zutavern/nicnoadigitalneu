# PRD: NICNOA v2.0 Features

## Product Requirements Document

**Version:** 2.0  
**Datum:** 19. Dezember 2025  
**Status:** Implementiert ✅

---

## 1. Übersicht

Dieses Dokument beschreibt die neuen Features der NICNOA Plattform v2.0, die im Dezember 2024 implementiert wurden.

### 1.1 Neue Features

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| Stripe Embedded Checkout | ✅ | Checkout direkt in der App |
| Stripe Link | ✅ | 1-Klick-Checkout Zahlungsmethode |
| Homepage Builder | ✅ | AI-gestützte Homepage-Erstellung |
| Custom Domains | ✅ | Vercel DNS Integration |
| Newsletter Builder | ✅ | Drag & Drop E-Mail-Editor |
| AI Model Management | ✅ | OpenRouter Integration |
| Google Business Integration | ✅ | Profil-Management (Mock) |

---

## 2. Stripe Embedded Checkout

### 2.1 Problemstellung

Bisheriger Checkout führte zu Stripe-hosted Seite → Medienbruch, niedrigere Conversion.

### 2.2 Lösung

Integrierter Checkout direkt in der NICNOA App mit:
- PaymentElement für Kartendaten
- LinkAuthenticationElement für Stripe Link
- AddressElement für Rechnungsadresse

### 2.3 Implementierung

```
/api/stripe/create-embedded-checkout  → Checkout Session
/api/stripe/create-checkout-intent    → Payment/Setup Intent
/api/stripe/checkout-status           → Status prüfen

/salon/checkout                       → Checkout-Seite
/salon/checkout/return                → Rückleitung nach Zahlung
/stylist/checkout                     → Checkout-Seite
/stylist/checkout/return              → Rückleitung nach Zahlung
```

### 2.4 Zahlungsmethoden

| Methode | Beschreibung |
|---------|--------------|
| Card | Kredit-/Debitkarten |
| Link | Stripe 1-Klick-Checkout (Netzwerk-weit) |
| SEPA Debit | Lastschrift für deutsche Kunden |

### 2.5 Trial-Handling

**Problem:** Bei Trial-Perioden wird ein `SetupIntent` statt `PaymentIntent` erstellt.

**Lösung:**
- API gibt `type: "payment"` oder `type: "setup"` zurück
- Frontend verwendet entsprechend `confirmPayment()` oder `confirmSetup()`

### 2.6 Akzeptanzkriterien

- [x] Checkout ohne Redirect zu Stripe
- [x] Stripe Link für wiederkehrende Kunden
- [x] SEPA Debit für deutsche Kunden
- [x] Trial-Perioden mit SetupIntent
- [x] Konfetti bei erfolgreicher Zahlung 🎉

---

## 3. Homepage Builder

### 3.1 Problemstellung

Stylisten/Salons benötigen professionelle Webpräsenz, haben aber kein Budget/Know-how für Webdesign.

### 3.2 Lösung

AI-gestützter Homepage-Builder mit:
- Wizard-geführter Erstellung
- AI-Generierung via OpenRouter
- Live-Editor für Anpassungen
- Custom Domain Support

### 3.3 Wizard-Schritte

1. **Projektname**: Name der Homepage
2. **Design-Stil**: minimalist, modern, classic, bold
3. **Seiten-Config**: Welche Seiten (Home, Services, Gallery, Contact, etc.)
4. **Kontaktdaten**: Adresse, Telefon, E-Mail, Social Media
5. **Review**: Zusammenfassung vor Generierung

### 3.4 AI-Generierung

```typescript
// Prompt-Struktur
{
  designStyle: "modern",
  colorScheme: "light",
  pages: ["home", "services", "gallery", "contact"],
  businessName: "Salon Schön",
  businessType: "hair_salon",
  contactData: { ... }
}
```

### 3.5 API-Endpunkte

```
/api/homepage                     → CRUD für Homepages
/api/homepage/[id]/generate       → AI-Generierung
/api/homepage/[id]/publish        → Veröffentlichen
/api/homepage-prompts             → Verfügbare Prompts
/api/admin/homepage-prompts       → Prompt-Verwaltung
```

### 3.6 Akzeptanzkriterien

- [x] Wizard mit 5 Schritten
- [x] AI-Generierung in < 30 Sekunden
- [x] Live-Preview während Bearbeitung
- [x] Custom Domain Support
- [x] Mobile-optimierte Ausgabe

---

## 4. Custom Domains

### 4.1 Problemstellung

Benutzer möchten eigene Domain (z.B. www.mein-salon.de) für ihre Homepage.

### 4.2 Lösung

Integration mit Vercel DNS API:
- Domain hinzufügen
- DNS-Records anzeigen
- Verifizierung prüfen
- SSL automatisch

### 4.3 Flow

1. Benutzer gibt Domain ein
2. System fügt Domain zu Vercel Project hinzu
3. Benutzer konfiguriert DNS bei Registrar
4. System verifiziert und aktiviert SSL

### 4.4 API-Endpunkte

```
/api/domains                      → CRUD für Domains
/api/domains/check                → Verfügbarkeit prüfen
/api/domains/purchase             → Domain kaufen (optional)
```

### 4.5 Akzeptanzkriterien

- [x] Domain hinzufügen/entfernen
- [x] DNS-Records anzeigen
- [x] Verifizierungsstatus
- [x] Automatisches SSL

---

## 5. Newsletter Builder

### 5.1 Problemstellung

Marketing-E-Mails manuell zu erstellen ist zeitaufwändig und inkonsistent.

### 5.2 Lösung

Drag & Drop Newsletter-Editor mit:
- 20+ Block-Typen
- Live-Preview (Desktop/Mobile)
- Personalisierungs-Tokens
- Scheduling
- Analytics

### 5.3 Block-Typen

| Kategorie | Blöcke |
|-----------|--------|
| Text | TEXT, HEADING, QUOTE, LIST |
| Media | IMAGE, VIDEO |
| Action | BUTTON, SOCIAL_LINKS |
| Layout | DIVIDER, SPACER, TWO_COLUMN, THREE_COLUMN |
| Commerce | PRODUCT_CARD, COUPON |
| User | PROFILE, UNSUBSCRIBE |

### 5.4 Personalisierung

| Token | Ersetzung |
|-------|-----------|
| `{{name}}` | Vollständiger Name |
| `{{firstName}}` | Vorname |
| `{{email}}` | E-Mail-Adresse |
| `{{anrede}}` | Personalisierte Anrede |
| `{{date}}` | Aktuelles Datum |

### 5.5 API-Endpunkte

```
/api/admin/newsletter             → CRUD für Newsletter
/api/admin/newsletter/[id]/send   → Versenden
/api/admin/newsletter/[id]/send-test → Test-E-Mail
/api/admin/newsletter/upload      → Bild-Upload
```

### 5.6 Akzeptanzkriterien

- [x] Drag & Drop Editor
- [x] 20+ Block-Typen
- [x] Live-Preview
- [x] Undo/Redo
- [x] Auto-Save
- [x] Test-E-Mail
- [x] Scheduling
- [x] Analytics (Opens, Clicks, Bounces)

---

## 6. AI Model Management

### 6.1 Problemstellung

AI-Features benötigen flexible Modell-Auswahl und Kostentracking.

### 6.2 Lösung

Admin-Dashboard für AI-Modelle mit:
- Modell-Katalog (OpenRouter)
- Kategorisierung
- Kostentracking
- Usage-basierte Abrechnung

### 6.3 Modell-Kategorien

| Kategorie | Verwendung |
|-----------|------------|
| GENERAL | Allgemeine Aufgaben |
| CREATIVE | Kreative Texte |
| CODE | Code-Generierung |
| REASONING | Komplexe Logik |
| VISION | Bildverarbeitung |
| FAST | Schnelle Antworten |

### 6.4 Kostenstruktur

```typescript
// Kosten pro 1000 Tokens
{
  "gpt-4o": { input: 0.005, output: 0.015 },
  "claude-3-5-sonnet": { input: 0.003, output: 0.015 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 }
}
```

### 6.5 Credit-System

- Inklusive Credits im Abo (z.B. €10/Monat)
- Pay-per-Use für Überschreitung
- Transparente Anzeige im Dashboard

### 6.6 API-Endpunkte

```
/api/admin/ai-models              → CRUD für Modelle
/api/user/usage                   → Verbrauch abrufen
```

### 6.7 Akzeptanzkriterien

- [x] Modell-Verwaltung (Admin)
- [x] Kategorisierung
- [x] Kostentracking
- [x] Usage-Dashboard
- [x] Inklusive Credits pro Plan

---

## 7. Google Business Integration

### 7.1 Problemstellung

Salons/Stylisten müssen Google Business Profile separat verwalten.

### 7.2 Lösung (Phase 1 - Mock)

Dashboard-Integration mit:
- Profil-Übersicht
- Posts erstellen
- Fotos verwalten
- Insights anzeigen
- Profil-Score

### 7.3 Features

| Feature | Status |
|---------|--------|
| Profil-Übersicht | ✅ (Mock) |
| Posts erstellen | ✅ (Mock) |
| Fotos verwalten | ✅ (Mock) |
| Insights | ✅ (Mock) |
| Profil-Score | ✅ (Mock) |

### 7.4 Profil-Score

Berechnung basierend auf:
- Vollständigkeit des Profils
- Anzahl Fotos
- Anzahl Bewertungen
- Regelmäßige Posts

### 7.5 Zukünftige Phasen

- Phase 2: Google Business API Integration
- Phase 3: Automatische Post-Generierung mit AI

---

## 8. Technische Änderungen

### 8.1 Next.js 16 Migration

- `middleware.ts` → `proxy.ts` (deprecated)
- Turbopack standardmäßig aktiviert
- Suspense-Boundaries für `useSearchParams()`

### 8.2 Stripe SDK Updates

```typescript
// Neue Zahlungsmethoden aktivieren
payment_method_types: ['card', 'link', 'sepa_debit']

// SetupIntent für Trial
const setupIntent = await stripe.setupIntents.create({
  customer: customerId,
  payment_method_types: ['card', 'link'],
})
```

### 8.3 Neue Dependencies

```json
{
  "@stripe/react-stripe-js": "^3.x",
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "canvas-confetti": "^1.x"
}
```

---

## 9. Metriken & Erfolg

### 9.1 Erwartete Verbesserungen

| Metrik | Vorher | Erwartet |
|--------|--------|----------|
| Checkout Conversion | ~65% | ~80% |
| Checkout Abbrüche | ~35% | ~15% |
| Newsletter Open Rate | - | ~40% |
| Homepage-Erstellungszeit | - | < 5 Min |

### 9.2 Tracking

- PostHog für User-Flows
- Stripe Dashboard für Payments
- Resend Dashboard für E-Mails

---

## 10. Dokumentation

### 10.1 Aktualisierte Docs

- [API.md](./API.md) - 140+ Endpunkte
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Systemarchitektur
- [DATABASE.md](./DATABASE.md) - 55+ Tabellen
- [README.md](../README.md) - Feature-Übersicht

### 10.2 Neue Docs

- [PRD-v2.0-Features.md](./PRD-v2.0-Features.md) - Dieses Dokument

---

**Erstellt von:** NICNOA Development Team  
**Letzte Aktualisierung:** 19. Dezember 2025

