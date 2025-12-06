import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clearDemoModeCache, isDemoModeActive, getMockAdminSettings } from '@/lib/mock-data'

// GET /api/admin/settings - Hole Platform-Einstellungen
export async function GET() {
  try {
    // Demo-Modus prüfen - aber Einstellungen immer von DB laden für Admin
    // Damit Admin den Demo-Modus ausschalten kann
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    // Hole oder erstelle Einstellungen (Singleton-Pattern)
    let settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' }
    })

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { id: 'default' }
      })
    }

    // Passwort nicht zurückgeben
    const { smtpPassword, ...safeSettings } = settings

    return NextResponse.json({
      ...safeSettings,
      smtpPassword: smtpPassword ? '••••••••' : null
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Einstellungen' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/settings - Aktualisiere Platform-Einstellungen
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const {
      // Allgemein
      companyName,
      supportEmail,
      supportPhone,
      defaultLanguage,
      timezone,
      currency,
      // Branding
      logoUrl,
      faviconUrl,
      primaryColor,
      // Billing
      trialDays,
      // SMTP
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpFrom,
      smtpSecure,
      // Analytics
      googleAnalyticsId,
      // Demo-Modus
      useDemoMode,
      demoModeMessage
    } = body

    // Aktualisiere Einstellungen (upsert für Singleton)
    const updateData: Record<string, unknown> = {}

    // Nur geänderte Felder übernehmen
    if (companyName !== undefined) updateData.companyName = companyName
    if (supportEmail !== undefined) updateData.supportEmail = supportEmail
    if (supportPhone !== undefined) updateData.supportPhone = supportPhone
    if (defaultLanguage !== undefined) updateData.defaultLanguage = defaultLanguage
    if (timezone !== undefined) updateData.timezone = timezone
    if (currency !== undefined) updateData.currency = currency
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl
    if (faviconUrl !== undefined) updateData.faviconUrl = faviconUrl
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor
    if (trialDays !== undefined) updateData.trialDays = trialDays
    if (smtpHost !== undefined) updateData.smtpHost = smtpHost
    if (smtpPort !== undefined) updateData.smtpPort = smtpPort
    if (smtpUser !== undefined) updateData.smtpUser = smtpUser
    if (smtpFrom !== undefined) updateData.smtpFrom = smtpFrom
    if (smtpSecure !== undefined) updateData.smtpSecure = smtpSecure
    if (googleAnalyticsId !== undefined) updateData.googleAnalyticsId = googleAnalyticsId
    
    // Demo-Modus
    if (useDemoMode !== undefined) updateData.useDemoMode = useDemoMode
    if (demoModeMessage !== undefined) updateData.demoModeMessage = demoModeMessage
    
    // SMTP-Passwort nur aktualisieren wenn nicht Platzhalter
    if (smtpPassword !== undefined && smtpPassword !== '••••••••') {
      updateData.smtpPassword = smtpPassword
    }

    const settings = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData
      }
    })

    // Cache leeren wenn Demo-Modus geändert wurde
    if (useDemoMode !== undefined) {
      clearDemoModeCache()
    }

    // Log the settings change
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email || 'unknown',
        event: 'SETTINGS_CHANGED',
        status: 'SUCCESS',
        message: 'Platform-Einstellungen aktualisiert',
        metadata: { changedFields: Object.keys(updateData) }
      }
    })

    // Passwort nicht zurückgeben
    const { smtpPassword: _, ...safeSettings } = settings

    return NextResponse.json({
      ...safeSettings,
      smtpPassword: settings.smtpPassword ? '••••••••' : null
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Einstellungen' },
      { status: 500 }
    )
  }
}
