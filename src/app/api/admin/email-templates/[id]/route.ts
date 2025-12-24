import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive, getMockAdminEmailTemplates } from '@/lib/mock-data'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Einzelnes Template abrufen
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    
    // Demo-Modus prüfen
    if (await isDemoModeActive()) {
      const mockTemplates = getMockAdminEmailTemplates()
      const mockTemplate = mockTemplates.find(t => t.id === id)
      
      if (!mockTemplate) {
        return NextResponse.json(
          { error: 'Template nicht gefunden' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(mockTemplate)
    }
    
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
      include: {
        sentEmails: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            recipientEmail: true,
            subject: true,
            status: true,
            sentAt: true,
            createdAt: true,
          }
        },
        _count: {
          select: { sentEmails: true }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching email template:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Templates' },
      { status: 500 }
    )
  }
}

// PUT - Template aktualisieren
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    // Demo-Modus prüfen - Speichern nicht erlaubt
    if (await isDemoModeActive()) {
      return NextResponse.json(
        { error: 'Im Demo-Modus können keine Änderungen gespeichert werden. Deaktiviere den Demo-Modus in den Plattform-Einstellungen.' },
        { status: 403 }
      )
    }
    
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, subject, content, category, primaryColor, logoUrl, isActive } = body

    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template nicht gefunden' },
        { status: 404 }
      )
    }

    const updated = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name,
        description,
        subject,
        content,
        category,
        primaryColor,
        logoUrl,
        isActive,
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Templates' },
      { status: 500 }
    )
  }
}

// DELETE - Template löschen
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template nicht gefunden' },
        { status: 404 }
      )
    }

    if (template.isSystem) {
      return NextResponse.json(
        { error: 'System-Templates können nicht gelöscht werden' },
        { status: 400 }
      )
    }

    await prisma.emailTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting email template:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Templates' },
      { status: 500 }
    )
  }
}











