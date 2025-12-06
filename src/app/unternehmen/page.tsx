'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Heart, Target, Lightbulb, Users } from 'lucide-react'
import Link from 'next/link'

const values = [
  {
    icon: Heart,
    title: 'Leidenschaft',
    description: 'Wir brennen für die Beauty-Branche und verstehen die täglichen Herausforderungen von Salon-Betreibern und Stylisten.'
  },
  {
    icon: Target,
    title: 'Innovation',
    description: 'Wir entwickeln zukunftsweisende Lösungen, die den Salon-Alltag revolutionieren und neue Standards setzen.'
  },
  {
    icon: Lightbulb,
    title: 'Einfachheit',
    description: 'Komplexe Technologie, einfach verpackt. Unsere Plattform ist intuitiv und macht Spaß zu nutzen.'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Wir bauen eine starke Gemeinschaft von Salon-Profis, die voneinander lernen und gemeinsam wachsen.'
  }
]

const team = [
  {
    name: 'Nico',
    role: 'Co-Founder & CEO',
    description: 'Mit über 10 Jahren Erfahrung in der Beauty-Branche kennt Nico die Herausforderungen aus erster Hand.'
  },
  {
    name: 'Daniel',
    role: 'Co-Founder & CTO',
    description: 'Daniel bringt technische Expertise und die Vision für eine digitale Transformation der Branche.'
  }
]

export default function UnternehmenPage() {
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
              Wir revolutionieren<br />
              <span className="text-primary">Salon-Coworking</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              NICNOA & CO. DIGITAL wurde gegründet, um die Art und Weise zu verändern, 
              wie Salon-Spaces betrieben werden. Unsere Mission: Mehr Zeit für das, was zählt – Ihre Kunden.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="container pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl rounded-xl border bg-card p-8 shadow-lg"
        >
          <h2 className="mb-6 text-2xl font-bold">Unsere Geschichte</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Alles begann mit einer einfachen Beobachtung: Salon-Betreiber verbringen zu viel Zeit mit 
              Verwaltungsaufgaben und zu wenig mit dem, was sie lieben – ihre Kunst auszuüben und 
              Kunden glücklich zu machen.
            </p>
            <p>
              Aus dieser Erkenntnis entstand NICNOA & CO. DIGITAL. Eine Plattform, die speziell 
              für die Bedürfnisse moderner Salon-Coworking-Spaces entwickelt wurde.
            </p>
            <p>
              Heute helfen wir Hunderten von Salons dabei, ihre Prozesse zu digitalisieren, 
              ihre Auslastung zu optimieren und ein professionelles Arbeitsumfeld für 
              selbstständige Stylisten zu schaffen.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold">Unsere Werte</h2>
            <p className="text-muted-foreground">
              Was uns antreibt und wie wir arbeiten
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-4">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold">Das Team</h2>
          <p className="text-muted-foreground">
            Die Menschen hinter NICNOA & CO. DIGITAL
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-2xl gap-8 md:grid-cols-2">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-xl border bg-card p-6 text-center shadow-lg"
            >
              <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/40" />
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="mb-2 text-sm text-primary">{member.role}</p>
              <p className="text-sm text-muted-foreground">{member.description}</p>
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
              Werden Sie Teil unserer Geschichte
            </h2>
            <p className="mb-8 text-muted-foreground">
              Entdecken Sie, wie NICNOA Ihren Salon-Space transformieren kann.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/registrieren">
                <Button size="lg" className="w-full sm:w-auto">
                  Jetzt starten
                </Button>
              </Link>
              <Link href="/partner">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Partner werden
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}



