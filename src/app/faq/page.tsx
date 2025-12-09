'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Users, Loader2, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'

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

export default function FAQPage() {
  const [activeSection, setActiveSection] = useState<'salon' | 'mieter'>('salon')
  const [faqs, setFaqs] = useState<{
    SALON_OWNER: FAQ[]
    STYLIST: FAQ[]
  }>({ SALON_OWNER: [], STYLIST: [] })
  const [config, setConfig] = useState<FAQPageConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [faqsRes, configRes] = await Promise.all([
        Promise.all([
          fetch('/api/faqs?role=SALON_OWNER').catch(err => {
            console.error('Error fetching SALON_OWNER FAQs:', err)
            return { ok: false, json: async () => [] }
          }),
          fetch('/api/faqs?role=STYLIST').catch(err => {
            console.error('Error fetching STYLIST FAQs:', err)
            return { ok: false, json: async () => [] }
          }),
        ]),
        fetch('/api/faq-page-config').catch(err => {
          console.error('Error fetching FAQ page config:', err)
          return { ok: false, json: async () => null }
        }),
      ])

      const [salonRes, stylistRes] = faqsRes
      const salonData = salonRes.ok ? await salonRes.json().catch(() => []) : []
      const stylistData = stylistRes.ok ? await stylistRes.json().catch(() => []) : []
      const configData = configRes.ok ? await configRes.json().catch(() => null) : null

      setFaqs({
        SALON_OWNER: Array.isArray(salonData) ? salonData : [],
        STYLIST: Array.isArray(stylistData) ? stylistData : [],
      })
      setConfig(configData)
    } catch (error) {
      console.error('Error fetching data:', error)
      // Setze leere Daten als Fallback
      setFaqs({
        SALON_OWNER: [],
        STYLIST: [],
      })
      setConfig(null)
    } finally {
      setIsLoading(false)
    }
  }

  const currentFAQs = activeSection === 'salon' ? faqs.SALON_OWNER : faqs.STYLIST
  const pageConfig = config || {
    heroBadgeText: 'Häufig gestellte Fragen',
    heroTitle: 'Ihre Fragen beantwortet',
    heroDescription: 'Hier finden Sie Antworten auf die wichtigsten Fragen rund um NICNOA & CO. DIGITAL',
    sectionTitle: 'Frequently Asked Questions',
    sectionDescription: 'Entdecken Sie schnelle und umfassende Antworten auf häufige Fragen zu unserer Plattform, Services und Features.',
    salonTabLabel: 'Für Salon-Space Betreiber',
    stylistTabLabel: 'Für Stuhlmieter',
    contactText: 'Können Sie nicht finden, wonach Sie suchen? Kontaktieren Sie unser',
    contactLinkText: 'Support-Team',
    contactLinkUrl: '/support',
  }

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
            {pageConfig.heroBadgeText && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{pageConfig.heroBadgeText}</span>
              </div>
            )}
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              {pageConfig.heroTitle}
            </h1>
            {pageConfig.heroDescription && (
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {pageConfig.heroDescription}
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
                {pageConfig.salonTabLabel}
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
                {pageConfig.stylistTabLabel}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium">
                  {faqs.STYLIST.length}
                </span>
              </Button>
            </div>

            {/* FAQ Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {(pageConfig.sectionTitle || pageConfig.sectionDescription) && (
                  <div className="mb-12 text-center">
                    {pageConfig.sectionTitle && (
                      <h2 className="text-foreground text-4xl font-semibold mb-4">
                        {pageConfig.sectionTitle}
                      </h2>
                    )}
                    {pageConfig.sectionDescription && (
                      <p className="text-muted-foreground text-balance text-lg">
                        {pageConfig.sectionDescription}
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

                    {pageConfig.contactText && (
                      <p className="text-muted-foreground text-center">
                        {pageConfig.contactText}{' '}
                        <Link
                          href={pageConfig.contactLinkUrl || '/support'}
                          className="text-primary font-medium hover:underline"
                        >
                          {pageConfig.contactLinkText}
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
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
