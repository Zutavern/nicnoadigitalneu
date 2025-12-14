import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - SEO-Einstellungen abrufen
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const settings = await prisma.platformSettings.findFirst()
    
    // SEO-Einstellungen aus den Platform Settings extrahieren
    // Falls sie noch nicht existieren, werden Standardwerte zurückgegeben
    return NextResponse.json({
      siteTitle: settings?.platformName || 'NICNOA - Die Plattform für Stylisten',
      siteDescription: settings?.platformDescription || 'NICNOA verbindet Stylisten mit Salonbesitzern.',
      siteKeywords: 'Friseur, Stylist, Salon, Stuhlmiete, Beauty, Hair',
      ogImage: '',
      twitterHandle: '@nicnoa',
      googleSiteVerification: '',
      robotsTxt: `User-agent: *
Allow: /

Sitemap: https://www.nicnoa.online/sitemap.xml`
    })
  } catch (error) {
    console.error('Fehler beim Laden der SEO-Einstellungen:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// PUT - SEO-Einstellungen speichern
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const data = await request.json()
    
    // Für jetzt speichern wir nur den Titel und die Beschreibung
    // in den Platform Settings
    await prisma.platformSettings.updateMany({
      data: {
        platformName: data.siteTitle,
        platformDescription: data.siteDescription
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Speichern der SEO-Einstellungen:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

