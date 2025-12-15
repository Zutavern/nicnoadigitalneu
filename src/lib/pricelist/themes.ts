// Pricelist Themes - Elegant Classic & Modern Minimal

export interface PriceListTheme {
  id: string
  name: string
  description: string
  preview: string // Vorschau-Bild oder Gradient
  
  // Typography
  headerFont: string
  bodyFont: string
  
  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  mutedColor: string
  backgroundColor: string
  dividerColor: string
  
  // Layout
  borderRadius: string
  headerSize: string
  subHeaderSize: string
  priceSize: string
  bodySize: string
  
  // Styles
  headerWeight: string
  headerTransform: 'uppercase' | 'capitalize' | 'none'
  letterSpacing: string
  lineHeight: string
  
  // Decorations
  sectionUnderline: boolean
  priceAlignment: 'right' | 'left' | 'dotted' // dotted = mit Punkten zwischen Name und Preis
  infoBoxStyle: 'bordered' | 'filled' | 'subtle'
}

export const THEMES: Record<string, PriceListTheme> = {
  elegant: {
    id: 'elegant',
    name: 'Elegant Classic',
    description: 'Zeitlos elegant mit Serifenschrift und goldenen Akzenten',
    preview: 'linear-gradient(135deg, #f8f6f3 0%, #e8e4de 100%)',
    
    // Typography
    headerFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Cormorant Garamond", Georgia, serif',
    
    // Colors
    primaryColor: '#1a1a1a',
    secondaryColor: '#4a4a4a',
    accentColor: '#C9A961', // Gold
    textColor: '#2d2d2d',
    mutedColor: '#8a8a8a',
    backgroundColor: 'transparent',
    dividerColor: '#C9A961',
    
    // Layout
    borderRadius: '0px',
    headerSize: '1.75rem',
    subHeaderSize: '1rem',
    priceSize: '1rem',
    bodySize: '0.9rem',
    
    // Styles
    headerWeight: '600',
    headerTransform: 'uppercase',
    letterSpacing: '0.15em',
    lineHeight: '1.6',
    
    // Decorations
    sectionUnderline: true,
    priceAlignment: 'dotted',
    infoBoxStyle: 'bordered',
  },
  
  modern: {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Clean und modern mit starkem Kontrast',
    preview: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    
    // Typography
    headerFont: '"Space Grotesk", "Inter", system-ui, sans-serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    
    // Colors
    primaryColor: '#0a0a0a',
    secondaryColor: '#525252',
    accentColor: '#0a0a0a',
    textColor: '#171717',
    mutedColor: '#a3a3a3',
    backgroundColor: 'transparent',
    dividerColor: '#e5e5e5',
    
    // Layout
    borderRadius: '8px',
    headerSize: '1.5rem',
    subHeaderSize: '0.9rem',
    priceSize: '1rem',
    bodySize: '0.875rem',
    
    // Styles
    headerWeight: '700',
    headerTransform: 'none',
    letterSpacing: '-0.01em',
    lineHeight: '1.5',
    
    // Decorations
    sectionUnderline: false,
    priceAlignment: 'right',
    infoBoxStyle: 'filled',
  },
}

export const DEFAULT_THEME = 'elegant'

export function getTheme(themeId: string): PriceListTheme {
  return THEMES[themeId] || THEMES[DEFAULT_THEME]
}

export function getThemeCSS(theme: PriceListTheme): string {
  return `
    --pl-header-font: ${theme.headerFont};
    --pl-body-font: ${theme.bodyFont};
    --pl-primary: ${theme.primaryColor};
    --pl-secondary: ${theme.secondaryColor};
    --pl-accent: ${theme.accentColor};
    --pl-text: ${theme.textColor};
    --pl-muted: ${theme.mutedColor};
    --pl-bg: ${theme.backgroundColor};
    --pl-divider: ${theme.dividerColor};
    --pl-radius: ${theme.borderRadius};
    --pl-header-size: ${theme.headerSize};
    --pl-subheader-size: ${theme.subHeaderSize};
    --pl-price-size: ${theme.priceSize};
    --pl-body-size: ${theme.bodySize};
    --pl-header-weight: ${theme.headerWeight};
    --pl-header-transform: ${theme.headerTransform};
    --pl-letter-spacing: ${theme.letterSpacing};
    --pl-line-height: ${theme.lineHeight};
  `
}

// Theme-Auswahl Optionen
export const THEME_OPTIONS = Object.values(THEMES).map(theme => ({
  value: theme.id,
  label: theme.name,
  description: theme.description,
  preview: theme.preview,
}))


