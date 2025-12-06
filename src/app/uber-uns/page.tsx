'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { 
  Linkedin,
  Users,
  ShieldCheck,
  Scaling,
  Lightbulb,
  ArrowRight,
  Rocket,
  Target,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const approaches = [
  {
    icon: Target,
    title: 'Praxisnah validiert',
    description: 'Wir haben unsere Konzepte zunächst offline getestet und bewiesen, dass sie in der realen Welt funktionieren – bevor wir sie digital skaliert haben.',
  },
  {
    icon: ShieldCheck,
    title: 'Rechtssicherheit & Automatisierung',
    description: 'Automatisierte Verträge und integrierte Compliance-Standards schaffen Sicherheit bei allen Mietprozessen.',
  },
  {
    icon: Scaling,
    title: 'Skalierbarkeit & Flexibilität',
    description: 'Unsere Plattform passt sich an individuelle Anforderungen an, ob Einzelunternehmer, KMU oder Großunternehmen.',
  },
  {
    icon: Sparkles,
    title: 'Benutzerfreundlichkeit',
    description: 'Ein intuitives Design und durchdachte Workflows machen die Verwaltung und Vermietung von Flächen so einfach wie möglich.',
  },
]

export default function UberUnsPage() {
  // Placeholder images - replace with actual hosted images
  const danielImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80'
  const nicoImage = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=600&fit=crop&q=80'

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
              <Users className="mr-1 h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Das Team hinter NICNOA</span>
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Experten für moderne <br />
              <span className="text-primary">Salon-Spaces</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Wir sind Daniel und Nico – zwei erfahrene Experten, die mit Leidenschaft 
              die Zukunft des Salon-Managements gestalten. Mit unserer Expertise 
              revolutionieren wir die Art und Weise, wie Salon-Spaces verwaltet werden.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container py-16">
        <div className="grid gap-16 md:grid-cols-2">
          {/* Daniel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={danielImage}
                alt="Daniel"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            <div className="flex flex-col flex-1 mt-6">
              <h2 className="text-2xl font-bold">Daniel</h2>
              <span className="text-primary font-medium">Co-Founder</span>
              <p className="mt-2 text-muted-foreground min-h-[100px]">
                Mit über 20 Jahren Berufserfahrung in Produktentwicklung, Agilität, 
                Daten-Analytics und als Tech- sowie Produkt-Lead hat Daniel bereits 
                zahlreiche branchenübergreifende Projekte erfolgreich geleitet.
              </p>
              <Button variant="ghost" size="sm" className="self-start mt-auto" asChild>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="mr-2 h-4 w-4" />
                  Daniel auf LinkedIn
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Nico */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={nicoImage}
                alt="Nico"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            <div className="flex flex-col flex-1 mt-6">
              <h2 className="text-2xl font-bold">Nico</h2>
              <span className="text-primary font-medium">Co-Founder</span>
              <p className="mt-2 text-muted-foreground min-h-[100px]">
                Nico ist Industrie-Experte mit 15 Jahren Erfahrung im Wellness- und 
                Beauty-Business und Betreiber von drei sehr erfolgreichen Coworking 
                Spaces.
              </p>
              <Button variant="ghost" size="sm" className="self-start mt-auto" asChild>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="mr-2 h-4 w-4" />
                  Nico auf LinkedIn
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="border-t bg-muted/50">
        <div className="container py-16">
          <div className="grid gap-16 md:grid-cols-2">
            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
                <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Unsere Vision</span>
              </div>
              <h2 className="text-3xl font-bold">Die Zukunft der Salon-Branche gestalten</h2>
              <p className="text-muted-foreground">
                Wir glauben an eine Zukunft, in der flexible Salon-Spaces und 
                gemeinsame Ressourcen den Unternehmergeist in der Beauty-Branche 
                beflügeln und nachhaltiges Wachstum fördern.
              </p>
            </motion.div>

            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
                <Target className="mr-2 h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Unsere Mission</span>
              </div>
              <h2 className="text-3xl font-bold">Innovativ & Effizient</h2>
              <p className="text-muted-foreground">
                Unser Antrieb ist es, innovative und effiziente Lösungen zu schaffen, 
                die das Management von Salon-Spaces vereinfachen und die Zusammenarbeit 
                in der Beauty-Branche fördern.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold">Unser Ansatz</h2>
          <p className="mt-4 text-muted-foreground">
            Wie wir arbeiten und was uns auszeichnet
          </p>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {approaches.map((approach, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5 flex-shrink-0">
                  <approach.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold leading-tight">{approach.title}</h3>
                  <p className="text-sm text-muted-foreground">{approach.description}</p>
                </div>
              </div>
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Section */}
      <section className="border-t bg-muted/50">
        <div className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">
                Warum wir tun, was wir tun
              </h2>
              <p className="text-muted-foreground mb-8">
                Wir sind fest davon überzeugt, dass moderne Salon-Spaces und 
                intelligente Ressourcennutzung der Schlüssel zum Erfolg in der 
                Beauty-Branche sind. Gemeinsam gestalten wir die Zukunft des 
                Salon-Managements.
              </p>
              <Button size="lg" className="group" asChild>
                <Link href="/registrieren">
                  Jetzt durchstarten
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 