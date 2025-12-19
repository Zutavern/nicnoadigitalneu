// Homepage Builder - Constants & Configurations

import type { 
  HomepageTemplate, 
  HomepagePageConfig, 
  HomepageDesignStyle,
  HomepagePage 
} from './types'

/**
 * Maximale Anzahl an Projekten pro Benutzer
 */
export const MAX_PROJECTS_PER_USER = 6

/**
 * Template-Konfigurationen
 */
export interface TemplateConfig {
  value: HomepageTemplate
  label: string
  description: string
  previewImage: string
  forRole: 'STYLIST' | 'SALON_OWNER' | 'BOTH'
  features: string[]
}

export const TEMPLATE_CONFIGS: Record<HomepageTemplate, TemplateConfig> = {
  STYLIST_CLASSIC: {
    value: 'STYLIST_CLASSIC',
    label: 'Klassisch',
    description: 'Zeitloses Design mit elegantem Portfolio-Fokus',
    previewImage: '/templates/stylist-classic.png',
    forRole: 'STYLIST',
    features: ['Portfolio-Galerie', 'Bewertungen', 'Terminbuchung']
  },
  STYLIST_MODERN: {
    value: 'STYLIST_MODERN',
    label: 'Modern',
    description: 'Dynamisches Design mit großen Bildern und Animationen',
    previewImage: '/templates/stylist-modern.png',
    forRole: 'STYLIST',
    features: ['Hero-Video', 'Scroll-Animationen', 'Social Feed']
  },
  STYLIST_MINIMAL: {
    value: 'STYLIST_MINIMAL',
    label: 'Minimalistisch',
    description: 'Reduziertes Design mit Fokus auf das Wesentliche',
    previewImage: '/templates/stylist-minimal.png',
    forRole: 'STYLIST',
    features: ['Clean Layout', 'Schnelle Ladezeiten', 'Mobile-First']
  },
  SALON_PROFESSIONAL: {
    value: 'SALON_PROFESSIONAL',
    label: 'Professionell',
    description: 'Seriöses Design für etablierte Salons',
    previewImage: '/templates/salon-professional.png',
    forRole: 'SALON_OWNER',
    features: ['Team-Übersicht', 'Service-Katalog', 'Preisliste']
  },
  SALON_ELEGANT: {
    value: 'SALON_ELEGANT',
    label: 'Elegant',
    description: 'Luxuriöses Design für gehobene Ansprüche',
    previewImage: '/templates/salon-elegant.png',
    forRole: 'SALON_OWNER',
    features: ['Premium-Optik', 'Parallax-Effekte', 'Goldakzente']
  },
  SALON_VIBRANT: {
    value: 'SALON_VIBRANT',
    label: 'Lebendig',
    description: 'Farbenfrohe und energetische Präsentation',
    previewImage: '/templates/salon-vibrant.png',
    forRole: 'SALON_OWNER',
    features: ['Lebendige Farben', 'Dynamische Layouts', 'Social Integration']
  }
}

/**
 * Seiten-Konfigurationen
 */
export interface PageConfigOption {
  value: HomepagePageConfig
  label: string
  description: string
  pages: PageDefinition[]
  forRole: 'STYLIST' | 'SALON_OWNER' | 'BOTH'
}

export interface PageDefinition {
  slug: string
  title: string
  description: string
  required: boolean
}

// Seiten-Definitionen für Stuhlmieter
const STYLIST_PAGES: Record<string, PageDefinition> = {
  home: { slug: 'home', title: 'Startseite', description: 'Hero, Über mich Teaser, Highlights', required: true },
  about: { slug: 'ueber-mich', title: 'Über mich', description: 'Ausbildung, Erfahrung, Philosophie', required: false },
  portfolio: { slug: 'portfolio', title: 'Portfolio', description: 'Arbeiten & Vorher/Nachher Bilder', required: false },
  services: { slug: 'leistungen', title: 'Leistungen & Preise', description: 'Services mit Preisen', required: false },
  gallery: { slug: 'galerie', title: 'Galerie', description: 'Foto-Galerie', required: false },
  contact: { slug: 'kontakt', title: 'Kontakt', description: 'Kontaktformular & Infos', required: false },
  legal: { slug: 'impressum', title: 'Impressum & Datenschutz', description: 'Rechtliche Seiten', required: true }
}

// Seiten-Definitionen für Salons
const SALON_PAGES: Record<string, PageDefinition> = {
  home: { slug: 'home', title: 'Startseite', description: 'Hero, Salon-Präsentation, Highlights', required: true },
  about: { slug: 'ueber-uns', title: 'Über uns', description: 'Geschichte, Team-Übersicht, Philosophie', required: false },
  team: { slug: 'team', title: 'Unser Team', description: 'Stylisten mit Profilen', required: false },
  services: { slug: 'leistungen', title: 'Leistungen', description: 'Alle Services des Salons', required: false },
  prices: { slug: 'preise', title: 'Preisliste', description: 'Vollständige Preisliste', required: false },
  gallery: { slug: 'galerie', title: 'Galerie', description: 'Salon & Arbeiten', required: false },
  contact: { slug: 'kontakt', title: 'Kontakt', description: 'Kontaktformular, Öffnungszeiten, Anfahrt', required: false },
  legal: { slug: 'impressum', title: 'Impressum & Datenschutz', description: 'Rechtliche Seiten', required: true }
}

export const PAGE_CONFIG_OPTIONS: PageConfigOption[] = [
  // Für Stuhlmieter
  {
    value: 'ONE_PAGER',
    label: 'One-Pager',
    description: 'Alles auf einer Seite – perfekt für den schnellen Start',
    forRole: 'STYLIST',
    pages: [
      { ...STYLIST_PAGES.home, description: 'Komplette Präsentation auf einer Seite' }
    ]
  },
  {
    value: 'BASIC',
    label: 'Basis (3 Seiten)',
    description: 'Startseite, Kontakt und rechtliche Infos',
    forRole: 'STYLIST',
    pages: [STYLIST_PAGES.home, STYLIST_PAGES.contact, STYLIST_PAGES.legal]
  },
  {
    value: 'STANDARD',
    label: 'Standard (5 Seiten)',
    description: 'Die wichtigsten Seiten für eine professionelle Präsenz',
    forRole: 'STYLIST',
    pages: [STYLIST_PAGES.home, STYLIST_PAGES.about, STYLIST_PAGES.services, STYLIST_PAGES.contact, STYLIST_PAGES.legal]
  },
  {
    value: 'FULL',
    label: 'Komplett (7 Seiten)',
    description: 'Vollständige Website mit allen Funktionen',
    forRole: 'STYLIST',
    pages: [STYLIST_PAGES.home, STYLIST_PAGES.about, STYLIST_PAGES.portfolio, STYLIST_PAGES.services, STYLIST_PAGES.gallery, STYLIST_PAGES.contact, STYLIST_PAGES.legal]
  },
  
  // Für Salons
  {
    value: 'ONE_PAGER',
    label: 'One-Pager',
    description: 'Alles auf einer Seite – ideal für kleinere Salons',
    forRole: 'SALON_OWNER',
    pages: [
      { ...SALON_PAGES.home, description: 'Komplette Salon-Präsentation auf einer Seite' }
    ]
  },
  {
    value: 'BASIC',
    label: 'Basis (3 Seiten)',
    description: 'Startseite, Kontakt und rechtliche Infos',
    forRole: 'SALON_OWNER',
    pages: [SALON_PAGES.home, SALON_PAGES.contact, SALON_PAGES.legal]
  },
  {
    value: 'STANDARD',
    label: 'Standard (6 Seiten)',
    description: 'Professionelle Präsenz mit Team und Services',
    forRole: 'SALON_OWNER',
    pages: [SALON_PAGES.home, SALON_PAGES.team, SALON_PAGES.services, SALON_PAGES.prices, SALON_PAGES.contact, SALON_PAGES.legal]
  },
  {
    value: 'FULL',
    label: 'Premium (8 Seiten)',
    description: 'Komplette Website für etablierte Salons',
    forRole: 'SALON_OWNER',
    pages: [SALON_PAGES.home, SALON_PAGES.about, SALON_PAGES.team, SALON_PAGES.services, SALON_PAGES.prices, SALON_PAGES.gallery, SALON_PAGES.contact, SALON_PAGES.legal]
  }
]

/**
 * Design-Style Konfigurationen
 */
export interface DesignStyleConfig {
  value: HomepageDesignStyle
  label: string
  description: string
  previewImage: string
  cssVariables: {
    borderRadius: string
    fontHeading: string
    fontBody: string
    shadow: string
  }
}

export const DESIGN_STYLE_CONFIGS: Record<HomepageDesignStyle, DesignStyleConfig> = {
  MODERN: {
    value: 'MODERN',
    label: 'Modern',
    description: 'Klare Linien, mutige Farben, viel Weißraum',
    previewImage: '/design-styles/modern.png',
    cssVariables: {
      borderRadius: '12px',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      shadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
    }
  },
  CLASSIC: {
    value: 'CLASSIC',
    label: 'Klassisch',
    description: 'Elegant, zeitlos, professionell',
    previewImage: '/design-styles/classic.png',
    cssVariables: {
      borderRadius: '4px',
      fontHeading: 'Playfair Display',
      fontBody: 'Lora',
      shadow: '0 4px 20px rgba(0,0,0,0.08)'
    }
  },
  MINIMALIST: {
    value: 'MINIMALIST',
    label: 'Minimalistisch',
    description: 'Reduziert, fokussiert, clean',
    previewImage: '/design-styles/minimalist.png',
    cssVariables: {
      borderRadius: '0px',
      fontHeading: 'Helvetica Neue',
      fontBody: 'Helvetica Neue',
      shadow: 'none'
    }
  },
  CREATIVE: {
    value: 'CREATIVE',
    label: 'Kreativ',
    description: 'Einzigartig, künstlerisch, auffällig',
    previewImage: '/design-styles/creative.png',
    cssVariables: {
      borderRadius: '24px',
      fontHeading: 'Space Grotesk',
      fontBody: 'DM Sans',
      shadow: '0 20px 60px -20px rgba(0,0,0,0.2)'
    }
  }
}

/**
 * Default-Kontaktdaten (für Mockdaten)
 */
export const DEFAULT_CONTACT_DATA = {
  name: 'Max Mustermann',
  email: 'kontakt@beispiel.de',
  phone: '+49 123 456789',
  street: 'Musterstraße 1',
  city: 'Berlin',
  zipCode: '10115',
  country: 'Deutschland',
  openingHours: {
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '20:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '09:00', close: '14:00' },
    sunday: { open: '00:00', close: '00:00', closed: true }
  }
}

/**
 * Wizard-Schritte
 */
export const WIZARD_STEPS = [
  { id: 'project-name', label: 'Projekt', description: 'Name & URL' },
  { id: 'contact-data', label: 'Kontakt', description: 'Deine Daten' },
  { id: 'page-config', label: 'Seiten', description: 'Umfang wählen' },
  { id: 'design-style', label: 'Design', description: 'Style wählen' },
  { id: 'review', label: 'Fertig', description: 'Überprüfen & Starten' }
] as const

/**
 * Status-Konfigurationen
 */
export const STATUS_CONFIGS = {
  DRAFT: { label: 'Entwurf', color: 'secondary', icon: 'FileEdit' },
  GENERATING: { label: 'Wird generiert...', color: 'warning', icon: 'Loader2' },
  READY: { label: 'Bereit', color: 'success', icon: 'CheckCircle' },
  PUBLISHED: { label: 'Veröffentlicht', color: 'primary', icon: 'Globe' },
  ERROR: { label: 'Fehler', color: 'destructive', icon: 'AlertCircle' }
} as const

/**
 * Generiert eine Slug aus dem Projektnamen
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
}

/**
 * Generiert die initialen Seiten basierend auf der Konfiguration
 */
export function generateInitialPages(
  pageConfig: HomepagePageConfig,
  forRole: 'STYLIST' | 'SALON_OWNER'
): HomepagePage[] {
  const config = PAGE_CONFIG_OPTIONS.find(
    c => c.value === pageConfig && c.forRole === forRole
  )
  
  if (!config) return []
  
  return config.pages.map((page, index) => ({
    id: `page-${page.slug}`,
    slug: page.slug,
    title: page.title,
    description: page.description,
    isGenerated: false,
    isEditing: false,
    sortOrder: index
  }))
}



