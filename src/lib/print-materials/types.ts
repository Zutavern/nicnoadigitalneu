// Print Materials Types - Spiegelt Prisma Schema
import type {
  PrintMaterial as PrismaPrintMaterial,
  PrintBlock as PrismaPrintBlock,
  PrintMaterialType,
  PrintSide,
  PrintBlockType,
} from '@prisma/client'

// Re-export Prisma enums
export type { PrintMaterialType, PrintSide, PrintBlockType }

// ============================================
// Client-side Types (für Editor-State)
// ============================================

export interface PrintBlockClient {
  id: string
  printMaterialId: string
  side: PrintSide
  sortOrder: number
  type: PrintBlockType

  // Position & Größe in mm
  x: number
  y: number
  width: number
  height: number
  rotation: number

  // Gemeinsame Eigenschaften
  content?: string | null
  textAlign: 'left' | 'center' | 'right'
  fontSize: number
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold'
  color: string

  // Bild/Logo
  imageUrl?: string | null
  objectFit: 'contain' | 'cover' | 'fill'
  borderRadius: number

  // QR-Code
  qrCodeUrl?: string | null
  qrCodeLabel?: string | null
  qrCodeSize: number

  // Kontakt
  showPhone: boolean
  showEmail: boolean
  showAddress: boolean
  showWebsite: boolean

  // Layout
  spacing: number

  // Editor State
  isNew?: boolean
  isSelected?: boolean
  isDragging?: boolean
}

export interface PrintMaterialClient {
  id: string
  userId: string
  name: string
  type: PrintMaterialType

  // Größe
  width: number
  height: number
  bleed: number

  // Theming
  theme: string
  fontFamily: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string

  // Hintergrund
  frontBackgroundUrl?: string | null
  backBackgroundUrl?: string | null

  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  blocks: PrintBlockClient[]
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreatePrintMaterialRequest {
  name: string
  type?: PrintMaterialType
  width?: number
  height?: number
  bleed?: number
  theme?: string
  fontFamily?: string
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  frontBackgroundUrl?: string
  backBackgroundUrl?: string
}

export interface UpdatePrintMaterialRequest {
  name?: string
  type?: PrintMaterialType
  width?: number
  height?: number
  bleed?: number
  theme?: string
  fontFamily?: string
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  frontBackgroundUrl?: string | null
  backBackgroundUrl?: string | null
  isPublished?: boolean
}

export interface CreateBlockRequest {
  side?: PrintSide
  type: PrintBlockType
  sortOrder?: number
  x?: number
  y?: number
  width?: number
  height?: number
  rotation?: number
  content?: string
  textAlign?: 'left' | 'center' | 'right'
  fontSize?: number
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: string
  imageUrl?: string
  objectFit?: 'contain' | 'cover' | 'fill'
  borderRadius?: number
  qrCodeUrl?: string
  qrCodeLabel?: string
  qrCodeSize?: number
  showPhone?: boolean
  showEmail?: boolean
  showAddress?: boolean
  showWebsite?: boolean
  spacing?: number
}

export interface UpdateBlockRequest extends Partial<CreateBlockRequest> {
  id: string
}

// ============================================
// Material-Typ Konfiguration
// ============================================

export interface MaterialTypeConfig {
  type: PrintMaterialType
  label: string
  description: string
  icon: string
  width: number // Standard in mm
  height: number // Standard in mm
  hasTwoSides: boolean
}

export const MATERIAL_TYPE_CONFIGS: Record<PrintMaterialType, MaterialTypeConfig> = {
  BUSINESS_CARD: {
    type: 'BUSINESS_CARD',
    label: 'Visitenkarte',
    description: 'Standard-Visitenkarte 89 × 59 mm',
    icon: 'CreditCard',
    width: 89,
    height: 59,
    hasTwoSides: true,
  },
  BUSINESS_CARD_SQUARE: {
    type: 'BUSINESS_CARD_SQUARE',
    label: 'Visitenkarte Quadrat',
    description: 'Quadratische Visitenkarte 55 × 55 mm',
    icon: 'Square',
    width: 55,
    height: 55,
    hasTwoSides: true,
  },
  FLYER_A6: {
    type: 'FLYER_A6',
    label: 'Flyer A6',
    description: 'DIN A6 Flyer 105 × 148 mm',
    icon: 'FileText',
    width: 105,
    height: 148,
    hasTwoSides: true,
  },
  FLYER_A5: {
    type: 'FLYER_A5',
    label: 'Flyer A5',
    description: 'DIN A5 Flyer 148 × 210 mm',
    icon: 'File',
    width: 148,
    height: 210,
    hasTwoSides: true,
  },
  POSTCARD: {
    type: 'POSTCARD',
    label: 'Postkarte',
    description: 'Postkarte 148 × 105 mm',
    icon: 'Mail',
    width: 148,
    height: 105,
    hasTwoSides: true,
  },
  GIFT_CARD: {
    type: 'GIFT_CARD',
    label: 'Geschenkkarte',
    description: 'Geschenkkarte 85 × 55 mm',
    icon: 'Gift',
    width: 85,
    height: 55,
    hasTwoSides: true,
  },
}

// ============================================
// Block-Typ Konfiguration
// ============================================

export interface BlockTypeConfig {
  type: PrintBlockType
  label: string
  description: string
  icon: string
  defaultWidth: number // in mm
  defaultHeight: number // in mm
}

export const BLOCK_TYPE_CONFIGS: Record<PrintBlockType, BlockTypeConfig> = {
  TEXT: {
    type: 'TEXT',
    label: 'Text',
    description: 'Freier Textblock',
    icon: 'Type',
    defaultWidth: 40,
    defaultHeight: 8,
  },
  NAME: {
    type: 'NAME',
    label: 'Name',
    description: 'Name oder Firmenname',
    icon: 'User',
    defaultWidth: 50,
    defaultHeight: 10,
  },
  TAGLINE: {
    type: 'TAGLINE',
    label: 'Slogan',
    description: 'Slogan oder Untertitel',
    icon: 'Quote',
    defaultWidth: 50,
    defaultHeight: 6,
  },
  LOGO: {
    type: 'LOGO',
    label: 'Logo',
    description: 'Logo aus Brand oder hochgeladen',
    icon: 'Image',
    defaultWidth: 20,
    defaultHeight: 20,
  },
  QR_CODE: {
    type: 'QR_CODE',
    label: 'QR-Code',
    description: 'QR-Code für Website oder Booking',
    icon: 'QrCode',
    defaultWidth: 15,
    defaultHeight: 15,
  },
  CONTACT_INFO: {
    type: 'CONTACT_INFO',
    label: 'Kontakt',
    description: 'Telefon, E-Mail, Adresse',
    icon: 'Contact',
    defaultWidth: 45,
    defaultHeight: 20,
  },
  IMAGE: {
    type: 'IMAGE',
    label: 'Bild',
    description: 'Bild oder Grafik',
    icon: 'ImageIcon',
    defaultWidth: 30,
    defaultHeight: 20,
  },
  SHAPE: {
    type: 'SHAPE',
    label: 'Form',
    description: 'Linie, Rechteck oder Kreis',
    icon: 'Shapes',
    defaultWidth: 30,
    defaultHeight: 2,
  },
  SOCIAL_LINKS: {
    type: 'SOCIAL_LINKS',
    label: 'Social Media',
    description: 'Social Media Icons',
    icon: 'Share2',
    defaultWidth: 40,
    defaultHeight: 8,
  },
}

// ============================================
// Theme Konfiguration
// ============================================

export interface ThemeConfig {
  id: string
  name: string
  description: string
  preview: string // Thumbnail URL oder Gradient
  fontFamily: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
}

export const THEME_CONFIGS: ThemeConfig[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Schlicht und elegant',
    preview: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    fontFamily: 'inter',
    primaryColor: '#000000',
    secondaryColor: '#666666',
    backgroundColor: '#ffffff',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Zeitgemäß und professionell',
    preview: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    fontFamily: 'space-grotesk',
    primaryColor: '#ffffff',
    secondaryColor: '#a0a0a0',
    backgroundColor: '#1a1a2e',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Klassisch und edel',
    preview: 'linear-gradient(135deg, #f8f4f0 0%, #e8e4e0 100%)',
    fontFamily: 'playfair',
    primaryColor: '#2c2c2c',
    secondaryColor: '#8b7355',
    backgroundColor: '#f8f4f0',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Auffällig und mutig',
    preview: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
    fontFamily: 'poppins',
    primaryColor: '#ffffff',
    secondaryColor: '#fff5f5',
    backgroundColor: '#ff6b6b',
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Natürlich und organisch',
    preview: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    fontFamily: 'quicksand',
    primaryColor: '#2e7d32',
    secondaryColor: '#558b2f',
    backgroundColor: '#e8f5e9',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Luxuriös und exklusiv',
    preview: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)',
    fontFamily: 'cormorant',
    primaryColor: '#d4af37',
    secondaryColor: '#b8860b',
    backgroundColor: '#0d0d0d',
  },
]

// ============================================
// Font Konfiguration
// ============================================

export interface FontConfig {
  id: string
  name: string
  family: string
  weights: number[]
}

export const FONT_CONFIGS: FontConfig[] = [
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif', weights: [400, 500, 600, 700] },
  { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif', weights: [400, 500, 600, 700] },
  { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display, serif', weights: [400, 500, 600, 700] },
  { id: 'space-grotesk', name: 'Space Grotesk', family: 'Space Grotesk, sans-serif', weights: [400, 500, 600, 700] },
  { id: 'quicksand', name: 'Quicksand', family: 'Quicksand, sans-serif', weights: [400, 500, 600, 700] },
  { id: 'cormorant', name: 'Cormorant Garamond', family: 'Cormorant Garamond, serif', weights: [400, 500, 600, 700] },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif', weights: [400, 500, 600, 700] },
  { id: 'raleway', name: 'Raleway', family: 'Raleway, sans-serif', weights: [400, 500, 600, 700] },
]

// ============================================
// Bleed Konfiguration
// ============================================

export const BLEED_OPTIONS = [
  { value: 1, label: '1 mm Beschnitt', description: 'Für einfache Designs' },
  { value: 3, label: '3 mm Beschnitt', description: 'Standard für Druckereien' },
]

// ============================================
// Utility Functions
// ============================================

/**
 * Konvertiert mm zu Pixel (96 DPI)
 */
export function mmToPixel(mm: number, dpi: number = 96): number {
  return (mm / 25.4) * dpi
}

/**
 * Konvertiert Pixel zu mm
 */
export function pixelToMm(pixel: number, dpi: number = 96): number {
  return (pixel / dpi) * 25.4
}

/**
 * Erstellt einen neuen Block mit Standardwerten
 */
export function createNewBlock(
  type: PrintBlockType,
  printMaterialId: string,
  side: PrintSide,
  sortOrder: number,
  material: PrintMaterialClient
): PrintBlockClient {
  const config = BLOCK_TYPE_CONFIGS[type]
  const safeWidth = material.width - (material.bleed * 2)
  const safeHeight = material.height - (material.bleed * 2)

  // Zentriere den Block im sicheren Bereich
  const centerX = (safeWidth - config.defaultWidth) / 2
  const centerY = (safeHeight - config.defaultHeight) / 2

  return {
    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    printMaterialId,
    side,
    sortOrder,
    type,
    x: Math.max(0, centerX),
    y: Math.max(0, centerY),
    width: Math.min(config.defaultWidth, safeWidth),
    height: Math.min(config.defaultHeight, safeHeight),
    rotation: 0,
    textAlign: 'center',
    fontSize: type === 'NAME' ? 14 : type === 'TAGLINE' ? 8 : 10,
    fontWeight: type === 'NAME' ? 'bold' : 'normal',
    color: material.primaryColor,
    objectFit: 'contain',
    borderRadius: 0,
    qrCodeSize: 15,
    showPhone: true,
    showEmail: true,
    showAddress: true,
    showWebsite: false,
    spacing: 2,
    isNew: true,
  }
}

/**
 * Gibt die Safe-Zone (sicherer Bereich ohne Beschnitt) zurück
 */
export function getSafeZone(material: PrintMaterialClient) {
  return {
    x: material.bleed,
    y: material.bleed,
    width: material.width - (material.bleed * 2),
    height: material.height - (material.bleed * 2),
  }
}

/**
 * Prüft, ob ein Block innerhalb der Safe-Zone liegt
 */
export function isBlockInSafeZone(block: PrintBlockClient, material: PrintMaterialClient): boolean {
  const safeZone = getSafeZone(material)
  return (
    block.x >= 0 &&
    block.y >= 0 &&
    block.x + block.width <= safeZone.width &&
    block.y + block.height <= safeZone.height
  )
}

/**
 * Beschränkt Block-Position auf Safe-Zone
 */
export function constrainToSafeZone(
  block: PrintBlockClient,
  material: PrintMaterialClient
): PrintBlockClient {
  const safeZone = getSafeZone(material)
  return {
    ...block,
    x: Math.max(0, Math.min(block.x, safeZone.width - block.width)),
    y: Math.max(0, Math.min(block.y, safeZone.height - block.height)),
    width: Math.min(block.width, safeZone.width),
    height: Math.min(block.height, safeZone.height),
  }
}

