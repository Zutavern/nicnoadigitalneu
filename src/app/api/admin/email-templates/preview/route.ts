import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { renderEmailPreview, renderEmailPreviewFromMock } from '@/lib/email'
import { isDemoModeActive, getMockAdminEmailTemplates } from '@/lib/mock-data'

// POST - Email Preview generieren
export async function POST(request: Request) {
  try {
    // Demo-Modus prüfen
    const isDemo = await isDemoModeActive()
    
    if (!isDemo) {
      const session = await auth()
      if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
      }
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Ungültiger JSON-Body' },
        { status: 400 }
      )
    }

    const { templateSlug, customContent, previewData } = body

    if (!templateSlug) {
      return NextResponse.json(
        { error: 'Template Slug erforderlich' },
        { status: 400 }
      )
    }

    // Im Demo-Modus: Verwende Mock-Templates
    if (isDemo) {
      const mockTemplates = getMockAdminEmailTemplates()
      const mockTemplate = mockTemplates.find(t => t.slug === templateSlug)
      
      if (!mockTemplate) {
        return NextResponse.json({ error: `Template "${templateSlug}" nicht gefunden` }, { status: 400 })
      }
      
      const result = await renderEmailPreviewFromMock(mockTemplate, customContent, previewData)
      
      if ('error' in result) {
        console.error('Preview generation error:', result.error, { templateSlug })
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      
      return NextResponse.json(result)
    }

    const result = await renderEmailPreview(templateSlug, customContent, previewData)

    if ('error' in result) {
      console.error('Preview generation error:', result.error, { templateSlug })
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating preview:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    return NextResponse.json(
      { error: `Fehler beim Generieren der Vorschau: ${errorMessage}` },
      { status: 500 }
    )
  }
}











