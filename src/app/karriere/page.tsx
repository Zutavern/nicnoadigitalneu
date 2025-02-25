'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Button } from '@/components/ui/button'
import { 
  Users,
  Code2,
  Lightbulb,
  Building2,
  Clock,
  Laptop,
  GraduationCap,
  Heart,
  Coffee
} from 'lucide-react'

const jobs = [
  {
    title: 'Team Assistant',
    type: 'Vollzeit',
    location: 'München',
    department: 'Operations',
    icon: Users,
    description: 'Als Team Assistant unterstützt du unser wachsendes Team bei der täglichen Organisation und trägst maßgeblich zur Effizienz unserer Abläufe bei.',
    requirements: [
      'Abgeschlossene kaufmännische Ausbildung',
      'Sehr gute MS Office Kenntnisse',
      'Ausgezeichnete Deutsch- und Englischkenntnisse',
      'Organisationstalent und Hands-on Mentalität',
    ],
  },
  {
    title: 'Full Stack Developer',
    type: 'Vollzeit',
    location: 'München / Remote',
    department: 'Engineering',
    icon: Code2,
    description: 'Als Full Stack Developer entwickelst du innovative Lösungen für unsere SaaS-Plattform und gestaltest die Zukunft des Salon-Managements.',
    requirements: [
      'Erfahrung mit React, TypeScript und Node.js',
      'Verständnis für UI/UX Design',
      'Kenntnisse in der Arbeit mit APIs',
      'Agile Entwicklungsmethoden',
    ],
  },
  {
    title: 'Product Owner',
    type: 'Vollzeit',
    location: 'München',
    department: 'Product',
    icon: Lightbulb,
    description: 'Als Product Owner definierst du die Produktstrategie und arbeitest eng mit dem Entwicklungsteam zusammen, um innovative Features zu entwickeln.',
    requirements: [
      'Mind. 3 Jahre Erfahrung als Product Owner',
      'Erfahrung mit agilen Methoden',
      'Starke analytische Fähigkeiten',
      'Ausgeprägtes technisches Verständnis',
    ],
  },
]

const benefits = [
  {
    title: 'Modernes Büro',
    description: 'Zentral gelegenes Büro mit modernster Ausstattung',
    icon: Building2,
  },
  {
    title: 'Flexible Arbeitszeiten',
    description: 'Work-Life-Balance durch flexible Zeiteinteilung',
    icon: Clock,
  },
  {
    title: 'Remote Work',
    description: 'Möglichkeit zum hybriden Arbeiten von zu Hause',
    icon: Laptop,
  },
  {
    title: 'Weiterbildung',
    description: 'Individuelle Entwicklungsmöglichkeiten',
    icon: GraduationCap,
  },
  {
    title: 'Team Events',
    description: 'Regelmäßige Team-Events und Aktivitäten',
    icon: Heart,
  },
  {
    title: 'Getränke & Snacks',
    description: 'Kostenlose Getränke und Snacks im Büro',
    icon: Coffee,
  },
]

export default function KarrierePage() {
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
              Werde Teil unserer Vision für die <br />
              <span className="text-primary">Zukunft des Salon-Managements</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Bei NICNOA & CO. DIGITAL entwickeln wir innovative Lösungen für die Beauty-Branche. 
              Gestalte mit uns die digitale Transformation von Salon-Spaces.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t bg-muted/50">
        <div className="container py-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Deine Vorteile
          </h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 rounded-xl border bg-card"
              >
                <div className="rounded-lg bg-primary/10 p-2">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Offene Stellen
        </h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6"
        >
          {jobs.map((job, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-xl border bg-card p-6 shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                {/* Icon and Title */}
                <div className="flex items-start gap-4 sm:w-1/3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <job.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>{job.type}</p>
                      <p>{job.location}</p>
                      <p>{job.department}</p>
                    </div>
                  </div>
                </div>

                {/* Description and Requirements */}
                <div className="sm:w-2/3">
                  <p className="text-muted-foreground">
                    {job.description}
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="font-medium">Anforderungen:</p>
                    <ul className="list-inside space-y-1 text-sm text-muted-foreground">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Button>
                      Jetzt bewerben
                    </Button>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  )
} 