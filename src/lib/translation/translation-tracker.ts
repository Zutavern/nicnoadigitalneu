import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'
import { TRANSLATABLE_FIELDS } from './content-scanner'

// Hash für Content erstellen
export function createContentHash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

// Änderungen tracken und Jobs erstellen
export async function trackContentChanges(
  contentType: string,
  contentId: string,
  originalData: Record<string, unknown> | null,
  updatedData: Record<string, unknown>,
  translatableFields?: string[]
): Promise<{ jobsCreated: number; fieldsChanged: string[] }> {
  // Felder für diesen Content-Typ ermitteln
  const fieldsConfig = TRANSLATABLE_FIELDS[contentType]
  const fields = translatableFields || fieldsConfig?.fields || []
  const priority = fieldsConfig?.priority || 0

  if (fields.length === 0) {
    return { jobsCreated: 0, fieldsChanged: [] }
  }

  // Aktive Sprachen (außer Default) holen
  const activeLanguages = await prisma.language.findMany({
    where: {
      isActive: true,
      isDefault: false,
    },
  })

  if (activeLanguages.length === 0) {
    return { jobsCreated: 0, fieldsChanged: [] }
  }

  let jobsCreated = 0
  const fieldsChanged: string[] = []

  for (const field of fields) {
    const newValue = updatedData[field]
    const oldValue = originalData?.[field]

    // Nur String-Felder verarbeiten
    if (typeof newValue !== 'string' || newValue.trim().length === 0) {
      continue
    }

    // Prüfen ob sich der Wert geändert hat
    const newHash = createContentHash(newValue)
    const oldHash = oldValue ? createContentHash(String(oldValue)) : null

    if (oldHash && newHash === oldHash) {
      // Keine Änderung
      continue
    }

    fieldsChanged.push(field)

    // Für jede Sprache: Bestehende Übersetzung als veraltet markieren und Job erstellen
    for (const lang of activeLanguages) {
      // Bestehende Übersetzung prüfen
      const existingTranslation = await prisma.translation.findUnique({
        where: {
          languageId_contentType_contentId_field: {
            languageId: lang.id,
            contentType,
            contentId,
            field,
          },
        },
      })

      if (existingTranslation) {
        // Als veraltet markieren
        await prisma.translation.update({
          where: { id: existingTranslation.id },
          data: { isOutdated: true },
        })
      }

      // Prüfen ob bereits ein ausstehender Job existiert
      const existingJob = await prisma.translationJob.findFirst({
        where: {
          languageId: lang.id,
          contentType,
          contentId,
          field,
          status: { in: ['PENDING', 'PROCESSING'] },
        },
      })

      if (!existingJob) {
        // Neuen Job erstellen (mit höherer Priorität für Updates)
        await prisma.translationJob.create({
          data: {
            languageId: lang.id,
            contentType,
            contentId,
            field,
            originalText: newValue,
            sourceHash: newHash,
            priority: priority + 10, // Updates haben höhere Priorität
          },
        })
        jobsCreated++
      } else {
        // Bestehenden Job aktualisieren
        await prisma.translationJob.update({
          where: { id: existingJob.id },
          data: {
            originalText: newValue,
            sourceHash: newHash,
            status: 'PENDING',
            attempts: 0,
            lastError: null,
          },
        })
      }
    }
  }

  if (fieldsChanged.length > 0) {
    console.log(`[Translation Tracker] ${contentType}/${contentId}: ${fieldsChanged.length} fields changed, ${jobsCreated} jobs created`)
  }

  return { jobsCreated, fieldsChanged }
}

// Wrapper für API-Routes: Automatisches Tracking bei Updates
export function withTranslationTracking<T extends Record<string, unknown>>(
  contentType: string,
  translatableFields?: string[]
) {
  return async function trackUpdate(
    contentId: string,
    originalData: T | null,
    updatedData: T
  ): Promise<void> {
    await trackContentChanges(
      contentType,
      contentId,
      originalData as Record<string, unknown> | null,
      updatedData as Record<string, unknown>,
      translatableFields
    )
  }
}

// Hilfsfunktion: Alle veralteten Übersetzungen für ein Content-Item aktualisieren
export async function refreshTranslationsFor(
  contentType: string,
  contentId: string
): Promise<number> {
  const fieldsConfig = TRANSLATABLE_FIELDS[contentType]
  if (!fieldsConfig) return 0

  // Veraltete Übersetzungen finden
  const outdatedTranslations = await prisma.translation.findMany({
    where: {
      contentType,
      contentId,
      isOutdated: true,
    },
  })

  let jobsCreated = 0

  for (const translation of outdatedTranslations) {
    // Prüfen ob bereits ein Job existiert
    const existingJob = await prisma.translationJob.findFirst({
      where: {
        languageId: translation.languageId,
        contentType,
        contentId,
        field: translation.field,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
    })

    if (!existingJob) {
      // Aktuellen Originaltext holen (aus der DB)
      // Dies würde eine generische Funktion benötigen...
      // Für jetzt überspringen wir das
      console.warn(`[Translation Tracker] Cannot refresh ${contentType}/${contentId}/${translation.field} - need original text`)
    }
  }

  return jobsCreated
}


