import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DESIGN_PRESETS, getPreset, type DesignTokens } from '@/lib/design-presets'

/**
 * GET /api/admin/design-tokens
 * 
 * Gibt die aktuellen Design-Tokens für den Admin zurück,
 * inkl. aller verfügbaren Presets.
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const settings = await prisma.platformSettings.findFirst({
      where: { id: 'default' },
      select: {
        designSystemPreset: true,
        designTokens: true,
      },
    })

    // Alle verfügbaren Presets
    const presets = Object.values(DESIGN_PRESETS).map(preset => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
    }))

    // Aktuelle Konfiguration
    const currentPreset = settings?.designSystemPreset || 'nicnoa-classic'
    const customTokens = settings?.designTokens as DesignTokens | null
    
    // Aktive Tokens (custom falls vorhanden, sonst Preset)
    const activeTokens = customTokens || getPreset(currentPreset).tokens

    return NextResponse.json({
      currentPreset,
      hasCustomTokens: !!customTokens,
      activeTokens,
      presets,
    })
  } catch (error) {
    console.error('Fehler beim Laden der Design-Tokens (Admin):', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Design-Tokens' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/design-tokens
 * 
 * Speichert die Design-Tokens.
 * Body: { preset?: string, tokens?: DesignTokens }
 * - Wenn nur `preset` übergeben wird: Preset wird aktiviert, customTokens gelöscht
 * - Wenn `tokens` übergeben wird: Custom Tokens werden gespeichert
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { preset, tokens } = body

    // Validierung
    if (!preset && !tokens) {
      return NextResponse.json(
        { error: 'Entweder preset oder tokens muss angegeben werden' },
        { status: 400 }
      )
    }

    // Preset-Validierung
    if (preset && !DESIGN_PRESETS[preset]) {
      return NextResponse.json(
        { error: 'Ungültiges Preset' },
        { status: 400 }
      )
    }

    // Tokens-Validierung (Basis-Check)
    if (tokens) {
      const requiredFields = ['brand', 'gradient', 'glow', 'surface', 'text', 'animation']
      const missingFields = requiredFields.filter(field => !tokens[field])
      
      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `Fehlende Token-Felder: ${missingFields.join(', ')}` },
          { status: 400 }
        )
      }

      // Optionale Felder mit Defaults auffüllen falls nicht vorhanden
      if (!tokens.typography) {
        tokens.typography = {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontFamilyHeading: 'Inter, system-ui, sans-serif',
          baseSize: '16px',
          lineHeight: '1.6',
          letterSpacing: '-0.01em',
        }
      }
      if (!tokens.radius) {
        tokens.radius = {
          sm: '0.375rem',
          md: '0.5rem',
          lg: '0.75rem',
          xl: '1rem',
          full: '9999px',
        }
      }
      if (!tokens.shadows) {
        tokens.shadows = {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          glow: '0 0 20px hsl(151 40% 50% / 0.3)',
        }
      }
    }

    // Aktualisiere oder erstelle PlatformSettings
    const updatedSettings = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: {
        designSystemPreset: preset || 'custom',
        // Wenn nur Preset gewählt: tokens löschen, sonst custom tokens setzen
        designTokens: tokens || null,
        updatedAt: new Date(),
      },
      create: {
        id: 'default',
        designSystemPreset: preset || 'custom',
        designTokens: tokens || null,
      },
      select: {
        designSystemPreset: true,
        designTokens: true,
      },
    })

    // Aktive Tokens zurückgeben
    const activeTokens = updatedSettings.designTokens as DesignTokens | null
      || getPreset(updatedSettings.designSystemPreset || 'nicnoa-classic').tokens

    return NextResponse.json({
      success: true,
      currentPreset: updatedSettings.designSystemPreset,
      hasCustomTokens: !!updatedSettings.designTokens,
      activeTokens,
    })
  } catch (error) {
    console.error('Fehler beim Speichern der Design-Tokens:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Design-Tokens' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/design-tokens/reset
 * 
 * Setzt die Design-Tokens auf den Default-Preset zurück.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (action === 'reset') {
      await prisma.platformSettings.upsert({
        where: { id: 'default' },
        update: {
          designSystemPreset: 'nicnoa-classic',
          designTokens: null,
          updatedAt: new Date(),
        },
        create: {
          id: 'default',
          designSystemPreset: 'nicnoa-classic',
          designTokens: null,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Design-Tokens wurden zurückgesetzt',
      })
    }

    return NextResponse.json(
      { error: 'Ungültige Aktion' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Fehler beim Zurücksetzen der Design-Tokens:', error)
    return NextResponse.json(
      { error: 'Fehler beim Zurücksetzen der Design-Tokens' },
      { status: 500 }
    )
  }
}

