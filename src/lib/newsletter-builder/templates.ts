// Newsletter Builder - Professionelle Vorlagen

import type { NewsletterBlock } from './types'
import { generateBlockId } from './types'

export interface NewsletterTemplate {
  id: string
  name: string
  description: string
  category: 'marketing' | 'transactional' | 'engagement' | 'announcement'
  thumbnail?: string
  blocks: NewsletterBlock[]
}

/**
 * Willkommens-Newsletter Template
 * Für neue Benutzer, Stylisten, etc.
 */
const welcomeTemplate: NewsletterTemplate = {
  id: 'welcome',
  name: 'Willkommen',
  description: 'Begrüße neue Nutzer mit einem freundlichen Willkommens-Newsletter',
  category: 'engagement',
  blocks: [
    {
      id: generateBlockId(),
      type: 'HEADING',
      sortOrder: 0,
      text: 'Willkommen bei NICNOA!',
      level: 1,
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 1,
      spacerSize: 'SMALL',
    },
    {
      id: generateBlockId(),
      type: 'PARAGRAPH',
      sortOrder: 2,
      content: 'Wir freuen uns riesig, dass du dabei bist! Bei NICNOA findest du alles, was du für deinen Erfolg brauchst. Hier sind ein paar Tipps für den perfekten Start:',
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 3,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'THREE_COLUMN',
      sortOrder: 4,
      columnWidths: [33, 34, 33],
      childBlocks: [
        {
          id: generateBlockId(),
          type: 'PROFILE',
          sortOrder: 0,
          columnIndex: 0,
          profileName: 'Profil erstellen',
          profileRole: 'Schritt 1',
          profileDescription: 'Vervollständige dein Profil für mehr Sichtbarkeit',
        },
        {
          id: generateBlockId(),
          type: 'PROFILE',
          sortOrder: 0,
          columnIndex: 1,
          profileName: 'Preisliste anlegen',
          profileRole: 'Schritt 2',
          profileDescription: 'Erstelle deine professionelle Preisliste',
        },
        {
          id: generateBlockId(),
          type: 'PROFILE',
          sortOrder: 0,
          columnIndex: 2,
          profileName: 'Kunden einladen',
          profileRole: 'Schritt 3',
          profileDescription: 'Teile deinen Link mit deinen Kunden',
        },
      ],
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 5,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'BUTTON',
      sortOrder: 6,
      buttonText: 'Jetzt loslegen',
      href: 'https://nicnoa.online/dashboard',
      buttonVariant: 'primary',
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 7,
      spacerSize: 'LARGE',
    },
    {
      id: generateBlockId(),
      type: 'DIVIDER',
      sortOrder: 8,
      dividerStyle: 'solid',
    },
    {
      id: generateBlockId(),
      type: 'PARAGRAPH',
      sortOrder: 9,
      content: 'Bei Fragen sind wir jederzeit für dich da. Antworte einfach auf diese E-Mail oder schreibe uns an support@nicnoa.online.',
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SOCIAL_LINKS',
      sortOrder: 10,
      socialLinks: [
        { platform: 'instagram', url: 'https://instagram.com/nicnoa' },
        { platform: 'facebook', url: 'https://facebook.com/nicnoa' },
      ],
      socialIconSize: 'medium',
      align: 'center',
    },
  ],
}

/**
 * Produkt-Ankündigung Template
 * Für neue Features, Produkte oder Updates
 */
const productAnnouncementTemplate: NewsletterTemplate = {
  id: 'product-announcement',
  name: 'Produkt-Ankündigung',
  description: 'Stelle neue Features oder Produkte professionell vor',
  category: 'announcement',
  blocks: [
    {
      id: generateBlockId(),
      type: 'IMAGE',
      sortOrder: 0,
      src: '',
      alt: 'Produktbild',
      imageWidth: 100,
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 1,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'HEADING',
      sortOrder: 2,
      text: 'NEU: Das beste Update aller Zeiten',
      level: 1,
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'PARAGRAPH',
      sortOrder: 3,
      content: 'Wir haben hart gearbeitet und präsentieren dir stolz unser neuestes Update. Entdecke die neuen Funktionen, die deinen Workflow revolutionieren werden.',
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 4,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'HEADING',
      sortOrder: 5,
      text: 'Das erwartet dich:',
      level: 2,
      align: 'left',
    },
    {
      id: generateBlockId(),
      type: 'LIST',
      sortOrder: 6,
      listItems: [
        'Neues Dashboard mit besserer Übersicht',
        'Schnellere Ladezeiten für alle Seiten',
        'Verbesserte mobile Ansicht',
        'Neue Integrationen mit beliebten Tools',
      ],
      listStyle: 'check',
      align: 'left',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 7,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'QUOTE',
      sortOrder: 8,
      quoteText: 'Dieses Update hat meinen Workflow komplett verändert. So einfach war es noch nie!',
      quoteAuthor: 'Sarah M.',
      quoteRole: 'Beta-Testerin',
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 9,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'BUTTON',
      sortOrder: 10,
      buttonText: 'Jetzt entdecken',
      href: 'https://nicnoa.online',
      buttonVariant: 'primary',
      align: 'center',
    },
  ],
}

/**
 * Sale/Promotion Template
 * Für Rabattaktionen und Sonderangebote
 */
const salePromotionTemplate: NewsletterTemplate = {
  id: 'sale-promotion',
  name: 'Sale & Promotion',
  description: 'Perfekt für Rabattaktionen und zeitlich begrenzte Angebote',
  category: 'marketing',
  blocks: [
    {
      id: generateBlockId(),
      type: 'HEADING',
      sortOrder: 0,
      text: '🎉 Großer SALE',
      level: 1,
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'HEADING',
      sortOrder: 1,
      text: 'Bis zu 30% Rabatt auf alles!',
      level: 2,
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 2,
      spacerSize: 'SMALL',
    },
    {
      id: generateBlockId(),
      type: 'PARAGRAPH',
      sortOrder: 3,
      content: 'Nur für kurze Zeit: Sichere dir jetzt exklusive Rabatte auf alle Produkte und Services. Nutze deinen persönlichen Gutscheincode:',
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 4,
      spacerSize: 'SMALL',
    },
    {
      id: generateBlockId(),
      type: 'COUPON',
      sortOrder: 5,
      couponCode: 'SALE30',
      couponDescription: '30% Rabatt auf deine nächste Bestellung',
      couponExpiry: '31.12.2025',
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 6,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'HEADING',
      sortOrder: 7,
      text: 'Unsere Top-Angebote',
      level: 2,
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'TWO_COLUMN',
      sortOrder: 8,
      columnWidths: [50, 50],
      childBlocks: [
        {
          id: generateBlockId(),
          type: 'PRODUCT_CARD',
          sortOrder: 0,
          columnIndex: 0,
          productName: 'Premium Paket',
          productDescription: 'Alle Features inklusive',
          productPrice: '€ 19,99',
          productButtonText: 'Zum Angebot',
          productButtonUrl: 'https://nicnoa.online',
        },
        {
          id: generateBlockId(),
          type: 'PRODUCT_CARD',
          sortOrder: 0,
          columnIndex: 1,
          productName: 'Starter Paket',
          productDescription: 'Perfekt zum Einstieg',
          productPrice: '€ 9,99',
          productButtonText: 'Zum Angebot',
          productButtonUrl: 'https://nicnoa.online',
        },
      ],
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 9,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'BUTTON',
      sortOrder: 10,
      buttonText: 'Alle Angebote ansehen',
      href: 'https://nicnoa.online/angebote',
      buttonVariant: 'primary',
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 11,
      spacerSize: 'SMALL',
    },
    {
      id: generateBlockId(),
      type: 'PARAGRAPH',
      sortOrder: 12,
      content: 'Der Rabatt gilt nur bis zum Ende des Monats. Nicht mit anderen Aktionen kombinierbar.',
      align: 'center',
    },
  ],
}

/**
 * Monatlicher Update/Newsletter Template
 * Für regelmäßige News und Updates
 */
const monthlyUpdateTemplate: NewsletterTemplate = {
  id: 'monthly-update',
  name: 'Monatlicher Update',
  description: 'Regelmäßige News und Updates für deine Community',
  category: 'engagement',
  blocks: [
    {
      id: generateBlockId(),
      type: 'HEADING',
      sortOrder: 0,
      text: 'Dein monatliches Update 📬',
      level: 1,
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'PARAGRAPH',
      sortOrder: 1,
      content: 'Hier sind die wichtigsten Neuigkeiten und Highlights des letzten Monats. Wir haben einiges für dich vorbereitet!',
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'DIVIDER',
      sortOrder: 2,
      dividerStyle: 'solid',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 3,
      spacerSize: 'SMALL',
    },
    {
      id: generateBlockId(),
      type: 'TWO_COLUMN',
      sortOrder: 4,
      columnWidths: [40, 60],
      childBlocks: [
        {
          id: generateBlockId(),
          type: 'IMAGE',
          sortOrder: 0,
          columnIndex: 0,
          src: '',
          alt: 'News Bild 1',
          imageWidth: 100,
        },
        {
          id: generateBlockId(),
          type: 'HEADING',
          sortOrder: 0,
          columnIndex: 1,
          text: 'Neues Feature: Dashboard 2.0',
          level: 3,
        },
        {
          id: generateBlockId(),
          type: 'PARAGRAPH',
          sortOrder: 1,
          columnIndex: 1,
          content: 'Das neue Dashboard bietet dir eine bessere Übersicht über alle wichtigen Kennzahlen. Entdecke die neuen Möglichkeiten!',
        },
      ],
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 5,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'TWO_COLUMN',
      sortOrder: 6,
      columnWidths: [60, 40],
      childBlocks: [
        {
          id: generateBlockId(),
          type: 'HEADING',
          sortOrder: 0,
          columnIndex: 0,
          text: 'Erfolgsgeschichte des Monats',
          level: 3,
        },
        {
          id: generateBlockId(),
          type: 'PARAGRAPH',
          sortOrder: 1,
          columnIndex: 0,
          content: 'Wie Anna ihren Umsatz mit NICNOA verdreifacht hat. Lies ihre inspirierende Geschichte.',
        },
        {
          id: generateBlockId(),
          type: 'IMAGE',
          sortOrder: 0,
          columnIndex: 1,
          src: '',
          alt: 'News Bild 2',
          imageWidth: 100,
        },
      ],
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 7,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'HEADING',
      sortOrder: 8,
      text: 'Diesen Monat erreicht 🎯',
      level: 2,
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'THREE_COLUMN',
      sortOrder: 9,
      columnWidths: [33, 34, 33],
      childBlocks: [
        {
          id: generateBlockId(),
          type: 'HEADING',
          sortOrder: 0,
          columnIndex: 0,
          text: '1.250+',
          level: 2,
          align: 'center',
        },
        {
          id: generateBlockId(),
          type: 'PARAGRAPH',
          sortOrder: 1,
          columnIndex: 0,
          content: 'Neue Nutzer',
          align: 'center',
        },
        {
          id: generateBlockId(),
          type: 'HEADING',
          sortOrder: 0,
          columnIndex: 1,
          text: '98%',
          level: 2,
          align: 'center',
        },
        {
          id: generateBlockId(),
          type: 'PARAGRAPH',
          sortOrder: 1,
          columnIndex: 1,
          content: 'Zufriedenheit',
          align: 'center',
        },
        {
          id: generateBlockId(),
          type: 'HEADING',
          sortOrder: 0,
          columnIndex: 2,
          text: '15',
          level: 2,
          align: 'center',
        },
        {
          id: generateBlockId(),
          type: 'PARAGRAPH',
          sortOrder: 1,
          columnIndex: 2,
          content: 'Neue Features',
          align: 'center',
        },
      ],
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 10,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'BUTTON',
      sortOrder: 11,
      buttonText: 'Alle News lesen',
      href: 'https://nicnoa.online/blog',
      buttonVariant: 'primary',
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 12,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'SOCIAL_LINKS',
      sortOrder: 13,
      socialLinks: [
        { platform: 'instagram', url: 'https://instagram.com/nicnoa' },
        { platform: 'facebook', url: 'https://facebook.com/nicnoa' },
        { platform: 'linkedin', url: 'https://linkedin.com/company/nicnoa' },
      ],
      socialIconSize: 'medium',
      align: 'center',
    },
  ],
}

/**
 * Event-Einladung Template
 * Für Webinare, Events und Veranstaltungen
 */
const eventInvitationTemplate: NewsletterTemplate = {
  id: 'event-invitation',
  name: 'Event-Einladung',
  description: 'Einladungen für Webinare, Events und Veranstaltungen',
  category: 'marketing',
  blocks: [
    {
      id: generateBlockId(),
      type: 'HEADING',
      sortOrder: 0,
      text: 'Du bist eingeladen! 🎤',
      level: 1,
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'IMAGE',
      sortOrder: 1,
      src: '',
      alt: 'Event Banner',
      imageWidth: 100,
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 2,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'HEADING',
      sortOrder: 3,
      text: 'Webinar: Erfolgreich mit NICNOA',
      level: 2,
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'PARAGRAPH',
      sortOrder: 4,
      content: 'Lerne in 60 Minuten, wie du das Maximum aus NICNOA herausholst. Unsere Experten zeigen dir die besten Tipps und Tricks.',
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 5,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'LIST',
      sortOrder: 6,
      listItems: [
        '📅 Datum: 15. Januar 2025',
        '🕐 Zeit: 18:00 - 19:00 Uhr',
        '📍 Ort: Online via Zoom',
        '💰 Kosten: Kostenlos',
      ],
      listStyle: 'bullet',
      align: 'left',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 7,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'HEADING',
      sortOrder: 8,
      text: 'Deine Speaker',
      level: 2,
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'TWO_COLUMN',
      sortOrder: 9,
      columnWidths: [50, 50],
      childBlocks: [
        {
          id: generateBlockId(),
          type: 'PROFILE',
          sortOrder: 0,
          columnIndex: 0,
          profileName: 'Max Mustermann',
          profileRole: 'CEO & Gründer',
          profileDescription: 'Experte für digitales Marketing mit 10+ Jahren Erfahrung',
        },
        {
          id: generateBlockId(),
          type: 'PROFILE',
          sortOrder: 0,
          columnIndex: 1,
          profileName: 'Anna Schmidt',
          profileRole: 'Head of Product',
          profileDescription: 'Produktspezialistin und UX-Expertin',
        },
      ],
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 10,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'HEADING',
      sortOrder: 11,
      text: 'Das erwartet dich:',
      level: 3,
      align: 'left',
    },
    {
      id: generateBlockId(),
      type: 'LIST',
      sortOrder: 12,
      listItems: [
        'Praxis-Tipps für deinen Alltag',
        'Live-Demo der neuesten Features',
        'Q&A Session mit unseren Experten',
        'Exklusive Rabatte für Teilnehmer',
      ],
      listStyle: 'check',
      align: 'left',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 13,
      spacerSize: 'MEDIUM',
    },
    {
      id: generateBlockId(),
      type: 'BUTTON',
      sortOrder: 14,
      buttonText: 'Jetzt anmelden',
      href: 'https://nicnoa.online/webinar',
      buttonVariant: 'primary',
      align: 'center',
    },
    {
      id: generateBlockId(),
      type: 'SPACER',
      sortOrder: 15,
      spacerSize: 'SMALL',
    },
    {
      id: generateBlockId(),
      type: 'PARAGRAPH',
      sortOrder: 16,
      content: 'Die Plätze sind begrenzt. Sichere dir jetzt deinen kostenlosen Platz!',
      align: 'center',
    },
  ],
}

/**
 * Alle verfügbaren Templates
 */
export const NEWSLETTER_TEMPLATES: NewsletterTemplate[] = [
  welcomeTemplate,
  productAnnouncementTemplate,
  salePromotionTemplate,
  monthlyUpdateTemplate,
  eventInvitationTemplate,
]

/**
 * Template nach ID finden
 */
export function getTemplateById(id: string): NewsletterTemplate | undefined {
  return NEWSLETTER_TEMPLATES.find(t => t.id === id)
}

/**
 * Templates nach Kategorie filtern
 */
export function getTemplatesByCategory(category: NewsletterTemplate['category']): NewsletterTemplate[] {
  return NEWSLETTER_TEMPLATES.filter(t => t.category === category)
}

/**
 * Klont ein Template mit neuen Block-IDs
 */
export function cloneTemplateBlocks(template: NewsletterTemplate): NewsletterBlock[] {
  const cloneBlock = (block: NewsletterBlock): NewsletterBlock => {
    const cloned: NewsletterBlock = {
      ...block,
      id: generateBlockId(),
      isNew: false,
      isEditing: false,
    }
    
    if (block.childBlocks) {
      cloned.childBlocks = block.childBlocks.map(child => ({
        ...cloneBlock(child),
        parentBlockId: cloned.id,
      }))
    }
    
    return cloned
  }
  
  return template.blocks.map(cloneBlock)
}



