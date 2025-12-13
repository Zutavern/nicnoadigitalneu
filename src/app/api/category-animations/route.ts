import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isValidLocale, type Locale } from '@/lib/translation/i18n-config'

export const dynamic = 'force-dynamic'

// GET - Aktive Category Animations abrufen (Public, mit Übersetzungen)
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

    const animations = await prisma.categoryAnimation.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        categoryKey: true,
        title: true,
        subtitle: true,
        description: true,
        badgeText: true,
        features: true,
        animationType: true,
        presetAnimation: true,
        customAnimationCode: true,
        lottieUrl: true,
        animationPosition: true,
        animationSize: true,
        animationSpeed: true,
        useDesignSystemColors: true,
        customPrimaryColor: true,
        customSecondaryColor: true,
        customAccentColor: true,
        sortOrder: true,
      },
    })

    // Übersetzungen laden und anwenden
    if (locale !== DEFAULT_LOCALE && animations.length > 0) {
      const animationIds = animations.map(a => a.id)
      const translations = await prisma.translation.findMany({
        where: {
          contentType: 'category_animation',
          contentId: { in: animationIds },
          languageId: locale,
          status: 'TRANSLATED',
        },
        select: { contentId: true, field: true, value: true },
      })

      const translationMap = new Map<string, Record<string, string>>()
      for (const t of translations) {
        if (!translationMap.has(t.contentId)) {
          translationMap.set(t.contentId, {})
        }
        translationMap.get(t.contentId)![t.field] = t.value
      }

      for (const animation of animations) {
        const animTranslations = translationMap.get(animation.id)
        if (animTranslations) {
          if (animTranslations.title) animation.title = animTranslations.title
          if (animTranslations.subtitle) animation.subtitle = animTranslations.subtitle
          if (animTranslations.description) animation.description = animTranslations.description
          if (animTranslations.badgeText) animation.badgeText = animTranslations.badgeText
        }
      }
    }

    return NextResponse.json(animations)
  } catch (error) {
    console.error('Error fetching category animations:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kategorie-Animationen' },
      { status: 500 }
    )
  }
}




