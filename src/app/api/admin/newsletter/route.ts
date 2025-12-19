import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NewsletterStatus, NewsletterSegment } from '@prisma/client'

// GET - Liste aller Newsletter
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as NewsletterStatus | null
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = status ? { status } : {}

    const [newsletters, total] = await Promise.all([
      prisma.newsletter.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.newsletter.count({ where })
    ])

    // Transform designJson to include contentBlocks at top level for convenience
    const transformedNewsletters = newsletters.map(newsletter => {
      const designJson = newsletter.designJson as Record<string, unknown> | null
      return {
        ...newsletter,
        contentBlocks: designJson?.contentBlocks || [],
      }
    })

    return NextResponse.json({
      newsletters: transformedNewsletters,
      total,
      hasMore: offset + newsletters.length < total
    })
  } catch (error) {
    console.error('Newsletter GET error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Newsletter' },
      { status: 500 }
    )
  }
}

// POST - Neuen Newsletter erstellen
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { name, subject, preheader, designJson, contentBlocks, segment } = body

    if (!name || !subject) {
      return NextResponse.json(
        { error: 'Name und Betreff sind erforderlich' },
        { status: 400 }
      )
    }

    // Store contentBlocks inside designJson for backwards compatibility
    const finalDesignJson = contentBlocks 
      ? { contentBlocks, ...designJson }
      : designJson || {}

    const newsletter = await prisma.newsletter.create({
      data: {
        name,
        subject,
        preheader: preheader || null,
        designJson: finalDesignJson,
        segment: segment || NewsletterSegment.ALL,
        status: NewsletterStatus.DRAFT,
        createdBy: session.user.id
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Return contentBlocks at top level
    const designJsonTyped = newsletter.designJson as Record<string, unknown> | null
    return NextResponse.json({ 
      newsletter: {
        ...newsletter,
        contentBlocks: designJsonTyped?.contentBlocks || [],
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Newsletter POST error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Newsletters' },
      { status: 500 }
    )
  }
}
