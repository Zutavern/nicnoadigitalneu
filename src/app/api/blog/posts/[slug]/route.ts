import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const post = await prisma.blogPost.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        publishedAt: {
          lte: new Date(),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
            role: true,
            bio: true,
            linkedinUrl: true,
            instagramUrl: true,
            twitterUrl: true,
            websiteUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Blog-Post nicht gefunden' },
        { status: 404 }
      )
    }

    // Increment view count (non-blocking)
    prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    }).catch(console.error)

    // Get related posts (same category or tags)
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
        id: { not: post.id },
        OR: [
          { categoryId: post.categoryId },
          {
            tags: {
              some: {
                tagId: {
                  in: post.tags.map((t) => t.tagId),
                },
              },
            },
          },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    })

    // Transform tags
    const formattedPost = {
      ...post,
      tags: post.tags.map((pt) => pt.tag),
    }

    return NextResponse.json({
      post: formattedPost,
      relatedPosts,
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Blog-Posts' },
      { status: 500 }
    )
  }
}


