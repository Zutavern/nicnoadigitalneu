// Homepage Builder - TypeScript Types

import type {
  HomepageTemplate,
  HomepagePageConfig,
  HomepageDesignStyle,
  HomepageStatus,
} from '@prisma/client'

// Re-export Prisma enums for convenience
export type {
  HomepageTemplate,
  HomepagePageConfig,
  HomepageDesignStyle,
  HomepageStatus,
}

/**
 * Kontaktdaten für die Homepage
 */
export interface HomepageContactData {
  // Allgemein
  name: string
  email: string
  phone: string
  
  // Adresse
  street: string
  city: string
  zipCode: string
  country: string
  
  // Für Salons
  salonName?: string
  openingHours?: OpeningHours
  
  // Social Media
  instagram?: string
  facebook?: string
  tiktok?: string
  website?: string
}

/**
 * Öffnungszeiten
 */
export interface OpeningHours {
  monday?: DayHours
  tuesday?: DayHours
  wednesday?: DayHours
  thursday?: DayHours
  friday?: DayHours
  saturday?: DayHours
  sunday?: DayHours
}

export interface DayHours {
  open: string  // z.B. "09:00"
  close: string // z.B. "18:00"
  closed?: boolean
}

/**
 * Einzelne Seite im Homepage-Projekt
 */
export interface HomepagePage {
  id: string
  slug: string          // z.B. "home", "about", "contact"
  title: string         // z.B. "Startseite", "Über mich", "Kontakt"
  description?: string  // SEO Description
  
  // V0-generierter Content
  generatedCode?: string
  generatedAt?: string  // ISO Date
  
  // V0 URLs
  v0DemoUrl?: string    // Preview URL für die generierte Komponente
  v0WebUrl?: string     // URL zum Bearbeiten in V0
  v0ChatId?: string     // Chat ID für weitere Prompts
  
  // Status
  isGenerated: boolean
  isEditing: boolean
  
  // Sortierung
  sortOrder: number
}

/**
 * Homepage-Projekt (Client-seitig)
 */
export interface HomepageProjectClient {
  id: string
  userId: string
  name: string
  slug: string
  
  // Konfiguration
  templateType: HomepageTemplate
  pageConfig: HomepagePageConfig
  designStyle: HomepageDesignStyle
  
  // Kontaktdaten
  contactData: HomepageContactData | null
  
  // V0
  v0GenerationId: string | null
  v0Error: string | null
  
  // Seiten
  pages: HomepagePage[]
  
  // Branding
  brandingColor: string | null
  brandingLogoUrl: string | null
  fontHeading: string | null
  fontBody: string | null
  
  // Status
  status: HomepageStatus
  isPublished: boolean
  publishedAt: string | null
  publishedUrl: string | null
  
  // Analytics
  viewCount: number
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Wizard-Schritt Typen
 */
export type WizardStep = 
  | 'project-name'
  | 'contact-data'
  | 'page-config'
  | 'design-style'
  | 'review'

export interface WizardState {
  currentStep: WizardStep
  projectName: string
  slug: string
  templateType: HomepageTemplate | null
  pageConfig: HomepagePageConfig | null
  designStyle: HomepageDesignStyle | null
  contactData: HomepageContactData | null
  brandingColor: string
  brandingLogoUrl: string | null
}

/**
 * API Request/Response Types
 */
export interface CreateHomepageRequest {
  name: string
  slug: string
  templateType: HomepageTemplate
  pageConfig: HomepagePageConfig
  designStyle: HomepageDesignStyle
  contactData: HomepageContactData
  brandingColor?: string
  brandingLogoUrl?: string
}

export interface UpdateHomepageRequest {
  name?: string
  contactData?: HomepageContactData
  brandingColor?: string
  brandingLogoUrl?: string
  fontHeading?: string
  fontBody?: string
}

export interface GeneratePageRequest {
  pageSlug: string
  customPrompt?: string
}

export interface PublishRequest {
  customDomain?: string
}

/**
 * V0 API Types
 */
export interface V0GenerateRequest {
  prompt: string
  framework: 'nextjs' | 'react'
  styling: 'tailwind' | 'css'
}

export interface V0GenerateResponse {
  id: string
  code: string
  status: 'success' | 'error'
  error?: string
}

