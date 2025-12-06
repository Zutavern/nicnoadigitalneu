'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Smartphone, 
  Brain, 
  Share2, 
  Layout,
  ChevronRight
} from 'lucide-react'

const roadmapItems = [
  {
    quarter: 'Q2 2025',
    title: 'Start Beta-Programm',
    description: 'Exklusiver Zugang für ausgewählte Salon-Spaces zur Mitgestaltung der Plattform.',
    icon: Sparkles,
    status: 'Planung',
  },
  {
    quarter: 'Q3 2025',
    title: 'Mobile App',
    description: 'Native Apps für iOS und Android mit allen wichtigen Features für unterwegs.',
    icon: Smartphone,
    status: 'In Entwicklung',
  },
  {
    quarter: 'Q4 2025',
    title: 'KI-Integration',
    description: 'Intelligente Automatisierung und Vorhersagen für optimale Geschäftsentscheidungen.',
    icon: Brain,
    status: 'Konzeption',
  },
  {
    quarter: 'Q1 2026',
    title: 'Social Media Manager',
    description: 'Integriertes Tool zur Verwaltung und Analyse Ihrer Social Media Präsenz.',
    icon: Share2,
    status: 'Planung',
  },
  {
    quarter: 'Q2 2026',
    title: 'Landing Pages für Stuhlmieter',
    description: 'Individuelle Präsentationsseiten für jeden Stuhlmieter mit Buchungsfunktion.',
    icon: Layout,
    status: 'Ideenfindung',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function RoadmapPage() {
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
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Unsere Vision für die <br />
              <span className="text-primary">Zukunft des Salon-Managements</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Gemeinsam mit unseren Kunden entwickeln wir die Zukunft der Salon-Coworking-Branche. 
              Ihre Bedürfnisse und Feedback fließen direkt in unsere Produktentwicklung ein.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="container pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border md:left-1/2" />

          {/* Timeline Items */}
          <div className="space-y-12">
            {roadmapItems.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="rounded-xl border bg-card p-6 shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {item.quarter}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                    </div>
                    <p className="mt-4 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Timeline Point */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-lg md:mx-auto">
                  <div className="h-4 w-4 rounded-full bg-primary" />
                </div>

                {/* Empty Space for Layout */}
                <div className="hidden flex-1 md:block" />
              </motion.div>
            ))}
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
                Gestalten Sie die Zukunft mit
              </h2>
              <p className="mb-8 text-muted-foreground">
                Werden Sie Teil unseres Beta-Programms und helfen Sie uns, die perfekte Lösung für Ihren Salon-Space zu entwickeln.
              </p>
              <Button size="lg" className="group">
                Beta-Programm anfragen
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
} 