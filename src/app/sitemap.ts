import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.nicnoa.online'

// Statische Seiten
const STATIC_PAGES = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/produkt', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/preise', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/uber-uns', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/partner', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/karriere', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/presse', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/roadmap', priority: 0.5, changeFrequency: 'weekly' as const },
  { path: '/updates', priority: 0.5, changeFrequency: 'weekly' as const },
  { path: '/beta-programm', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
  { path: '/impressum', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/datenschutz', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/agb', priority: 0.3, changeFrequency: 'yearly' as const },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = []

  // Aktive Sprachen laden
  let activeLanguages: { id: string; isDefault: boolean }[] = []
  try {
    activeLanguages = await prisma.language.findMany({
      where: { isActive: true },
      select: { id: true, isDefault: true },
      orderBy: { sortOrder: 'asc' },
    })
  } catch (error) {
    console.warn('Error fetching languages for sitemap:', error)
    activeLanguages = [{ id: 'de', isDefault: true }]
  }

  const defaultLang = activeLanguages.find(l => l.isDefault) || activeLanguages[0]

  // 1. Statische Seiten
  for (const page of STATIC_PAGES) {
    const languages: Record<string, string> = {}
    
    for (const lang of activeLanguages) {
      const url = lang.isDefault
        ? `${BASE_URL}${page.path}`
        : `${BASE_URL}/${lang.id}${page.path}`
      languages[lang.id] = url
    }

    sitemapEntries.push({
      url: `${BASE_URL}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: activeLanguages.length > 1 ? { languages } : undefined,
    })
  }

  // 2. Blog-Posts
  try {
    const blogPosts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    for (const post of blogPosts) {
      const languages: Record<string, string> = {}
      
      for (const lang of activeLanguages) {
        const url = lang.isDefault
          ? `${BASE_URL}/blog/${post.slug}`
          : `${BASE_URL}/${lang.id}/blog/${post.slug}`
        languages[lang.id] = url
      }

      sitemapEntries.push({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: activeLanguages.length > 1 ? { languages } : undefined,
      })
    }
  } catch (error) {
    console.warn('Error fetching blog posts for sitemap:', error)
  }

  // 3. Job-Postings
  try {
    const jobs = await prisma.jobPosting.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })

    for (const job of jobs) {
      const languages: Record<string, string> = {}
      
      for (const lang of activeLanguages) {
        const url = lang.isDefault
          ? `${BASE_URL}/karriere/${job.slug}`
          : `${BASE_URL}/${lang.id}/karriere/${job.slug}`
        languages[lang.id] = url
      }

      sitemapEntries.push({
        url: `${BASE_URL}/karriere/${job.slug}`,
        lastModified: job.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.5,
        alternates: activeLanguages.length > 1 ? { languages } : undefined,
      })
    }
  } catch (error) {
    console.warn('Error fetching jobs for sitemap:', error)
  }

  return sitemapEntries
}



