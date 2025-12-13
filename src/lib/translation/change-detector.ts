import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'
import { getTranslatableContent, type TranslatableContent } from './content-scanner'

export interface ChangedContent extends TranslatableContent {
  oldHash: string | null
  newHash: string
  hasTranslation: boolean
  languageId: string
}

export interface ScanResult {
  totalScanned: number
  newContent: number
  changedContent: number
  unchangedContent: number
  changes: ChangedContent[]
}

/**
 * Berechnet einen SHA256 Hash für einen Text
 */
export function calculateHash(text: string): string {
  return createHash('sha256').update(text || '').digest('hex')
}

/**
 * Scannt alle übersetzbaren Inhalte und erkennt Änderungen
 * durch Vergleich der Hash-Werte
 */
export async function scanForChanges(languageId?: string): Promise<ScanResult> {
  console.log('🔍 Scanning for translation changes...')
  
  // 1. Alle übersetzbaren Inhalte laden
  const translatableContent = await getTranslatableContent()
  
  // 2. Aktive Sprachen laden (außer Deutsch = Quellsprache)
  const languages = languageId
    ? [{ id: languageId }]
    : await prisma.language.findMany({
        where: { isActive: true, id: { not: 'de' } },
        select: { id: true },
      })

  const changes: ChangedContent[] = []
  let newContent = 0
  let changedContent = 0
  let unchangedContent = 0

  // 3. Für jeden Inhalt und jede Sprache prüfen
  for (const content of translatableContent) {
    const newHash = calculateHash(content.value)
    
    for (const lang of languages) {
      // Existierende Übersetzung finden
      const existingTranslation = await prisma.translation.findUnique({
        where: {
          languageId_contentType_contentId_field: {
            languageId: lang.id,
            contentType: content.contentType,
            contentId: content.contentId,
            field: content.field,
          },
        },
        select: { sourceHash: true, isOutdated: true },
      })

      if (!existingTranslation) {
        // Neuer Inhalt ohne Übersetzung
        newContent++
        changes.push({
          ...content,
          oldHash: null,
          newHash,
          hasTranslation: false,
          languageId: lang.id,
        })
      } else if (existingTranslation.sourceHash !== newHash) {
        // Inhalt hat sich geändert
        changedContent++
        changes.push({
          ...content,
          oldHash: existingTranslation.sourceHash,
          newHash,
          hasTranslation: true,
          languageId: lang.id,
        })
      } else {
        // Keine Änderung
        unchangedContent++
      }
    }
  }

  console.log(`✅ Scan complete: ${newContent} new, ${changedContent} changed, ${unchangedContent} unchanged`)

  return {
    totalScanned: translatableContent.length * languages.length,
    newContent,
    changedContent,
    unchangedContent,
    changes,
  }
}

/**
 * Markiert geänderte Übersetzungen als veraltet (isOutdated = true)
 * und erstellt Jobs für neue/geänderte Inhalte
 */
export async function markOutdatedAndCreateJobs(
  changes: ChangedContent[],
  createJobsForNew: boolean = true,
  createJobsForChanged: boolean = true
): Promise<{ markedOutdated: number; jobsCreated: number }> {
  let markedOutdated = 0
  let jobsCreated = 0

  for (const change of changes) {
    if (change.hasTranslation) {
      // Existierende Übersetzung als veraltet markieren
      await prisma.translation.update({
        where: {
          languageId_contentType_contentId_field: {
            languageId: change.languageId,
            contentType: change.contentType,
            contentId: change.contentId,
            field: change.field,
          },
        },
        data: { isOutdated: true },
      })
      markedOutdated++
    }

    // Job erstellen für neue oder geänderte Inhalte
    const shouldCreateJob = 
      (!change.hasTranslation && createJobsForNew) ||
      (change.hasTranslation && createJobsForChanged)

    if (shouldCreateJob && change.value && change.value.trim().length > 0) {
      // Prüfen ob bereits ein Job existiert
      const existingJob = await prisma.translationJob.findFirst({
        where: {
          languageId: change.languageId,
          contentType: change.contentType,
          contentId: change.contentId,
          field: change.field,
          status: { in: ['PENDING', 'PROCESSING'] },
        },
      })

      if (!existingJob) {
        await prisma.translationJob.create({
          data: {
            languageId: change.languageId,
            contentType: change.contentType,
            contentId: change.contentId,
            field: change.field,
            originalText: change.value,
            sourceHash: change.newHash,
            priority: change.priority,
            status: 'PENDING',
          },
        })
        jobsCreated++
      }
    }
  }

  console.log(`📝 Marked ${markedOutdated} translations as outdated, created ${jobsCreated} new jobs`)

  return { markedOutdated, jobsCreated }
}

/**
 * Vollständiger Scan: Erkennt Änderungen und erstellt Jobs
 */
export async function scanAndQueueTranslations(
  languageId?: string,
  options: {
    createJobsForNew?: boolean
    createJobsForChanged?: boolean
  } = {}
): Promise<ScanResult & { markedOutdated: number; jobsCreated: number }> {
  const { createJobsForNew = true, createJobsForChanged = true } = options

  const scanResult = await scanForChanges(languageId)
  
  const { markedOutdated, jobsCreated } = await markOutdatedAndCreateJobs(
    scanResult.changes,
    createJobsForNew,
    createJobsForChanged
  )

  return {
    ...scanResult,
    markedOutdated,
    jobsCreated,
  }
}


