// Pricelist Types - Spiegelt Prisma Schema
import type { 
  PriceList as PrismaPriceList, 
  PriceBlock as PrismaPriceBlock, 
  PriceVariant as PrismaPriceVariant,
  PricingModel,
  BlockType,
  PriceType,
  SpacerSize,
} from '@prisma/client'

// Re-export Prisma enums
export type { PricingModel, BlockType, PriceType, SpacerSize }

// ============================================
// Client-side Types (für Editor-State)
// ============================================

export interface PriceVariantClient {
  id: string
  label: string
  price: number
  sortOrder: number
  isNew?: boolean // Für neue, noch nicht gespeicherte Varianten
}

export interface PriceBlockClient {
  id: string
  priceListId: string
  type: BlockType
  sortOrder: number
  
  // Container-Blöcke (TWO_COLUMN, THREE_COLUMN)
  parentBlockId?: string | null
  columnIndex?: number | null
  
  // SECTION_HEADER
  title?: string | null
  subtitle?: string | null
  
  // PRICE_ITEM
  itemName?: string | null
  description?: string | null
  priceType?: PriceType | null
  price?: number | null
  priceMax?: number | null
  priceText?: string | null
  qualifier?: string | null
  
  // TEXT / INFO_BOX / QUOTE
  content?: string | null
  
  // IMAGE / LOGO
  imageUrl?: string | null
  
  // SPACER
  spacerSize?: SpacerSize | null
  
  // BADGE
  badgeText?: string | null
  badgeStyle?: 'filled' | 'outline' | 'gradient' | null
  badgeColor?: string | null
  
  // ICON_TEXT
  iconName?: string | null
  
  // CONTACT_INFO
  phone?: string | null
  email?: string | null
  address?: string | null
  website?: string | null
  
  // SOCIAL_LINKS
  socialLinks?: SocialLink[] | null
  
  // QR_CODE
  qrCodeUrl?: string | null
  qrCodeLabel?: string | null
  
  // FOOTER
  footerText?: string | null
  
  // COLUMN CONTAINER (TWO_COLUMN, THREE_COLUMN)
  columnWidths?: number[] | null // Prozentuale Spaltenbreiten [50, 50] oder [33, 33, 34]
  
  // Gemeinsame Styling-Optionen für alle Textblöcke
  textAlign?: 'left' | 'center' | 'right' | null
  backgroundColor?: string | null // Hex-Farbe oder vordefinierte Farbe
  
  // Relations
  variants: PriceVariantClient[]
  childBlocks?: PriceBlockClient[]
  
  // Editor State
  isNew?: boolean
  isEditing?: boolean
  isDragging?: boolean
}

export interface SocialLink {
  platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'pinterest'
  url: string
}

export interface PriceListClient {
  id: string
  userId: string
  name: string
  pricingModel: PricingModel
  theme: string
  fontFamily: string
  backgroundId?: string | null
  backgroundUrl?: string | null // Für Anzeige
  showLogo: boolean
  showContact: boolean
  columns: number
  // Padding in mm
  paddingTop: number
  paddingBottom: number
  paddingLeft: number
  paddingRight: number
  // Inhaltsskalierung (0.5 = 50%, 1.0 = 100%, 1.5 = 150%)
  contentScale: number
  // Inhaltsverschiebung in mm
  contentOffsetX: number
  contentOffsetY: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  blocks: PriceBlockClient[]
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreatePriceListRequest {
  name: string
  pricingModel: PricingModel
  theme?: string
  fontFamily?: string
  backgroundId?: string
  showLogo?: boolean
  showContact?: boolean
  columns?: number
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  contentScale?: number
  contentOffsetX?: number
  contentOffsetY?: number
}

export interface UpdatePriceListRequest {
  name?: string
  pricingModel?: PricingModel
  theme?: string
  fontFamily?: string
  backgroundId?: string | null
  showLogo?: boolean
  showContact?: boolean
  columns?: number
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  contentScale?: number
  contentOffsetX?: number
  contentOffsetY?: number
  isPublished?: boolean
}

export interface CreateBlockRequest {
  type: BlockType
  sortOrder?: number
  parentBlockId?: string | null
  columnIndex?: number | null
  title?: string
  subtitle?: string
  itemName?: string
  description?: string
  priceType?: PriceType
  price?: number
  priceMax?: number
  priceText?: string
  qualifier?: string
  content?: string
  imageUrl?: string
  spacerSize?: SpacerSize
  badgeText?: string
  badgeStyle?: 'filled' | 'outline' | 'gradient'
  badgeColor?: string
  iconName?: string
  phone?: string
  email?: string
  address?: string
  website?: string
  socialLinks?: SocialLink[]
  qrCodeUrl?: string
  qrCodeLabel?: string
  footerText?: string
  columnWidths?: number[]
  textAlign?: 'left' | 'center' | 'right'
  backgroundColor?: string
  variants?: Omit<PriceVariantClient, 'id'>[]
}

export interface UpdateBlockRequest extends Partial<Omit<CreateBlockRequest, 'type'>> {
  id: string
  type?: BlockType
}

export interface ReorderBlocksRequest {
  blocks: { id: string; sortOrder: number }[]
}

export interface CreateVariantRequest {
  label: string
  price: number
  sortOrder?: number
}

// ============================================
// Block-Typ Konfiguration
// ============================================

export interface BlockTypeConfig {
  type: BlockType
  label: string
  description: string
  icon: string // Lucide icon name
  defaultData: Partial<PriceBlockClient>
  canHaveVariants: boolean
}

export const BLOCK_TYPE_CONFIGS: Record<BlockType, BlockTypeConfig> = {
  SECTION_HEADER: {
    type: 'SECTION_HEADER',
    label: 'Section',
    description: 'Überschrift für einen Bereich',
    icon: 'Type',
    defaultData: {
      title: 'Neue Section',
      subtitle: null,
    },
    canHaveVariants: false,
  },
  PRICE_ITEM: {
    type: 'PRICE_ITEM',
    label: 'Preis-Eintrag',
    description: 'Dienstleistung mit Preis',
    icon: 'DollarSign',
    defaultData: {
      itemName: 'Neue Dienstleistung',
      priceType: 'FIXED',
      price: 0,
    },
    canHaveVariants: true,
  },
  TEXT: {
    type: 'TEXT',
    label: 'Text',
    description: 'Freier Text oder Hinweis',
    icon: 'AlignLeft',
    defaultData: {
      content: '',
    },
    canHaveVariants: false,
  },
  DIVIDER: {
    type: 'DIVIDER',
    label: 'Trennlinie',
    description: 'Horizontale Linie',
    icon: 'Minus',
    defaultData: {},
    canHaveVariants: false,
  },
  SPACER: {
    type: 'SPACER',
    label: 'Abstand',
    description: 'Vertikaler Leerraum',
    icon: 'Space',
    defaultData: {
      spacerSize: 'MEDIUM',
    },
    canHaveVariants: false,
  },
  IMAGE: {
    type: 'IMAGE',
    label: 'Bild',
    description: 'Bild oder Logo einfügen',
    icon: 'Image',
    defaultData: {
      imageUrl: null,
    },
    canHaveVariants: false,
  },
  INFO_BOX: {
    type: 'INFO_BOX',
    label: 'Hinweis-Box',
    description: 'Hervorgehobener Hinweis',
    icon: 'Info',
    defaultData: {
      content: '',
    },
    canHaveVariants: false,
  },
  // Layout Container
  TWO_COLUMN: {
    type: 'TWO_COLUMN',
    label: '2 Spalten',
    description: 'Zweispaltiges Layout',
    icon: 'Columns2',
    defaultData: {},
    canHaveVariants: false,
  },
  THREE_COLUMN: {
    type: 'THREE_COLUMN',
    label: '3 Spalten',
    description: 'Dreispaltiges Layout',
    icon: 'Columns3',
    defaultData: {},
    canHaveVariants: false,
  },
  // Neue Blockelemente
  BADGE: {
    type: 'BADGE',
    label: 'Badge',
    description: 'Hervorgehobenes Label (NEU, SALE, etc.)',
    icon: 'Tag',
    defaultData: {
      badgeText: 'NEU',
      badgeStyle: 'filled',
      badgeColor: 'primary',
    },
    canHaveVariants: false,
  },
  QUOTE: {
    type: 'QUOTE',
    label: 'Zitat',
    description: 'Kundenbewertung oder Zitat',
    icon: 'Quote',
    defaultData: {
      content: '',
      title: '', // Autor/Name
    },
    canHaveVariants: false,
  },
  ICON_TEXT: {
    type: 'ICON_TEXT',
    label: 'Icon & Text',
    description: 'Text mit vorangestelltem Icon',
    icon: 'Star',
    defaultData: {
      iconName: 'Check',
      content: '',
    },
    canHaveVariants: false,
  },
  CONTACT_INFO: {
    type: 'CONTACT_INFO',
    label: 'Kontakt',
    description: 'Kontaktinformationen',
    icon: 'Contact',
    defaultData: {
      phone: '',
      email: '',
      address: '',
      website: '',
    },
    canHaveVariants: false,
  },
  SOCIAL_LINKS: {
    type: 'SOCIAL_LINKS',
    label: 'Social Media',
    description: 'Social Media Links',
    icon: 'Share2',
    defaultData: {
      socialLinks: [],
    },
    canHaveVariants: false,
  },
  QR_CODE: {
    type: 'QR_CODE',
    label: 'QR-Code',
    description: 'QR-Code für URL/Buchung',
    icon: 'QrCode',
    defaultData: {
      qrCodeUrl: '',
      qrCodeLabel: 'Jetzt buchen',
    },
    canHaveVariants: false,
  },
  LOGO: {
    type: 'LOGO',
    label: 'Logo',
    description: 'Logo mit spezieller Formatierung',
    icon: 'Hexagon',
    defaultData: {
      imageUrl: null,
    },
    canHaveVariants: false,
  },
  FOOTER: {
    type: 'FOOTER',
    label: 'Footer',
    description: 'Fußzeile mit Impressum/Öffnungszeiten',
    icon: 'PanelBottom',
    defaultData: {
      footerText: '',
    },
    canHaveVariants: false,
  },
  PAGE_BREAK: {
    type: 'PAGE_BREAK',
    label: 'Seitenumbruch',
    description: 'Erzwingt einen Seitenumbruch für mehrseitige PDFs',
    icon: 'FileStack',
    defaultData: {},
    canHaveVariants: false,
  },
}

// ============================================
// Preismodell-Konfiguration
// ============================================

export interface PricingModelConfig {
  model: PricingModel
  label: string
  description: string
  icon: string
  defaultVariantLabels: string[]
}

export const PRICING_MODEL_CONFIGS: Record<PricingModel, PricingModelConfig> = {
  FIXED_PRICE: {
    model: 'FIXED_PRICE',
    label: 'Festpreise',
    description: 'Ein fester Preis pro Dienstleistung',
    icon: 'CircleDollarSign',
    defaultVariantLabels: [],
  },
  BY_HAIR_LENGTH: {
    model: 'BY_HAIR_LENGTH',
    label: 'Nach Haarlänge',
    description: 'Preise gestaffelt nach Kurz, Mittel, Lang',
    icon: 'Ruler',
    defaultVariantLabels: ['Kurz', 'Mittel', 'Lang'],
  },
  BY_CATEGORY: {
    model: 'BY_CATEGORY',
    label: 'Nach Kategorie',
    description: 'Preise nach eigenen Kategorien',
    icon: 'LayoutGrid',
    defaultVariantLabels: [],
  },
  BY_GENDER: {
    model: 'BY_GENDER',
    label: 'Nach Geschlecht',
    description: 'Preise getrennt nach Damen, Herren, Kinder',
    icon: 'Users',
    defaultVariantLabels: ['Damen', 'Herren', 'Kinder'],
  },
}

// ============================================
// Preis-Typ Konfiguration
// ============================================

export interface PriceTypeConfig {
  type: PriceType
  label: string
  description: string
  formatPrice: (price: number | null, priceMax?: number | null, priceText?: string | null) => string
}

export const PRICE_TYPE_CONFIGS: Record<PriceType, PriceTypeConfig> = {
  FIXED: {
    type: 'FIXED',
    label: 'Festpreis',
    description: 'Ein fester Preis',
    formatPrice: (price) => price != null ? `${price.toFixed(2)} €` : '-',
  },
  FROM: {
    type: 'FROM',
    label: 'Ab-Preis',
    description: 'Mindestpreis (ab ...)',
    formatPrice: (price) => price != null ? `ab ${price.toFixed(2)} €` : '-',
  },
  RANGE: {
    type: 'RANGE',
    label: 'Preisspanne',
    description: 'Von-Bis Preis',
    formatPrice: (price, priceMax) => {
      if (price == null) return '-'
      if (priceMax == null) return `${price.toFixed(2)} €`
      return `${price.toFixed(2)} - ${priceMax.toFixed(2)} €`
    },
  },
  SURCHARGE: {
    type: 'SURCHARGE',
    label: 'Aufpreis',
    description: 'Zusätzlicher Aufpreis',
    formatPrice: (price) => price != null ? `+ ${price.toFixed(2)} €` : '-',
  },
  TEXT: {
    type: 'TEXT',
    label: 'Text',
    description: 'Freitext statt Preis',
    formatPrice: (_, __, priceText) => priceText || '-',
  },
}

// ============================================
// Spacer-Größen Konfiguration
// ============================================

export interface SpacerSizeConfig {
  size: SpacerSize
  label: string
  heightPx: number
  heightMm: number // Für PDF
}

export const SPACER_SIZE_CONFIGS: Record<SpacerSize, SpacerSizeConfig> = {
  SMALL: {
    size: 'SMALL',
    label: 'Klein',
    heightPx: 8,
    heightMm: 3,
  },
  MEDIUM: {
    size: 'MEDIUM',
    label: 'Mittel',
    heightPx: 16,
    heightMm: 6,
  },
  LARGE: {
    size: 'LARGE',
    label: 'Groß',
    heightPx: 32,
    heightMm: 12,
  },
}

// ============================================
// Utility Functions
// ============================================

export function formatPrice(
  block: Pick<PriceBlockClient, 'priceType' | 'price' | 'priceMax' | 'priceText'>
): string {
  const config = block.priceType ? PRICE_TYPE_CONFIGS[block.priceType] : PRICE_TYPE_CONFIGS.FIXED
  return config.formatPrice(block.price ?? null, block.priceMax ?? null, block.priceText ?? null)
}

export function getDefaultVariants(pricingModel: PricingModel): Omit<PriceVariantClient, 'id'>[] {
  const config = PRICING_MODEL_CONFIGS[pricingModel]
  return config.defaultVariantLabels.map((label, index) => ({
    label,
    price: 0,
    sortOrder: index,
  }))
}

export function createNewBlock(
  type: BlockType,
  priceListId: string,
  sortOrder: number,
  pricingModel?: PricingModel
): PriceBlockClient {
  const config = BLOCK_TYPE_CONFIGS[type]
  const baseBlock: PriceBlockClient = {
    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    priceListId,
    type,
    sortOrder,
    variants: [],
    isNew: true,
    ...config.defaultData,
  }

  // Für PRICE_ITEM: Standard-Varianten hinzufügen
  if (type === 'PRICE_ITEM' && pricingModel) {
    baseBlock.variants = getDefaultVariants(pricingModel).map((v, i) => ({
      ...v,
      id: `temp-variant-${Date.now()}-${i}`,
      isNew: true,
    }))
  }

  return baseBlock
}


