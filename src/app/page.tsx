import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { MainNav } from '@/components/layout/main-nav'
import { Hero } from '@/components/sections/hero'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { HomepageFAQSection } from '@/components/sections/homepage-faq-section'
import { Footer } from '@/components/layout/footer'
import { getServerLocale, applyTranslations, applyConfigTranslations } from '@/lib/translation/apply-translations'
import { HomepageTracker } from '@/components/analytics/page-tracker'

export const metadata: Metadata = {
  title: 'NICNOA&CO.online - Moderne Salon-Space Verwaltung',
  description: 'Revolutionieren Sie die Art und Weise, wie Salon-Spaces verwaltet werden. Coworking im Beauty-Bereich einfach, effizient und profitabel.',
}

// Revalidate every 5 minutes for fresh data
export const revalidate = 300

interface Testimonial {
  id: string
  name: string
  role: 'STYLIST' | 'SALON_OWNER'
  text: string
  imageUrl: string | null
  company: string | null
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  role: 'STYLIST' | 'SALON_OWNER'
}

async function getTestimonials(): Promise<{
  STYLIST: Testimonial[]
  SALON_OWNER: Testimonial[]
}> {
  try {
    const [stylistTestimonials, salonOwnerTestimonials] = await Promise.all([
      prisma.testimonial.findMany({
        where: { isActive: true, role: 'STYLIST' },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          role: true,
          text: true,
          imageUrl: true,
          company: true,
        },
      }),
      prisma.testimonial.findMany({
        where: { isActive: true, role: 'SALON_OWNER' },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          role: true,
          text: true,
          imageUrl: true,
          company: true,
        },
      }),
    ])

    return {
      STYLIST: stylistTestimonials as Testimonial[],
      SALON_OWNER: salonOwnerTestimonials as Testimonial[],
    }
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return { STYLIST: [], SALON_OWNER: [] }
  }
}

async function getHomepageFAQs(): Promise<{
  STYLIST: FAQ[]
  SALON_OWNER: FAQ[]
}> {
  try {
    // Prisma Model für FAQs - wegen Großschreibung
    const FAQModel = (prisma as any).fAQ || (prisma as any).faq || (prisma as any).FAQ

    if (FAQModel && typeof FAQModel.findMany === 'function') {
      const [stylistFaqs, salonOwnerFaqs] = await Promise.all([
        FAQModel.findMany({
          where: {
            isActive: true,
            showOnHomepage: true,
            role: 'STYLIST',
          },
          orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'desc' },
          ],
          select: {
            id: true,
            question: true,
            answer: true,
            category: true,
            role: true,
          },
        }),
        FAQModel.findMany({
          where: {
            isActive: true,
            showOnHomepage: true,
            role: 'SALON_OWNER',
          },
          orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'desc' },
          ],
          select: {
            id: true,
            question: true,
            answer: true,
            category: true,
            role: true,
          },
        }),
      ])

      return {
        STYLIST: stylistFaqs as FAQ[],
        SALON_OWNER: salonOwnerFaqs as FAQ[],
      }
    }

    // Fallback: Raw SQL
    const [stylistFaqs, salonOwnerFaqs] = await Promise.all([
      prisma.$queryRaw`
        SELECT id, question, answer, category, role
        FROM faqs 
        WHERE is_active = true AND show_on_homepage = true AND role = 'STYLIST'
        ORDER BY sort_order ASC, created_at DESC
      ` as Promise<FAQ[]>,
      prisma.$queryRaw`
        SELECT id, question, answer, category, role
        FROM faqs 
        WHERE is_active = true AND show_on_homepage = true AND role = 'SALON_OWNER'
        ORDER BY sort_order ASC, created_at DESC
      ` as Promise<FAQ[]>,
    ])

    return {
      STYLIST: stylistFaqs || [],
      SALON_OWNER: salonOwnerFaqs || [],
    }
  } catch (error) {
    console.error('Error fetching homepage FAQs:', error)
    return { STYLIST: [], SALON_OWNER: [] }
  }
}

async function getFAQPageConfig() {
  try {
    const FAQPageConfigModel = (prisma as any).fAQPageConfig || (prisma as any).faqPageConfig || (prisma as any).FAQPageConfig

    if (FAQPageConfigModel && typeof FAQPageConfigModel.findFirst === 'function') {
      const config = await FAQPageConfigModel.findFirst()
      return config
    }

    // Fallback Raw SQL
    const result = await prisma.$queryRaw`
      SELECT 
        section_title as "sectionTitle",
        section_description as "sectionDescription",
        salon_tab_label as "salonTabLabel",
        stylist_tab_label as "stylistTabLabel"
      FROM faq_page_config
      LIMIT 1
    ` as any[]

    return result?.[0] || null
  } catch (error) {
    console.error('Error fetching FAQ page config:', error)
    return null
  }
}

async function getGlobalUIConfig() {
  try {
    const config = await prisma.globalUIConfig.findUnique({
      where: { id: 'default' },
      select: {
        homeFaqButtonText: true,
      },
    })
    return config
  } catch (error) {
    console.error('Error fetching GlobalUIConfig:', error)
    return null
  }
}

export default async function Home() {
  // Aktuelle Sprache ermitteln
  const locale = await getServerLocale()
  
  // Daten werden auf dem Server geladen - kein Wasserfall!
  const [testimonials, homepageFaqs, faqConfig, globalUIConfig] = await Promise.all([
    getTestimonials(),
    getHomepageFAQs(),
    getFAQPageConfig(),
    getGlobalUIConfig(),
  ])

  // Übersetzungen anwenden
  const translatedTestimonials = {
    STYLIST: await applyTranslations(
      testimonials.STYLIST,
      'testimonial',
      locale,
      ['text', 'name', 'company']
    ),
    SALON_OWNER: await applyTranslations(
      testimonials.SALON_OWNER,
      'testimonial',
      locale,
      ['text', 'name', 'company']
    ),
  }

  const translatedFaqs = {
    STYLIST: await applyTranslations(
      homepageFaqs.STYLIST,
      'faq',
      locale,
      ['question', 'answer']
    ),
    SALON_OWNER: await applyTranslations(
      homepageFaqs.SALON_OWNER,
      'faq',
      locale,
      ['question', 'answer']
    ),
  }

  const translatedFaqConfig = await applyConfigTranslations(
    faqConfig,
    'faq_page_config',
    'default',
    locale,
    ['sectionTitle', 'sectionDescription', 'salonTabLabel', 'stylistTabLabel']
  )

  return (
    <main className="relative min-h-screen">
      <HomepageTracker />
      <MainNav />
      <Hero />
      <TestimonialsSection testimonials={translatedTestimonials} />
      <HomepageFAQSection 
        faqs={translatedFaqs}
        config={{
          sectionTitle: translatedFaqConfig?.sectionTitle || 'Häufig gestellte Fragen',
          sectionDescription: translatedFaqConfig?.sectionDescription || 'Finden Sie schnelle Antworten auf die wichtigsten Fragen zu unserer Plattform.',
          salonTabLabel: translatedFaqConfig?.salonTabLabel || 'Für Salonbesitzer',
          stylistTabLabel: translatedFaqConfig?.stylistTabLabel || 'Für Stuhlmieter',
          buttonText: globalUIConfig?.homeFaqButtonText || 'Noch mehr Fragen & Antworten',
          buttonLink: '/faq',
        }}
      />
      <Footer />
    </main>
  )
}
