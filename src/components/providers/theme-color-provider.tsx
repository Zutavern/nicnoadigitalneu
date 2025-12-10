'use client'

import { useEffect, useState } from 'react'
import type { DesignTokens } from '@/lib/design-presets'

/**
 * ThemeColorProvider - Setzt ALLE CSS-Variablen basierend auf den Design-Tokens
 * 
 * Aktualisiert sowohl die Brand-Variablen als auch die Shadcn/UI-Variablen,
 * damit das gesamte Design-System konsistent ist.
 */
export function ThemeColorProvider() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const applyDesignTokens = async () => {
      try {
        // Hole Design-Tokens von der API (mit Cache-Busting)
        const response = await fetch(`/api/platform/design-tokens?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        if (!response.ok) {
          console.warn('Design-Tokens konnten nicht geladen werden, verwende Defaults')
          setLoaded(true)
          return
        }

        const data = await response.json()
        const tokens: DesignTokens = data.tokens

        if (!tokens) {
          setLoaded(true)
          return
        }

        // Alle CSS-Variablen setzen
        applyAllTokens(tokens)

        // Dark Mode Varianten
        const darkTokens = generateDarkModeTokens(tokens)
        applyDarkModeStyles(tokens, darkTokens)

        // Cache für schnelleres Laden
        localStorage.setItem('design-tokens', JSON.stringify(tokens))
        localStorage.setItem('design-tokens-timestamp', Date.now().toString())

        setLoaded(true)
      } catch (error) {
        console.error('Fehler beim Anwenden der Design-Tokens:', error)
        setLoaded(true)
      }
    }

    // Versuche erst aus localStorage zu laden für schnelleres Initial-Rendering
    const cachedTokens = localStorage.getItem('design-tokens')
    const cacheTimestamp = localStorage.getItem('design-tokens-timestamp')
    const cacheMaxAge = 5 * 60 * 1000 // 5 Minuten Cache

    if (cachedTokens && cacheTimestamp) {
      const age = Date.now() - parseInt(cacheTimestamp)
      if (age < cacheMaxAge) {
        try {
          const tokens: DesignTokens = JSON.parse(cachedTokens)
          applyAllTokens(tokens)
        } catch {
          // Cache ungültig, ignorieren
        }
      }
    }

    // Immer von API laden (aktualisiert auch den Cache)
    applyDesignTokens()
  }, [])

  return null
}

/**
 * Wendet ALLE Tokens auf :root an - sowohl Brand als auch Shadcn-Variablen
 */
function applyAllTokens(tokens: DesignTokens) {
  const root = document.documentElement

  // ========================================
  // SHADCN/UI CORE VARIABLES (für alle UI-Komponenten)
  // ========================================
  
  // Primary (Buttons, Links, etc.)
  root.style.setProperty('--primary', tokens.brand.primary)
  root.style.setProperty('--primary-foreground', tokens.text.onPrimary)
  
  // Secondary (Secondary Buttons, etc.)
  root.style.setProperty('--secondary', tokens.brand.secondary)
  root.style.setProperty('--secondary-foreground', tokens.text.onSecondary)
  
  // Accent (Hover-States, Highlights)
  root.style.setProperty('--accent', tokens.brand.accent)
  root.style.setProperty('--accent-foreground', tokens.text.onAccent)
  
  // Ring (Focus-States)
  root.style.setProperty('--ring', tokens.brand.primary)
  
  // ========================================
  // BRAND COLORS (für Marketing/Custom-Komponenten)
  // ========================================
  root.style.setProperty('--brand-primary', tokens.brand.primary)
  root.style.setProperty('--brand-primary-foreground', tokens.text.onPrimary)
  root.style.setProperty('--brand-secondary', tokens.brand.secondary)
  root.style.setProperty('--brand-secondary-foreground', tokens.text.onSecondary)
  root.style.setProperty('--brand-accent', tokens.brand.accent)
  root.style.setProperty('--brand-accent-foreground', tokens.text.onAccent)

  // ========================================
  // GRADIENT COLORS
  // ========================================
  root.style.setProperty('--gradient-from', tokens.gradient.from)
  root.style.setProperty('--gradient-via', tokens.gradient.via)
  root.style.setProperty('--gradient-to', tokens.gradient.to)

  // ========================================
  // GLOW/ANIMATION COLORS
  // ========================================
  root.style.setProperty('--glow-primary', tokens.glow.primary)
  root.style.setProperty('--glow-secondary', tokens.glow.secondary)
  root.style.setProperty('--animation-particle', tokens.animation.particle)
  root.style.setProperty('--animation-orbit', tokens.animation.orbit)
  root.style.setProperty('--animation-pulse', tokens.animation.pulse)

  // ========================================
  // SURFACE COLORS (für Marketing-Seiten)
  // ========================================
  root.style.setProperty('--surface-background', tokens.surface.background)
  root.style.setProperty('--surface-card', tokens.surface.card)
  root.style.setProperty('--surface-muted', tokens.surface.muted)
  root.style.setProperty('--surface-warm', tokens.surface.warm)

  // ========================================
  // TYPOGRAPHY
  // ========================================
  if (tokens.typography) {
    root.style.setProperty('--font-family', tokens.typography.fontFamily)
    root.style.setProperty('--font-family-heading', tokens.typography.fontFamilyHeading)
    root.style.setProperty('--font-size-base', tokens.typography.baseSize)
    root.style.setProperty('--line-height', tokens.typography.lineHeight)
    root.style.setProperty('--letter-spacing', tokens.typography.letterSpacing)
  }

  // ========================================
  // RADIUS
  // ========================================
  if (tokens.radius) {
    root.style.setProperty('--radius', tokens.radius.lg)
    root.style.setProperty('--radius-sm', tokens.radius.sm)
    root.style.setProperty('--radius-md', tokens.radius.md)
    root.style.setProperty('--radius-lg', tokens.radius.lg)
    root.style.setProperty('--radius-xl', tokens.radius.xl)
    root.style.setProperty('--radius-full', tokens.radius.full)
  }

  // ========================================
  // SHADOWS
  // ========================================
  if (tokens.shadows) {
    root.style.setProperty('--shadow-sm', tokens.shadows.sm)
    root.style.setProperty('--shadow-md', tokens.shadows.md)
    root.style.setProperty('--shadow-lg', tokens.shadows.lg)
    root.style.setProperty('--shadow-glow', tokens.shadows.glow)
  }
}

/**
 * Generiert Dark-Mode-Varianten der Tokens
 */
function generateDarkModeTokens(tokens: DesignTokens): DesignTokens {
  const adjustLightness = (hsl: string, delta: number): string => {
    const parts = hsl.match(/(\d+)\s+(\d+)%?\s+(\d+)%?/)
    if (!parts) return hsl
    
    const h = parseInt(parts[1])
    const s = parseInt(parts[2])
    let l = parseInt(parts[3])
    
    l = Math.max(0, Math.min(100, l + delta))
    
    return `${h} ${s}% ${l}%`
  }

  return {
    brand: {
      primary: adjustLightness(tokens.brand.primary, 15),
      secondary: adjustLightness(tokens.brand.secondary, -70),
      accent: adjustLightness(tokens.brand.accent, 10),
    },
    gradient: {
      from: adjustLightness(tokens.gradient.from, 10),
      via: adjustLightness(tokens.gradient.via, 10),
      to: adjustLightness(tokens.gradient.to, 10),
    },
    glow: {
      primary: adjustLightness(tokens.glow.primary, 10),
      secondary: adjustLightness(tokens.glow.secondary, 10),
    },
    surface: {
      background: '224 50% 6%',
      card: '224 45% 8%',
      muted: '224 40% 12%',
      warm: '30 15% 10%',
    },
    text: {
      onPrimary: tokens.text.onPrimary,
      onSecondary: adjustLightness(tokens.text.onSecondary, 50),
      onAccent: tokens.text.onAccent,
    },
    animation: {
      particle: adjustLightness(tokens.animation.particle, 10),
      orbit: adjustLightness(tokens.animation.orbit, 10),
      pulse: adjustLightness(tokens.animation.pulse, 10),
    },
    typography: tokens.typography,
    radius: tokens.radius,
    shadows: tokens.shadows ? {
      sm: tokens.shadows.sm.replace(/0\.05/g, '0.3').replace(/0\.1/g, '0.4'),
      md: tokens.shadows.md.replace(/0\.05/g, '0.3').replace(/0\.1/g, '0.4'),
      lg: tokens.shadows.lg.replace(/0\.05/g, '0.3').replace(/0\.1/g, '0.4'),
      glow: tokens.shadows.glow.replace(/0\.2/g, '0.35').replace(/0\.25/g, '0.4').replace(/0\.3/g, '0.45'),
    } : undefined,
  }
}

/**
 * Wendet Dark-Mode-Styles als dynamisches Stylesheet an
 * Setzt ALLE Variablen für .dark Klasse
 */
function applyDarkModeStyles(lightTokens: DesignTokens, darkTokens: DesignTokens) {
  // Entferne altes Stylesheet falls vorhanden
  const existingStyle = document.getElementById('design-system-dark-mode')
  if (existingStyle) {
    existingStyle.remove()
  }

  // Shadow CSS
  const shadowStyles = darkTokens.shadows ? `
      --shadow-sm: ${darkTokens.shadows.sm};
      --shadow-md: ${darkTokens.shadows.md};
      --shadow-lg: ${darkTokens.shadows.lg};
      --shadow-glow: ${darkTokens.shadows.glow};
  ` : ''

  const style = document.createElement('style')
  style.id = 'design-system-dark-mode'
  style.textContent = `
    .dark {
      /* Shadcn/UI Core Variables */
      --primary: ${darkTokens.brand.primary};
      --primary-foreground: ${darkTokens.text.onPrimary};
      --secondary: ${darkTokens.brand.secondary};
      --secondary-foreground: ${darkTokens.text.onSecondary};
      --accent: ${darkTokens.brand.accent};
      --accent-foreground: ${darkTokens.text.onAccent};
      --ring: ${darkTokens.brand.primary};
      
      /* Brand Colors */
      --brand-primary: ${darkTokens.brand.primary};
      --brand-primary-foreground: ${darkTokens.text.onPrimary};
      --brand-secondary: ${darkTokens.brand.secondary};
      --brand-secondary-foreground: ${darkTokens.text.onSecondary};
      --brand-accent: ${darkTokens.brand.accent};
      --brand-accent-foreground: ${darkTokens.text.onAccent};
      
      /* Gradient */
      --gradient-from: ${darkTokens.gradient.from};
      --gradient-via: ${darkTokens.gradient.via};
      --gradient-to: ${darkTokens.gradient.to};
      
      /* Glow */
      --glow-primary: ${darkTokens.glow.primary};
      --glow-secondary: ${darkTokens.glow.secondary};
      
      /* Surface */
      --surface-background: ${darkTokens.surface.background};
      --surface-card: ${darkTokens.surface.card};
      --surface-muted: ${darkTokens.surface.muted};
      --surface-warm: ${darkTokens.surface.warm};
      
      /* Animation */
      --animation-particle: ${darkTokens.animation.particle};
      --animation-orbit: ${darkTokens.animation.orbit};
      --animation-pulse: ${darkTokens.animation.pulse};
      
      /* Shadows */
      ${shadowStyles}
    }
  `
  document.head.appendChild(style)
}

/**
 * Hook zum manuellen Neuladen der Design-Tokens
 */
export function useRefreshDesignTokens() {
  const refresh = async () => {
    localStorage.removeItem('design-tokens')
    localStorage.removeItem('design-tokens-timestamp')
    window.location.reload()
  }

  return { refresh }
}
