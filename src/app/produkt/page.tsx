'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Shield, 
  Smartphone, 
  Clock,
  CreditCard,
  MessageSquare,
  Settings
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Calendar,
    title: 'Digitale Terminbuchung',
    description: 'Ihre Kunden buchen 24/7 online. Automatische Bestätigungen und Erinnerungen reduzieren No-Shows um bis zu 80%.'
  },
  {
    icon: Users,
    title: 'Team & Stuhlverwaltung',
    description: 'Verwalten Sie Ihre Mitarbeiter, Stuhlmieter und deren Verfügbarkeiten zentral. Flexible Mietmodelle und transparente Abrechnung.'
  },
  {
    icon: BarChart3,
    title: 'Umfassende Analytics',
    description: 'Detaillierte Einblicke in Auslastung, Umsatz und Kundenverhalten. Datenbasierte Entscheidungen für Ihr Wachstum.'
  },
  {
    icon: Shield,
    title: 'Rechtssichere Verträge',
    description: 'Von Fachanwälten geprüfte Mietverträge. Digitale Unterschriften und revisionssichere Dokumentation.'
  },
  {
    icon: Smartphone,
    title: 'Mobile App',
    description: 'Volle Kontrolle von unterwegs. Push-Benachrichtigungen für neue Buchungen und wichtige Updates.'
  },
  {
    icon: Clock,
    title: 'Automatisierung',
    description: 'Wiederkehrende Aufgaben automatisieren. Von Rechnungsstellung bis Terminerinnerungen - alles läuft von selbst.'
  },
  {
    icon: CreditCard,
    title: 'Integrierte Zahlungen',
    description: 'Sichere Online-Zahlungen, automatische Rechnungsstellung und transparente Provisionsmodelle.'
  },
  {
    icon: MessageSquare,
    title: 'Kundenkommunikation',
    description: 'Integrierter Chat, SMS und E-Mail. Bleiben Sie mit Ihren Kunden und Mietern in Kontakt.'
  },
  {
    icon: Settings,
    title: 'Anpassbar',
    description: 'Ihr Branding, Ihre Regeln. Passen Sie die Plattform an Ihre individuellen Bedürfnisse an.'
  }
]

export default function ProduktPage() {
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
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Alles was Ihr<br />
              <span className="text-primary">Salon-Space</span> braucht
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Eine Plattform für Terminbuchung, Stuhlvermietung, Kundenverwaltung und Analytics. 
              Entwickelt von Salon-Experten für Salon-Experten.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/registrieren">
                <Button size="lg" className="w-full sm:w-auto">
                  Kostenlos starten
                </Button>
              </Link>
              <Link href="/preise">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Preise ansehen
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container pb-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50">
        <div className="container py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="mb-4 text-3xl font-bold">
              Bereit für die Zukunft Ihres Salons?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Starten Sie noch heute und erleben Sie, wie NICNOA Ihren Arbeitsalltag revolutioniert.
            </p>
            <Link href="/registrieren">
              <Button size="lg">
                Jetzt kostenlos testen
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}



