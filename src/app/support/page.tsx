'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Search,
  Mail,
  MessageSquare,
  Phone,
  FileText,
  BookOpen,
  Video,
  Headphones,
  ChevronRight,
  ArrowRight
} from 'lucide-react'

const helpCategories = [
  {
    icon: FileText,
    title: 'Dokumentation',
    description: 'Ausführliche Anleitungen und Dokumentation zu allen Features',
    link: '/dokumentation'
  },
  {
    icon: BookOpen,
    title: 'Erste Schritte',
    description: 'Schnellstart-Guide für neue Benutzer',
    link: '/erste-schritte'
  },
  {
    icon: Video,
    title: 'Video-Tutorials',
    description: 'Schritt-für-Schritt Videoanleitungen',
    link: '/tutorials'
  },
  {
    icon: Headphones,
    title: 'Live Support',
    description: 'Direkter Kontakt zu unserem Support-Team',
    link: '/kontakt'
  }
]

const faqs = [
  {
    question: 'Wie kann ich mein Konto erstellen?',
    answer: 'Die Registrierung ist einfach: Klicken Sie auf "Registrieren", geben Sie Ihre Daten ein und bestätigen Sie Ihre E-Mail-Adresse. Als Salon-Betreiber werden Sie durch einen zusätzlichen Verifizierungsprozess geführt.'
  },
  {
    question: 'Welche Zahlungsmethoden werden unterstützt?',
    answer: 'Wir akzeptieren alle gängigen Kredit- und Debitkarten (VISA, Mastercard, American Express), SEPA-Lastschrift sowie PayPal. Die Abrechnung erfolgt transparent und automatisiert.'
  },
  {
    question: 'Wie funktioniert die Terminverwaltung?',
    answer: 'Unser digitales Buchungssystem ermöglicht eine einfache Verwaltung aller Termine. Sie können Verfügbarkeiten festlegen, Termine bestätigen oder verschieben und automatische Erinnerungen aktivieren.'
  },
  {
    question: 'Gibt es eine Mindestvertragslaufzeit?',
    answer: 'Wir bieten flexible Laufzeiten an: monatlich, quartalsweise oder jährlich. Die Mindestlaufzeit beträgt einen Monat, bei längeren Laufzeiten profitieren Sie von attraktiven Rabatten.'
  },
  {
    question: 'Wie sicher sind meine Daten?',
    answer: 'Datensicherheit hat für uns höchste Priorität. Wir verwenden modernste Verschlüsselungstechnologien und speichern alle Daten DSGVO-konform in deutschen Rechenzentren.'
  },
  {
    question: 'Kann ich das System testen?',
    answer: 'Ja, wir bieten eine kostenlose 14-tägige Testphase an. In dieser Zeit können Sie alle Premium-Features unverbindlich testen und sich von unserer Plattform überzeugen.'
  }
]

export default function SupportPage() {
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
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Wie können wir Ihnen <br />
              <span className="text-primary">helfen?</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Unser Support-Team steht Ihnen bei allen Fragen zur Seite. 
              Finden Sie schnell Antworten oder kontaktieren Sie uns direkt.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-8 max-w-2xl"
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                className="pl-10" 
                placeholder="Suchen Sie nach Hilfeartikeln..."
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="container pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {helpCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-xl border bg-card p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col items-start">
                <div className="rounded-lg bg-primary/10 p-3 mb-4">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{category.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {category.description}
                </p>
                <Button 
                  variant="ghost" 
                  className="group/btn mt-auto"
                >
                  Mehr erfahren
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t bg-muted/30">
        <div className="container py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            <h2 className="text-3xl font-bold tracking-tight text-center mb-8">
              Häufig gestellte Fragen
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  Kontaktieren Sie uns
                </h2>
                <p className="text-muted-foreground">
                  Unser Support-Team ist von Montag bis Freitag von 9:00 bis 18:00 Uhr für Sie da.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">E-Mail</h3>
                    <p className="text-sm text-muted-foreground">
                      support@nicnoa.de
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Antwort innerhalb von 24 Stunden
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Live-Chat</h3>
                    <p className="text-sm text-muted-foreground">
                      Direkte Unterstützung im Chat
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Durchschnittliche Wartezeit: 5 Minuten
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Telefon</h3>
                    <p className="text-sm text-muted-foreground">
                      +49 (0) 89 123 456 789
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mo-Fr 9:00-18:00 Uhr
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border bg-card p-6"
            >
              <form className="space-y-4">
                <div className="space-y-2">
                  <Input placeholder="Ihr Name" />
                </div>
                <div className="space-y-2">
                  <Input type="email" placeholder="Ihre E-Mail-Adresse" />
                </div>
                <div className="space-y-2">
                  <Input placeholder="Betreff" />
                </div>
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Ihre Nachricht"
                    className="min-h-[150px]"
                  />
                </div>
                <Button className="w-full">
                  Nachricht senden
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
} 