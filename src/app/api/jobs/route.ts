import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isValidLocale, type Locale } from '@/lib/translation/i18n-config'

// GET - Hole alle aktiven Jobs (mit Übersetzungen)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Locale ermitteln
    let locale: Locale = DEFAULT_LOCALE
    try {
      const cookieStore = await cookies()
      const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)
      if (localeCookie?.value && isValidLocale(localeCookie.value)) {
        locale = localeCookie.value as Locale
      }
    } catch { /* ignore */ }

    const where = category
      ? { isActive: true, category }
      : { isActive: true }

    const jobs = await prisma.jobPosting.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
      ],
    })

    // Übersetzungen laden und anwenden
    if (locale !== DEFAULT_LOCALE && jobs.length > 0) {
      const jobIds = jobs.map(j => j.id)
      const translations = await prisma.translation.findMany({
        where: {
          contentType: 'job_posting',
          contentId: { in: jobIds },
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

      for (const job of jobs) {
        const jobTranslations = translationMap.get(job.id)
        if (jobTranslations) {
          if (jobTranslations.title) job.title = jobTranslations.title
          if (jobTranslations.description) job.description = jobTranslations.description
          if (jobTranslations.requirements) job.requirements = jobTranslations.requirements
          if (jobTranslations.benefits) job.benefits = jobTranslations.benefits
        }
      }
    }

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Jobs' },
      { status: 500 }
    )
  }
}






