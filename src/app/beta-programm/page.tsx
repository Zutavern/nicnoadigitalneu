'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Button } from '@/components/ui/button'
import { 
  Rocket,
  Users,
  MessageSquare,
  Gift,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

const benefits = [
  {
    icon: Rocket,
    title: 'Early Access',
    description: 'Exklusiver Zugriff auf alle Features vor dem offiziellen Launch.',
  },
  {
    icon: Users,
    title: 'Direkter Einfluss',
    description: 'Gestalten Sie aktiv die Zukunft der Plattform mit Ihrem Feedback.',
  },
  {
    icon: MessageSquare,
    title: 'Premium Support',
    description: 'Direkter Draht zu unserem Entwicklungsteam für schnelle Hilfe.',
  },
  {
    icon: Gift,
    title: 'Lifetime Rabatt',
    description: '50% Rabatt auf alle Preispläne - garantiert für die gesamte Nutzungsdauer.',
  },
]

const requirements = [
  'Aktiver Salon-Space mit mindestens 3 Arbeitsplätzen',
  'Bereitschaft zur aktiven Teilnahme am Feedback-Prozess',
  'Mindestens 2 Jahre Erfahrung im Salon-Management',
  'Offenheit für digitale Innovationen',
]

const timeline = [
  {
    date: 'Q2 2025',
    title: 'Start der Beta',
    description: 'Onboarding der ersten 5 Beta-Tester und initiale Systemeinrichtung.',
  },
  {
    date: 'Q3 2025',
    title: 'Feedback & Optimierung',
    description: 'Intensive Feedback-Runden und kontinuierliche Verbesserungen.',
  },
  {
    date: 'Q4 2025',
    title: 'Feature-Erweiterung',
    description: 'Integration neuer Features basierend auf Beta-Feedback.',
  },
  {
    date: 'Q1 2026',
    title: 'Finalisierung',
    description: 'Letzte Optimierungen vor dem offiziellen Launch.',
  },
]

export default function BetaProgrammPage() {
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
              <Rocket className="mr-1 h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Start in Q2 2025</span>
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Gestalten Sie die Zukunft des <br />
              <span className="text-primary">Salon-Managements</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Werden Sie einer von nur 5 exklusiven Beta-Testern und profitieren Sie 
              von einzigartigen Vorteilen. Gemeinsam entwickeln wir die perfekte 
              Lösung für moderne Salon-Spaces.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" className="group">
                Jetzt bewerben
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline">
                Mehr erfahren
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{benefit.title}</h3>
              </div>
              <p className="mt-4 text-muted-foreground">{benefit.description}</p>
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
            </div>
          ))}
        </motion.div>
      </section>

      {/* Requirements Section */}
      <section className="border-t bg-muted/50">
        <div className="container py-16">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-4">
                Anforderungen
              </h2>
              <p className="text-muted-foreground mb-8">
                Wir suchen innovative Salon-Betreiber, die mit uns die Zukunft gestalten möchten.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {requirements.map((requirement, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border bg-card p-4"
                >
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{requirement}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Beta-Programm Timeline
            </h2>
            <p className="text-muted-foreground">
              Ein strukturierter Fahrplan für die Entwicklung unserer Plattform.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border md:left-1/2" />
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="rounded-xl border bg-card p-6">
                      <span className="text-sm font-medium text-primary">
                        {item.date}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                      <p className="mt-1 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-card md:mx-auto">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  </div>
                  <div className="hidden flex-1 md:block" />
                </div>
              ))}
            </div>
          </div>
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
                Bereit für die Zukunft?
              </h2>
              <p className="mb-8 text-muted-foreground">
                Sichern Sie sich jetzt einen der exklusiven Beta-Tester Plätze und profitieren Sie 
                von einzigartigen Vorteilen.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="group">
                  Beta-Bewerbung starten
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Mehr Informationen
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
} 