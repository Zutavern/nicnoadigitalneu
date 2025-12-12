import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { BlogContent } from './blog-content'

export const metadata: Metadata = {
  title: 'Blog | NICNOA - Insights für die Beauty-Branche',
  description: 'Tipps, Trends und Expertenwissen für Salonbesitzer und Stylisten. Erfahre mehr über modernes Salon-Management, Marketing und Karrierechancen.',
}

export const revalidate = 300

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: Date | null
  readingTime: number
  isFeatured: boolean
  author: {
    id: string
    name: string
    slug: string
    avatar: string | null
    role: string | null
  }
  category: {
    id: string
    name: string
    slug: string
    color: string | null
  } | null
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  color: string | null
  _count: {
    posts: number
  }
}

interface BlogPageConfig {
  heroBadgeText: string | null
  heroTitle: string
  heroDescription: string | null
  featuredTitle: string | null
  showCategoryFilter: boolean
  allCategoriesLabel: string
  // Newsletter
  newsletterTitle: string | null
  newsletterDescription: string | null
  newsletterButtonText: string | null
}

async function getBlogData(): Promise<{
  posts: BlogPost[]
  featuredPost: BlogPost | null
  categories: BlogCategory[]
  config: BlogPageConfig
}> {
  const [posts, categories, config] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
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
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
    }),
    prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED',
                publishedAt: { lte: new Date() },
              },
            },
          },
        },
      },
    }),
    prisma.blogPageConfig.findFirst(),
  ])

  const featuredPost = posts.find((p) => p.isFeatured) || posts[0] || null
  const regularPosts = posts.filter((p) => p.id !== featuredPost?.id)

  const defaultConfig: BlogPageConfig = {
    heroBadgeText: 'NICNOA Blog',
    heroTitle: 'Insights für die Beauty-Branche',
    heroDescription:
      'Entdecke Tipps, Trends und Expertenwissen für Salonbesitzer und Stylisten.',
    featuredTitle: 'Featured Story',
    showCategoryFilter: true,
    allCategoriesLabel: 'Alle Artikel',
    newsletterTitle: 'Bleib auf dem Laufenden',
    newsletterDescription: 'Erhalte die neuesten Tipps und Insights direkt in dein Postfach.',
    newsletterButtonText: 'Jetzt Mitglied werden',
  }

  return {
    posts: regularPosts,
    featuredPost,
    categories,
    config: config || defaultConfig,
  }
}

export default async function BlogPage() {
  const { posts, featuredPost, categories, config } = await getBlogData()

  return (
    <BlogContent
      posts={posts}
      featuredPost={featuredPost}
      categories={categories}
      config={config}
    />
  )
}


