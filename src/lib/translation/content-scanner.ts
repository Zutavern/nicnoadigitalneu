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
  // ============================================
  // Seiten-Configs (höchste Priorität) - inkl. SEO-Metadaten
  // ============================================
  
  home_page_config: {
    fields: [
      // Hero Section
      'heroBadgeText', 'heroTitleLine1', 'heroTitleLine2', 'heroTitleHighlight',
      'heroDescription',
      // CTAs
      'ctaPrimaryText', 'ctaSecondaryText',
      // Features Section
      'featuresTitle', 'featuresSubtitle',
      // CTA Section
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 100,
  },
  
  product_page_config: {
    fields: [
      // Hero Section
      'heroBadgeText', 'heroTitle', 'heroSubtitle', 'heroDescription',
      'heroCtaText', 'heroSecondaryCtaText',
      // Features Section
      'featuresTitle', 'featuresSubtitle',
      // CTA Section
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 100,
  },
  
  about_us_page_config: {
    fields: [
      // Hero Section
      'heroBadgeText', 'heroTitle', 'heroDescription',
      // Team Members
      'team1Name', 'team1Role', 'team1Description',
      'team2Name', 'team2Role', 'team2Description',
      // Vision Section
      'visionBadgeText', 'visionTitle', 'visionDescription',
      // Mission Section
      'missionBadgeText', 'missionTitle', 'missionDescription',
      // CTA Section
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 90,
  },
  
  career_page_config: {
    fields: [
      // Hero Section
      'heroBadgeText', 'heroTitle', 'heroDescription',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 80,
  },
  
  partner_page_config: {
    fields: [
      // Hero Section
      'heroBadgeText', 'heroTitle', 'heroDescription',
      'heroFeature1Text', 'heroFeature2Text', 'heroFeature3Text',
      // Partner Card CTA
      'cardCtaText', 'cardCtaButtonText',
      // CTA Section
      'ctaTitle', 'ctaDescription', 'ctaButton1Text', 'ctaButton2Text',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 80,
  },
  
  faq_page_config: {
    fields: [
      // Hero Section
      'heroBadgeText', 'heroTitle', 'heroDescription',
      // FAQ Section Header
      'sectionTitle', 'sectionDescription',
      // Tab Labels
      'salonTabLabel', 'stylistTabLabel',
      // Contact Section
      'contactText', 'contactLinkText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 80,
  },
  
  press_page_config: {
    fields: [
      // Hero Section
      'heroBadgeText', 'heroTitle', 'heroDescription',
      // CTA Section
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 70,
  },
  
  roadmap_page_config: {
    fields: [
      // Hero Section
      'heroBadgeText', 'heroTitle', 'heroDescription',
      // CTA Section
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 70,
  },
  
  beta_page_config: {
    fields: [
      // Hero Section
      'heroBadgeText', 'heroTitle', 'heroTitleHighlight', 'heroDescription',
      'heroCtaPrimaryText', 'heroCtaSecondaryText',
      // Benefits Section
      'benefitsTitle', 'benefitsSubtitle',
      // Requirements Section
      'requirementsTitle', 'requirementsSubtitle',
      // CTA Section
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 60,
  },
  
  updates_page_config: {
    fields: [
      // Hero Section
      'heroBadgeText', 'heroTitle', 'heroTitleHighlight', 'heroDescription',
      // CTA Section
      'ctaTitle', 'ctaDescription', 'ctaButtonText',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 60,
  },
  
  blog_page_config: {
    fields: [
      // Hero Section
      'heroBadgeText', 'heroTitle', 'heroDescription',
      // Featured Section
      'featuredTitle',
      // Category Filter
      'allCategoriesLabel',
      // Newsletter CTA
      'newsletterTitle', 'newsletterDescription', 'newsletterButtonText',
      // SEO
      'defaultMetaTitle', 'defaultMetaDescription',
    ],
    priority: 60,
  },
  
  legal_page_config: {
    fields: [
      // Hero Section
      'heroBadgeText', 'heroTitle', 'heroDescription',
      // SEO
      'metaTitle', 'metaDescription',
    ],
    priority: 50,
  },
  
  // Auth-Seiten (Login/Register)
  auth_page_config: {
    fields: [
      // Login Page
      'loginTitle', 'loginSubtitle', 'loginCtaText', 'loginCtaLink',
      'loginFeature1Text', 'loginFeature2Text', 'loginFeature3Text',
      // Register Page
      'registerTitle', 'registerSubtitle', 'registerCtaText', 'registerCtaLink',
      'registerFeature1Text', 'registerFeature2Text', 'registerFeature3Text',
    ],
    priority: 70,
  },
  
  // Globale SEO-Einstellungen
  global_seo_config: {
    fields: [
      'siteName', 'titleSuffix', 'defaultMetaDescription',
      'organizationName', 'organizationAddress',
    ],
    priority: 90,
  },

  // ============================================
  // Dynamische Inhalte (mittlere Priorität)
  // ============================================
  
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
    fields: ['name', 'text', 'role', 'company'],
    priority: 40,
  },
  
  partner: {
    fields: ['name', 'description', 'offer', 'instructions'],
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
    fields: ['title', 'description', 'requirements', 'benefits', 'location', 'type'],
    priority: 40,
  },
  
  legal_section: {
    fields: ['title', 'content'],
    priority: 50,
  },
  
  // Services (für öffentliche Seiten)
  service_category: {
    fields: ['name', 'description'],
    priority: 30,
  },
  
  service: {
    fields: ['name', 'description'],
    priority: 30,
  },

  // ============================================
  // System-Texte (niedrigere Priorität)
  // ============================================
  
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

  // 21. Auth Page Config (Login/Register Seiten)
  try {
    const config = await prisma.authPageConfig.findUnique({ where: { id: 'default' } })
    if (config) {
      const fields = TRANSLATABLE_FIELDS.auth_page_config
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'auth_page_config',
        'default',
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning auth_page_config:', e) }

  // 22. Global SEO Config
  try {
    const config = await prisma.globalSeoConfig.findUnique({ where: { id: 'default' } })
    if (config) {
      const fields = TRANSLATABLE_FIELDS.global_seo_config
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'global_seo_config',
        'default',
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning global_seo_config:', e) }

  // 23. Service Categories
  try {
    const categories = await prisma.serviceCategory.findMany({ where: { isActive: true } })
    const fields = TRANSLATABLE_FIELDS.service_category
    for (const c of categories) {
      allContent.push(...extractFields(
        c as unknown as Record<string, unknown>,
        fields.fields,
        'service_category',
        c.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning service_category:', e) }

  // 24. Services
  try {
    const services = await prisma.service.findMany({ where: { isActive: true } })
    const fields = TRANSLATABLE_FIELDS.service
    for (const s of services) {
      allContent.push(...extractFields(
        s as unknown as Record<string, unknown>,
        fields.fields,
        'service',
        s.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning service:', e) }

  // 25. Blog Page Config
  try {
    const configs = await prisma.blogPageConfig.findMany()
    const fields = TRANSLATABLE_FIELDS.blog_page_config
    for (const config of configs) {
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'blog_page_config',
        config.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning blog_page_config:', e) }

  // 26. Legal Page Configs (Impressum, Datenschutz, AGB)
  try {
    const configs = await prisma.legalPageConfig.findMany()
    const fields = TRANSLATABLE_FIELDS.legal_page_config
    for (const config of configs) {
      allContent.push(...extractFields(
        config as unknown as Record<string, unknown>,
        fields.fields,
        'legal_page_config',
        config.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning legal_page_config:', e) }

  // 27. Legal Sections
  try {
    const sections = await prisma.legalSection.findMany({ where: { isActive: true } })
    const fields = TRANSLATABLE_FIELDS.legal_section
    for (const s of sections) {
      allContent.push(...extractFields(
        s as unknown as Record<string, unknown>,
        fields.fields,
        'legal_section',
        s.id,
        fields.priority
      ))
    }
  } catch (e) { console.warn('Error scanning legal_section:', e) }

  console.log(`📝 Content Scanner: Found ${allContent.length} translatable fields`)
  return allContent
}

// Export für Change Tracking
export { TRANSLATABLE_FIELDS }
