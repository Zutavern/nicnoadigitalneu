/**
 * Credit-Pricing für verschiedene AI-Features
 * 
 * Preise sind so kalkuliert, dass sie die tatsächlichen API-Kosten
 * plus eine kleine Marge abdecken.
 */

// Credit-Preise pro Feature
export const CREDIT_PRICING = {
  // Text-Generierung (OpenRouter)
  text_generation: {
    name: 'Text-Generierung',
    description: 'KI-generierter Text für Posts, Beschreibungen etc.',
    creditsPerUnit: 1,
    unit: '1K Tokens',
    // Basiert auf ~$0.001/1K Tokens (GPT-4o-mini)
  },
  
  // Übersetzung
  translation: {
    name: 'Übersetzung',
    description: 'Automatische Übersetzung von Texten',
    creditsPerUnit: 0.5,
    unit: '1K Zeichen',
  },
  
  // Bild-Generierung (OpenRouter/Replicate)
  image_generation: {
    name: 'Bild-Generierung',
    description: 'KI-generierte Bilder für Social Media',
    creditsPerUnit: 5,
    unit: 'Bild',
    // Basiert auf ~$0.02-0.05/Bild
  },
  
  // Video-Generierung (Replicate)
  video_generation: {
    name: 'Video-Generierung',
    description: 'KI-generierte Videos für Social Media',
    creditsPerUnit: 50,
    unit: '10s Video',
    // Basiert auf ~$0.25-0.40/Video
  },
  
  // Hashtag-Vorschläge
  hashtag_suggestions: {
    name: 'Hashtag-Vorschläge',
    description: 'KI-generierte Hashtag-Empfehlungen',
    creditsPerUnit: 0.5,
    unit: 'Anfrage',
  },
  
  // Content-Verbesserung
  content_improvement: {
    name: 'Content-Verbesserung',
    description: 'KI-basierte Textoptimierung',
    creditsPerUnit: 1,
    unit: 'Anfrage',
  },
  
  // Social Media Post (kombiniert)
  social_post: {
    name: 'Social Media Post',
    description: 'Vollständiger Post mit Text-Generierung',
    creditsPerUnit: 2,
    unit: 'Post',
  },
} as const

export type CreditFeature = keyof typeof CREDIT_PRICING

/**
 * Berechnet die Credits für ein Feature basierend auf der Nutzung
 */
export function calculateCredits(
  feature: CreditFeature,
  quantity: number = 1
): number {
  const pricing = CREDIT_PRICING[feature]
  if (!pricing) {
    console.warn(`Unknown feature for credit calculation: ${feature}`)
    return 0
  }
  return pricing.creditsPerUnit * quantity
}

/**
 * Berechnet Credits basierend auf Token-Nutzung
 */
export function calculateCreditsFromTokens(tokens: number): number {
  // 1 Credit pro 1000 Tokens
  return Math.ceil(tokens / 1000) * CREDIT_PRICING.text_generation.creditsPerUnit
}

/**
 * Berechnet Credits basierend auf USD-Kosten
 * Konvertiert USD zu Credits mit einem Faktor
 */
export function calculateCreditsFromUsd(costUsd: number): number {
  // 1 USD = ~100 Credits (anpassbar)
  const USD_TO_CREDITS_RATE = 100
  return Math.ceil(costUsd * USD_TO_CREDITS_RATE * 100) / 100
}

/**
 * Gibt die Credit-Preise für die UI zurück
 */
export function getCreditPricingInfo() {
  return Object.entries(CREDIT_PRICING).map(([key, value]) => ({
    id: key,
    ...value,
  }))
}

// Euro-Preis pro Credit (für Anzeige)
export const CREDIT_VALUE_EUR = 0.01 // 1 Credit = 1 Cent

/**
 * Konvertiert Credits zu Euro
 */
export function creditsToEur(credits: number): number {
  return Math.round(credits * CREDIT_VALUE_EUR * 100) / 100
}

/**
 * Konvertiert Euro zu Credits
 */
export function eurToCredits(eur: number): number {
  return Math.round(eur / CREDIT_VALUE_EUR)
}

