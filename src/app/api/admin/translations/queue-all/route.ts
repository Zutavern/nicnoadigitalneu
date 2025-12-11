import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createHash } from 'crypto'
import { getTranslatableContent } from '@/lib/translation/content-scanner'

// POST: Alle Inhalte für alle aktiven Sprachen zur Übersetzung einreihen
export async function POST() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Aktive Sprachen (außer Default) abrufen
    const activeLanguages = await prisma.language.findMany({
      where: {
        isActive: true,
        isDefault: false,
      },
    })

    if (activeLanguages.length === 0) {
      return NextResponse.json({
        success: true,
        jobsCreated: 0,
        message: 'Keine zusätzlichen Sprachen aktiviert',
      })
    }

    // Alle übersetzbaren Inhalte scannen
    const translatableContent = await getTranslatableContent()

    let jobsCreated = 0
    const errors: string[] = []

    // Für jede Sprache und jeden Inhalt einen Job erstellen
    for (const lang of activeLanguages) {
      for (const content of translatableContent) {
        try {
          const sourceHash = createHash('sha256')
            .update(content.value)
            .digest('hex')

          // Prüfen ob bereits eine aktuelle Übersetzung existiert
          const existingTranslation = await prisma.translation.findUnique({
            where: {
              languageId_contentType_contentId_field: {
                languageId: lang.id,
                contentType: content.contentType,
                contentId: content.contentId,
                field: content.field,
              },
            },
          })

          // Nur Job erstellen wenn keine Übersetzung existiert oder veraltet ist
          if (!existingTranslation || existingTranslation.sourceHash !== sourceHash) {
            // Prüfen ob bereits ein pending Job existiert
            const existingJob = await prisma.translationJob.findFirst({
              where: {
                languageId: lang.id,
                contentType: content.contentType,
                contentId: content.contentId,
                field: content.field,
                status: { in: ['PENDING', 'PROCESSING'] },
              },
            })

            if (!existingJob) {
              await prisma.translationJob.create({
                data: {
                  languageId: lang.id,
                  contentType: content.contentType,
                  contentId: content.contentId,
                  field: content.field,
                  originalText: content.value,
                  sourceHash,
                  priority: content.priority || 0,
                },
              })
              jobsCreated++
            }
          }
        } catch (err) {
          errors.push(`${content.contentType}/${content.contentId}/${content.field}: ${err}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      jobsCreated,
      languagesProcessed: activeLanguages.length,
      contentItemsScanned: translatableContent.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    })
  } catch (error) {
    console.error('Error queueing translations:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Übersetzungsjobs' },
      { status: 500 }
    )
  }
}
