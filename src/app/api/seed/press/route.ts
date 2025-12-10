import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const sampleArticles = [
  {
    title: 'NICNOA revolutioniert die Friseurbranche mit innovativer Plattform',
    excerpt: 'Das Startup NICNOA bringt eine neue Lösung für Salonbesitzer und selbstständige Stylisten auf den Markt, die das Stuhlmieten digitalisiert und vereinfacht.',
    source: 'Gründerszene',
    sourceUrl: 'https://www.gruenderszene.de',
    category: 'feature',
    isFeatured: true,
    publishedAt: new Date('2024-03-15'),
  },
  {
    title: 'Interview: „Wir machen Friseure zu erfolgreichen Unternehmern"',
    excerpt: 'Im Gespräch mit dem NICNOA-Gründerteam über ihre Vision, die Herausforderungen der Branche und wie digitale Tools Stylisten unterstützen können.',
    source: 'Beauty Forum',
    sourceUrl: 'https://www.beautyforum.de',
    category: 'interview',
    isFeatured: true,
    publishedAt: new Date('2024-02-20'),
  },
  {
    title: 'Stuhlmiete 2.0: Wie NICNOA den Markt verändert',
    excerpt: 'Die Plattform bietet erstmals eine vollständig digitale Lösung für die Verwaltung von Stuhlmieten in Friseursalons.',
    source: 'Friseurwelt',
    sourceUrl: 'https://www.friseurwelt.de',
    category: 'news',
    isFeatured: false,
    publishedAt: new Date('2024-01-10'),
  },
  {
    title: 'NICNOA erhält Seed-Finanzierung für Expansion',
    excerpt: 'Das Beauty-Tech-Startup sichert sich eine siebenstellige Finanzierung, um seine Plattform europaweit auszubauen.',
    source: 'TechCrunch DE',
    sourceUrl: 'https://www.techcrunch.com',
    category: 'announcement',
    isFeatured: true,
    publishedAt: new Date('2024-04-05'),
  },
  {
    title: 'Selbstständig im Salon: NICNOA macht\'s möglich',
    excerpt: 'Immer mehr Friseure entscheiden sich für die Selbstständigkeit. NICNOA bietet ihnen die technische Infrastruktur.',
    source: 'Friseur Magazin',
    sourceUrl: 'https://www.friseurmagazin.de',
    category: 'feature',
    isFeatured: false,
    publishedAt: new Date('2023-12-01'),
  },
  {
    title: 'Digitalisierung in der Beauty-Branche: Best Practices',
    excerpt: 'NICNOA wird als Vorreiter bei der Digitalisierung traditioneller Geschäftsmodelle im Beauty-Sektor genannt.',
    source: 'Business Insider DE',
    sourceUrl: 'https://www.businessinsider.de',
    category: 'news',
    isFeatured: false,
    publishedAt: new Date('2023-11-15'),
  },
  {
    title: 'Erfolgsgeschichten: Wie Sarah mit NICNOA ihre Karriere startete',
    excerpt: 'Die junge Stylistin berichtet, wie ihr die Plattform half, den Schritt in die Selbstständigkeit zu wagen.',
    source: 'BUNTE',
    sourceUrl: 'https://www.bunte.de',
    category: 'interview',
    isFeatured: false,
    publishedAt: new Date('2023-10-20'),
  },
  {
    title: 'NICNOA gewinnt Startup Award im Beauty-Bereich',
    excerpt: 'Die Jury lobte insbesondere den innovativen Ansatz und das Potenzial zur Transformation der Branche.',
    source: 'Startup Magazin',
    sourceUrl: 'https://www.startup-magazin.de',
    category: 'announcement',
    isFeatured: false,
    publishedAt: new Date('2024-05-10'),
  },
]

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

export async function POST() {
  try {
    // Lösche vorhandene Artikel (optional)
    await prisma.pressArticle.deleteMany({})

    // Erstelle neue Artikel
    const createdArticles = []
    for (const article of sampleArticles) {
      const slug = generateSlug(article.title)
      const created = await prisma.pressArticle.create({
        data: {
          ...article,
          slug,
          sortOrder: sampleArticles.indexOf(article),
          isActive: true,
        },
      })
      createdArticles.push(created)
    }

    // Erstelle auch die Standard-Seitenkonfiguration
    await prisma.pressPageConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        heroBadgeText: 'Presse & Medien',
        heroTitle: 'NICNOA in den Medien',
        heroDescription: 'Aktuelle Berichte, Interviews und Pressemitteilungen über NICNOA und die Zukunft der Friseurbranche.',
        showStats: true,
        stat1Label: 'Presse-Artikel',
        stat1Value: '50+',
        stat2Label: 'Medienreichweite',
        stat2Value: '10M+',
        stat3Label: 'Auszeichnungen',
        stat3Value: '5',
        showPressKit: true,
        pressKitTitle: 'Presse-Kit',
        pressKitDescription: 'Laden Sie unser Presse-Kit mit Logos, Bildern und Unternehmensinformationen herunter.',
        pressKitDownloadUrl: '',
        contactTitle: 'Presse-Kontakt',
        contactDescription: 'Für Medienanfragen und Interviews stehen wir Ihnen gerne zur Verfügung.',
        contactEmail: 'presse@nicnoa.de',
        contactPhone: '+49 89 1234567',
        contactPerson: 'Lisa Müller, PR Manager',
        metaTitle: 'Presse & Medien | NICNOA',
        metaDescription: 'Aktuelle Berichte und Pressemitteilungen über NICNOA - die innovative Plattform für Friseure und Salons.',
      },
      update: {},
    })

    return NextResponse.json({
      success: true,
      message: `${createdArticles.length} Presse-Artikel erstellt!`,
      articles: createdArticles,
    })
  } catch (error) {
    console.error('Error seeding press articles:', error)
    return NextResponse.json(
      { error: 'Fehler beim Seeden der Presse-Artikel' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const articles = await prisma.pressArticle.findMany({
      orderBy: { publishedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      count: articles.length,
      articles,
    })
  } catch (error) {
    console.error('Error fetching press articles:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Presse-Artikel' },
      { status: 500 }
    )
  }
}

