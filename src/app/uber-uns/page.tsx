'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Button } from '@/components/ui/button'
import { 
  Linkedin,
  ArrowRight,
  CheckCircle2,
  Users,
  Target,
  Lightbulb,
  Rocket,
  BarChart,
  Shield,
  Zap,
  Heart,
  Globe,
  Network
} from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

// Neue Vision Details
const visionPoints = [
  {
    title: 'Flexible Arbeitsmodelle',
    description: 'Wir ermöglichen es Beauty-Professionals, selbstbestimmt und flexibel in modernen Salon-Spaces zu arbeiten.',
    icon: Network
  },
  {
    title: 'Optimale Raumnutzung',
    description: 'Durch intelligentes Management maximieren wir die Auslastung von Behandlungsräumen und Arbeitsplätzen in Salons.',
    icon: BarChart
  },
  {
    title: 'Vernetzte Beauty-Community',
    description: 'Wir verbinden Salonbetreiber und Beauty-Professionals für eine starke, kollaborative Zukunft der Beautybranche.',
    icon: Globe
  }
]

// Neue Mission Details
const missionPoints = [
  {
    title: 'Rechtssicherheit',
    description: 'Standardisierte Verträge und Compliance-Richtlinien für sorgenfreies Vermieten.',
    icon: Shield
  },
  {
    title: 'Automatisierung',
    description: 'Intelligente Prozesse reduzieren den Verwaltungsaufwand auf ein Minimum.',
    icon: Zap
  },
  {
    title: 'Skalierbarkeit',
    description: 'Flexible Lösungen, die mit Ihrem Unternehmen mitwachsen.',
    icon: Rocket
  }
]

export default function UberUnsPage() {
  const supabase = createClient()

  const danielImageUrl = supabase.storage
    .from('profilepic')
    .getPublicUrl('mache_mir_eine_hnlichices_bild__u6t98do2nlo1d1tkpyys_2.png').data.publicUrl

  const nicoImageUrl = supabase.storage
    .from('profilepic')
    .getPublicUrl('1644532693520.jpeg').data.publicUrl

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
              Das Team hinter <br />
              <span className="text-primary">NICNOA & CO. DIGITAL</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Wir sind ein dynamisches Duo mit der Vision, die Beauty-Branche von morgen 
              aktiv mitzugestalten. Mit unserer Expertise in Technologie und Beauty-Business 
              entwickeln wir innovative Lösungen für moderne Salon-Spaces und deren selbstständige 
              Beauty-Professionals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container py-24">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Daniel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative rounded-xl border bg-card p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6 h-48 w-48 overflow-hidden rounded-full">
                <Image
                  src={danielImageUrl}
                  alt="Daniel Zutavern"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 192px, 192px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/20 mix-blend-overlay" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">Daniel Zutavern</h3>
              <p className="mb-4 text-primary">Co-Founder & Tech/Product Lead</p>
              <p className="mb-6 text-muted-foreground">
                Als erfahrener Technologie- und Produktexperte mit fast zwei Jahrzehnten Erfahrung 
                leitet Daniel die technische und produktstrategische Vision von NICNOA. Seine 
                Expertise in agiler Entwicklung, Skalierung von SaaS-Lösungen und sein tiefes 
                Verständnis für Benutzerfreundlichkeit sind der Schlüssel zur Umsetzung unserer 
                innovativen Plattform.
              </p>
              <a
                href="https://linkedin.com/in/danielzutavern"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </a>
            </div>
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
          </motion.div>

          {/* Niko */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative rounded-xl border bg-card p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6 h-48 w-48 overflow-hidden rounded-full">
                <Image
                  src={nicoImageUrl}
                  alt="Nico Rapp"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 192px, 192px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/20 mix-blend-overlay" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">Nico Rapp</h3>
              <p className="mb-4 text-primary">Co-Founder & Industry Expert</p>
              <p className="mb-6 text-muted-foreground">
                Als erfolgreicher Betreiber von drei Coworking Spaces bringt Nico umfassende 
                praktische Expertise im Beauty- und Coworking-Bereich ein. Seine langjährige 
                Erfahrung im operativen Geschäft und sein tiefgreifendes Verständnis für die 
                Bedürfnisse moderner Salon-Spaces machen ihn zum idealen Ansprechpartner für 
                unsere Kunden und Partner.
              </p>
              <a
                href="https://linkedin.com/in/nico-rapp-8600b414a"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </a>
            </div>
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="border-t bg-muted/30">
        <div className="container py-24">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
                  <Target className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Unsere Vision</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Die Beauty-Branche neu definieren
                </h2>
                <p className="text-muted-foreground">
                  Wir sind fest davon überzeugt, dass die Zukunft der Beauty-Branche in flexiblen Arbeitsmodellen, 
                  intelligenter Raumnutzung und starker Vernetzung liegt. Mit unseren Lösungen ermöglichen wir 
                  Salonbetreibern und selbstständigen Beauty-Professionals, gemeinsam erfolgreich zu sein und zu wachsen.
                </p>
              </div>
              
              <div className="grid gap-6">
                {visionPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-start gap-4"
                  >
                    <div className="rounded-lg bg-primary/10 p-2">
                      <point.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{point.title}</h3>
                      <p className="text-sm text-muted-foreground">{point.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
                  <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Unsere Mission</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Innovative SaaS-Lösungen entwickeln
                </h2>
                <p className="text-muted-foreground">
                  Wir entwickeln eine rechtssichere, skalierbare und benutzerfreundliche SaaS-Plattform, die das Vermieten unterschiedlichster Kapazitäten – von Coworking-Arbeitsplätzen bis hin zu Stühlen in Beauty-Salons – mühelos und profitabel gestaltet.
                </p>
              </div>

              <div className="grid gap-6">
                {missionPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-start gap-4"
                  >
                    <div className="rounded-lg bg-primary/10 p-2">
                      <point.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{point.title}</h3>
                      <p className="text-sm text-muted-foreground">{point.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
            <Heart className="mr-2 h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Unser Warum</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Warum wir tun, was wir tun
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Unser Antrieb ist die Überzeugung, dass moderne Salon-Spaces durch intelligente 
            Raumnutzung und digitale Vernetzung zum Erfolg aller Beauty-Professionals beitragen können.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-12 max-w-3xl rounded-xl border bg-card p-8"
        >
          <p className="text-muted-foreground leading-relaxed">
            Durch die digitale Vernetzung von Salon-Spaces und Beauty-Professionals schaffen wir nicht nur 
            neue Einkommensmöglichkeiten, sondern revolutionieren die gesamte Beauty-Branche. Wir glauben 
            fest daran, dass flexible Arbeitsmodelle und professionelles Space-Management die Zukunft der 
            Beauty-Branche sind. Mit unserer Plattform ermöglichen wir es Salonbetreibern und 
            selbstständigen Beauty-Professionals, Teil dieser innovativen Entwicklung zu sein.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">Unsere Motivation</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <ul className="mt-8 space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
              <span className="text-muted-foreground">
                Wir begleiten Salon-Spaces und Beauty-Professionals als langfristiger Partner und 
                unterstützen sie bei der digitalen Transformation ihres Geschäfts.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
              <span className="text-muted-foreground">
                Wir entwickeln eine Plattform, die Flexibilität und Professionalität in der 
                Beauty-Branche neu definiert und moderne Arbeitsmodelle zum Standard macht.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
              <span className="text-muted-foreground">
                Wir schaffen die technologische Grundlage für den nachhaltigen Erfolg von 
                Salon-Spaces und deren Beauty-Professionals in der digitalen Zukunft.
              </span>
            </li>
          </ul>
        </motion.div>
      </section>
    </main>
  )
}