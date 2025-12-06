'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Building2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'

const salonSpaceFAQs = [
  {
    frage: "Was ist NICNOA & CO. DIGITAL?",
    antwort: "NICNOA & CO. DIGITAL ist eine innovative SaaS-Plattform, die speziell für Salon-Coworking-Spaces entwickelt wurde. Wir bieten eine All-in-One-Lösung für die Verwaltung Ihres Beauty-Spaces, von der Buchung bis zur Abrechnung."
  },
  {
    frage: "Wie kann ich meinen Salon-Space mit NICNOA verwalten?",
    antwort: "Unsere Plattform bietet Ihnen Tools für Terminplanung, Stuhlvermietung, Kundenverwaltung, Abrechnungen und mehr. Sie können alles zentral über ein übersichtliches Dashboard steuern."
  },
  {
    frage: "Welche Vorteile bietet NICNOA für mein Geschäft?",
    antwort: "Mit NICNOA optimieren Sie Ihre Auslastung, reduzieren den Verwaltungsaufwand und schaffen ein professionelles Arbeitsumfeld. Sie profitieren von automatisierten Prozessen, detaillierten Analysen und einem modernen Buchungssystem."
  },
  {
    frage: "Wie funktioniert die Abrechnung?",
    antwort: "NICNOA bietet ein transparentes Pay-as-you-go Modell. Sie zahlen nur für die Features, die Sie wirklich nutzen. Alle Transaktionen werden automatisch erfasst und übersichtlich dokumentiert."
  }
]

const mieterFAQs = [
  {
    frage: "Wie sicher ist die Vermietung rechtlich?",
    antwort: "Mit NICNOA sind Sie auf der sicheren Seite. Wir stellen rechtssichere Mietverträge zur Verfügung, die von Fachanwälten geprüft wurden. Zusätzlich sind alle Transaktionen und Vereinbarungen digital dokumentiert und entsprechen den aktuellen Datenschutzrichtlinien."
  },
  {
    frage: "Welche Vorteile habe ich als Stuhlmieter?",
    antwort: "Sie profitieren von flexiblen Mietoptionen, einem professionellen Arbeitsumfeld und einer starken Community. Zudem erhalten Sie Zugang zu unserem Buchungssystem für Ihre Kunden."
  },
  {
    frage: "Wie funktioniert die Terminverwaltung?",
    antwort: "Sie erhalten Zugriff auf unser digitales Terminbuchungssystem. Ihre Kunden können online Termine buchen, und Sie behalten stets den Überblick über Ihren Kalender."
  },
  {
    frage: "Wie kann ich mein Business analysieren und Preise gestalten?",
    antwort: "NICNOA bietet Ihnen umfangreiche Analytics-Tools für Ihre Geschäftsentwicklung. Sie können Auslastung, Umsatz und Kundenverhalten analysieren sowie flexible Preislisten erstellen. Das hilft Ihnen, datenbasierte Entscheidungen zu treffen und Ihre Preisgestaltung zu optimieren."
  }
]

function FAQItem({ frage, antwort }: { frage: string; antwort: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-lg font-medium">{frage}</span>
        <ChevronDown
          className={`h-5 w-5 text-primary transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-muted-foreground">{antwort}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  const [activeSection, setActiveSection] = useState<'salon' | 'mieter'>('salon')

  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      
      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="container py-16 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Häufig gestellte Fragen
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Hier finden Sie Antworten auf die wichtigsten Fragen rund um NICNOA & CO. DIGITAL
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container pb-16">
        <div className="mx-auto max-w-3xl">
          {/* Section Switcher */}
          <div className="mb-12 flex justify-center gap-4">
            <Button
              size="lg"
              variant={activeSection === 'salon' ? 'default' : 'outline'}
              onClick={() => setActiveSection('salon')}
              className="flex items-center gap-2"
            >
              <Building2 className="h-5 w-5" />
              Für Salon-Space Betreiber
            </Button>
            <Button
              size="lg"
              variant={activeSection === 'mieter' ? 'default' : 'outline'}
              onClick={() => setActiveSection('mieter')}
              className="flex items-center gap-2"
            >
              <Users className="h-5 w-5" />
              Für Stuhlmieter
            </Button>
          </div>

          {/* FAQ List */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border bg-card p-6 shadow-lg"
          >
            <div className="space-y-4">
              {activeSection === 'salon'
                ? salonSpaceFAQs.map((faq, index) => (
                    <FAQItem key={index} {...faq} />
                  ))
                : mieterFAQs.map((faq, index) => (
                    <FAQItem key={index} {...faq} />
                  ))}
            </div>
          </motion.div>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Noch Fragen? Kontaktieren Sie uns!
            </p>
            <Button className="mt-4" size="lg">
              Kontakt aufnehmen
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 