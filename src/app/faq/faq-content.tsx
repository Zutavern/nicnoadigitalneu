'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Users, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'
import { PageEvents } from '@/lib/analytics'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  role: 'STYLIST' | 'SALON_OWNER'
  sortOrder: number
}

interface FAQPageConfig {
  heroBadgeText: string
  heroTitle: string
  heroDescription: string
  sectionTitle: string
  sectionDescription: string
  salonTabLabel: string
  stylistTabLabel: string
  contactText: string
  contactLinkText: string
  contactLinkUrl: string
}

interface FAQContentProps {
  faqs: {
    SALON_OWNER: FAQ[]
    STYLIST: FAQ[]
  }
  config: FAQPageConfig
}

export function FAQContent({ faqs, config }: FAQContentProps) {
  const [activeSection, setActiveSection] = useState<'salon' | 'mieter'>('salon')

  useEffect(() => {
    PageEvents.faqViewed()
  }, [])

  const currentFAQs = activeSection === 'salon' ? faqs.SALON_OWNER : faqs.STYLIST

  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      
      {/* Hero Section */}
      <section className="relative pt-20 border-b">
        <div className="container py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {config.heroBadgeText && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{config.heroBadgeText}</span>
              </div>
            )}
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              {config.heroTitle}
            </h1>
            {config.heroDescription && (
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {config.heroDescription}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            {/* Section Switcher */}
            <div className="mb-12 flex justify-center gap-4">
              <Button
                size="lg"
                variant={activeSection === 'salon' ? 'default' : 'outline'}
                onClick={() => setActiveSection('salon')}
                className="flex items-center gap-2"
              >
                <Building2 className="h-5 w-5" />
                {config.salonTabLabel}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium">
                  {faqs.SALON_OWNER.length}
                </span>
              </Button>
              <Button
                size="lg"
                variant={activeSection === 'mieter' ? 'default' : 'outline'}
                onClick={() => setActiveSection('mieter')}
                className="flex items-center gap-2"
              >
                <Users className="h-5 w-5" />
                {config.stylistTabLabel}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium">
                  {faqs.STYLIST.length}
                </span>
              </Button>
            </div>

            {/* FAQ Content */}
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {(config.sectionTitle || config.sectionDescription) && (
                <div className="mb-12 text-center">
                  {config.sectionTitle && (
                    <h2 className="text-foreground text-4xl font-semibold mb-4">
                      {config.sectionTitle}
                    </h2>
                  )}
                  {config.sectionDescription && (
                    <p className="text-muted-foreground text-balance text-lg">
                      {config.sectionDescription}
                    </p>
                  )}
                </div>
              )}

              {currentFAQs.length > 0 ? (
                <div className="space-y-12">
                  <Accordion
                    type="single"
                    collapsible
                    className="bg-card ring-foreground/5 rounded-lg w-full border border-transparent px-8 py-3 shadow ring-1"
                  >
                    {currentFAQs.map((faq) => (
                      <AccordionItem
                        key={faq.id}
                        value={faq.id}
                        className="border-dotted"
                      >
                        <AccordionTrigger className="cursor-pointer text-base hover:no-underline text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-base text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {config.contactText && (
                    <p className="text-muted-foreground text-center">
                      {config.contactText}{' '}
                      <Link
                        href={config.contactLinkUrl || '/support'}
                        className="text-primary font-medium hover:underline"
                      >
                        {config.contactLinkText}
                      </Link>
                    </p>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p>Keine FAQs verfügbar.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}


