'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  HandshakeIcon,
  Sparkles,
  Scissors,
  Calendar,
  Calculator,
  Shield,
  Gift,
} from 'lucide-react'
import Link from 'next/link'

interface Partner {
  id: string
  name: string
  slug: string
  category: string
  description: string
  offer: string
  code: string | null
  link: string
  isHighlight: boolean
}

interface PartnerPageConfig {
  heroBadgeText: string
  heroTitle: string
  heroDescription: string
  heroFeature1Text: string
  heroFeature2Text: string
  heroFeature3Text: string
  cardCtaText: string
  cardCtaLink: string
  cardCtaButtonText: string
  ctaTitle: string
  ctaDescription: string
  ctaButton1Text: string
  ctaButton1Link: string
  ctaButton2Text: string
  ctaButton2Link: string
}

interface PartnerContentProps {
  partners: Partner[]
  config: PartnerPageConfig
}

const partnerCategories = [
  { id: 'tools', label: 'Tools & Produkte', icon: Scissors, color: 'blue' },
  { id: 'booking', label: 'Buchung & Kassensysteme', icon: Calendar, color: 'green' },
  { id: 'finance', label: 'Finanzen & Versicherungen', icon: Calculator, color: 'purple' },
]

export function PartnerContent({ partners, config }: PartnerContentProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filteredPartners = activeCategory === 'all'
    ? partners
    : partners.filter((p) => p.category === activeCategory)

  const getCategoryCount = (categoryId: string) => {
    return partners.filter((p) => p.category === categoryId).length
  }

  return (
    <main className="min-h-screen bg-background">
      <MainNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 pt-32 pb-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {config.heroBadgeText && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <HandshakeIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{config.heroBadgeText}</span>
              </div>
            )}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {config.heroTitle}
            </h1>
            {config.heroDescription && (
              <p className="text-xl text-muted-foreground mb-8">
                {config.heroDescription}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              {config.heroFeature1Text && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>{config.heroFeature1Text}</span>
                </div>
              )}
              {config.heroFeature2Text && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border">
                  <Gift className="h-4 w-4 text-primary" />
                  <span>{config.heroFeature2Text}</span>
                </div>
              )}
              {config.heroFeature3Text && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>{config.heroFeature3Text}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter Tools - Always Visible */}
      <section className="container mb-12">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl border transition-all ${
              activeCategory === 'all'
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                : 'bg-card hover:bg-muted border-border hover:border-primary/20'
            }`}
          >
            <HandshakeIcon className="h-5 w-5" />
            <span className="font-semibold">Alle Partner</span>
            <Badge variant={activeCategory === 'all' ? 'secondary' : 'outline'} className="ml-2">
              {partners.length}
            </Badge>
          </motion.button>

          {partnerCategories.map((category, index) => {
            const Icon = category.icon
            const count = getCategoryCount(category.id)
            const isActive = activeCategory === category.id
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                    : 'bg-card hover:bg-muted border-border hover:border-primary/20'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-semibold">{category.label}</span>
                <Badge variant={isActive ? 'secondary' : 'outline'} className="ml-2">
                  {count}
                </Badge>
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* Partners Grid */}
      <section className="container pb-20">
        <AnimatePresence mode="wait">
          {filteredPartners.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">Keine Partner in dieser Kategorie gefunden.</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              {filteredPartners.map((partner, index) => {
                const category = partnerCategories.find((c) => c.id === partner.category)
                return (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="h-full"
                  >
                    <Card className="h-full flex flex-col group hover:shadow-lg transition-all hover:border-primary/20">
                      <CardContent className="p-6 flex flex-col flex-1">
                        {/* Logo */}
                        <div className="flex items-center justify-center h-16 w-full mb-4">
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                            <div className="text-2xl font-bold text-primary">
                              {partner.name.split(' ').map(word => word[0]).join('')}
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold mb-3 text-center line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
                          {partner.name}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground text-center mb-6 line-clamp-3 flex-1">
                          {partner.description}
                        </p>

                        {/* Benefits Preview */}
                        <div className="mb-6">
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                            <div className="flex items-center gap-2 mb-1">
                              <Gift className="h-4 w-4 text-primary" />
                              <span className="text-xs font-semibold text-primary">Exklusives Angebot</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {partner.offer}
                            </p>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-4 border-t mt-auto">
                          {config.cardCtaText && (
                            <p className="text-xs text-center text-muted-foreground mb-3">
                              {config.cardCtaText}
                            </p>
                          )}
                          <Button
                            asChild
                            variant="outline"
                            className="w-full"
                            size="sm"
                          >
                            <Link href={config.cardCtaLink || '/registrieren'}>
                              {config.cardCtaButtonText || 'Jetzt Mitglied werden'}
                              <ArrowRight className="ml-2 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* CTA Section */}
      {(config.ctaTitle || config.ctaDescription) && (
        <section className="border-t bg-muted/30 py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              {config.ctaTitle && (
                <h2 className="text-3xl font-bold mb-4">
                  {config.ctaTitle}
                </h2>
              )}
              {config.ctaDescription && (
                <p className="text-muted-foreground mb-8 text-lg">
                  {config.ctaDescription}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {config.ctaButton1Text && (
                  <Button size="lg" asChild>
                    <Link href={config.ctaButton1Link || '/registrieren'}>
                      {config.ctaButton1Text}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {config.ctaButton2Text && (
                  <Button size="lg" variant="outline" asChild>
                    <Link href={config.ctaButton2Link || '/preise'}>
                      {config.ctaButton2Text}
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}

