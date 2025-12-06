'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { 
  Rocket,
  Wrench,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Star
} from 'lucide-react'

const updates = [
  {
    date: 'März 2025',
    category: 'Neu',
    title: 'Dark Mode & Performance',
    description: 'Elegantes dunkles Design für bessere Übersicht und optimierte Ladezeiten für schnellere Navigation.',
    icon: Sparkles,
    highlight: true,
  },
  {
    date: 'Februar 2025',
    category: 'Sicherheit',
    title: 'Erweiterte Datensicherheit',
    description: 'Implementierung modernster Verschlüsselungstechnologien und verbesserter Zugriffskontrollen.',
    icon: Shield,
  },
  {
    date: 'Februar 2025',
    category: 'Feature',
    title: 'Intelligente Terminplanung',
    description: 'Neue Algorithmen für optimale Auslastung und automatische Terminerinnerungen.',
    icon: Zap,
  },
  {
    date: 'Januar 2025',
    category: 'Optimierung',
    title: 'UI/UX Verbesserungen',
    description: 'Überarbeitete Navigation und intuitivere Benutzerführung für effizienteres Arbeiten.',
    icon: Wrench,
  },
  {
    date: 'Januar 2025',
    category: 'Feature',
    title: 'Beta Start',
    description: 'Offizieller Start der Beta-Phase mit ausgewählten Partnersalons.',
    icon: Rocket,
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

export default function UpdatesPage() {
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
            <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm">
              <Star className="mr-1 h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-muted-foreground">Neueste Updates</span>
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Stetige Verbesserungen für Ihren <br />
              <span className="text-primary">Salon-Space</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Entdecken Sie unsere neuesten Entwicklungen und Verbesserungen. 
              Wir arbeiten kontinuierlich daran, Ihre Erfahrung noch besser zu machen.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Updates Grid */}
      <section className="container pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2"
        >
          {updates.map((update, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`group relative rounded-xl border bg-card p-6 shadow-lg transition-shadow hover:shadow-xl ${
                update.highlight ? 'md:col-span-2' : ''
              }`}
            >
              {/* Category Badge */}
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {update.category}
                </span>
                <span className="text-sm text-muted-foreground">
                  {update.date}
                </span>
              </div>

              {/* Content */}
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <update.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{update.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {update.description}
                  </p>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Newsletter Section */}
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
                Bleiben Sie auf dem Laufenden
              </h2>
              <p className="mb-8 text-muted-foreground">
                Abonnieren Sie unseren Newsletter und erhalten Sie als Erste/r Informationen über neue Features und Verbesserungen.
              </p>
              <Button size="lg" className="group">
                Newsletter abonnieren
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 