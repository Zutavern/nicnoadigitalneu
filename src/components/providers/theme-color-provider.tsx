'use client'

import { useEffect } from 'react'

/**
 * ThemeColorProvider - Setzt die CSS-Variablen basierend auf PlatformSettings primaryColor
 * 
 * Diese Komponente stellt sicher, dass die primaryColor aus der Datenbank
 * die CSS-Variablen überschreibt, sodass Logo und Password-Panel die richtige Farbe haben.
 */
export function ThemeColorProvider() {
  useEffect(() => {
    const applyPrimaryColor = async () => {
      try {
        // Hole PlatformSettings primaryColor
        const response = await fetch('/api/platform/primary-color')
        if (!response.ok) return

        const data = await response.json()
        const primaryColor = data.primaryColor

        if (!primaryColor) return

        // Konvertiere HEX zu HSL
        const hsl = hexToHsl(primaryColor)
        if (!hsl) return

        // Setze CSS-Variable für Light Mode
        document.documentElement.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`)

        // Für Dark Mode: Verwende eine hellere Variante
        const darkHsl = { ...hsl, l: Math.min(98, hsl.l + 30) }
        const darkModeStyle = document.createElement('style')
        darkModeStyle.textContent = `
          .dark {
            --primary: ${darkHsl.h} ${darkHsl.s}% ${darkHsl.l}%;
          }
        `
        document.head.appendChild(darkModeStyle)
      } catch (error) {
        console.error('Fehler beim Anwenden der Primary-Color:', error)
      }
    }

    applyPrimaryColor()
  }, [])

  return null
}

/**
 * Konvertiert HEX zu HSL
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  // Entferne # falls vorhanden
  hex = hex.replace('#', '')

  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // Grau
  } else {
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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}


