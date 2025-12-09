import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding Blog data...')

  // Create Blog Authors
  const authors = await Promise.all([
    prisma.blogAuthor.upsert({
      where: { slug: 'daniel-zutavern' },
      update: {},
      create: {
        name: 'Daniel Zutavern',
        slug: 'daniel-zutavern',
        role: 'Gründer & CEO',
        bio: 'Daniel ist Gründer von NICNOA und bringt jahrelange Erfahrung in der Digitalisierung der Beauty-Branche mit.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        linkedinUrl: 'https://linkedin.com/in/danielzutavern',
      },
    }),
    prisma.blogAuthor.upsert({
      where: { slug: 'nico-schneider' },
      update: {},
      create: {
        name: 'Nico Schneider',
        slug: 'nico-schneider',
        role: 'Co-Founder & COO',
        bio: 'Nico ist Co-Founder bei NICNOA und Experte für Salon-Operations und Business Development.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        linkedinUrl: 'https://linkedin.com/in/nicoschneider',
      },
    }),
    prisma.blogAuthor.upsert({
      where: { slug: 'nicnoa-team' },
      update: {},
      create: {
        name: 'NICNOA Team',
        slug: 'nicnoa-team',
        role: 'Redaktion',
        bio: 'Das NICNOA Team teilt regelmäßig Insights, Tipps und Branchennews.',
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
      },
    }),
  ])

  console.log('✅ Authors created:', authors.length)

  // Create Blog Categories
  const categories = await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: 'salon-tipps' },
      update: {},
      create: {
        name: 'Salon-Tipps',
        slug: 'salon-tipps',
        description: 'Praktische Tipps für den Salon-Alltag',
        color: '#3B82F6',
        sortOrder: 1,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'marketing' },
      update: {},
      create: {
        name: 'Marketing',
        slug: 'marketing',
        description: 'Marketing-Strategien für Salons und Stylisten',
        color: '#10B981',
        sortOrder: 2,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'trends' },
      update: {},
      create: {
        name: 'Trends',
        slug: 'trends',
        description: 'Die neuesten Trends aus der Beauty-Branche',
        color: '#F59E0B',
        sortOrder: 3,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'karriere' },
      update: {},
      create: {
        name: 'Karriere',
        slug: 'karriere',
        description: 'Karrieretipps für Stylisten und Salonbesitzer',
        color: '#8B5CF6',
        sortOrder: 4,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        name: 'Business',
        slug: 'business',
        description: 'Business-Insights und Unternehmertipps',
        color: '#EC4899',
        sortOrder: 5,
      },
    }),
  ])

  console.log('✅ Categories created:', categories.length)

  // Create Blog Tags
  const tags = await Promise.all([
    prisma.blogTag.upsert({ where: { slug: 'selbststaendigkeit' }, update: {}, create: { name: 'Selbstständigkeit', slug: 'selbststaendigkeit' } }),
    prisma.blogTag.upsert({ where: { slug: 'stuhlmiete' }, update: {}, create: { name: 'Stuhlmiete', slug: 'stuhlmiete' } }),
    prisma.blogTag.upsert({ where: { slug: 'social-media' }, update: {}, create: { name: 'Social Media', slug: 'social-media' } }),
    prisma.blogTag.upsert({ where: { slug: 'instagram' }, update: {}, create: { name: 'Instagram', slug: 'instagram' } }),
    prisma.blogTag.upsert({ where: { slug: 'kundengewinnung' }, update: {}, create: { name: 'Kundengewinnung', slug: 'kundengewinnung' } }),
    prisma.blogTag.upsert({ where: { slug: 'salonmanagement' }, update: {}, create: { name: 'Salonmanagement', slug: 'salonmanagement' } }),
    prisma.blogTag.upsert({ where: { slug: 'preisgestaltung' }, update: {}, create: { name: 'Preisgestaltung', slug: 'preisgestaltung' } }),
    prisma.blogTag.upsert({ where: { slug: 'finanzen' }, update: {}, create: { name: 'Finanzen', slug: 'finanzen' } }),
    prisma.blogTag.upsert({ where: { slug: 'weiterbildung' }, update: {}, create: { name: 'Weiterbildung', slug: 'weiterbildung' } }),
    prisma.blogTag.upsert({ where: { slug: 'digitalisierung' }, update: {}, create: { name: 'Digitalisierung', slug: 'digitalisierung' } }),
  ])

  console.log('✅ Tags created:', tags.length)

  // Create Blog Posts
  const posts = [
    {
      title: 'Stuhlmiete vs. Anstellung: Was lohnt sich mehr?',
      slug: 'stuhlmiete-vs-anstellung-vergleich',
      excerpt: 'Ein detaillierter Vergleich zwischen Stuhlmiete und Festanstellung. Welches Modell passt besser zu deinen Karrierezielen?',
      content: `
<h2>Die große Frage: Stuhlmiete oder Anstellung?</h2>
<p>Als Friseur*in stehst du früher oder später vor einer wichtigen Entscheidung: Bleibst du in einer Festanstellung oder wagst du den Schritt in die Selbstständigkeit mit einem gemieteten Stuhl?</p>

<h3>Vorteile der Stuhlmiete</h3>
<ul>
  <li><strong>Freiheit:</strong> Du bist dein eigener Chef und bestimmst selbst über Arbeitszeiten, Preise und Kunden.</li>
  <li><strong>Höheres Einkommen:</strong> Bei guter Auslastung kannst du deutlich mehr verdienen als im Angestelltenverhältnis.</li>
  <li><strong>Eigene Marke:</strong> Du baust dir einen eigenen Kundenstamm und eine persönliche Marke auf.</li>
</ul>

<h3>Vorteile der Anstellung</h3>
<ul>
  <li><strong>Sicherheit:</strong> Ein festes Gehalt, Sozialversicherung und bezahlter Urlaub geben dir finanzielle Stabilität.</li>
  <li><strong>Weniger Verwaltung:</strong> Du musst dich nicht um Buchhaltung, Steuern oder Versicherungen kümmern.</li>
  <li><strong>Team:</strong> Du arbeitest in einem Team und hast direkte Kollegen.</li>
</ul>

<blockquote>
"Die Stuhlmiete hat mein Leben verändert. Ich verdiene nicht nur mehr, sondern habe endlich die Freiheit, die ich mir immer gewünscht habe." – Sarah M., Stylistin
</blockquote>

<h3>Fazit</h3>
<p>Beide Modelle haben ihre Berechtigung. Entscheidend ist, was zu deiner aktuellen Lebenssituation und deinen Zielen passt. Mit NICNOA machen wir den Einstieg in die Stuhlmiete so einfach wie nie zuvor.</p>
      `.trim(),
      featuredImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=630&fit=crop',
      isFeatured: true,
      authorSlug: 'daniel-zutavern',
      categorySlug: 'karriere',
      tagSlugs: ['selbststaendigkeit', 'stuhlmiete', 'finanzen'],
      readingTime: 5,
    },
    {
      title: '10 Instagram-Tipps für Friseure: So gewinnst du mehr Kunden',
      slug: 'instagram-tipps-friseure',
      excerpt: 'Social Media ist für Stylisten unverzichtbar. Hier sind 10 erprobte Strategien, um deinen Instagram-Account zum Kundenmagnet zu machen.',
      content: `
<h2>Warum Instagram für Friseure unverzichtbar ist</h2>
<p>Instagram ist die perfekte Plattform für visuelle Berufe. Als Friseur*in kannst du hier deine Arbeit präsentieren und neue Kunden gewinnen.</p>

<h3>1. Zeige deine besten Arbeiten</h3>
<p>Poste regelmäßig Vorher-Nachher-Bilder. Diese performen auf Instagram besonders gut und zeigen dein Können.</p>

<h3>2. Nutze die richtigen Hashtags</h3>
<p>Verwende eine Mischung aus beliebten (#hairstylist) und lokalen (#friseurmuenchen) Hashtags.</p>

<h3>3. Stories sind dein Freund</h3>
<p>Zeige deinen Alltag, Behind-the-Scenes und Sneak Peeks. Stories schaffen Nähe zu deinen Followern.</p>

<h3>4. Interagiere mit deiner Community</h3>
<p>Antworte auf Kommentare und DMs zeitnah. Engagement ist der Schlüssel zum Algorithmus.</p>

<h3>5. Poste zur richtigen Zeit</h3>
<p>Analysiere, wann deine Follower am aktivsten sind und poste zu diesen Zeiten.</p>

<h3>6. Reels nutzen</h3>
<p>Kurze Videos haben eine enorme Reichweite. Zeige Transformationen oder Styling-Tipps.</p>

<h3>7. Konsistente Ästhetik</h3>
<p>Entwickle einen einheitlichen Look für deinen Feed. Das wirkt professionell und wiedererkennbar.</p>

<h3>8. Call-to-Action nicht vergessen</h3>
<p>Fordere deine Follower auf zu interagieren: "Was ist eure Lieblings-Haarfarbe?"</p>

<h3>9. Kooperationen</h3>
<p>Arbeite mit anderen Salons, Fotografen oder Influencern zusammen.</p>

<h3>10. Highlights organisieren</h3>
<p>Nutze Story-Highlights für Preise, Bewertungen, Anfahrt und FAQs.</p>
      `.trim(),
      featuredImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=630&fit=crop',
      isFeatured: false,
      authorSlug: 'nicnoa-team',
      categorySlug: 'marketing',
      tagSlugs: ['social-media', 'instagram', 'kundengewinnung'],
      readingTime: 7,
    },
    {
      title: 'Die wichtigsten Trends 2025: Was Salonbesitzer wissen müssen',
      slug: 'salon-trends-2025',
      excerpt: 'Von Nachhaltigkeit bis Digitalisierung: Diese Trends werden die Beauty-Branche 2025 prägen.',
      content: `
<h2>Die Beauty-Branche im Wandel</h2>
<p>2025 bringt spannende Veränderungen für die Friseurbranche. Wer jetzt die richtigen Weichen stellt, ist für die Zukunft gerüstet.</p>

<h3>Trend 1: Nachhaltigkeit</h3>
<p>Kunden achten zunehmend auf nachhaltige Produkte und Praktiken. Bio-Produkte und wassersparende Techniken werden zum Standard.</p>

<h3>Trend 2: Digitale Buchung</h3>
<p>Online-Terminbuchung ist keine Option mehr, sondern Pflicht. Kunden erwarten 24/7 Buchungsmöglichkeiten.</p>

<h3>Trend 3: Personalisierung</h3>
<p>Individuelle Behandlungen und maßgeschneiderte Produkte sind gefragt. Standardlösungen reichen nicht mehr.</p>

<h3>Trend 4: Wellness-Integration</h3>
<p>Salons werden zu Wohlfühloasen. Kopfmassagen, Aromatherapie und Entspannung sind Teil des Angebots.</p>

<h3>Trend 5: Flexible Arbeitsmodelle</h3>
<p>Stuhlmiete und Coworking-Konzepte setzen sich durch. Flexibilität ist das neue Normal.</p>

<blockquote>
"Die Zukunft gehört den Salons, die Tradition mit Innovation verbinden." – Nico Schneider, NICNOA
</blockquote>
      `.trim(),
      featuredImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=630&fit=crop',
      isFeatured: false,
      authorSlug: 'nico-schneider',
      categorySlug: 'trends',
      tagSlugs: ['digitalisierung', 'salonmanagement'],
      readingTime: 4,
    },
    {
      title: 'Preisgestaltung für Stylisten: So findest du deinen perfekten Preis',
      slug: 'preisgestaltung-stylisten',
      excerpt: 'Die richtige Preisgestaltung ist essenziell für den Erfolg. Lerne, wie du deine Preise strategisch festlegst.',
      content: `
<h2>Der Preis ist heiß: So kalkulierst du richtig</h2>
<p>Viele Stylisten unterschätzen sich und ihre Arbeit. Dabei ist eine durchdachte Preisgestaltung der Schlüssel zum wirtschaftlichen Erfolg.</p>

<h3>Schritt 1: Kosten ermitteln</h3>
<p>Liste alle deine monatlichen Kosten auf: Stuhlmiete, Produkte, Versicherungen, Steuern, private Ausgaben.</p>

<h3>Schritt 2: Arbeitszeit kalkulieren</h3>
<p>Wie viele produktive Stunden arbeitest du wirklich? Rechne realistisch – nicht jede Stunde ist eine Kundenstunde.</p>

<h3>Schritt 3: Stundensatz berechnen</h3>
<p>Teile deine Gesamtkosten + gewünschten Gewinn durch deine produktiven Stunden.</p>

<h3>Schritt 4: Marktvergleich</h3>
<p>Schau dir an, was andere Stylisten in deiner Region verlangen. Du musst nicht der günstigste sein!</p>

<h3>Schritt 5: Wert kommunizieren</h3>
<p>Erkläre deinen Kunden, warum dein Service seinen Preis wert ist. Qualität hat ihren Preis.</p>

<h3>Typische Fehler vermeiden</h3>
<ul>
  <li>Zu niedrige Preise aus Angst vor Kundenverlust</li>
  <li>Keine regelmäßige Preisanpassung</li>
  <li>Rabatte ohne Strategie</li>
</ul>
      `.trim(),
      featuredImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=630&fit=crop',
      isFeatured: false,
      authorSlug: 'daniel-zutavern',
      categorySlug: 'business',
      tagSlugs: ['preisgestaltung', 'finanzen', 'selbststaendigkeit'],
      readingTime: 6,
    },
    {
      title: 'Von der Anstellung zur Stuhlmiete: Ein Erfahrungsbericht',
      slug: 'erfahrungsbericht-stuhlmiete',
      excerpt: 'Sarah erzählt von ihrem Weg in die Selbstständigkeit und was sie dabei gelernt hat.',
      content: `
<h2>Mein Weg in die Selbstständigkeit</h2>
<p>Vor zwei Jahren habe ich den Sprung gewagt und bin von der Festanstellung in die Stuhlmiete gewechselt. Hier ist meine Geschichte.</p>

<h3>Der Anfang</h3>
<p>Nach 8 Jahren als angestellte Friseurin fühlte ich mich eingeengt. Die festen Arbeitszeiten, die vorgegebenen Preise – ich wollte mehr Kontrolle über meine Arbeit.</p>

<h3>Die Entscheidung</h3>
<p>Der Wechsel war nicht einfach. Ich hatte Angst vor dem Unbekannten. Aber mit der Unterstützung von NICNOA fühlte ich mich gut vorbereitet.</p>

<h3>Die ersten Monate</h3>
<p>Anfangs war es holprig. Ich musste lernen, mich selbst zu vermarkten und meine Finanzen zu managen. Aber jeder Tag wurde besser.</p>

<h3>Heute</h3>
<p>Ich verdiene 40% mehr als vorher und habe endlich die Work-Life-Balance, die ich mir gewünscht habe. Mein eigener Kundenstamm wächst stetig.</p>

<blockquote>
"Die beste Entscheidung meines Lebens war, den Mut zu haben, etwas Neues zu wagen."
</blockquote>

<h3>Meine Tipps für den Wechsel</h3>
<ul>
  <li>Baue dir vor dem Wechsel ein finanzielles Polster auf</li>
  <li>Informiere deine Stammkunden rechtzeitig</li>
  <li>Nutze die ersten Wochen für Marketing</li>
  <li>Sei geduldig – Erfolg braucht Zeit</li>
</ul>
      `.trim(),
      featuredImage: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1200&h=630&fit=crop',
      isFeatured: false,
      authorSlug: 'nicnoa-team',
      categorySlug: 'karriere',
      tagSlugs: ['selbststaendigkeit', 'stuhlmiete', 'weiterbildung'],
      readingTime: 5,
    },
  ]

  for (const postData of posts) {
    const author = authors.find((a) => a.slug === postData.authorSlug)
    const category = categories.find((c) => c.slug === postData.categorySlug)

    if (!author || !category) {
      console.log(`⚠️ Skipping post "${postData.title}" - missing author or category`)
      continue
    }

    const post = await prisma.blogPost.upsert({
      where: { slug: postData.slug },
      update: {
        title: postData.title,
        excerpt: postData.excerpt,
        content: postData.content,
        featuredImage: postData.featuredImage,
        isFeatured: postData.isFeatured,
        readingTime: postData.readingTime,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      create: {
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt,
        content: postData.content,
        featuredImage: postData.featuredImage,
        isFeatured: postData.isFeatured,
        readingTime: postData.readingTime,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: author.id,
        categoryId: category.id,
        metaTitle: postData.title,
        metaDescription: postData.excerpt,
      },
    })

    // Add tags
    const postTags = tags.filter((t) => postData.tagSlugs.includes(t.slug))
    for (const tag of postTags) {
      await prisma.blogPostTag.upsert({
        where: {
          postId_tagId: {
            postId: post.id,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          postId: post.id,
          tagId: tag.id,
        },
      })
    }

    console.log(`✅ Post created: ${post.title}`)
  }

  // Create Blog Page Config
  const existingConfig = await prisma.blogPageConfig.findFirst()
  if (!existingConfig) {
    await prisma.blogPageConfig.create({
      data: {
        heroBadgeText: 'NICNOA Blog',
        heroTitle: 'Insights für die Beauty-Branche',
        heroDescription: 'Entdecke Tipps, Trends und Expertenwissen für Salonbesitzer und Stylisten.',
        featuredTitle: 'Featured Story',
        showCategoryFilter: true,
        allCategoriesLabel: 'Alle Artikel',
        newsletterTitle: 'Bleib auf dem Laufenden',
        newsletterDescription: 'Erhalte die neuesten Tipps und Insights direkt in dein Postfach.',
        newsletterButtonText: 'Newsletter abonnieren',
      },
    })
    console.log('✅ Blog Page Config created')
  } else {
    console.log('✅ Blog Page Config already exists')
  }

  console.log('🎉 Blog seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

