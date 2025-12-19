// V0 Prompt Builder für Homepage-Generierung

import type { 
  HomepageTemplate, 
  HomepageDesignStyle, 
  HomepageContactData,
  HomepagePage
} from './types'
import { TEMPLATE_CONFIGS, DESIGN_STYLE_CONFIGS } from './constants'

interface PromptContext {
  templateType: HomepageTemplate
  designStyle: HomepageDesignStyle
  contactData: HomepageContactData
  pages: HomepagePage[]
  brandingColor: string
  logoUrl?: string
  forRole: 'STYLIST' | 'SALON_OWNER'
}

/**
 * Generiert den V0-Prompt für eine komplette Homepage
 */
export function buildFullHomepagePrompt(context: PromptContext): string {
  const templateConfig = TEMPLATE_CONFIGS[context.templateType]
  const designConfig = DESIGN_STYLE_CONFIGS[context.designStyle]
  
  const businessType = context.forRole === 'STYLIST' ? 'Friseur/Stylist' : 'Friseursalon'
  const businessName = context.forRole === 'SALON_OWNER' 
    ? context.contactData.salonName || context.contactData.name
    : context.contactData.name

  return `
Erstelle eine professionelle ${businessType}-Website mit folgenden Spezifikationen:

## Business-Informationen
- **Name:** ${businessName}
- **Typ:** ${businessType}
- **Adresse:** ${context.contactData.street}, ${context.contactData.zipCode} ${context.contactData.city}
- **Telefon:** ${context.contactData.phone}
- **E-Mail:** ${context.contactData.email}
${context.contactData.website ? `- **Website:** ${context.contactData.website}` : ''}
${context.contactData.instagram ? `- **Instagram:** @${context.contactData.instagram}` : ''}

## Design-Vorgaben
- **Template-Stil:** ${templateConfig.label} - ${templateConfig.description}
- **Design-Style:** ${designConfig.label} - ${designConfig.description}
- **Primärfarbe:** ${context.brandingColor}
- **Schriftart Überschriften:** ${designConfig.cssVariables.fontHeading}
- **Schriftart Text:** ${designConfig.cssVariables.fontBody}
- **Border-Radius:** ${designConfig.cssVariables.borderRadius}
${context.logoUrl ? `- **Logo-URL:** ${context.logoUrl}` : ''}

## Zu generierende Seiten
${context.pages.map((page, i) => `${i + 1}. **${page.title}** (/${page.slug}) - ${page.description || 'Standard-Inhalt'}`).join('\n')}

## Technische Anforderungen
- Next.js 14+ App Router
- TypeScript
- Tailwind CSS für Styling
- Vollständig responsive (Mobile-First)
- SEO-optimiert mit Meta-Tags
- Barrierefreie Gestaltung (WCAG 2.1)
- Deutsche Sprache für alle Texte
- Schnelle Ladezeiten (optimierte Bilder)
- Rechtlich konforme Impressum- und Datenschutzseiten für Deutschland

## Wichtige Elemente
${context.forRole === 'STYLIST' ? `
- Hero-Section mit professionellem Bild
- Über-mich-Bereich mit Erfahrung und Spezialisierungen
- Portfolio/Galerie mit Vorher-Nachher-Bildern
- Preisliste mit Services
- Kontaktformular
- Social Media Integration
` : `
- Hero-Section mit Salon-Ambiente
- Team-Vorstellung mit einzelnen Stylisten
- Service-Katalog mit Preisen
- Öffnungszeiten-Anzeige
- Anfahrtskarte/Google Maps
- Online-Terminbuchung (Platzhalter)
- Kundenbewertungen-Bereich
`}

## Öffnungszeiten
${context.contactData.openingHours ? formatOpeningHours(context.contactData.openingHours) : 'Montag - Samstag: Nach Vereinbarung'}

Generiere vollständigen, produktionsbereiten Code für alle Seiten. Nutze professionelle Platzhalterbilder von Unsplash für Friseur-/Salon-Bilder.
`.trim()
}

/**
 * Generiert den V0-Prompt für eine einzelne Seite
 */
export function buildSinglePagePrompt(
  context: PromptContext, 
  page: HomepagePage,
  customInstructions?: string
): string {
  const designConfig = DESIGN_STYLE_CONFIGS[context.designStyle]
  const businessName = context.forRole === 'SALON_OWNER' 
    ? context.contactData.salonName || context.contactData.name
    : context.contactData.name

  const pageSpecificContent = getPageSpecificContent(page.slug, context)

  return `
Regeneriere die Seite "${page.title}" für die ${context.forRole === 'STYLIST' ? 'Stylist' : 'Salon'}-Website "${businessName}":

## Seiten-Details
- **Seite:** ${page.title}
- **URL:** /${page.slug}
- **Beschreibung:** ${page.description || 'Standard-Inhalt'}

## Design-Kontext
- **Primärfarbe:** ${context.brandingColor}
- **Design-Style:** ${DESIGN_STYLE_CONFIGS[context.designStyle].label}
- **Schriftarten:** ${designConfig.cssVariables.fontHeading} / ${designConfig.cssVariables.fontBody}

## Seiten-spezifischer Inhalt
${pageSpecificContent}

${customInstructions ? `## Zusätzliche Anweisungen\n${customInstructions}` : ''}

## Technische Anforderungen
- Next.js 14+ App Router Komponente
- TypeScript
- Tailwind CSS
- Responsive Design
- Deutsche Sprache

Generiere nur den Code für diese eine Seite, kompatibel mit dem Rest der Website.
`.trim()
}

/**
 * Liefert seiten-spezifischen Inhalt für den Prompt
 */
function getPageSpecificContent(slug: string, context: PromptContext): string {
  const { contactData, forRole } = context
  
  switch (slug) {
    case 'home':
      return `
- Hero-Section mit starkem Bild und Call-to-Action
- Kurze Vorstellung (2-3 Sätze)
- Highlights/Features (3-4 Punkte)
- Testimonial-Teaser
- CTA zur Terminbuchung`

    case 'ueber-mich':
    case 'ueber-uns':
      return `
- Persönliche/Unternehmens-Geschichte
- Qualifikationen und Erfahrung
- Philosophie und Werte
- Professionelles Bild/Team-Bild
${forRole === 'STYLIST' ? '- Spezialisierungen und Zertifikate' : '- Meilensteine des Salons'}`

    case 'team':
      return `
- Team-Übersicht als Karten-Grid
- Pro Stylist: Foto, Name, Spezialisierung
- Klick führt zu Detail oder Modal
- Möglichkeit zur Terminbuchung pro Stylist`

    case 'portfolio':
      return `
- Masonry-Grid mit Arbeiten
- Vorher/Nachher-Slider-Funktion
- Kategorie-Filter (Schnitt, Farbe, Styling)
- Lightbox für Vollansicht`

    case 'leistungen':
    case 'services':
      return `
- Service-Kategorien (Schneiden, Färben, Styling, Pflege)
- Pro Service: Beschreibung, Dauer, Preis
- Visuelle Icons oder Bilder
- CTA zur Buchung`

    case 'preise':
      return `
- Übersichtliche Preisliste nach Kategorien
- Damen/Herren/Kinder Unterscheidung
- Zusatzleistungen
- Hinweis auf Preise als Richtwerte`

    case 'galerie':
      return `
- Bildergalerie mit Salon-Ambiente
- Arbeitsbeispiele
- Event-Fotos (falls vorhanden)
- Lightbox-Funktion`

    case 'kontakt':
      return `
- Kontaktformular (Name, E-Mail, Telefon, Nachricht)
- Adresse: ${contactData.street}, ${contactData.zipCode} ${contactData.city}
- Telefon: ${contactData.phone}
- E-Mail: ${contactData.email}
- Anfahrtsbeschreibung/Karte-Platzhalter
${contactData.openingHours ? `- Öffnungszeiten anzeigen` : ''}`

    case 'impressum':
      return `
- Vollständiges Impressum nach deutschem Recht
- Datenschutzerklärung (DSGVO-konform)
- Verantwortlicher: ${contactData.name}
- Adresse: ${contactData.street}, ${contactData.zipCode} ${contactData.city}
- E-Mail: ${contactData.email}
- Haftungsausschluss
- Urheberrechtshinweise`

    default:
      return '- Standard-Seiteninhalt basierend auf dem Seitentitel'
  }
}

/**
 * Formatiert Öffnungszeiten für den Prompt
 */
function formatOpeningHours(hours: Record<string, { open: string; close: string; closed?: boolean }>): string {
  const days: Record<string, string> = {
    monday: 'Montag',
    tuesday: 'Dienstag',
    wednesday: 'Mittwoch',
    thursday: 'Donnerstag',
    friday: 'Freitag',
    saturday: 'Samstag',
    sunday: 'Sonntag'
  }

  return Object.entries(days)
    .map(([key, label]) => {
      const dayHours = hours[key]
      if (!dayHours || dayHours.closed) {
        return `- ${label}: Geschlossen`
      }
      return `- ${label}: ${dayHours.open} - ${dayHours.close} Uhr`
    })
    .join('\n')
}



