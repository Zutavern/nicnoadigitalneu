import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive, getMockAdminEmailTemplates } from '@/lib/mock-data'

// GET - Alle Email Templates abrufen
export async function GET(request: Request) {
  try {
    // Demo-Modus prüfen
    if (await isDemoModeActive({ ignoreForAdmin: true })) {
      return NextResponse.json(getMockAdminEmailTemplates())
    }

    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const templates = await prisma.emailTemplate.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { sentEmails: true }
        }
      }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Templates' },
      { status: 500 }
    )
  }
}

// POST - Neues Template erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { slug, name, description, subject, content, category, primaryColor, logoUrl } = body

    // Prüfe ob slug bereits existiert
    const existing = await prisma.emailTemplate.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ein Template mit diesem Slug existiert bereits' },
        { status: 400 }
      )
    }

    const template = await prisma.emailTemplate.create({
      data: {
        slug,
        name,
        description,
        subject,
        content,
        category: category || 'custom',
        primaryColor,
        logoUrl,
        isActive: true,
        isSystem: false,
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating email template:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Templates' },
      { status: 500 }
    )
  }
}
