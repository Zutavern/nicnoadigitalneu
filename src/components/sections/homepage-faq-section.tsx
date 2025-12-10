'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, Scissors, Building2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  const [activeTab, setActiveTab] = useState<'SALON_OWNER' | 'STYLIST'>('SALON_OWNER')
  
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

  const currentFAQs = activeTab === 'SALON_OWNER' ? faqs.SALON_OWNER : faqs.STYLIST

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 -right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'hsl(var(--primary) / 0.08)' }}
        />
        <div 
          className="absolute bottom-1/4 -left-20 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'hsl(var(--primary) / 0.08)' }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <Badge
            variant="outline"
            className="mb-5 px-5 py-2.5 bg-primary/10 border-primary/20"
          >
            <HelpCircle className="w-4 h-4 mr-2 text-primary" />
            <span className="text-primary font-medium">FAQ</span>
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5">{sectionTitle}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {sectionDescription}
          </p>
        </motion.div>

        {/* Modern Tabs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          {/* Tab Buttons - Modern Design */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm shadow-lg">
              <button
                onClick={() => setActiveTab('SALON_OWNER')}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'SALON_OWNER'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Building2 className="h-5 w-5" />
                <span>{salonTabLabel}</span>
              </button>
              <button
                onClick={() => setActiveTab('STYLIST')}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'STYLIST'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Scissors className="h-5 w-5" />
                <span>{stylistTabLabel}</span>
              </button>
            </div>
          </div>

          {/* FAQ Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentFAQs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {currentFAQs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AccordionItem
                      value={faq.id}
                      className="border border-border/50 rounded-xl px-6 bg-card/30 backdrop-blur-sm hover:bg-card/50 hover:border-primary/20 transition-all duration-300 shadow-sm"
                    >
                      <AccordionTrigger className="text-left font-semibold hover:no-underline py-5 text-foreground hover:text-primary transition-colors">
                        <span className="flex items-center gap-3">
                          <span 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                            style={{ 
                              backgroundColor: 'hsl(var(--primary) / 0.15)',
                              color: 'hsl(var(--primary))'
                            }}
                          >
                            {index + 1}
                          </span>
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5 pl-11 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12 rounded-xl bg-card/30 border border-border/50">
                <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Keine FAQs für {activeTab === 'SALON_OWNER' ? 'Salonbesitzer' : 'Stuhlmieter'} verfügbar.
                </p>
              </div>
            )}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Button 
              asChild 
              size="lg" 
              className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-8"
            >
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
