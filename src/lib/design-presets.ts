/**
 * Design-System Presets
 * 
 * Definiert alle verfügbaren Farbschemen für die Anwendung.
 * Jedes Preset enthält alle notwendigen Farbtokens in HSL-Format.
 */

export interface DesignTokens {
  // Brand Colors
  brand: {
    primary: string       // Hauptfarbe (HSL ohne hsl())
    secondary: string     // Sekundärfarbe
    accent: string        // Akzentfarbe (CTAs)
  }
  // Gradient Colors
  gradient: {
    from: string          // Start
    via: string           // Mitte
    to: string            // Ende
  }
  // Glow/Animation Colors
  glow: {
    primary: string       // Primärer Leuchteffekt
    secondary: string     // Sekundärer Leuchteffekt
  }
  // Surface Colors
  surface: {
    background: string    // Hintergrund
    card: string          // Karten-Hintergrund
    muted: string         // Gedämpfter Hintergrund
    warm: string          // Warmer Hintergrund (für Marketing)
  }
  // Text Colors (für Kontrast)
  text: {
    onPrimary: string     // Text auf Primary
    onSecondary: string   // Text auf Secondary
    onAccent: string      // Text auf Accent
  }
  // Animation/Particle Colors
  animation: {
    particle: string      // Partikelfarbe
    orbit: string         // Orbit-Effekte
    pulse: string         // Puls-Effekte
  }
  // Typography Settings
  typography: {
    fontFamily: string        // Schriftfamilie (z.B. 'Inter', 'Geist')
    fontFamilyHeading: string // Überschriften-Schrift
    baseSize: string          // Basis-Schriftgröße (z.B. '16px')
    lineHeight: string        // Standard-Zeilenhöhe (z.B. '1.5')
    letterSpacing: string     // Standard-Zeichenabstand (z.B. '-0.02em')
  }
  // Radius Settings
  radius: {
    sm: string                // Kleiner Radius (z.B. '0.25rem')
    md: string                // Mittlerer Radius (z.B. '0.5rem')
    lg: string                // Großer Radius (z.B. '0.75rem')
    xl: string                // Extra großer Radius (z.B. '1rem')
    full: string              // Voller Radius (z.B. '9999px')
  }
  // Shadow Settings
  shadows: {
    sm: string                // Kleiner Schatten
    md: string                // Mittlerer Schatten
    lg: string                // Großer Schatten
    glow: string              // Leuchtschatten
  }
}

export interface DesignPreset {
  id: string
  name: string
  description: string
  tokens: DesignTokens
}

/**
 * NICNOA Classic - Das originale Farbschema
 * Olivgrün + Beige + Orange
 */
const nicnoaClassic: DesignPreset = {
  id: 'nicnoa-classic',
  name: 'NICNOA Classic',
  description: 'Das originale NICNOA Farbschema mit Olivgrün, Beige und Orange',
  tokens: {
    brand: {
      primary: '151 15% 43%',      // Olivgrün #6B7B5E
      secondary: '36 33% 94%',     // Beige #F5F0E8
      accent: '24 79% 56%',        // Orange #E87B35
    },
    gradient: {
      from: '151 25% 35%',         // Dunkleres Grün
      via: '80 20% 45%',           // Übergangsgrün
      to: '24 70% 50%',            // Orange
    },
    glow: {
      primary: '151 40% 50%',      // Grün-Glow
      secondary: '24 70% 55%',     // Orange-Glow
    },
    surface: {
      background: '36 20% 97%',    // Sehr helles Beige
      card: '36 25% 95%',          // Leicht warmes Weiß
      muted: '36 15% 92%',         // Gedämpftes Beige
      warm: '36 30% 95%',          // Warmes Beige
    },
    text: {
      onPrimary: '0 0% 100%',      // Weiß
      onSecondary: '151 20% 25%',  // Dunkles Grün
      onAccent: '0 0% 100%',       // Weiß
    },
    animation: {
      particle: '151 30% 60%',     // Helles Grün
      orbit: '24 60% 60%',         // Helles Orange
      pulse: '80 25% 55%',         // Gelbgrün
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontFamilyHeading: 'Inter, system-ui, sans-serif',
      baseSize: '16px',
      lineHeight: '1.6',
      letterSpacing: '-0.01em',
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      glow: '0 0 20px hsl(151 40% 50% / 0.3)',
    },
  },
}

/**
 * Modern Purple - Modernes Tech-Farbschema
 * Violett + Slate + Pink
 */
const modernPurple: DesignPreset = {
  id: 'modern-purple',
  name: 'Modern Purple',
  description: 'Modernes Tech-Farbschema mit Violett und Pink-Akzenten',
  tokens: {
    brand: {
      primary: '262 83% 58%',      // Violett #8B5CF6
      secondary: '210 40% 96%',    // Slate #F1F5F9
      accent: '330 81% 60%',       // Pink #EC4899
    },
    gradient: {
      from: '262 80% 55%',         // Violett
      via: '290 70% 55%',          // Magenta
      to: '330 80% 60%',           // Pink
    },
    glow: {
      primary: '262 80% 65%',      // Violett-Glow
      secondary: '330 75% 65%',    // Pink-Glow
    },
    surface: {
      background: '222 47% 11%',   // Slate-900
      card: '217 33% 17%',         // Slate-800
      muted: '215 25% 27%',        // Slate-700
      warm: '210 40% 96%',         // Slate-50
    },
    text: {
      onPrimary: '0 0% 100%',      // Weiß
      onSecondary: '222 47% 11%',  // Slate-900
      onAccent: '0 0% 100%',       // Weiß
    },
    animation: {
      particle: '262 60% 70%',     // Helles Violett
      orbit: '330 60% 70%',        // Helles Pink
      pulse: '290 50% 65%',        // Magenta
    },
    typography: {
      fontFamily: 'Geist, Inter, system-ui, sans-serif',
      fontFamilyHeading: 'Geist, Inter, system-ui, sans-serif',
      baseSize: '16px',
      lineHeight: '1.5',
      letterSpacing: '-0.02em',
    },
    radius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 8px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      lg: '0 12px 20px -5px rgb(0 0 0 / 0.4), 0 4px 8px -4px rgb(0 0 0 / 0.3)',
      glow: '0 0 30px hsl(262 80% 65% / 0.4)',
    },
  },
}

/**
 * Corporate Blue - Professionelles Business-Farbschema
 * Blau + Gray + Cyan
 */
const corporateBlue: DesignPreset = {
  id: 'corporate-blue',
  name: 'Corporate Blue',
  description: 'Professionelles Business-Farbschema mit Blau und Cyan',
  tokens: {
    brand: {
      primary: '217 91% 60%',      // Blau #3B82F6
      secondary: '210 20% 98%',    // Gray #F9FAFB
      accent: '188 95% 43%',       // Cyan #06B6D4
    },
    gradient: {
      from: '217 90% 55%',         // Blau
      via: '200 85% 50%',          // Sky
      to: '188 90% 45%',           // Cyan
    },
    glow: {
      primary: '217 85% 65%',      // Blau-Glow
      secondary: '188 85% 55%',    // Cyan-Glow
    },
    surface: {
      background: '210 20% 98%',   // Gray-50
      card: '0 0% 100%',           // Weiß
      muted: '210 18% 96%',        // Gray-100
      warm: '210 15% 97%',         // Neutrales Grau
    },
    text: {
      onPrimary: '0 0% 100%',      // Weiß
      onSecondary: '222 47% 11%',  // Slate-900
      onAccent: '0 0% 100%',       // Weiß
    },
    animation: {
      particle: '217 70% 70%',     // Helles Blau
      orbit: '188 70% 60%',        // Helles Cyan
      pulse: '200 60% 65%',        // Sky
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontFamilyHeading: 'Inter, system-ui, sans-serif',
      baseSize: '15px',
      lineHeight: '1.6',
      letterSpacing: '0',
    },
    radius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
      glow: '0 0 15px hsl(217 85% 65% / 0.25)',
    },
  },
}

/**
 * Emerald Fresh - Frisches Natur-Farbschema
 * Smaragd + Mint + Amber
 */
const emeraldFresh: DesignPreset = {
  id: 'emerald-fresh',
  name: 'Emerald Fresh',
  description: 'Frisches Natur-Farbschema mit Smaragd und Amber-Akzenten',
  tokens: {
    brand: {
      primary: '160 84% 39%',      // Smaragd #10B981
      secondary: '152 76% 95%',    // Mint #ECFDF5
      accent: '38 92% 50%',        // Amber #F59E0B
    },
    gradient: {
      from: '160 80% 40%',         // Smaragd
      via: '142 70% 45%',          // Grün
      to: '38 85% 50%',            // Amber
    },
    glow: {
      primary: '160 70% 50%',      // Smaragd-Glow
      secondary: '38 80% 55%',     // Amber-Glow
    },
    surface: {
      background: '152 50% 97%',   // Sehr helles Mint
      card: '152 40% 98%',         // Fast Weiß mit Mint
      muted: '152 30% 94%',        // Gedämpftes Mint
      warm: '152 35% 95%',         // Mint-Ton
    },
    text: {
      onPrimary: '0 0% 100%',      // Weiß
      onSecondary: '160 60% 25%',  // Dunkles Smaragd
      onAccent: '0 0% 100%',       // Weiß
    },
    animation: {
      particle: '160 50% 60%',     // Helles Smaragd
      orbit: '38 60% 60%',         // Helles Amber
      pulse: '142 45% 55%',        // Grün
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontFamilyHeading: 'Inter, system-ui, sans-serif',
      baseSize: '16px',
      lineHeight: '1.7',
      letterSpacing: '0',
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
      glow: '0 0 20px hsl(160 70% 50% / 0.3)',
    },
  },
}

/**
 * Midnight Elegance - Elegantes Dark-Mode Farbschema
 * Deep Blue + Gold + Silver
 */
const midnightElegance: DesignPreset = {
  id: 'midnight-elegance',
  name: 'Midnight Elegance',
  description: 'Elegantes Dark-Mode Farbschema mit Gold-Akzenten',
  tokens: {
    brand: {
      primary: '220 70% 50%',      // Deep Blue
      secondary: '225 45% 12%',    // Midnight
      accent: '45 90% 55%',        // Gold #EAAA00
    },
    gradient: {
      from: '220 70% 45%',         // Deep Blue
      via: '260 50% 45%',          // Purple-Hint
      to: '45 85% 50%',            // Gold
    },
    glow: {
      primary: '220 75% 55%',      // Blue-Glow
      secondary: '45 85% 60%',     // Gold-Glow
    },
    surface: {
      background: '225 50% 6%',    // Deep Midnight
      card: '225 45% 10%',         // Card Midnight
      muted: '225 40% 15%',        // Muted Midnight
      warm: '30 20% 12%',          // Warm Dark
    },
    text: {
      onPrimary: '0 0% 100%',      // Weiß
      onSecondary: '45 30% 90%',   // Light Gold
      onAccent: '225 50% 10%',     // Dark on Gold
    },
    animation: {
      particle: '45 70% 65%',      // Light Gold Particles
      orbit: '220 60% 60%',        // Blue Orbit
      pulse: '260 40% 55%',        // Purple Pulse
    },
    typography: {
      fontFamily: 'Geist, Inter, system-ui, sans-serif',
      fontFamilyHeading: 'Geist, Inter, system-ui, sans-serif',
      baseSize: '16px',
      lineHeight: '1.6',
      letterSpacing: '-0.01em',
    },
    radius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.5)',
      md: '0 4px 8px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
      lg: '0 12px 25px -5px rgb(0 0 0 / 0.5), 0 6px 10px -5px rgb(0 0 0 / 0.4)',
      glow: '0 0 30px hsl(45 85% 60% / 0.25)',
    },
  },
}

/**
 * Rose Minimal - Minimalistisches Rosa-Farbschema
 * Rosé + Off-White + Charcoal
 */
const roseMinimal: DesignPreset = {
  id: 'rose-minimal',
  name: 'Rose Minimal',
  description: 'Minimalistisches Farbschema mit Rosé-Tönen',
  tokens: {
    brand: {
      primary: '350 60% 55%',      // Soft Rose
      secondary: '30 30% 98%',     // Off-White
      accent: '350 70% 60%',       // Rose Accent
    },
    gradient: {
      from: '350 55% 50%',         // Rose
      via: '360 50% 55%',          // Pink-Rose
      to: '20 50% 55%',            // Warm Rose
    },
    glow: {
      primary: '350 60% 60%',      // Rose-Glow
      secondary: '20 55% 60%',     // Warm-Glow
    },
    surface: {
      background: '30 25% 98%',    // Warm Off-White
      card: '0 0% 100%',           // Pure White
      muted: '30 15% 95%',         // Light Warm
      warm: '30 30% 96%',          // Warmer
    },
    text: {
      onPrimary: '0 0% 100%',      // Weiß
      onSecondary: '0 0% 20%',     // Charcoal
      onAccent: '0 0% 100%',       // Weiß
    },
    animation: {
      particle: '350 45% 70%',     // Light Rose
      orbit: '20 45% 65%',         // Warm
      pulse: '360 40% 65%',        // Pink
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontFamilyHeading: 'Inter, system-ui, sans-serif',
      baseSize: '16px',
      lineHeight: '1.7',
      letterSpacing: '0.01em',
    },
    radius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03)',
      glow: '0 0 25px hsl(350 60% 60% / 0.2)',
    },
  },
}

/**
 * Alle verfügbaren Presets
 */
export const DESIGN_PRESETS: Record<string, DesignPreset> = {
  'nicnoa-classic': nicnoaClassic,
  'modern-purple': modernPurple,
  'corporate-blue': corporateBlue,
  'emerald-fresh': emeraldFresh,
  'midnight-elegance': midnightElegance,
  'rose-minimal': roseMinimal,
}

/**
 * Default Preset ID
 */
export const DEFAULT_PRESET_ID = 'nicnoa-classic'

/**
 * Holt ein Preset anhand der ID
 */
export function getPreset(id: string): DesignPreset {
  return DESIGN_PRESETS[id] || DESIGN_PRESETS[DEFAULT_PRESET_ID]
}

/**
 * Alle Preset-IDs als Array
 */
export function getPresetIds(): string[] {
  return Object.keys(DESIGN_PRESETS)
}

/**
 * Konvertiert HSL-String zu CSS-Value
 * Input: "151 15% 43%"
 * Output: "hsl(151 15% 43%)"
 */
export function hslToCss(hsl: string): string {
  return `hsl(${hsl})`
}

/**
 * Konvertiert HEX zu HSL-String
 * Input: "#6B7B5E"
 * Output: "151 15% 43%"
 */
export function hexToHslString(hex: string): string {
  hex = hex.replace('#', '')
  
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * Konvertiert HSL-String zu HEX
 * Input: "151 15% 43%"
 * Output: "#6B7B5E"
 */
export function hslStringToHex(hslString: string): string {
  const parts = hslString.match(/(\d+)\s+(\d+)%?\s+(\d+)%?/)
  if (!parts) return '#000000'
  
  const h = parseInt(parts[1]) / 360
  const s = parseInt(parts[2]) / 100
  const l = parseInt(parts[3]) / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Erstellt Default Design-Tokens für neue Installationen
 */
export function getDefaultTokens(): DesignTokens {
  return DESIGN_PRESETS[DEFAULT_PRESET_ID].tokens
}

