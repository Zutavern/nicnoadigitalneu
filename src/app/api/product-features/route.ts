import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isValidLocale, type Locale } from '@/lib/translation/i18n-config'

export const dynamic = 'force-dynamic'

// GET - Alle Produkt-Features abrufen (mit Übersetzungen)
export async function GET() {
  try {
    // Locale ermitteln
    let locale: Locale = DEFAULT_LOCALE
    try {
      const cookieStore = await cookies()
      const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)
      if (localeCookie?.value && isValidLocale(localeCookie.value)) {
        locale = localeCookie.value as Locale
      }
    } catch { /* ignore */ }

    const features = await prisma.productFeature.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    // Übersetzungen laden und anwenden
    if (locale !== DEFAULT_LOCALE && features.length > 0) {
      const featureIds = features.map(f => f.id)
      const translations = await prisma.translation.findMany({
        where: {
          contentType: 'product_feature',
          contentId: { in: featureIds },
          languageId: locale,
          status: 'TRANSLATED',
        },
        select: { contentId: true, field: true, value: true },
      })

      // Übersetzungen anwenden
      const translationMap = new Map<string, Record<string, string>>()
      for (const t of translations) {
        if (!translationMap.has(t.contentId)) {
          translationMap.set(t.contentId, {})
        }
        translationMap.get(t.contentId)![t.field] = t.value
      }

      for (const feature of features) {
        const featureTranslations = translationMap.get(feature.id)
        if (featureTranslations) {
          if (featureTranslations.title) feature.title = featureTranslations.title
          if (featureTranslations.description) feature.description = featureTranslations.description
        }
      }
    }

    return NextResponse.json(features)
  } catch (error) {
    console.error('Error fetching product features:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Produkt-Features' },
      { status: 500 }
    )
  }
}

// POST - Neues Produkt-Feature erstellen
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const feature = await prisma.productFeature.create({
      data: {
        title: data.title,
        description: data.description,
        iconName: data.iconName,
        category: data.category || 'core',
        isActive: data.isActive ?? true,
        isHighlight: data.isHighlight ?? false,
        sortOrder: data.sortOrder ?? 0,
      },
    })

    return NextResponse.json(feature, { status: 201 })
  } catch (error) {
    console.error('Error creating product feature:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Produkt-Features' },
      { status: 500 }
    )
  }
}







