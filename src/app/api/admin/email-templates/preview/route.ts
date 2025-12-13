import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { renderEmailPreview } from '@/lib/email'

// POST - Email Preview generieren
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { templateSlug, customContent, previewData } = body

    if (!templateSlug) {
      return NextResponse.json(
        { error: 'Template Slug erforderlich' },
        { status: 400 }
      )
    }

    const result = await renderEmailPreview(templateSlug, customContent, previewData)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating preview:', error)
    return NextResponse.json(
      { error: 'Fehler beim Generieren der Vorschau' },
      { status: 500 }
    )
  }
}











