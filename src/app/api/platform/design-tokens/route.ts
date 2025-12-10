import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDefaultTokens, DESIGN_PRESETS, type DesignTokens } from '@/lib/design-presets'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/platform/design-tokens
 * 
 * Gibt die aktuellen Design-Tokens zurück.
 * Falls keine in der Datenbank gespeichert sind, werden die Defaults verwendet.
 */
export async function GET() {
  try {
    const settings = await prisma.platformSettings.findFirst({
      where: { id: 'default' },
      select: {
        designSystemPreset: true,
        designTokens: true,
      },
    })

    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    }

    // Falls custom tokens gespeichert sind, diese verwenden
    if (settings?.designTokens) {
      return NextResponse.json({
        preset: settings.designSystemPreset || 'custom',
        tokens: settings.designTokens as DesignTokens,
      }, { headers })
    }

    // Falls ein Preset gewählt wurde, dessen Tokens laden
    if (settings?.designSystemPreset && DESIGN_PRESETS[settings.designSystemPreset]) {
      const preset = DESIGN_PRESETS[settings.designSystemPreset]
      return NextResponse.json({
        preset: preset.id,
        tokens: preset.tokens,
      }, { headers })
    }

    // Fallback: Default Tokens
    return NextResponse.json({
      preset: 'nicnoa-classic',
      tokens: getDefaultTokens(),
    }, { headers })
  } catch (error) {
    console.error('Fehler beim Laden der Design-Tokens:', error)
    
    // Bei Fehlern trotzdem Defaults zurückgeben
    return NextResponse.json({
      preset: 'nicnoa-classic',
      tokens: getDefaultTokens(),
    }, { 
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    })
  }
}

