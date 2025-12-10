'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { 
  Rocket,
  Users,
  MessageSquare,
  Gift,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Sparkles,
  Award,
} from 'lucide-react'

interface BetaBenefit {
  id: string
  icon: string
  title: string
  description: string
}

interface BetaRequirement {
  id: string
  text: string
}

interface BetaTimelineItem {
  id: string
  date: string
  title: string
  description: string
}

interface BetaPageData {
  heroBadgeText: string | null
  heroTitle: string
  heroTitleHighlight: string | null
  heroDescription: string | null
  heroCtaPrimaryText: string | null
  heroCtaPrimaryLink: string | null
  heroCtaSecondaryText: string | null
  heroCtaSecondaryLink: string | null
  requirementsTitle: string | null
  requirementsDescription: string | null
  timelineTitle: string | null
  timelineDescription: string | null
  ctaTitle: string | null
  ctaDescription: string | null
  ctaButtonText: string | null
  ctaButtonLink: string | null
  benefits: BetaBenefit[]
  requirements: BetaRequirement[]
  timelineItems: BetaTimelineItem[]
}

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ElementType> = {
    'rocket': Rocket,
    'users': Users,
    'message-square': MessageSquare,
    'gift': Gift,
    'zap': Zap,
    'star': Star,
    'shield': Shield,
    'sparkles': Sparkles,
    'check-circle': CheckCircle,
    'award': Award,
  }
  return iconMap[iconName] || Rocket
}

export function BetaProgrammContent({ data }: { data: BetaPageData }) {
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
                <Rocket className="mr-1 h-3.5 w-3.5 text-primary" />
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
            <div className="mt-8 flex justify-center gap-4">
              {data.heroCtaPrimaryText && (
                <Button size="lg" className="group" asChild>
                  <a href={data.heroCtaPrimaryLink || '#'}>
                    {data.heroCtaPrimaryText}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              )}
              {data.heroCtaSecondaryText && (
                <Button size="lg" variant="outline" asChild>
                  <a href={data.heroCtaSecondaryLink || '#'}>{data.heroCtaSecondaryText}</a>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      {data.benefits.length > 0 && (
        <section id="vorteile" className="container py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {data.benefits.map((benefit) => {
              const IconComponent = getIconComponent(benefit.icon)
              return (
                <div
                  key={benefit.id}
                  className="group relative rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{benefit.title}</h3>
                  </div>
                  <p className="mt-4 text-muted-foreground">{benefit.description}</p>
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
                </div>
              )
            })}
          </motion.div>
        </section>
      )}

      {/* Requirements Section */}
      {data.requirements.length > 0 && (
        <section className="border-t bg-muted/50">
          <div className="container py-16">
            <div className="mx-auto max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold mb-4">{data.requirementsTitle}</h2>
                {data.requirementsDescription && (
                  <p className="text-muted-foreground mb-8">{data.requirementsDescription}</p>
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {data.requirements.map((requirement) => (
                  <div
                    key={requirement.id}
                    className="flex items-center gap-3 rounded-lg border bg-card p-4"
                  >
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{requirement.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Timeline Section */}
      {data.timelineItems.length > 0 && (
        <section className="container py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{data.timelineTitle}</h2>
              {data.timelineDescription && (
                <p className="text-muted-foreground">{data.timelineDescription}</p>
              )}
            </div>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border md:left-1/2" />
              <div className="space-y-12">
                {data.timelineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-8 ${
                      index % 2 === 0 ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="rounded-xl border bg-card p-6">
                        <span className="text-sm font-medium text-primary">{item.date}</span>
                        <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                        <p className="mt-1 text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-card md:mx-auto">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    </div>
                    <div className="hidden flex-1 md:block" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* CTA Section */}
      {data.ctaTitle && (
        <section id="bewerbung" className="border-t bg-muted/50">
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
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {data.ctaButtonText && (
                    <Button size="lg" className="group" asChild>
                      <a href={data.ctaButtonLink || '#'}>
                        {data.ctaButtonText}
                        <Zap className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
