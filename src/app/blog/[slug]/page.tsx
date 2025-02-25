'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import Image from 'next/image'
import { Calendar, Clock, Share2, Twitter, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface ArticleBlock {
  type: string
  content?: string
  url?: string
  caption?: string
  items?: string[]
}

interface Article {
  title: string
  date: string
  readTime: string
  category: string
  author: {
    name: string
    role: string
    image: string
  }
  content: ArticleBlock[]
}

const articles: Record<string, Article> = {
  'coworking-spaces-moderne-salongeschaeft': {
    title: 'Coworking Spaces: Die Zukunft des modernen Salongeschäfts',
    date: '15. März 2024',
    readTime: '5 min',
    category: 'Trends',
    author: {
      name: 'Nico Rapp',
      role: 'Co-Founder & Industry Expert',
      image: createClient().storage.from('profilepic').getPublicUrl('1644532693520.jpeg').data.publicUrl
    },
    content: [
      {
        type: 'paragraph',
        content: 'Die Beauty-Branche befindet sich im Wandel. Traditionelle Geschäftsmodelle werden durch innovative Konzepte ergänzt, die den veränderten Bedürfnissen sowohl der Kunden als auch der Beauty-Professionals Rechnung tragen. Eine besonders spannende Entwicklung sind Coworking Spaces im Salongeschäft.'
      },
      {
        type: 'subheading',
        content: 'Die Evolution des Salon-Konzepts'
      },
      {
        type: 'paragraph',
        content: 'Coworking Spaces im Salonbereich bieten Beauty-Professionals die Möglichkeit, flexibel und unabhängig zu arbeiten, ohne die hohen Investitionen und das Risiko einer eigenen Salonführung eingehen zu müssen. Diese innovative Form der Arbeitsplatzgestaltung ermöglicht es Friseuren, Kosmetikern und anderen Beauty-Experten, ihre Dienstleistungen in einem professionellen Umfeld anzubieten.'
      },
      {
        type: 'image',
        url: '/images/blog/coworking-salon.jpg',
        caption: 'Moderner Coworking Space für Beauty-Professionals'
      },
      {
        type: 'subheading',
        content: 'Vorteile für Beauty-Professionals'
      },
      {
        type: 'list',
        items: [
          'Flexible Arbeitszeiten und -modelle',
          'Reduzierte finanzielle Risiken',
          'Professionelle Arbeitsumgebung',
          'Networking-Möglichkeiten',
          'Shared Resources und Equipment'
        ]
      },
      {
        type: 'quote',
        content: 'Coworking Spaces sind mehr als nur geteilte Arbeitsplätze – sie sind Innovationshubs, die neue Perspektiven für die gesamte Beauty-Branche eröffnen.'
      }
    ]
  },
  'nicnoa-and-co-stores-muenchen': {
    title: 'Innovation trifft Tradition: Die drei NICNOA & Co Stores in München',
    date: '12. März 2024',
    readTime: '4 min',
    category: 'Success Stories',
    author: {
      name: 'Nico Rapp',
      role: 'Co-Founder & Industry Expert',
      image: createClient().storage.from('profilepic').getPublicUrl('1644532693520.jpeg').data.publicUrl
    },
    content: [
      {
        type: 'paragraph',
        content: 'In der Münchner Beauty-Szene hat sich NICNOA & Co als Synonym für Innovation und moderne Arbeitskonzepte etabliert. Mit drei strategisch platzierten Stores hat das Unternehmen nicht nur ein erfolgreiches Co-Working-Konzept für Friseure geschaffen, sondern auch neue Maßstäbe in der Branche gesetzt.'
      },
      {
        type: 'subheading',
        content: 'Die drei Premium-Standorte in München'
      },
      {
        type: 'list',
        items: [
          'Store N°1 Glockenbach - Papa Schmid Straße 2',
          'Store N°2 Maxvorstadt - Gabelsbergerstraße 73',
          'Store N°3 Gärtnerplatz - Rumfordstraße 3'
        ]
      },
      {
        type: 'paragraph',
        content: 'Jeder Store verkörpert das Konzept "Selbstbestimmt, freischaffend, authentisch!" und bietet Friseuren die perfekte Umgebung für kreatives Arbeiten und berufliche Selbstverwirklichung.'
      },
      {
        type: 'subheading',
        content: 'Das All-Inclusive Konzept'
      },
      {
        type: 'paragraph',
        content: 'NICNOA & Co geht weit über das klassische Stuhlmietenkonzept hinaus. Das "Plug & Play"-Prinzip umfasst alle wesentlichen Aspekte, die Friseure für ihre erfolgreiche Selbstständigkeit benötigen.'
      },
      {
        type: 'list',
        items: [
          'Kabinettware: Hochwertige Produkte von Davines',
          'Komplette Nebenkosten inklusive',
          'Professionelles Inventar zur Nutzung',
          'Umfassende Reinigungsservices',
          'Alle relevanten Gebühren abgedeckt',
          'Allgemeinkosten bereits enthalten'
        ]
      },
      {
        type: 'quote',
        content: 'Unser Team schafft die optimale Arbeitsumgebung, in der kreativ gearbeitet, Ideen geboren und Selbstverwirklichung gefördert wird. Und das alles gewinnbringend für unsere Co-Worker.'
      },
      {
        type: 'subheading',
        content: 'Community und Entwicklung'
      },
      {
        type: 'paragraph',
        content: 'Bei NICNOA & Co steht neben der individuellen Entfaltung auch das Miteinander- und Voneinander-Lernen im Zentrum. Die Stores bieten nicht nur einen Arbeitsplatz, sondern eine echte Community für ambitionierte Beauty-Professionals.'
      }
    ]
  },
  'digitale-transformation-beauty-branche': {
    title: 'Digitale Transformation in der Beauty-Branche',
    date: '10. März 2024',
    readTime: '5 min',
    category: 'Trends',
    author: {
      name: 'Nico Rapp',
      role: 'Co-Founder & Industry Expert',
      image: createClient().storage.from('profilepic').getPublicUrl('1644532693520.jpeg').data.publicUrl
    },
    content: [
      {
        type: 'paragraph',
        content: 'Die Beauty-Branche befindet sich im Wandel. Traditionelle Geschäftsmodelle werden durch innovative Konzepte ergänzt, die den veränderten Bedürfnissen sowohl der Kunden als auch der Beauty-Professionals Rechnung tragen. Eine besonders spannende Entwicklung sind Coworking Spaces im Salongeschäft.'
      },
      {
        type: 'subheading',
        content: 'Die Evolution des Salon-Konzepts'
      },
      {
        type: 'paragraph',
        content: 'Coworking Spaces im Salonbereich bieten Beauty-Professionals die Möglichkeit, flexibel und unabhängig zu arbeiten, ohne die hohen Investitionen und das Risiko einer eigenen Salonführung eingehen zu müssen. Diese innovative Form der Arbeitsplatzgestaltung ermöglicht es Friseuren, Kosmetikern und anderen Beauty-Experten, ihre Dienstleistungen in einem professionellen Umfeld anzubieten.'
      },
      {
        type: 'image',
        url: '/images/blog/coworking-salon.jpg',
        caption: 'Moderner Coworking Space für Beauty-Professionals'
      },
      {
        type: 'subheading',
        content: 'Vorteile für Beauty-Professionals'
      },
      {
        type: 'list',
        items: [
          'Flexible Arbeitszeiten und -modelle',
          'Reduzierte finanzielle Risiken',
          'Professionelle Arbeitsumgebung',
          'Networking-Möglichkeiten',
          'Shared Resources und Equipment'
        ]
      },
      {
        type: 'quote',
        content: 'Coworking Spaces sind mehr als nur geteilte Arbeitsplätze – sie sind Innovationshubs, die neue Perspektiven für die gesamte Beauty-Branche eröffnen.'
      }
    ]
  },
  'nachhaltigkeit-salon-management': {
    title: 'Nachhaltiges Salon-Management: Ein Leitfaden für erfolgreiche Beauty-Professionals',
    date: '8. März 2024',
    readTime: '5 min',
    category: 'Trends',
    author: {
      name: 'Nico Rapp',
      role: 'Co-Founder & Industry Expert',
      image: createClient().storage.from('profilepic').getPublicUrl('1644532693520.jpeg').data.publicUrl
    },
    content: [
      {
        type: 'paragraph',
        content: 'Die Beauty-Branche befindet sich im Wandel. Traditionelle Geschäftsmodelle werden durch innovative Konzepte ergänzt, die den veränderten Bedürfnissen sowohl der Kunden als auch der Beauty-Professionals Rechnung tragen. Eine besonders spannende Entwicklung sind Coworking Spaces im Salongeschäft.'
      },
      {
        type: 'subheading',
        content: 'Die Evolution des Salon-Konzepts'
      },
      {
        type: 'paragraph',
        content: 'Coworking Spaces im Salonbereich bieten Beauty-Professionals die Möglichkeit, flexibel und unabhängig zu arbeiten, ohne die hohen Investitionen und das Risiko einer eigenen Salonführung eingehen zu müssen. Diese innovative Form der Arbeitsplatzgestaltung ermöglicht es Friseuren, Kosmetikern und anderen Beauty-Experten, ihre Dienstleistungen in einem professionellen Umfeld anzubieten.'
      },
      {
        type: 'image',
        url: '/images/blog/coworking-salon.jpg',
        caption: 'Moderner Coworking Space für Beauty-Professionals'
      },
      {
        type: 'subheading',
        content: 'Vorteile für Beauty-Professionals'
      },
      {
        type: 'list',
        items: [
          'Flexible Arbeitszeiten und -modelle',
          'Reduzierte finanzielle Risiken',
          'Professionelle Arbeitsumgebung',
          'Networking-Möglichkeiten',
          'Shared Resources und Equipment'
        ]
      },
      {
        type: 'quote',
        content: 'Coworking Spaces sind mehr als nur geteilte Arbeitsplätze – sie sind Innovationshubs, die neue Perspektiven für die gesamte Beauty-Branche eröffnen.'
      }
    ]
  }
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug]

  if (!article) {
    return (
      <main className="min-h-screen bg-background">
        <MainNav />
        <div className="container py-32 text-center">
          <h1 className="text-4xl font-bold">Artikel nicht gefunden</h1>
          <p className="mt-4 text-muted-foreground">
            Der gesuchte Artikel existiert leider nicht.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      
      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="container py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            {/* Article Meta */}
            <div className="flex items-center gap-4 text-sm">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                {article.category}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {article.date}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {article.readTime}
              </div>
            </div>

            {/* Article Title */}
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {article.title}
            </h1>

            {/* Author Info */}
            <div className="mt-8 flex items-center gap-4">
              <Image
                src={article.author.image}
                alt={article.author.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{article.author.name}</p>
                <p className="text-sm text-muted-foreground">{article.author.role}</p>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="mt-8 flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Teilen:</span>
              <Button variant="ghost" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="container pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-3xl space-y-8"
        >
          {article.content.map((block, index) => {
            switch (block.type) {
              case 'paragraph':
                if (!block.content) return null
                return (
                  <p key={index} className="text-lg leading-relaxed text-muted-foreground">
                    {block.content}
                  </p>
                )
              case 'subheading':
                if (!block.content) return null
                return (
                  <h2 key={index} className="text-2xl font-bold tracking-tight">
                    {block.content}
                  </h2>
                )
              case 'image':
                if (!block.url || !block.caption) return null
                return (
                  <div key={index} className="relative aspect-[16/9] overflow-hidden rounded-xl">
                    <Image
                      src={block.url}
                      alt={block.caption}
                      fill
                      className="object-cover"
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {block.caption}
                    </p>
                  </div>
                )
              case 'quote':
                if (!block.content) return null
                return (
                  <blockquote key={index} className="border-l-4 border-primary pl-6 italic">
                    {block.content}
                  </blockquote>
                )
              case 'list':
                if (!block.items) return null
                return (
                  <ul key={index} className="my-6 space-y-2">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )
              default:
                return null
            }
          })}
        </motion.div>
      </section>
    </main>
  )
} 