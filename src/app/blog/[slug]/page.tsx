import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BlogPostContent } from './blog-post-content'

export const revalidate = 300

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featuredImage: string | null
  featuredImageAlt: string | null
  metaTitle: string | null
  metaDescription: string | null
  publishedAt: Date | null
  readingTime: number
  viewCount: number
  author: {
    id: string
    name: string
    slug: string
    avatar: string | null
    role: string | null
    bio: string | null
    linkedinUrl: string | null
    instagramUrl: string | null
    twitterUrl: string | null
    websiteUrl: string | null
  }
  category: {
    id: string
    name: string
    slug: string
    color: string | null
  } | null
  tags: Array<{
    tag: {
      id: string
      name: string
      slug: string
    }
  }>
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: Date | null
  readingTime: number
  author: {
    id: string
    name: string
    avatar: string | null
  }
  category: {
    id: string
    name: string
    slug: string
    color: string | null
  } | null
}

async function getPost(slug: string): Promise<{
  post: BlogPost | null
  relatedPosts: RelatedPost[]
}> {
  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
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
    return { post: null, relatedPosts: [] }
  }

  // Increment view count (non-blocking)
  prisma.blogPost
    .update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(console.error)

  // Get related posts
  const tagIds = post.tags.map((t) => t.tag.id)
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
              tagId: { in: tagIds },
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

  return { post, relatedPosts }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { post } = await getPost(slug)

  if (!post) {
    return {
      title: 'Artikel nicht gefunden | NICNOA Blog',
    }
  }

  return {
    title: post.metaTitle || `${post.title} | NICNOA Blog`,
    description: post.metaDescription || post.excerpt || undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name],
      images: post.featuredImage
        ? [
            {
              url: post.featuredImage,
              width: 1200,
              height: 630,
              alt: post.featuredImageAlt || post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { post, relatedPosts } = await getPost(slug)

  if (!post) {
    notFound()
  }

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    datePublished: post.publishedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.linkedinUrl || undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'NICNOA',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nicnoa.de/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://nicnoa.de/blog/${post.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostContent
        post={{
          ...post,
          tags: post.tags.map((t) => t.tag),
        }}
        relatedPosts={relatedPosts}
      />
    </>
  )
}

