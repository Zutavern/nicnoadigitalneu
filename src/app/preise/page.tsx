'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
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
  { id: 'quarterly', name: 'Quartalsweise', price: 249, multiplier: 3, discount: '15%' },
  { id: 'yearly', name: 'Jährlich', price: 799, multiplier: 12, discount: '33%' },
]

export default function PricingPage() {
  const [selectedBilling, setSelectedBilling] = useState('monthly')

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

          {/* Billing Toggle */}
          <div className="mt-10">
            <div className="flex justify-center gap-4 rounded-lg bg-muted p-1">
              {billingOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedBilling(option.id)}
                  className={`relative rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    selectedBilling === option.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option.name}
                  {option.discount && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      -{option.discount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="container pb-16">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-xl border bg-card p-8 shadow-lg"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold">
                Professional Suite
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Die komplette Lösung für Ihren Salon-Space
              </p>
            </div>

            <div className="mb-6">
              <p className="flex items-baseline">
                <span className="text-4xl font-bold">
                  €{billingOptions.find(opt => opt.id === selectedBilling)?.price}
                </span>
                <span className="ml-2 text-sm text-muted-foreground">
                  /{selectedBilling === 'monthly' ? 'Monat' : selectedBilling === 'quarterly' ? 'Quartal' : 'Jahr'}
                </span>
              </p>
            </div>

            <Button className="mb-6 w-full bg-primary hover:bg-primary/90">
              Jetzt starten
            </Button>

            <div className="space-y-4">
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
          </motion.div>
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

      <Footer />
    </main>
  )
} 