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
  Zap
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const founderVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

const approaches = [
  {
    title: 'Praxisnahe Validierung',
    description: 'Wir haben unsere Konzepte zunächst im Offline-Bereich getestet, verfeinert und real erprobt, bevor wir sie digital skaliert haben.',
    icon: CheckCircle2
  },
  {
    title: 'Automatisierung & Compliance',
    description: 'Standardisierte Verträge und integrierte Compliance-Richtlinien gewährleisten Rechtssicherheit in sämtlichen Buchungs- und Abrechnungsprozessen.',
    icon: Shield
  },
  {
    title: 'Agilität & Flexibilität',
    description: 'Unser Plattformdesign ermöglicht es, schnell auf neue Marktanforderungen zu reagieren – ganz gleich, ob es sich um kleine, mittlere oder große Unternehmen handelt.',
    icon: Zap
  },
  {
    title: 'Nutzerorientiertes Design',
    description: 'Klare Workflows und ein intuitives Interface reduzieren Verwaltungsaufwand und ermöglichen es unseren Kunden, sich auf das Wesentliche zu konzentrieren: ihr Kerngeschäft.',
    icon: Users
  }
]

const values = [
  {
    title: 'Rechts- und Planungssicherheit',
    icon: Shield,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Automatisierte, transparente Prozesse',
    icon: Rocket,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Intuitive Nutzerführung',
    icon: Users,
    gradient: 'from-orange-500 to-red-500'
  },
  {
    title: 'Nahtlose Skalierbarkeit',
    icon: BarChart,
    gradient: 'from-green-500 to-emerald-500'
  }
]

export default function UberUnsPage() {
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
              Die Köpfe hinter <br />
              <span className="text-primary">NICNOA & CO.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Wir sind Daniel und Niko – zwei engagierte Profis, die fest daran glauben, dass die Zukunft der Arbeit flexibel, kollaborativ und durch innovative Technologien gestützt sein muss.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="container pb-24">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Daniel */}
          <motion.div
            variants={founderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-xl border bg-card p-8"
          >
            <div className="relative z-10">
              <div className="mb-6 aspect-square w-32 overflow-hidden rounded-xl bg-muted">
                <Image
                  src="/images/daniel.jpg"
                  alt="Daniel"
                  width={128}
                  height={128}
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <h2 className="mb-2 text-2xl font-bold">Daniel</h2>
              <p className="mb-4 text-sm text-primary">Tech & Product Lead</p>
              <p className="mb-6 text-muted-foreground">
                Mit über 20 Jahren Berufserfahrung in Produktentwicklung, Agilität, Daten-Analytics und als Tech- sowie Produkt-Lead hat Daniel zahlreiche branchenübergreifende Projekte erfolgreich realisiert.
              </p>
              <Link href="https://linkedin.com" target="_blank">
                <Button variant="outline" className="group">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn Profil
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.div>

          {/* Niko */}
          <motion.div
            variants={founderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-xl border bg-card p-8"
          >
            <div className="relative z-10">
              <div className="mb-6 aspect-square w-32 overflow-hidden rounded-xl bg-muted">
                <Image
                  src="/images/niko.jpg"
                  alt="Niko"
                  width={128}
                  height={128}
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <h2 className="mb-2 text-2xl font-bold">Niko</h2>
              <p className="mb-4 text-sm text-primary">Industry Expert & Founder</p>
              <p className="mb-6 text-muted-foreground">
                Niko ist Industrie-Experte mit 15 Jahren Erfahrung im Wellness- und Beauty-Business und Betreiber von drei sehr erfolgreichen Coworking Spaces.
              </p>
              <Link href="https://linkedin.com" target="_blank">
                <Button variant="outline" className="group">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn Profil
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
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
              className="space-y-6"
            >
              <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
                <Target className="mr-2 h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Unsere Vision</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Die Zukunft der Arbeit neu definieren
              </h2>
              <p className="text-muted-foreground">
                Wir sind fest davon überzeugt, dass sich die Zukunft der Arbeit durch offene Strukturen, intelligente Ressourcennutzung und digitale Vernetzung definiert.
              </p>
            </motion.div>

            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
                <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Unsere Mission</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Innovative SaaS-Lösungen entwickeln
              </h2>
              <p className="text-muted-foreground">
                Wir entwickeln eine rechtssichere, skalierbare und benutzerfreundliche SaaS-Plattform, die das Vermieten unterschiedlichster Kapazitäten mühelos und profitabel gestaltet.
              </p>
            </motion.div>
          </div>

          {/* Values */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-xl border bg-card p-6"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 transition-opacity group-hover:opacity-10`} />
                <div className="relative z-10">
                  <value.icon className="mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-semibold">{value.title}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="mb-12 text-3xl font-bold tracking-tight sm:text-4xl">
            Unser Ansatz
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2"
        >
          {approaches.map((approach, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <approach.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{approach.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {approach.description}
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30">
        <div className="container py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="mb-4 text-3xl font-bold">
              Bereit für die Zukunft?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Lassen Sie uns gemeinsam die nächste Stufe des flexiblen und vernetzten Arbeitens einläuten.
            </p>
            <Link href="/registrieren">
              <Button size="lg" className="group">
                Jetzt durchstarten
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 