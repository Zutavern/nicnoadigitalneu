'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { 
  Rocket,
  Wrench,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Star,
} from 'lucide-react'

interface ChangelogEntry {
  id: string
  date: Date | string
  category: string
  icon: string
  title: string
  description: string
  isHighlight: boolean
}

interface UpdatesPageData {
  heroBadgeText: string | null
  heroTitle: string
  heroTitleHighlight: string | null
  heroDescription: string | null
  ctaTitle: string | null
  ctaDescription: string | null
  ctaButtonText: string | null
  ctaButtonLink: string | null
  entries: ChangelogEntry[]
}

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ElementType> = {
    'sparkles': Sparkles,
    'shield': Shield,
    'zap': Zap,
    'wrench': Wrench,
    'rocket': Rocket,
    'star': Star,
  }
  return iconMap[iconName] || Sparkles
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function UpdatesContent({ data }: { data: UpdatesPageData }) {
  const renderTitle = (title: string, highlight: string | null) => {
    if (!highlight || !title.includes(highlight)) {
      return title
    }
    const parts = title.split(highlight)
    return (
      <>
        {parts[0]}
        <span className="text-primary">{highlight}</span>
        {parts.slice(1).join(highlight)}
      </>
    )
  }

  const formatDate = (dateStr: Date | string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
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
            className="text-center"
          >
            {data.heroBadgeText && (
              <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm">
                <Star className="mr-1 h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-muted-foreground">{data.heroBadgeText}</span>
              </span>
            )}
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              {renderTitle(data.heroTitle, data.heroTitleHighlight)}
            </h1>
            {data.heroDescription && (
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                {data.heroDescription}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Updates Grid */}
      {data.entries.length > 0 && (
        <section className="container pb-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2"
          >
            {data.entries.map((entry) => {
              const IconComponent = getIconComponent(entry.icon)
              return (
                <motion.article
                  key={entry.id}
                  variants={itemVariants}
                  className={`group relative rounded-xl border bg-card p-6 shadow-lg transition-shadow hover:shadow-xl ${
                    entry.isHighlight ? 'md:col-span-2' : ''
                  }`}
                >
                  {/* Category Badge */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {entry.category}
                    </span>
                    <time className="text-sm text-muted-foreground" dateTime={new Date(entry.date).toISOString()}>
                      {formatDate(entry.date)}
                    </time>
                  </div>

                  {/* Content */}
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold">{entry.title}</h2>
                      <p className="mt-2 text-muted-foreground">{entry.description}</p>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
                </motion.article>
              )
            })}
          </motion.div>
        </section>
      )}

      {/* Newsletter Section */}
      {data.ctaTitle && (
        <section id="newsletter" className="border-t bg-muted/50">
          <div className="container py-16">
            <div className="mx-auto max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="mb-4 text-3xl font-bold">{data.ctaTitle}</h2>
                {data.ctaDescription && (
                  <p className="mb-8 text-muted-foreground">{data.ctaDescription}</p>
                )}
                {data.ctaButtonText && (
                  <Button size="lg" className="group" asChild>
                    <a href={data.ctaButtonLink || '#'}>
                      {data.ctaButtonText}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
