/**
 * Newsletter Builder Types
 * Definiert Typen für den Newsletter-Block-Editor
 */

// Block Types - alle verfügbaren Newsletter-Blöcke
export type NewsletterBlockType =
  | 'HEADING'
  | 'PARAGRAPH'
  | 'BUTTON'
  | 'IMAGE'
  | 'DIVIDER'
  | 'SPACER'
  | 'TWO_COLUMN'
  | 'THREE_COLUMN'
  | 'SOCIAL_LINKS'
  | 'QUOTE'
  | 'LIST'
  | 'VIDEO'
  | 'PRODUCT_CARD'
  | 'COUPON'
  | 'PROFILE'
  | 'UNSUBSCRIBE'

// Heading Levels
export type HeadingLevel = 1 | 2 | 3

// Text Alignment
export type TextAlign = 'left' | 'center' | 'right'

// Button Variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline'

// Divider Styles
export type DividerStyle = 'solid' | 'dashed' | 'dotted'

// Spacer Sizes
export type SpacerSize = 'SMALL' | 'MEDIUM' | 'LARGE'

// List Styles
export type ListStyle = 'bullet' | 'number' | 'check'

// Social Icon Sizes
export type SocialIconSize = 'small' | 'medium' | 'large'

// Spacer Size Configuration
export const SPACER_SIZE_CONFIGS: Record<SpacerSize, { label: string; heightPx: number }> = {
  SMALL: { label: 'Klein', heightPx: 16 },
  MEDIUM: { label: 'Mittel', heightPx: 32 },
  LARGE: { label: 'Groß', heightPx: 64 },
}

// Heading Level Configuration
export const HEADING_LEVEL_CONFIGS: Record<HeadingLevel, { label: string; className: string }> = {
  1: { label: 'Überschrift 1 (H1)', className: 'text-2xl font-bold' },
  2: { label: 'Überschrift 2 (H2)', className: 'text-xl font-semibold' },
  3: { label: 'Überschrift 3 (H3)', className: 'text-lg font-semibold' },
}

// List Style Configuration
export const LIST_STYLE_CONFIGS: Record<ListStyle, { label: string; icon: string }> = {
  bullet: { label: 'Aufzählung', icon: 'List' },
  number: { label: 'Nummeriert', icon: 'ListOrdered' },
  check: { label: 'Checkliste', icon: 'ListChecks' },
}

// Social Platform Configurations
export const SOCIAL_PLATFORM_CONFIGS = {
  facebook: { label: 'Facebook', icon: 'Facebook', color: '#1877F2' },
  instagram: { label: 'Instagram', icon: 'Instagram', color: '#E4405F' },
  twitter: { label: 'X (Twitter)', icon: 'Twitter', color: '#000000' },
  linkedin: { label: 'LinkedIn', icon: 'Linkedin', color: '#0A66C2' },
  youtube: { label: 'YouTube', icon: 'Youtube', color: '#FF0000' },
  tiktok: { label: 'TikTok', icon: 'TikTok', color: '#000000' },
} as const

export type SocialPlatform = keyof typeof SOCIAL_PLATFORM_CONFIGS

// Social Link Interface
export interface SocialLink {
  platform: SocialPlatform
  url: string
}

// Newsletter Block Interface
export interface NewsletterBlock {
  id: string
  type: NewsletterBlockType
  sortOrder: number
  
  // Common Properties
  align?: TextAlign
  isNew?: boolean
  isEditing?: boolean
  
  // For nested blocks (TWO_COLUMN, THREE_COLUMN)
  columnIndex?: number
  parentBlockId?: string
  childBlocks?: NewsletterBlock[]
  columnWidths?: number[]
  
  // HEADING
  text?: string
  level?: HeadingLevel
  
  // PARAGRAPH
  content?: string
  
  // BUTTON
  buttonText?: string
  href?: string
  buttonVariant?: ButtonVariant
  
  // IMAGE
  src?: string
  alt?: string
  imageWidth?: number
  
  // DIVIDER
  dividerStyle?: DividerStyle
  
  // SPACER
  spacerSize?: SpacerSize
  
  // SOCIAL_LINKS
  socialLinks?: SocialLink[]
  socialIconSize?: SocialIconSize
  
  // QUOTE
  quoteText?: string
  quoteAuthor?: string
  quoteRole?: string
  
  // LIST
  listItems?: string[]
  listStyle?: ListStyle
  
  // VIDEO
  videoUrl?: string
  videoThumbnailUrl?: string
  videoTitle?: string
  
  // PRODUCT_CARD
  productName?: string
  productDescription?: string
  productPrice?: string
  productImageUrl?: string
  productButtonText?: string
  productButtonUrl?: string
  
  // COUPON
  couponCode?: string
  couponDescription?: string
  couponExpiry?: string
  
  // PROFILE
  profileName?: string
  profileRole?: string
  profileDescription?: string
  profileImageUrl?: string
  
  // UNSUBSCRIBE
  unsubscribeText?: string
  unsubscribeLinkText?: string
}

// Newsletter Branding from Platform Settings
export interface NewsletterBranding {
  logoUrl?: string
  primaryColor?: string
  footerText?: string
  companyName?: string
  websiteUrl?: string
}

// Personalisierungs-Platzhalter
// Diese werden beim Newsletter-Versand durch echte Daten aus der Datenbank ersetzt
export const PERSONALIZATION_PLACEHOLDERS = [
  { key: '{{anrede}}', label: 'Anrede', description: 'Personalisierte Anrede (Liebe Maria, Lieber Thomas, Hallo)' },
  { key: '{{name}}', label: 'Voller Name', description: 'Voller Name des Empfängers' },
  { key: '{{vorname}}', label: 'Vorname', description: 'Erster Teil des Namens' },
  { key: '{{email}}', label: 'E-Mail', description: 'E-Mail-Adresse des Empfängers' },
  { key: '{{company}}', label: 'Salon/Firma', description: 'Name des Salons (falls vorhanden)' },
  { key: '{{date}}', label: 'Datum', description: 'Aktuelles Datum (z.B. 18. Dezember 2025)' },
  { key: '{{year}}', label: 'Jahr', description: 'Aktuelles Jahr (z.B. 2025)' },
] as const

// Block Type Configurations
export interface BlockTypeConfig {
  type: NewsletterBlockType
  label: string
  description: string
  icon: string
  category: 'text' | 'media' | 'layout' | 'interactive' | 'special'
  defaultData: Partial<NewsletterBlock>
}

export const NEWSLETTER_BLOCK_CONFIGS: Record<NewsletterBlockType, BlockTypeConfig> = {
  HEADING: {
    type: 'HEADING',
    label: 'Überschrift',
    description: 'Titel oder Überschrift',
    icon: 'Heading',
    category: 'text',
    defaultData: { text: '', level: 1, align: 'left' },
  },
  PARAGRAPH: {
    type: 'PARAGRAPH',
    label: 'Text',
    description: 'Textabsatz',
    icon: 'Type',
    category: 'text',
    defaultData: { content: '', align: 'left' },
  },
  BUTTON: {
    type: 'BUTTON',
    label: 'Button',
    description: 'Call-to-Action Button',
    icon: 'MousePointerClick',
    category: 'interactive',
    defaultData: { buttonText: 'Mehr erfahren', href: '', buttonVariant: 'primary', align: 'center' },
  },
  IMAGE: {
    type: 'IMAGE',
    label: 'Bild',
    description: 'Bild einfügen',
    icon: 'Image',
    category: 'media',
    defaultData: { src: '', alt: '', imageWidth: 100, align: 'center' },
  },
  DIVIDER: {
    type: 'DIVIDER',
    label: 'Trennlinie',
    description: 'Horizontale Linie',
    icon: 'Minus',
    category: 'layout',
    defaultData: { dividerStyle: 'solid' },
  },
  SPACER: {
    type: 'SPACER',
    label: 'Abstand',
    description: 'Vertikaler Abstand',
    icon: 'Space',
    category: 'layout',
    defaultData: { spacerSize: 'MEDIUM' },
  },
  TWO_COLUMN: {
    type: 'TWO_COLUMN',
    label: '2 Spalten',
    description: 'Zwei-Spalten-Layout',
    icon: 'Columns2',
    category: 'layout',
    defaultData: { columnWidths: [50, 50], childBlocks: [] },
  },
  THREE_COLUMN: {
    type: 'THREE_COLUMN',
    label: '3 Spalten',
    description: 'Drei-Spalten-Layout',
    icon: 'Columns3',
    category: 'layout',
    defaultData: { columnWidths: [33, 34, 33], childBlocks: [] },
  },
  SOCIAL_LINKS: {
    type: 'SOCIAL_LINKS',
    label: 'Social Links',
    description: 'Social-Media-Links',
    icon: 'Share2',
    category: 'interactive',
    defaultData: { socialLinks: [], socialIconSize: 'medium', align: 'center' },
  },
  QUOTE: {
    type: 'QUOTE',
    label: 'Zitat',
    description: 'Zitat mit Autor',
    icon: 'Quote',
    category: 'text',
    defaultData: { quoteText: '', quoteAuthor: '', quoteRole: '', align: 'center' },
  },
  LIST: {
    type: 'LIST',
    label: 'Liste',
    description: 'Aufzählungsliste',
    icon: 'List',
    category: 'text',
    defaultData: { listItems: [], listStyle: 'bullet', align: 'left' },
  },
  VIDEO: {
    type: 'VIDEO',
    label: 'Video',
    description: 'Video-Thumbnail mit Link',
    icon: 'Play',
    category: 'media',
    defaultData: { videoUrl: '', videoThumbnailUrl: '', videoTitle: 'Video ansehen', align: 'center' },
  },
  PRODUCT_CARD: {
    type: 'PRODUCT_CARD',
    label: 'Produktkarte',
    description: 'Produkt präsentieren',
    icon: 'ShoppingBag',
    category: 'interactive',
    defaultData: {
      productName: '',
      productDescription: '',
      productPrice: '',
      productImageUrl: '',
      productButtonText: 'Jetzt kaufen',
      productButtonUrl: '',
      align: 'center',
    },
  },
  COUPON: {
    type: 'COUPON',
    label: 'Gutschein',
    description: 'Rabattcode anzeigen',
    icon: 'Ticket',
    category: 'interactive',
    defaultData: {
      couponCode: '',
      couponDescription: '',
      couponExpiry: '',
      align: 'center',
    },
  },
  PROFILE: {
    type: 'PROFILE',
    label: 'Profil',
    description: 'Person vorstellen',
    icon: 'User',
    category: 'interactive',
    defaultData: {
      profileName: '',
      profileRole: '',
      profileDescription: '',
      profileImageUrl: '',
      align: 'center',
    },
  },
  UNSUBSCRIBE: {
    type: 'UNSUBSCRIBE',
    label: 'Abmelden',
    description: 'Abmelde-Link (DSGVO)',
    icon: 'UserMinus',
    category: 'special',
    defaultData: {
      unsubscribeText: 'Du möchtest keine E-Mails mehr von uns erhalten?',
      unsubscribeLinkText: 'Hier abmelden',
      align: 'center',
    },
  },
}

// Block Categories for Toolbar
export const BLOCK_CATEGORIES = {
  text: {
    label: 'Text',
    types: ['HEADING', 'PARAGRAPH', 'QUOTE', 'LIST'] as NewsletterBlockType[],
  },
  media: {
    label: 'Medien',
    types: ['IMAGE', 'VIDEO'] as NewsletterBlockType[],
  },
  interactive: {
    label: 'Interaktiv',
    types: ['BUTTON', 'SOCIAL_LINKS', 'PRODUCT_CARD', 'COUPON', 'PROFILE'] as NewsletterBlockType[],
  },
  layout: {
    label: 'Layout',
    types: ['DIVIDER', 'SPACER', 'TWO_COLUMN', 'THREE_COLUMN'] as NewsletterBlockType[],
  },
  // Hinweis: Der Unsubscribe-Link ist IMMER automatisch im Footer (DSGVO-Pflicht)
} as const

// Helper function to create a new block
export function createNewBlock(type: NewsletterBlockType, sortOrder: number): NewsletterBlock {
  const config = NEWSLETTER_BLOCK_CONFIGS[type]
  return {
    id: generateBlockId(),
    type,
    sortOrder,
    isNew: true,
    isEditing: true,
    ...config.defaultData,
  }
}

// Helper function to generate unique block ID
export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
