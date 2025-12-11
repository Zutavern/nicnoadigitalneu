import { prisma } from '@/lib/prisma'

export interface TranslatableContent {
  contentType: string
  contentId: string
  field: string
  value: string
  priority: number
}

// Definition der übersetzbaren Felder pro Content-Type
const TRANSLATABLE_FIELDS: Record<string, { fields: string[]; priority: number }> = {
  // Seiten-Configs (höchste Priorität) - inkl. SEO-Metadaten
  home_page_config: {
    fields: [
      'heroTitle', 'heroSubtitle', 'heroCtaText', 'heroSecondaryCtaText',
      'featuresTitle', 'featuresSubtitle',
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 100,
  },
  product_page_config: {
    fields: [
      'heroTitle', 'heroSubtitle', 'heroCtaText',
      'featuresTitle', 'featuresSubtitle',
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 100,
  },
  about_us_page_config: {
    fields: [
      'heroTitle', 'heroSubtitle',
      'visionTitle', 'visionText',
      'missionTitle', 'missionText',
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 90,
  },
  career_page_config: {
    fields: [
      'heroTitle', 'heroSubtitle', 'heroDescription',
      'benefitsTitle', 'benefitsSubtitle',
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 80,
  },
  partner_page_config: {
    fields: [
      'heroBadgeText', 'heroTitle', 'heroDescription',
      'heroFeature1Text', 'heroFeature2Text', 'heroFeature3Text',
      'ctaTitle', 'ctaDescription', 'ctaButton1Text', 'ctaButton2Text',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 80,
  },
  faq_page_config: {
    fields: [
      'heroTitle', 'heroSubtitle',
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 80,
  },
  press_page_config: {
    fields: [
      'heroTitle', 'heroSubtitle',
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 70,
  },
  roadmap_page_config: {
    fields: [
      'heroTitle', 'heroSubtitle',
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 70,
  },
  beta_page_config: {
    fields: [
      'heroTitle', 'heroSubtitle', 'heroDescription',
      'benefitsTitle', 'benefitsSubtitle',
      'requirementsTitle', 'requirementsSubtitle',
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 60,
  },
  updates_page_config: {
    fields: [
      'heroBadgeText', 'heroTitle', 'heroTitleHighlight', 'heroDescription',
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 60,
  },
  blog_page_config: {
    fields: [
      'heroTitle', 'heroSubtitle',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 60,
  },
  legal_page_config: {
    fields: ['title', 'description', 'metaTitle', 'metaDescription'],
    priority: 50,
  },

  // Dynamische Inhalte (mittlere Priorität)
  blog_post: {
    fields: [
      'title', 'excerpt', 'content',
      // SEO & Open Graph
      'metaTitle', 'metaDescription', 'ogTitle', 'ogDescription',
    ],
    priority: 50,
  },
  faq: {
    fields: ['question', 'answer'],
    priority: 50,
  },
  testimonial: {
    fields: ['quote', 'author', 'role', 'company'],
    priority: 40,
  },
  partner: {
    fields: ['name', 'description', 'offer'],
    priority: 40,
  },
  product_feature: {
    fields: ['title', 'description'],
    priority: 40,
  },
  category_animation: {
    fields: ['title', 'description'],
    priority: 40,
  },
  approach_card: {
    fields: ['title', 'description'],
    priority: 40,
  },
  roadmap_item: {
    fields: ['title', 'description'],
    priority: 30,
  },
  beta_benefit: {
    fields: ['title', 'description'],
    priority: 30,
  },
  beta_requirement: {
    fields: ['title', 'description'],
    priority: 30,
  },
  beta_timeline_item: {
    fields: ['title', 'description'],
    priority: 30,
  },
  changelog_entry: {
    fields: ['title', 'description'],
    priority: 30,
  },
  press_article: {
    fields: ['title', 'excerpt', 'source'],
    priority: 30,
  },
  job_posting: {
    fields: ['title', 'description', 'requirements', 'location'],
    priority: 40,
  },
  legal_section: {
    fields: ['title', 'content'],
    priority: 50,
  },

  // System-Texte (niedrigere Priorität)
  error_message: {
    fields: ['message', 'description'],
    priority: 20,
  },
  email_template: {
    fields: ['subject', 'body'],
    priority: 20,
  },
}

// Hilfsfunktion zum sicheren Extrahieren von Feldern
function extractFields(
  record: Record<string, unknown>,
  fields: string[],
  contentType: string,
  contentId: string,
  priority: number
): TranslatableContent[] {
  const results: TranslatableContent[] = []

  for (const field of fields) {
    const value = record[field]
    if (typeof value === 'string' && value.trim().length > 0) {
      results.push({
        contentType,
        contentId,
        field,
        value: value.trim(),
        priority,
      })
    }
  }

  return results
}

// Hauptfunktion: Alle übersetzbaren Inhalte scannen
export async function getTranslatableContent(): Promise<TranslatableContent[]> {
  const allContent: TranslatableContent[] = []

  // 1. Home Page Config
  try {
    const config = await prisma.homePageConfig.findUnique({ where: { id: 'default' } })
    if (config) {
      const fields = TRANSLATABLE_FIELDS.home_page_config
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'home_page_config',
        'default',
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning home_page_config:', e) }

  // 2. Product Page Config
  try {
    const config = await prisma.productPageConfig.findUnique({ where: { id: 'default' } })
    if (config) {
      const fields = TRANSLATABLE_FIELDS.product_page_config
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'product_page_config',
        'default',
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning product_page_config:', e) }

  // 3. About Us Page Config
  try {
    const config = await prisma.aboutUsPageConfig.findUnique({ where: { id: 'default' } })
    if (config) {
      const fields = TRANSLATABLE_FIELDS.about_us_page_config
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'about_us_page_config',
        'default',
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning about_us_page_config:', e) }

  // 4. Career Page Config
  try {
    const config = await prisma.careerPageConfig.findUnique({ where: { id: 'default' } })
    if (config) {
      const fields = TRANSLATABLE_FIELDS.career_page_config
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'career_page_config',
        'default',
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning career_page_config:', e) }

  // 5. Partner Page Config
  try {
    const config = await prisma.partnerPageConfig.findUnique({ where: { id: 'default' } })
    if (config) {
      const fields = TRANSLATABLE_FIELDS.partner_page_config
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'partner_page_config',
        'default',
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning partner_page_config:', e) }

  // 6. FAQ Page Config
  try {
    const config = await prisma.fAQPageConfig.findUnique({ where: { id: 'default' } })
    if (config) {
      const fields = TRANSLATABLE_FIELDS.faq_page_config
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'faq_page_config',
        'default',
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning faq_page_config:', e) }

  // 7. Press Page Config
  try {
    const config = await prisma.pressPageConfig.findUnique({ where: { id: 'default' } })
    if (config) {
      const fields = TRANSLATABLE_FIELDS.press_page_config
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'press_page_config',
        'default',
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning press_page_config:', e) }

  // 8. Roadmap Page Config
  try {
    const config = await prisma.roadmapPageConfig.findUnique({ where: { id: 'default' } })
    if (config) {
      const fields = TRANSLATABLE_FIELDS.roadmap_page_config
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'roadmap_page_config',
        'default',
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning roadmap_page_config:', e) }

  // 9. Beta Page Config
  try {
    const config = await prisma.betaPageConfig.findUnique({ where: { id: 'default' } })
    if (config) {
      const fields = TRANSLATABLE_FIELDS.beta_page_config
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'beta_page_config',
        'default',
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning beta_page_config:', e) }

  // 10. Updates Page Config
  try {
    const config = await prisma.updatesPageConfig.findUnique({ where: { id: 'default' } })
    if (config) {
      const fields = TRANSLATABLE_FIELDS.updates_page_config
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'updates_page_config',
        'default',
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning updates_page_config:', e) }

  // 11. Blog Posts
  try {
    const posts = await prisma.blogPost.findMany({ where: { published: true } })
    const fields = TRANSLATABLE_FIELDS.blog_post
    for (const post of posts) {
      allContent.push(...extractFields(
        post as unknown as Record<string, unknown>,
        fields.fields,
        'blog_post',
        post.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning blog_post:', e) }

  // 12. FAQs
  try {
    const faqs = await prisma.fAQ.findMany({ where: { isActive: true } })
    const fields = TRANSLATABLE_FIELDS.faq
    for (const faq of faqs) {
      allContent.push(...extractFields(
        faq as unknown as Record<string, unknown>,
        fields.fields,
        'faq',
        faq.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning faq:', e) }

  // 13. Testimonials
  try {
    const testimonials = await prisma.testimonial.findMany({ where: { isActive: true } })
    const fields = TRANSLATABLE_FIELDS.testimonial
    for (const t of testimonials) {
      allContent.push(...extractFields(
        t as unknown as Record<string, unknown>,
        fields.fields,
        'testimonial',
        t.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning testimonial:', e) }

  // 14. Partners
  try {
    const partners = await prisma.partner.findMany({ where: { isActive: true } })
    const fields = TRANSLATABLE_FIELDS.partner
    for (const p of partners) {
      allContent.push(...extractFields(
        p as unknown as Record<string, unknown>,
        fields.fields,
        'partner',
        p.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning partner:', e) }

  // 15. Product Features
  try {
    const features = await prisma.productFeature.findMany({ where: { isActive: true } })
    const fields = TRANSLATABLE_FIELDS.product_feature
    for (const f of features) {
      allContent.push(...extractFields(
        f as unknown as Record<string, unknown>,
        fields.fields,
        'product_feature',
        f.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning product_feature:', e) }

  // 16. Category Animations
  try {
    const animations = await prisma.categoryAnimation.findMany({ where: { isActive: true } })
    const fields = TRANSLATABLE_FIELDS.category_animation
    for (const a of animations) {
      allContent.push(...extractFields(
        a as unknown as Record<string, unknown>,
        fields.fields,
        'category_animation',
        a.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning category_animation:', e) }

  // 17. Approach Cards
  try {
    const cards = await prisma.approachCard.findMany({ where: { isActive: true } })
    const fields = TRANSLATABLE_FIELDS.approach_card
    for (const c of cards) {
      allContent.push(...extractFields(
        c as unknown as Record<string, unknown>,
        fields.fields,
        'approach_card',
        c.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning approach_card:', e) }

  // 18. Roadmap Items
  try {
    const items = await prisma.roadmapItem.findMany({ where: { isActive: true } })
    const fields = TRANSLATABLE_FIELDS.roadmap_item
    for (const i of items) {
      allContent.push(...extractFields(
        i as unknown as Record<string, unknown>,
        fields.fields,
        'roadmap_item',
        i.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning roadmap_item:', e) }

  // 19. Job Postings
  try {
    const jobs = await prisma.jobPosting.findMany({ where: { isActive: true } })
    const fields = TRANSLATABLE_FIELDS.job_posting
    for (const j of jobs) {
      allContent.push(...extractFields(
        j as unknown as Record<string, unknown>,
        fields.fields,
        'job_posting',
        j.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning job_posting:', e) }

  // 20. Error Messages
  try {
    const messages = await prisma.errorMessage.findMany()
    const fields = TRANSLATABLE_FIELDS.error_message
    for (const m of messages) {
      allContent.push(...extractFields(
        m as unknown as Record<string, unknown>,
        fields.fields,
        'error_message',
        m.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning error_message:', e) }

  console.log(`📝 Content Scanner: Found ${allContent.length} translatable fields`)
  return allContent
}

// Export für Change Tracking
export { TRANSLATABLE_FIELDS }
