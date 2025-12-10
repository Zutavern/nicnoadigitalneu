'use client'

import { motion } from 'framer-motion'
import { HelpCircle, Scissors, Building2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  role: 'STYLIST' | 'SALON_OWNER'
}

interface HomepageFAQSectionProps {
  faqs: {
    STYLIST: FAQ[]
    SALON_OWNER: FAQ[]
  }
  config?: {
    sectionTitle?: string
    sectionDescription?: string
    salonTabLabel?: string
    stylistTabLabel?: string
    buttonText?: string
    buttonLink?: string
  }
}

export function HomepageFAQSection({ faqs, config }: HomepageFAQSectionProps) {
  const hasFAQs = faqs.STYLIST.length > 0 || faqs.SALON_OWNER.length > 0

  if (!hasFAQs) return null

  const sectionTitle = config?.sectionTitle || 'Häufig gestellte Fragen'
  const sectionDescription = config?.sectionDescription || 'Finden Sie schnelle Antworten auf die wichtigsten Fragen zu unserer Plattform.'
  const salonTabLabel = config?.salonTabLabel || 'Für Salonbesitzer'
  const stylistTabLabel = config?.stylistTabLabel || 'Für Stuhlmieter'
  const buttonText = config?.buttonText || 'Alle FAQs ansehen'
  const buttonLink = config?.buttonLink || '/faq'

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

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge
            variant="outline"
            className="mb-4 px-4 py-2 bg-primary/5 border-primary/20"
          >
            <HelpCircle className="w-4 h-4 mr-2 text-primary" />
            <span className="text-primary font-medium">FAQ</span>
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{sectionTitle}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {sectionDescription}
          </p>
        </motion.div>

        {/* FAQ Tabs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Tabs defaultValue="SALON_OWNER" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
              <TabsTrigger
                value="SALON_OWNER"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">{salonTabLabel}</span>
                <span className="sm:hidden">Salonbesitzer</span>
              </TabsTrigger>
              <TabsTrigger
                value="STYLIST"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Scissors className="h-4 w-4" />
                <span className="hidden sm:inline">{stylistTabLabel}</span>
                <span className="sm:hidden">Stuhlmieter</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="SALON_OWNER">
              {faqs.SALON_OWNER.length > 0 ? (
                <motion.div variants={itemVariants}>
                  <Accordion type="single" collapsible className="space-y-3">
                    {faqs.SALON_OWNER.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        variants={itemVariants}
                        custom={index}
                      >
                        <AccordionItem
                          value={faq.id}
                          className="border rounded-xl px-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
                        >
                          <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground pb-5">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    ))}
                  </Accordion>
                </motion.div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Keine FAQs für Salonbesitzer verfügbar.
                </p>
              )}
            </TabsContent>

            <TabsContent value="STYLIST">
              {faqs.STYLIST.length > 0 ? (
                <motion.div variants={itemVariants}>
                  <Accordion type="single" collapsible className="space-y-3">
                    {faqs.STYLIST.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        variants={itemVariants}
                        custom={index}
                      >
                        <AccordionItem
                          value={faq.id}
                          className="border rounded-xl px-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
                        >
                          <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground pb-5">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    ))}
                  </Accordion>
                </motion.div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Keine FAQs für Stuhlmieter verfügbar.
                </p>
              )}
            </TabsContent>
          </Tabs>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-10"
          >
            <Button asChild size="lg" variant="outline" className="group">
              <Link href={buttonLink}>
                {buttonText}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

