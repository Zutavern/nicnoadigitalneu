import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const defaultConfig = {
  siteName: 'NICNOA&CO.online',
  titleSuffix: ' | NICNOA&CO.online',
  defaultMetaDescription: 'Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces. Revolutionieren Sie Ihr Salon-Management.',
  defaultOgImage: null,
  twitterHandle: null,
  facebookAppId: null,
  googleSiteVerification: null,
  bingSiteVerification: null,
  robotsIndex: true,
  robotsFollow: true,
  organizationName: 'NICNOA GmbH',
  organizationLogo: null,
  organizationAddress: null,
  organizationPhone: null,
  organizationEmail: 'info@nicnoa.de',
}

// GET - Globale SEO-Konfiguration laden
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const config = await prisma.globalSeoConfig.findUnique({
      where: { id: 'default' },
    })

    if (!config) {
      return NextResponse.json(defaultConfig)
    }

    return NextResponse.json({
      id: config.id,
      siteName: config.siteName,
      titleSuffix: config.titleSuffix,
      defaultMetaDescription: config.defaultMetaDescription,
      defaultOgImage: config.defaultOgImage,
      twitterHandle: config.twitterHandle,
      facebookAppId: config.facebookAppId,
      googleSiteVerification: config.googleSiteVerification,
      bingSiteVerification: config.bingSiteVerification,
      robotsIndex: config.robotsIndex,
      robotsFollow: config.robotsFollow,
      organizationName: config.organizationName,
      organizationLogo: config.organizationLogo,
      organizationAddress: config.organizationAddress,
      organizationPhone: config.organizationPhone,
      organizationEmail: config.organizationEmail,
    })
  } catch (error) {
    console.error('Error fetching global SEO config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der SEO-Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT - Globale SEO-Konfiguration aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()

    const config = await prisma.globalSeoConfig.upsert({
      where: { id: 'default' },
      update: {
        siteName: body.siteName || defaultConfig.siteName,
        titleSuffix: body.titleSuffix,
        defaultMetaDescription: body.defaultMetaDescription,
        defaultOgImage: body.defaultOgImage,
        twitterHandle: body.twitterHandle,
        facebookAppId: body.facebookAppId,
        googleSiteVerification: body.googleSiteVerification,
        bingSiteVerification: body.bingSiteVerification,
        robotsIndex: body.robotsIndex ?? true,
        robotsFollow: body.robotsFollow ?? true,
        organizationName: body.organizationName,
        organizationLogo: body.organizationLogo,
        organizationAddress: body.organizationAddress,
        organizationPhone: body.organizationPhone,
        organizationEmail: body.organizationEmail,
      },
      create: {
        id: 'default',
        siteName: body.siteName || defaultConfig.siteName,
        titleSuffix: body.titleSuffix || defaultConfig.titleSuffix,
        defaultMetaDescription: body.defaultMetaDescription || defaultConfig.defaultMetaDescription,
        defaultOgImage: body.defaultOgImage,
        twitterHandle: body.twitterHandle,
        facebookAppId: body.facebookAppId,
        googleSiteVerification: body.googleSiteVerification,
        bingSiteVerification: body.bingSiteVerification,
        robotsIndex: body.robotsIndex ?? true,
        robotsFollow: body.robotsFollow ?? true,
        organizationName: body.organizationName || defaultConfig.organizationName,
        organizationLogo: body.organizationLogo,
        organizationAddress: body.organizationAddress,
        organizationPhone: body.organizationPhone,
        organizationEmail: body.organizationEmail || defaultConfig.organizationEmail,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating global SEO config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der SEO-Konfiguration' },
      { status: 500 }
    )
  }
}


