import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Einzelnen Post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post nicht gefunden' }, { status: 404 })
    }

    // Transform tags
    const formattedPost = {
      ...post,
      tagIds: post.tags.map((pt) => pt.tagId),
      tags: post.tags.map((pt) => pt.tag),
    }

    return NextResponse.json({ post: formattedPost })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// PUT: Post aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post nicht gefunden' }, { status: 404 })
    }

    // Calculate reading time
    const wordCount = data.content?.split(/\s+/).length || 0
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    // Handle status change to PUBLISHED
    let publishedAt = existingPost.publishedAt
    if (data.status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      publishedAt = new Date()
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
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
        status: data.status,
        isFeatured: data.isFeatured,
        publishedAt,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        readingTime,
      },
      include: {
        author: true,
        category: true,
      },
    })

    // Update tags
    if (data.tagIds !== undefined) {
      // Remove existing tags
      await prisma.blogPostTag.deleteMany({
        where: { postId: id },
      })

      // Add new tags
      if (data.tagIds.length > 0) {
        await prisma.blogPostTag.createMany({
          data: data.tagIds.map((tagId: string) => ({
            postId: id,
            tagId,
          })),
        })
      }
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
}

// DELETE: Post löschen
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
  }
}


