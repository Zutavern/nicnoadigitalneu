'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight,
  HandshakeIcon,
  Boxes,
  Zap,
  RefreshCw,
  Shield,
  Clock
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const partners = [
  {
    name: 'Lexware Office',
    logo: '/partner/lexware.svg',
    description: 'Nahtlose Integration mit Lexware Office für professionelle Buchhaltung und Finanzverwaltung. Automatisierte Prozesse sparen Zeit und minimieren Fehler.',
    benefits: [
      'Automatische Rechnungsstellung',
      'Digitale Buchhaltung',
      'Echtzeit-Finanzdaten',
      'Steuerrelevante Auswertungen'
    ]
  },
  {
    name: 'Shopify',
    logo: '/partner/shopify.svg',
    description: 'Verkaufen Sie Produkte direkt über Ihren Salon-Space mit unserer Shopify-Integration. Von der Lagerverwaltung bis zum Online-Shop alles aus einer Hand.',
    benefits: [
      'Integrierter Online-Shop',
      'Bestandsmanagement',
      'Multichannel-Verkauf',
      'Kundenmanagement'
    ]
  }
]

const benefits = [
  {
    icon: Zap,
    title: 'Schnelle Integration',
    description: 'Einfache und schnelle Einrichtung aller Partner-Services direkt aus Ihrem Dashboard.'
  },
  {
    icon: RefreshCw,
    title: 'Automatische Synchronisation',
    description: 'Alle Daten werden in Echtzeit zwischen den Systemen synchronisiert.'
  },
  {
    icon: Shield,
    title: 'Sicher & Zuverlässig',
    description: 'Höchste Sicherheitsstandards für alle Integrationen und Datentransfers.'
  },
  {
    icon: Clock,
    title: 'Zeit sparen',
    description: 'Automatisierte Prozesse reduzieren manuelle Arbeit und sparen wertvolle Zeit.'
  }
]

export default function PartnerPage() {
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
              <HandshakeIcon className="mr-1 h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Starke Partnerschaften</span>
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Technologie-Partner für Ihren <br />
              <span className="text-primary">erfolgreichen Salon-Space</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Wir arbeiten mit führenden Technologie-Unternehmen zusammen, um Ihnen 
              die beste Lösung für Ihr Salon-Management zu bieten.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="container py-16">
        <div className="grid gap-16">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="group relative rounded-xl border bg-card p-8 hover:shadow-lg transition-shadow"
            >
              <div className="grid gap-8 md:grid-cols-2">
                {/* Logo & Description */}
                <div className="space-y-6">
                  <div className="relative h-12 w-48">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-muted-foreground">
                    {partner.description}
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Features & Vorteile</h3>
                  <ul className="space-y-3">
                    {partner.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="border-t bg-muted/50">
        <div className="container py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1">
              <Boxes className="mr-2 h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Integration Benefits</span>
            </div>
            <h2 className="mt-4 text-3xl font-bold">
              Alle Vorteile auf einen Blick
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/20 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Bereit für die Integration?
            </h2>
            <p className="text-muted-foreground mb-8">
              Starten Sie jetzt mit NICNOA & CO. DIGITAL und profitieren Sie von 
              unseren starken Partnerschaften.
            </p>
            <Button size="lg" className="group" asChild>
              <Link href="/registrieren">
                Jetzt Partner-Integrationen nutzen
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 