import { Metadata } from "next"

// Artikel-Daten
const articles = {
  'coworking-spaces-moderne-salongeschaeft': {
    title: 'Coworking Spaces: Die Zukunft des modernen Salongeschäfts',
    description: 'Entdecken Sie, wie Coworking Spaces die Beauty-Branche revolutionieren und neue Möglichkeiten für Selbstständige schaffen.',
  },
  'nicnoa-and-co-stores-muenchen': {
    title: 'Innovation trifft Tradition: Die drei NICNOA & Co Stores in München',
    description: 'Entdecken Sie das innovative Co-Working-Konzept von NICNOA & Co und wie es die Arbeitswelt für Friseure in München revolutioniert.',
  },
  'digitale-transformation-beauty-branche': {
    title: 'Digitale Revolution in der Beauty-Branche',
    description: 'Wie moderne Technologien Friseursalons und Beauty-Dienstleister bei ihrer täglichen Arbeit unterstützen.',
  },
  'nachhaltigkeit-salon-management': {
    title: 'Nachhaltige Zukunft: Grüne Innovation im Salon-Management',
    description: 'Entdecken Sie, wie umweltbewusstes Management und digitale Lösungen die Beauty-Branche nachhaltiger gestalten.',
  }
}

type Props = {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = articles[params.slug as keyof typeof articles]

  if (!article) {
    return {
      title: 'Artikel nicht gefunden | NICNOA & CO. DIGITAL',
      description: 'Der gesuchte Artikel konnte leider nicht gefunden werden.',
    }
  }

  return {
    title: `${article.title} | Blog | NICNOA & CO. DIGITAL`,
    description: article.description,
    keywords: ['Beauty-Branche', 'Salon-Management', 'Digitalisierung', 'Innovation', 'Coworking'],
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: new Date().toISOString(),
      authors: ['NICNOA & CO. DIGITAL'],
      images: [
        {
          url: '/images/blog/og-image.jpg',
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: ['/images/blog/og-image.jpg'],
    },
  }
} 