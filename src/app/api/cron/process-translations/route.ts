import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { translateText } from '@/lib/translation/translation-service'
import { createHash } from 'crypto'

// Konfiguration
const BATCH_SIZE = 10 // Anzahl Jobs pro Durchlauf
const MAX_ATTEMPTS = 3

// Authentifizierung für Cron-Jobs (via Vercel Cron Secret oder API Key)
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Vercel Cron Secret
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  // Alternativ: API Key
  const apiKey = request.headers.get('x-api-key')
  if (apiKey && apiKey === process.env.TRANSLATION_API_KEY) {
    return true
  }

  // In Entwicklung ohne Auth erlauben
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  return false
}

export async function GET(request: NextRequest) {
  // Auth prüfen
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results = {
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
  }

  try {
    // 1. Pending Jobs holen (nach Priorität und Alter sortiert)
    const jobs = await prisma.translationJob.findMany({
      where: {
        status: 'PENDING',
        attempts: { lt: MAX_ATTEMPTS },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      take: BATCH_SIZE,
      include: {
        language: true,
      },
    })

    if (jobs.length === 0) {
      return NextResponse.json({
        message: 'No pending jobs',
        ...results,
        duration: Date.now() - startTime,
      })
    }

    console.log(`[Translation Worker] Processing ${jobs.length} jobs...`)

    // 2. Jobs verarbeiten
    for (const job of jobs) {
      results.processed++

      try {
        // Job als "processing" markieren
        await prisma.translationJob.update({
          where: { id: job.id },
          data: {
            status: 'PROCESSING',
            startedAt: new Date(),
            attempts: { increment: 1 },
          },
        })

        // Übersetzen
        const result = await translateText(job.originalText, job.languageId)

        // Übersetzung speichern
        await prisma.translation.upsert({
          where: {
            languageId_contentType_contentId_field: {
              languageId: job.languageId,
              contentType: job.contentType,
              contentId: job.contentId,
              field: job.field,
            },
          },
          update: {
            value: result.translatedText,
            sourceHash: job.sourceHash,
            status: 'TRANSLATED',
            isOutdated: false,
            provider: result.provider,
            translatedAt: new Date(),
          },
          create: {
            languageId: job.languageId,
            contentType: job.contentType,
            contentId: job.contentId,
            field: job.field,
            value: result.translatedText,
            sourceHash: job.sourceHash,
            status: 'TRANSLATED',
            isOutdated: false,
            provider: result.provider,
            translatedAt: new Date(),
          },
        })

        // Job als erledigt markieren
        await prisma.translationJob.update({
          where: { id: job.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        })

        results.successful++
        console.log(`[Translation Worker] ✓ ${job.language.nativeName}: ${job.contentType}/${job.field}`)

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.failed++
        results.errors.push(`${job.id}: ${errorMessage}`)

        // Job als fehlgeschlagen markieren (oder zurück zu PENDING wenn noch Versuche übrig)
        const updatedJob = await prisma.translationJob.findUnique({
          where: { id: job.id },
        })

        if (updatedJob && updatedJob.attempts >= MAX_ATTEMPTS) {
          await prisma.translationJob.update({
            where: { id: job.id },
            data: {
              status: 'FAILED',
              lastError: errorMessage,
            },
          })
        } else {
          await prisma.translationJob.update({
            where: { id: job.id },
            data: {
              status: 'PENDING',
              lastError: errorMessage,
            },
          })
        }

        console.error(`[Translation Worker] ✗ ${job.id}: ${errorMessage}`)
      }

      // Kurze Pause zwischen Jobs für Rate Limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // 3. Ergebnis zurückgeben
    const duration = Date.now() - startTime
    console.log(`[Translation Worker] Done in ${duration}ms: ${results.successful}/${results.processed} successful`)

    return NextResponse.json({
      message: `Processed ${results.processed} jobs`,
      ...results,
      duration,
    })

  } catch (error) {
    console.error('[Translation Worker] Critical error:', error)
    return NextResponse.json(
      { 
        error: 'Worker failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        ...results,
        duration: Date.now() - startTime,
      },
      { status: 500 }
    )
  }
}

// POST: Manueller Trigger mit spezifischen Optionen
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { languageId, contentType, batchSize } = body

  // Spezifische Filter anwenden
  const where: Record<string, unknown> = {
    status: 'PENDING',
    attempts: { lt: MAX_ATTEMPTS },
  }

  if (languageId) where.languageId = languageId
  if (contentType) where.contentType = contentType

  const jobs = await prisma.translationJob.findMany({
    where,
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' },
    ],
    take: batchSize || BATCH_SIZE,
  })

  // Gleiche Verarbeitung wie GET
  // ... (vereinfachte Version für manuelle Trigger)

  return NextResponse.json({
    message: `Found ${jobs.length} jobs matching criteria`,
    jobIds: jobs.map(j => j.id),
  })
}
