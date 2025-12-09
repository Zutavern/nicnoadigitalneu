'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  CreditCard,
  Settings,
  Users,
  Building2,
  BarChart3,
  Shield,
  Smartphone,
  LucideIcon
} from 'lucide-react'
import { FeatureShowcase } from '@/components/sections/feature-showcase'

const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description:
      'Intelligentes Buchungssystem für optimale Auslastung. Automatische Terminerinnerungen und nahtlose Kalendersynchronisation.',
  },
  {
    icon: CreditCard,
    title: 'Flexible Zahlungen',
    description:
      'Verschiedene Zahlungsmethoden, automatische Abrechnungen und transparente Umsatzübersichten in Echtzeit.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description:
      'Effiziente Verwaltung von Stuhlmietern, Rechtevergabe und integrierte Team-Kommunikation.',
  },
  {
    icon: Building2,
    title: 'Space Management',
    description:
      'Optimale Raumaufteilung, Ressourcenplanung und digitale Arbeitsplatzreservierung.',
  },
  {
    icon: BarChart3,
    title: 'Business Analytics',
    description:
      'Detaillierte Auswertungen, KPIs und Prognosen für fundierte Geschäftsentscheidungen.',
  },
  {
    icon: Shield,
    title: 'Rechtssicherheit',
    description:
      'Rechtskonforme Verträge, DSGVO-konformer Datenschutz und sichere Datenspeicherung.',
  },
  {
    icon: Settings,
    title: 'Automatisierung',
    description:
      'Workflow-Automatisierung für wiederkehrende Aufgaben, von der Rechnungsstellung bis zur Reinigungsplanung.',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description:
      'Vollständig responsive Plattform, optimiert für alle Geräte mit nativer App-Performance.',
  },
]

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

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) => (
  <motion.div
    variants={itemVariants}
    className="group relative rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow"
  >
    <div className="flex items-center gap-4">
      <div className="rounded-lg bg-primary/10 p-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="mt-4 text-muted-foreground">{description}</p>
    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
  </motion.div>
)

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-background">
      <MainNav />

      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="container py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Alle Features für Ihren <br />
              <span className="text-primary">erfolgreichen Salon-Space</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Entdecken Sie die umfassenden Möglichkeiten unserer Plattform.
              Entwickelt für moderne Salon-Betreiber, optimiert für maximalen
              Erfolg.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase */}
      <FeatureShowcase />

      {/* Features Grid */}
      <section className="container pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50">
        <div className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-4 text-3xl font-bold">
                Bereit für die Zukunft des Salon-Managements?
              </h2>
              <p className="mb-8 text-muted-foreground">
                Starten Sie jetzt mit NICNOA&CO.online und revolutionieren Sie
                Ihren Salon-Space.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="text-lg">
                  Jetzt Demo anfordern
                </Button>
                <Button size="lg" variant="outline" className="text-lg">
                  Preise ansehen
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold">
              Nahtlose Integration
            </h2>
            <p className="mb-8 text-muted-foreground">
              Unsere Plattform integriert sich perfekt in Ihren Arbeitsalltag und
              wächst mit Ihren Anforderungen.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4">
                <p className="font-medium">Schnelle Einrichtung</p>
                <p className="text-sm text-muted-foreground">
                  In wenigen Minuten startklar
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="font-medium">24/7 Support</p>
                <p className="text-sm text-muted-foreground">
                  Immer für Sie da
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="font-medium">Regelmäßige Updates</p>
                <p className="text-sm text-muted-foreground">
                  Stets auf dem neuesten Stand
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 