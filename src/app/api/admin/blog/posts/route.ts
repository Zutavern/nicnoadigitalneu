import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Alle Posts (Admin)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    
    if (status) where.status = status
    if (category) where.categoryId = category
    if (author) where.authorId = author

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          category: {
            select: { id: true, name: true, color: true },
          },
          _count: {
            select: { tags: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching admin posts:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// POST: Neuen Post erstellen
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const data = await request.json()

    // Generate slug from title
    let slug = data.slug || generateSlug(data.title)
    
    // Check if slug exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    })
    
    if (existingPost) {
      slug = `${slug}-${Date.now()}`
    }

    // Calculate reading time (approx 200 words per minute)
    const wordCount = data.content?.split(/\s+/).length || 0
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content || '',
        featuredImage: data.featuredImage,
        featuredImageAlt: data.featuredImageAlt,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords || [],
        canonicalUrl: data.canonicalUrl,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
        authorId: data.authorId,
        categoryId: data.categoryId,
        status: data.status || 'DRAFT',
        isFeatured: data.isFeatured || false,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        readingTime,
      },
      include: {
        author: true,
        category: true,
      },
    })

    // Handle tags
    if (data.tagIds?.length > 0) {
      await prisma.blogPostTag.createMany({
        data: data.tagIds.map((tagId: string) => ({
          postId: post.id,
          tagId,
        })),
      })
    }

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}


