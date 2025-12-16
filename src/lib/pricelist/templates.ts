import type { PriceBlockClient, BlockType, PriceType, SpacerSize, PricingModel } from './types'

// Template-Block Type (ohne IDs, die werden beim Erstellen generiert)
export type TemplateBlock = Omit<PriceBlockClient, 'id' | 'priceListId' | 'createdAt' | 'updatedAt'> & {
  childBlocks?: TemplateBlock[]
}

export interface PriceListTemplate {
  id: string
  name: string
  description: string
  category: 'minimal' | 'elegant' | 'modern' | 'classic' | 'bold' | 'spa'
  theme: string
  fontFamily: string
  columns: 1 | 2
  blocks: TemplateBlock[]
  previewColor: string
  // Für welches Preismodell ist diese Vorlage gedacht?
  pricingModel: PricingModel | 'ALL' // 'ALL' = passt für alle Modelle
}

// Helper zum Erstellen von Blöcken
const createBlock = (
  type: BlockType,
  sortOrder: number,
  data: Partial<TemplateBlock> = {}
): TemplateBlock => ({
  type,
  sortOrder,
  title: null,
  subtitle: null,
  itemName: null,
  description: null,
  priceType: 'FIXED' as PriceType,
  price: null,
  priceMax: null,
  priceText: null,
  qualifier: null,
  content: null,
  imageUrl: null,
  spacerSize: 'MEDIUM' as SpacerSize,
  badgeText: null,
  badgeStyle: 'filled',
  badgeColor: 'primary',
  iconName: null,
  phone: null,
  email: null,
  address: null,
  website: null,
  socialLinks: [],
  qrCodeUrl: null,
  qrCodeLabel: null,
  footerText: null,
  textAlign: 'left',
  columnWidths: null,
  variants: [],
  parentBlockId: null,
  columnIndex: null,
  childBlocks: [],
  ...data,
})

export const PRICELIST_TEMPLATES: PriceListTemplate[] = [
  // ========================================
  // FIXED_PRICE TEMPLATES
  // ========================================
  
  // TEMPLATE: Minimalistisch (Festpreise)
  {
    id: 'minimalist-fixed',
    name: 'Minimalistisch',
    description: 'Klares Design mit einfachen Festpreisen',
    category: 'minimal',
    theme: 'minimal',
    fontFamily: 'inter',
    columns: 1,
    previewColor: '#f5f5f5',
    pricingModel: 'FIXED_PRICE',
    blocks: [
      createBlock('SECTION_HEADER', 0, {
        title: 'Haarschnitte',
        subtitle: 'Professionelle Schnitte für jeden Stil',
      }),
      createBlock('PRICE_ITEM', 1, {
        itemName: 'Damenhaarschnitt',
        description: 'Waschen, Schneiden, Föhnen',
        price: 45,
      }),
      createBlock('PRICE_ITEM', 2, {
        itemName: 'Herrenhaarschnitt',
        description: 'Klassischer Schnitt mit Styling',
        price: 28,
      }),
      createBlock('PRICE_ITEM', 3, {
        itemName: 'Kinderhaarschnitt',
        description: 'Bis 12 Jahre',
        price: 18,
      }),
      createBlock('SPACER', 4, { spacerSize: 'MEDIUM' }),
      createBlock('SECTION_HEADER', 5, {
        title: 'Coloration',
      }),
      createBlock('PRICE_ITEM', 6, {
        itemName: 'Ansatzfarbe',
        price: 35,
      }),
      createBlock('PRICE_ITEM', 7, {
        itemName: 'Komplettfarbe',
        price: 55,
        priceType: 'FROM',
      }),
      createBlock('PRICE_ITEM', 8, {
        itemName: 'Strähnen',
        price: 65,
        priceType: 'FROM',
      }),
    ],
  },

  // TEMPLATE: Elegant (Festpreise)
  {
    id: 'elegant-fixed',
    name: 'Elegant',
    description: 'Stilvolles Design für gehobene Salons',
    category: 'elegant',
    theme: 'elegant',
    fontFamily: 'playfair',
    columns: 1,
    previewColor: '#faf8f5',
    pricingModel: 'FIXED_PRICE',
    blocks: [
      createBlock('TEXT', 0, {
        content: '✦ UNSER SERVICE ✦',
        textAlign: 'center',
      }),
      createBlock('SPACER', 1, { spacerSize: 'SMALL' }),
      createBlock('SECTION_HEADER', 2, {
        title: 'Schnitt & Styling',
        textAlign: 'center',
      }),
      createBlock('PRICE_ITEM', 3, {
        itemName: 'Signature Cut Damen',
        description: 'Beratung, Waschen, Schnitt, Styling',
        price: 75,
      }),
      createBlock('PRICE_ITEM', 4, {
        itemName: 'Signature Cut Herren',
        description: 'Beratung, Waschen, Schnitt, Finish',
        price: 45,
      }),
      createBlock('PRICE_ITEM', 5, {
        itemName: 'Luxury Blow-Dry',
        description: 'Föhnen & Styling',
        price: 35,
        priceType: 'FROM',
      }),
      createBlock('SPACER', 6, { spacerSize: 'MEDIUM' }),
      createBlock('SECTION_HEADER', 7, {
        title: 'Farbe & Highlights',
        textAlign: 'center',
      }),
      createBlock('PRICE_ITEM', 8, {
        itemName: 'Balayage',
        description: 'Natürliche Farbverläufe',
        price: 120,
        priceType: 'FROM',
      }),
      createBlock('PRICE_ITEM', 9, {
        itemName: 'Glossing',
        description: 'Glanz & Farbauffrischung',
        price: 45,
      }),
      createBlock('FOOTER', 10, {
        footerText: 'Alle Preise inkl. MwSt.',
        textAlign: 'center',
      }),
    ],
  },

  // TEMPLATE: Barbershop (Festpreise)
  {
    id: 'barbershop-fixed',
    name: 'Barbershop',
    description: 'Maskulines Design für Herrensalons',
    category: 'bold',
    theme: 'bold',
    fontFamily: 'spaceGrotesk',
    columns: 1,
    previewColor: '#1a1a1a',
    pricingModel: 'FIXED_PRICE',
    blocks: [
      createBlock('SECTION_HEADER', 0, {
        title: 'CUTS',
        textAlign: 'center',
      }),
      createBlock('PRICE_ITEM', 1, {
        itemName: 'Classic Cut',
        description: 'Waschen, Schneiden, Styling',
        price: 32,
      }),
      createBlock('PRICE_ITEM', 2, {
        itemName: 'Skin Fade',
        description: 'Präziser Übergang',
        price: 35,
      }),
      createBlock('PRICE_ITEM', 3, {
        itemName: 'Buzz Cut',
        description: 'Maschinenschnitt',
        price: 18,
      }),
      createBlock('PRICE_ITEM', 4, {
        itemName: 'Beard Trim',
        description: 'Bartpflege & Kontur',
        price: 15,
      }),
      createBlock('SPACER', 5, { spacerSize: 'MEDIUM' }),
      createBlock('SECTION_HEADER', 6, {
        title: 'COMBOS',
        textAlign: 'center',
      }),
      createBlock('PRICE_ITEM', 7, {
        itemName: 'Cut + Beard',
        description: 'Komplettpaket',
        price: 42,
      }),
      createBlock('PRICE_ITEM', 8, {
        itemName: 'Hot Towel Shave',
        description: 'Traditionelle Nassrasur',
        price: 28,
      }),
      createBlock('BADGE', 9, {
        badgeText: 'Walk-ins Welcome',
        badgeStyle: 'outline',
        textAlign: 'center',
      }),
    ],
  },

  // TEMPLATE: Spa & Wellness (Festpreise)
  {
    id: 'spa-fixed',
    name: 'Spa & Wellness',
    description: 'Entspanntes Design für Beauty-Services',
    category: 'spa',
    theme: 'soft',
    fontFamily: 'cormorant',
    columns: 1,
    previewColor: '#f8f5f2',
    pricingModel: 'FIXED_PRICE',
    blocks: [
      createBlock('TEXT', 0, {
        content: 'Willkommen in unserer Oase der Entspannung',
        textAlign: 'center',
      }),
      createBlock('SPACER', 1, { spacerSize: 'MEDIUM' }),
      createBlock('SECTION_HEADER', 2, {
        title: 'Haarpflege',
        textAlign: 'center',
      }),
      createBlock('PRICE_ITEM', 3, {
        itemName: 'Wellness-Schnitt',
        description: 'Mit Kopfmassage & Aromatherapie',
        price: 65,
      }),
      createBlock('PRICE_ITEM', 4, {
        itemName: 'Olaplex Treatment',
        description: 'Intensive Haarkur',
        price: 45,
      }),
      createBlock('SPACER', 5, { spacerSize: 'SMALL' }),
      createBlock('SECTION_HEADER', 6, {
        title: 'Gesicht & Körper',
        textAlign: 'center',
      }),
      createBlock('PRICE_ITEM', 7, {
        itemName: 'Gesichtsmassage',
        description: '30 Minuten',
        price: 40,
      }),
      createBlock('PRICE_ITEM', 8, {
        itemName: 'Augenbrauen-Styling',
        price: 15,
      }),
      createBlock('FOOTER', 9, {
        footerText: '🌿 Wir verwenden ausschließlich natürliche Produkte',
        textAlign: 'center',
      }),
    ],
  },

  // ========================================
  // BY_HAIR_LENGTH TEMPLATES (mit Varianten)
  // ========================================

  // TEMPLATE: Haarlängen Klassisch
  {
    id: 'hair-length-classic',
    name: 'Nach Haarlänge – Klassisch',
    description: 'Übersichtliche Preise nach Kurz/Mittel/Lang',
    category: 'classic',
    theme: 'classic',
    fontFamily: 'cormorant',
    columns: 1,
    previewColor: '#fdfcfa',
    pricingModel: 'BY_HAIR_LENGTH',
    blocks: [
      createBlock('SECTION_HEADER', 0, {
        title: 'Schnitt & Styling',
        subtitle: 'Preise nach Haarlänge',
      }),
      createBlock('PRICE_ITEM', 1, {
        itemName: 'Waschen, Schneiden, Föhnen',
        description: 'Komplettservice',
        variants: [
          { id: 'v1', label: 'Kurz', price: 38, sortOrder: 0 },
          { id: 'v2', label: 'Mittel', price: 48, sortOrder: 1 },
          { id: 'v3', label: 'Lang', price: 58, sortOrder: 2 },
        ],
      }),
      createBlock('PRICE_ITEM', 2, {
        itemName: 'Nur Schneiden',
        description: 'Ohne Waschen',
        variants: [
          { id: 'v4', label: 'Kurz', price: 28, sortOrder: 0 },
          { id: 'v5', label: 'Mittel', price: 35, sortOrder: 1 },
          { id: 'v6', label: 'Lang', price: 42, sortOrder: 2 },
        ],
      }),
      createBlock('PRICE_ITEM', 3, {
        itemName: 'Föhnen & Styling',
        variants: [
          { id: 'v7', label: 'Kurz', price: 20, sortOrder: 0 },
          { id: 'v8', label: 'Mittel', price: 28, sortOrder: 1 },
          { id: 'v9', label: 'Lang', price: 35, sortOrder: 2 },
        ],
      }),
      createBlock('SPACER', 4, { spacerSize: 'MEDIUM' }),
      createBlock('SECTION_HEADER', 5, {
        title: 'Coloration',
      }),
      createBlock('PRICE_ITEM', 6, {
        itemName: 'Komplettfarbe',
        description: 'Farbe nach Wahl',
        variants: [
          { id: 'v10', label: 'Kurz', price: 45, sortOrder: 0 },
          { id: 'v11', label: 'Mittel', price: 60, sortOrder: 1 },
          { id: 'v12', label: 'Lang', price: 75, sortOrder: 2 },
        ],
      }),
      createBlock('PRICE_ITEM', 7, {
        itemName: 'Strähnen/Foliensträhnen',
        variants: [
          { id: 'v13', label: 'Kurz', price: 55, sortOrder: 0 },
          { id: 'v14', label: 'Mittel', price: 75, sortOrder: 1 },
          { id: 'v15', label: 'Lang', price: 95, sortOrder: 2 },
        ],
      }),
      createBlock('PRICE_ITEM', 8, {
        itemName: 'Ansatzfarbe',
        price: 35,
        description: 'Einheitspreis',
      }),
    ],
  },

  // TEMPLATE: Haarlängen Modern
  {
    id: 'hair-length-modern',
    name: 'Nach Haarlänge – Modern',
    description: 'Modernes Design mit klarer Längenunterscheidung',
    category: 'modern',
    theme: 'modern',
    fontFamily: 'spaceGrotesk',
    columns: 1,
    previewColor: '#f8f8f8',
    pricingModel: 'BY_HAIR_LENGTH',
    blocks: [
      createBlock('TEXT', 0, {
        content: 'UNSERE PREISE RICHTEN SICH NACH IHRER HAARLÄNGE',
        textAlign: 'center',
      }),
      createBlock('SPACER', 1, { spacerSize: 'SMALL' }),
      createBlock('SECTION_HEADER', 2, {
        title: 'SCHNITT',
        textAlign: 'center',
      }),
      createBlock('PRICE_ITEM', 3, {
        itemName: 'Premium Cut',
        description: 'Beratung • Waschen • Schnitt • Finish',
        variants: [
          { id: 'v1', label: 'Kurz', price: 42, sortOrder: 0 },
          { id: 'v2', label: 'Mittel', price: 52, sortOrder: 1 },
          { id: 'v3', label: 'Lang', price: 65, sortOrder: 2 },
        ],
      }),
      createBlock('PRICE_ITEM', 4, {
        itemName: 'Express Cut',
        description: 'Schnitt ohne Extras',
        variants: [
          { id: 'v4', label: 'Kurz', price: 30, sortOrder: 0 },
          { id: 'v5', label: 'Mittel', price: 38, sortOrder: 1 },
          { id: 'v6', label: 'Lang', price: 45, sortOrder: 2 },
        ],
      }),
      createBlock('SPACER', 5, { spacerSize: 'MEDIUM' }),
      createBlock('SECTION_HEADER', 6, {
        title: 'FARBE',
        textAlign: 'center',
      }),
      createBlock('PRICE_ITEM', 7, {
        itemName: 'Balayage',
        description: 'Natürliche Farbverläufe',
        variants: [
          { id: 'v7', label: 'Kurz', price: 85, sortOrder: 0 },
          { id: 'v8', label: 'Mittel', price: 120, sortOrder: 1 },
          { id: 'v9', label: 'Lang', price: 155, sortOrder: 2 },
        ],
      }),
      createBlock('PRICE_ITEM', 8, {
        itemName: 'Glossing',
        description: 'Glanz-Treatment',
        variants: [
          { id: 'v10', label: 'Kurz', price: 35, sortOrder: 0 },
          { id: 'v11', label: 'Mittel', price: 45, sortOrder: 1 },
          { id: 'v12', label: 'Lang', price: 55, sortOrder: 2 },
        ],
      }),
      createBlock('BADGE', 9, {
        badgeText: 'Alle Preise inkl. Produkten',
        badgeStyle: 'subtle',
        textAlign: 'center',
      }),
    ],
  },

  // TEMPLATE: Haarlängen Elegant
  {
    id: 'hair-length-elegant',
    name: 'Nach Haarlänge – Elegant',
    description: 'Edles Design für Premium-Salons',
    category: 'elegant',
    theme: 'elegant',
    fontFamily: 'playfair',
    columns: 1,
    previewColor: '#fcfaf7',
    pricingModel: 'BY_HAIR_LENGTH',
    blocks: [
      createBlock('TEXT', 0, {
        content: '— PREISLISTE —',
        textAlign: 'center',
      }),
      createBlock('SPACER', 1, { spacerSize: 'SMALL' }),
      createBlock('SECTION_HEADER', 2, {
        title: 'Schnitt & Finish',
        textAlign: 'center',
      }),
      createBlock('PRICE_ITEM', 3, {
        itemName: 'Signature Haircut',
        description: 'Unser beliebtes Komplettpaket',
        variants: [
          { id: 'v1', label: 'Kurz', price: 55, sortOrder: 0 },
          { id: 'v2', label: 'Mittel', price: 70, sortOrder: 1 },
          { id: 'v3', label: 'Lang', price: 85, sortOrder: 2 },
        ],
      }),
      createBlock('PRICE_ITEM', 4, {
        itemName: 'Creative Styling',
        description: 'Föhnen oder Glätten',
        variants: [
          { id: 'v4', label: 'Kurz', price: 25, sortOrder: 0 },
          { id: 'v5', label: 'Mittel', price: 35, sortOrder: 1 },
          { id: 'v6', label: 'Lang', price: 45, sortOrder: 2 },
        ],
      }),
      createBlock('SPACER', 5, { spacerSize: 'MEDIUM' }),
      createBlock('SECTION_HEADER', 6, {
        title: 'Farbe & Technik',
        textAlign: 'center',
      }),
      createBlock('PRICE_ITEM', 7, {
        itemName: 'Full Color',
        description: 'Komplette Coloration',
        variants: [
          { id: 'v7', label: 'Kurz', price: 55, sortOrder: 0 },
          { id: 'v8', label: 'Mittel', price: 75, sortOrder: 1 },
          { id: 'v9', label: 'Lang', price: 95, sortOrder: 2 },
        ],
      }),
      createBlock('PRICE_ITEM', 8, {
        itemName: 'Highlights',
        description: 'Folien- oder Freihandtechnik',
        variants: [
          { id: 'v10', label: 'Kurz', price: 70, sortOrder: 0 },
          { id: 'v11', label: 'Mittel', price: 100, sortOrder: 1 },
          { id: 'v12', label: 'Lang', price: 130, sortOrder: 2 },
        ],
      }),
      createBlock('SPACER', 9, { spacerSize: 'SMALL' }),
      createBlock('SECTION_HEADER', 10, {
        title: 'Pflege',
        textAlign: 'center',
      }),
      createBlock('PRICE_ITEM', 11, {
        itemName: 'Keratin Treatment',
        description: 'Glättung & Pflege',
        variants: [
          { id: 'v13', label: 'Kurz', price: 120, sortOrder: 0 },
          { id: 'v14', label: 'Mittel', price: 180, sortOrder: 1 },
          { id: 'v15', label: 'Lang', price: 240, sortOrder: 2 },
        ],
      }),
      createBlock('FOOTER', 12, {
        footerText: 'Preise zzgl. Produkte bei besonders langen Haaren',
        textAlign: 'center',
      }),
    ],
  },

  // TEMPLATE: Haarlängen Minimal
  {
    id: 'hair-length-minimal',
    name: 'Nach Haarlänge – Minimal',
    description: 'Reduziert auf das Wesentliche',
    category: 'minimal',
    theme: 'minimal',
    fontFamily: 'inter',
    columns: 1,
    previewColor: '#ffffff',
    pricingModel: 'BY_HAIR_LENGTH',
    blocks: [
      createBlock('SECTION_HEADER', 0, {
        title: 'Damen',
      }),
      createBlock('PRICE_ITEM', 1, {
        itemName: 'Schnitt komplett',
        variants: [
          { id: 'v1', label: 'Kurz', price: 40, sortOrder: 0 },
          { id: 'v2', label: 'Mittel', price: 50, sortOrder: 1 },
          { id: 'v3', label: 'Lang', price: 60, sortOrder: 2 },
        ],
      }),
      createBlock('PRICE_ITEM', 2, {
        itemName: 'Färben',
        variants: [
          { id: 'v4', label: 'Kurz', price: 50, sortOrder: 0 },
          { id: 'v5', label: 'Mittel', price: 65, sortOrder: 1 },
          { id: 'v6', label: 'Lang', price: 80, sortOrder: 2 },
        ],
      }),
      createBlock('PRICE_ITEM', 3, {
        itemName: 'Strähnen',
        variants: [
          { id: 'v7', label: 'Kurz', price: 60, sortOrder: 0 },
          { id: 'v8', label: 'Mittel', price: 80, sortOrder: 1 },
          { id: 'v9', label: 'Lang', price: 100, sortOrder: 2 },
        ],
      }),
      createBlock('SPACER', 4, { spacerSize: 'MEDIUM' }),
      createBlock('SECTION_HEADER', 5, {
        title: 'Herren',
      }),
      createBlock('PRICE_ITEM', 6, {
        itemName: 'Herrenschnitt',
        price: 28,
      }),
      createBlock('PRICE_ITEM', 7, {
        itemName: 'Maschinenschnitt',
        price: 18,
      }),
    ],
  },

  // ========================================
  // BY_CATEGORY TEMPLATES (Varianten nach Kategorien)
  // ========================================

  // TEMPLATE: Nach Kategorien
  {
    id: 'by-category',
    name: 'Nach Kategorien',
    description: 'Preise nach Damen/Herren/Kinder',
    category: 'modern',
    theme: 'modern',
    fontFamily: 'spaceGrotesk',
    columns: 1,
    previewColor: '#f5f5f5',
    pricingModel: 'BY_CATEGORY',
    blocks: [
      createBlock('SECTION_HEADER', 0, {
        title: 'Haarschnitte',
        subtitle: 'Waschen, Schneiden, Föhnen',
      }),
      createBlock('PRICE_ITEM', 1, {
        itemName: 'Komplettschnitt',
        variants: [
          { id: 'v1', label: 'Damen', price: 48, sortOrder: 0 },
          { id: 'v2', label: 'Herren', price: 32, sortOrder: 1 },
          { id: 'v3', label: 'Kinder', price: 22, sortOrder: 2 },
        ],
      }),
      createBlock('PRICE_ITEM', 2, {
        itemName: 'Nur Schneiden',
        variants: [
          { id: 'v4', label: 'Damen', price: 35, sortOrder: 0 },
          { id: 'v5', label: 'Herren', price: 25, sortOrder: 1 },
          { id: 'v6', label: 'Kinder', price: 15, sortOrder: 2 },
        ],
      }),
      createBlock('PRICE_ITEM', 3, {
        itemName: 'Maschinenschnitt',
        price: 18,
      }),
      createBlock('SPACER', 4, { spacerSize: 'MEDIUM' }),
      createBlock('SECTION_HEADER', 5, {
        title: 'Coloration',
      }),
      createBlock('PRICE_ITEM', 6, {
        itemName: 'Ansatzfarbe',
        price: 35,
      }),
      createBlock('PRICE_ITEM', 7, {
        itemName: 'Komplettfarbe',
        price: 55,
        priceType: 'FROM',
      }),
    ],
  },

  // ========================================
  // UNIVERSAL TEMPLATES (für alle Modelle)
  // ========================================

  // TEMPLATE: Leer/Blank
  {
    id: 'blank',
    name: 'Leer starten',
    description: 'Starte mit einer leeren Preisliste',
    category: 'minimal',
    theme: 'minimal',
    fontFamily: 'inter',
    columns: 1,
    previewColor: '#ffffff',
    pricingModel: 'ALL',
    blocks: [],
  },
]

// Kategorie Labels für Filter
export const CATEGORY_LABELS: Record<PriceListTemplate['category'], string> = {
  minimal: 'Minimalistisch',
  elegant: 'Elegant',
  modern: 'Modern',
  classic: 'Klassisch',
  bold: 'Markant',
  spa: 'Wellness',
}

// Preismodell Labels
export const PRICING_MODEL_LABELS: Record<PricingModel | 'ALL', string> = {
  FIXED_PRICE: 'Festpreise',
  BY_HAIR_LENGTH: 'Nach Haarlänge',
  BY_CATEGORY: 'Nach Kategorie',
  BY_GENDER: 'Nach Geschlecht',
  ALL: 'Alle Modelle',
}

// Helper: Templates nach Preismodell filtern
export function getTemplatesForPricingModel(pricingModel: PricingModel): PriceListTemplate[] {
  return PRICELIST_TEMPLATES.filter(
    template => template.pricingModel === pricingModel || template.pricingModel === 'ALL'
  )
}
