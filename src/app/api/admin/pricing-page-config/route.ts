import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Pricing Page Config laden
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Config laden oder Default erstellen
    let config = await prisma.pricingPageConfig.findUnique({
      where: { id: 'default' }
    })

    if (!config) {
      // Erstelle Default-Config
      config = await prisma.pricingPageConfig.create({
        data: { id: 'default' }
      })
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Error fetching pricing page config:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Konfiguration' }, { status: 500 })
  }
}

// PATCH - Pricing Page Config aktualisieren
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
    
    // Aktualisiere Config
    const config = await prisma.pricingPageConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        ...body
      },
      update: body
    })

    return NextResponse.json({ config, success: true })
  } catch (error) {
    console.error('Error updating pricing page config:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern der Konfiguration' }, { status: 500 })
  }
}

