'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

const articles = [
  {
    slug: 'coworking-spaces-moderne-salongeschaeft',
    title: 'Coworking Spaces: Die Zukunft des modernen Salongeschäfts',
    excerpt: 'Wie flexible Arbeitsmodelle und Coworking Spaces die Beauty-Branche revolutionieren und neue Möglichkeiten für Selbstständige schaffen.',
    date: '15. März 2024',
    readTime: '5 min',
    category: 'Trends',
    featured: true,
  },
  {
    slug: 'nicnoa-and-co-stores-muenchen',
    title: 'Innovation trifft Tradition: Die drei NICNOA & Co Stores in München',
    excerpt: 'Entdecken Sie das innovative Co-Working-Konzept von NICNOA & Co und wie es die Arbeitswelt für Friseure in München revolutioniert.',
    date: '12. März 2024',
    readTime: '4 min',
    category: 'Success Stories',
  },
  {
    slug: 'digitale-transformation-beauty-branche',
    title: 'Digitale Revolution in der Beauty-Branche',
    excerpt: 'Wie moderne Technologien Friseursalons und Beauty-Dienstleister bei ihrer täglichen Arbeit unterstützen und das Kundenerlebnis verbessern.',
    date: '10. März 2024',
    readTime: '6 min',
    category: 'Digitalisierung',
  },
  {
    slug: 'nachhaltigkeit-salon-management',
    title: 'Nachhaltige Zukunft: Grüne Innovation im Salon-Management',
    excerpt: 'Wie umweltbewusstes Management und digitale Lösungen Hand in Hand gehen für eine nachhaltigere Beauty-Branche.',
    date: '8. März 2024',
    readTime: '4 min',
    category: 'Nachhaltigkeit',
  },
]

export default function BlogPage() {
  const featuredArticle = articles.find(article => article.featured)
  const regularArticles = articles.filter(article => !article.featured)

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
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Insights & Innovationen für die <br />
              <span className="text-primary">Beauty-Branche</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Entdecken Sie die neuesten Trends, Expertenwissen und Erfolgsgeschichten 
              aus der Welt des modernen Salon-Managements.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="container pb-16">
          <Link href={`/blog/${featuredArticle.slug}`}>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative overflow-hidden rounded-xl border bg-card"
            >
              <div className="relative aspect-[21/9] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/50 to-transparent z-10" />
                <Image
                  src="/images/blog/placeholder.jpg"
                  alt={featuredArticle.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="relative z-20 -mt-32 space-y-4 p-8">
                <div className="flex items-center gap-4 text-sm">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {featuredArticle.category}
                  </span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {featuredArticle.date}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {featuredArticle.readTime}
                  </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight group-hover:text-primary transition-colors">
                  {featuredArticle.title}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center gap-2 text-primary">
                  Weiterlesen
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.article>
          </Link>
        </section>
      )}

      {/* Regular Articles Grid */}
      <section className="container pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regularArticles.map((article, index) => (
            <motion.article
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Link href={`/blog/${article.slug}`} className="group">
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
                  <Image
                    src="/images/blog/placeholder.jpg"
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {article.readTime}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-primary">
                    Weiterlesen
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  )
} 