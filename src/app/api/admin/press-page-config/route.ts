import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Press Page Config laden (Admin)
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Config laden oder Default erstellen
    let config = await prisma.pressPageConfig.findUnique({
      where: { id: 'default' }
    })

    if (!config) {
      // Erstelle Default-Config
      config = await prisma.pressPageConfig.create({
        data: { id: 'default' }
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching press page config:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Konfiguration' }, { status: 500 })
  }
}

// PUT - Press Page Config aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Prüfe Admin-Rechte
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
    }

    const body = await request.json()
    
    // Aktualisiere Config
    const config = await prisma.pressPageConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        heroBadgeText: body.heroBadgeText,
        heroTitle: body.heroTitle || 'NICNOA in den Medien',
        heroDescription: body.heroDescription,
        showStats: body.showStats ?? true,
        stat1Label: body.stat1Label,
        stat1Value: body.stat1Value,
        stat2Label: body.stat2Label,
        stat2Value: body.stat2Value,
        stat3Label: body.stat3Label,
        stat3Value: body.stat3Value,
        showPressKit: body.showPressKit ?? true,
        pressKitTitle: body.pressKitTitle,
        pressKitDescription: body.pressKitDescription,
        pressKitDownloadUrl: body.pressKitDownloadUrl,
        contactTitle: body.contactTitle,
        contactDescription: body.contactDescription,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        contactPerson: body.contactPerson,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        ogImage: body.ogImage
      },
      update: {
        heroBadgeText: body.heroBadgeText,
        heroTitle: body.heroTitle || 'NICNOA in den Medien',
        heroDescription: body.heroDescription,
        showStats: body.showStats ?? true,
        stat1Label: body.stat1Label,
        stat1Value: body.stat1Value,
        stat2Label: body.stat2Label,
        stat2Value: body.stat2Value,
        stat3Label: body.stat3Label,
        stat3Value: body.stat3Value,
        showPressKit: body.showPressKit ?? true,
        pressKitTitle: body.pressKitTitle,
        pressKitDescription: body.pressKitDescription,
        pressKitDownloadUrl: body.pressKitDownloadUrl,
        contactTitle: body.contactTitle,
        contactDescription: body.contactDescription,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        contactPerson: body.contactPerson,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        ogImage: body.ogImage
      }
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating press page config:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern der Konfiguration' }, { status: 500 })
  }
}

// PATCH - Press Page Config teilweise aktualisieren
export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Prüfe Admin-Rechte
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
    }

    const body = await request.json()
    
    // Aktualisiere nur die übergebenen Felder
    const config = await prisma.pressPageConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        ...body
      },
      update: body
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating press page config:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern der Konfiguration' }, { status: 500 })
  }
}
