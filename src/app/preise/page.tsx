'use client'

import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const features = [
  'Digitales Buchungssystem',
  'Automatische Terminerinnerungen',
  'Digitale Verträge',
  'Team Management',
  'Umsatzanalysen',
  'Mobile App',
  'Kundenanalysen',
  'Premium Support',
  'Ressourcenplanung',
]

const billingOptions = [
  { id: 'monthly', name: 'Monatlich', price: 99, multiplier: 1 },
  { id: 'quarterly', name: 'Quartalsweise', price: 249, multiplier: 3, discount: '15%', recommended: true },
  { id: 'yearly', name: 'Jährlich', price: 799, multiplier: 12, discount: '33%' },
]

export default function PricingPage() {
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
              Flexibel und transparent<br />
              <span className="text-primary">kalkulieren</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Alle Features, ein Preis - Sie entscheiden nur die Laufzeit.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container pb-16">
        <div className="grid gap-8 md:grid-cols-3">
          {billingOptions.map((option) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`relative flex flex-col rounded-xl border bg-card p-8 shadow-lg ${
                option.recommended
                  ? 'ring-2 ring-primary scale-105'
                  : ''
              }`}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold flex items-center justify-between">
                  Professional Suite
                  {option.recommended && (
                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      Empfohlen
                    </span>
                  )}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {option.name}
                </p>
              </div>

              <div className="mb-6">
                <p className="flex items-baseline">
                  <span className="text-4xl font-bold">
                    €{option.price}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    /{option.id === 'monthly' ? 'Monat' : option.id === 'quarterly' ? 'Quartal' : 'Jahr'}
                  </span>
                </p>
                {option.discount && (
                  <p className="mt-1 text-sm text-primary">
                    Sie sparen {option.discount}
                  </p>
                )}
              </div>

              <div className="space-y-4 flex-grow">
                <p className="font-medium">Alle Features inklusive:</p>
                <ul className="space-y-3 text-sm">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className={`mt-8 w-full ${
                  option.recommended
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-secondary hover:bg-secondary/90'
                }`}
              >
                Jetzt starten
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50">
        <div className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Noch Fragen?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Unser Team berät Sie gerne bei der Auswahl der passenden Laufzeit für Ihren Salon-Space.
            </p>
            <Button size="lg">
              Beratungsgespräch vereinbaren
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
} 