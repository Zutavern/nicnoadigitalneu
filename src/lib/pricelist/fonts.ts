// Pricelist Fonts - Verfügbare Schriftarten

export interface FontOption {
  id: string
  name: string
  family: string
  category: 'serif' | 'sans-serif' | 'display'
  googleFont?: string // Google Fonts Name für Import
  weights: number[]
  preview: string // Beispieltext in dieser Schrift
}

export const FONTS: Record<string, FontOption> = {
  playfair: {
    id: 'playfair',
    name: 'Playfair Display',
    family: '"Playfair Display", Georgia, serif',
    category: 'serif',
    googleFont: 'Playfair+Display:wght@400;500;600;700',
    weights: [400, 500, 600, 700],
    preview: 'Eleganz & Stil',
  },
  cormorant: {
    id: 'cormorant',
    name: 'Cormorant Garamond',
    family: '"Cormorant Garamond", Georgia, serif',
    category: 'serif',
    googleFont: 'Cormorant+Garamond:wght@400;500;600;700',
    weights: [400, 500, 600, 700],
    preview: 'Klassisch & Zeitlos',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Pro',
    family: '"Crimson Pro", Georgia, serif',
    category: 'serif',
    googleFont: 'Crimson+Pro:wght@400;500;600;700',
    weights: [400, 500, 600, 700],
    preview: 'Traditionell & Edel',
  },
  inter: {
    id: 'inter',
    name: 'Inter',
    family: '"Inter", system-ui, sans-serif',
    category: 'sans-serif',
    googleFont: 'Inter:wght@400;500;600;700',
    weights: [400, 500, 600, 700],
    preview: 'Modern & Clean',
  },
  spaceGrotesk: {
    id: 'spaceGrotesk',
    name: 'Space Grotesk',
    family: '"Space Grotesk", system-ui, sans-serif',
    category: 'sans-serif',
    googleFont: 'Space+Grotesk:wght@400;500;600;700',
    weights: [400, 500, 600, 700],
    preview: 'Contemporary',
  },
  montserrat: {
    id: 'montserrat',
    name: 'Montserrat',
    family: '"Montserrat", system-ui, sans-serif',
    category: 'sans-serif',
    googleFont: 'Montserrat:wght@400;500;600;700',
    weights: [400, 500, 600, 700],
    preview: 'Vielseitig & Klar',
  },
  raleway: {
    id: 'raleway',
    name: 'Raleway',
    family: '"Raleway", system-ui, sans-serif',
    category: 'sans-serif',
    googleFont: 'Raleway:wght@400;500;600;700',
    weights: [400, 500, 600, 700],
    preview: 'Elegant Sans',
  },
  dmSans: {
    id: 'dmSans',
    name: 'DM Sans',
    family: '"DM Sans", system-ui, sans-serif',
    category: 'sans-serif',
    googleFont: 'DM+Sans:wght@400;500;600;700',
    weights: [400, 500, 600, 700],
    preview: 'Freundlich & Modern',
  },
}

export const DEFAULT_FONT = 'playfair'

export function getFont(fontId: string): FontOption {
  return FONTS[fontId] || FONTS[DEFAULT_FONT]
}

export function getFontFamily(fontId: string): string {
  return getFont(fontId).family
}

// Gruppierte Font-Optionen für die Auswahl
export const FONT_OPTIONS_GROUPED = {
  serif: Object.values(FONTS)
    .filter(f => f.category === 'serif')
    .map(f => ({ value: f.id, label: f.name, preview: f.preview })),
  'sans-serif': Object.values(FONTS)
    .filter(f => f.category === 'sans-serif')
    .map(f => ({ value: f.id, label: f.name, preview: f.preview })),
}

export const FONT_OPTIONS = Object.values(FONTS).map(f => ({
  value: f.id,
  label: f.name,
  preview: f.preview,
  category: f.category,
}))

// Google Fonts URL für alle Schriften generieren
export function getGoogleFontsUrl(fontIds: string[]): string {
  const fonts = fontIds
    .map(id => FONTS[id])
    .filter(Boolean)
    .filter(f => f.googleFont)
    .map(f => f.googleFont)
  
  if (fonts.length === 0) return ''
  
  return `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f}`).join('&')}&display=swap`
}

// Standard Google Fonts URL mit allen wichtigen Schriften
export const DEFAULT_GOOGLE_FONTS_URL = getGoogleFontsUrl([
  'playfair',
  'cormorant',
  'inter',
  'spaceGrotesk',
  'montserrat',
])


