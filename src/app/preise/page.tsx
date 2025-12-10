'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Check,
  Scissors,
  Building2,
  Sparkles,
  Shield,
  Clock,
  Users,
  Star,
  ArrowRight,
  Zap,
  Heart,
  Award,
  MessageCircle,
  Crown,
  Loader2,
  BadgeCheck,
  TrendingUp,
  Lock,
  Headphones
} from 'lucide-react'
import Link from 'next/link'

// Zeitraum-Optionen
type BillingPeriod = '3months' | '6months' | '12months'

const billingPeriods = [
  { id: '3months' as BillingPeriod, label: '3 Monate', months: 3, discount: 0 },
  { id: '6months' as BillingPeriod, label: '6 Monate', months: 6, discount: 15, popular: true },
  { id: '12months' as BillingPeriod, label: '12 Monate', months: 12, discount: 25 },
]

// Beispiel-Preise (werden später aus der DB geladen)
const stylistPlans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfekt für den Einstieg in die Selbstständigkeit',
    monthlyPrice: 29,
    features: [
      'Eigenes Buchungssystem',
      'Digitaler Terminkalender',
      'Kundenverwaltung (bis 100)',
      'Automatische Erinnerungen',
      'Mobile App Zugang',
      'E-Mail Support',
    ],
    popular: false,
    icon: Sparkles,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Für etablierte Stylisten mit wachsendem Kundenstamm',
    monthlyPrice: 49,
    features: [
      'Alles aus Starter',
      'Unbegrenzte Kundenverwaltung',
      'Umsatzanalysen & Reports',
      'Online-Zahlungen',
      'Eigene Buchungsseite',
      'WhatsApp Integration',
      'Prioritäts-Support',
    ],
    popular: true,
    icon: Crown,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Maximale Features für Top-Stylisten',
    monthlyPrice: 79,
    features: [
      'Alles aus Professional',
      'Multi-Location Support',
      'Team-Funktionen',
      'Erweiterte Marketing-Tools',
      'API-Zugang',
      'Persönlicher Account Manager',
      '24/7 Premium Support',
    ],
    popular: false,
    icon: Award,
  },
]

const salonOwnerPlans = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Ideal für kleine Salons mit 1-3 Stühlen',
    monthlyPrice: 79,
    features: [
      'Bis zu 3 Stuhlmieter',
      'Zentrales Buchungssystem',
      'Digitale Mietverträge',
      'Basis-Reporting',
      'Automatische Abrechnung',
      'E-Mail Support',
    ],
    popular: false,
    icon: Building2,
    chairs: 3,
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Für wachsende Salons mit Ambition',
    monthlyPrice: 149,
    features: [
      'Bis zu 10 Stuhlmieter',
      'Alles aus Basic',
      'Erweiterte Analysen',
      'Team-Management',
      'Ressourcenplanung',
      'Marketing-Dashboard',
      'Prioritäts-Support',
    ],
    popular: true,
    icon: TrendingUp,
    chairs: 10,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Komplettlösung für große Salon-Spaces',
    monthlyPrice: 249,
    features: [
      'Unbegrenzte Stuhlmieter',
      'Alles aus Business',
      'Multi-Standort Support',
      'White-Label Option',
      'Individuelle Integrationen',
      'Dedizierter Success Manager',
      '24/7 Premium Support',
    ],
    popular: false,
    icon: Award,
    chairs: null,
  },
]

// Trust-Elemente
const trustElements = [
  { icon: Shield, text: '256-bit SSL Verschlüsselung', description: 'Ihre Daten sind sicher' },
  { icon: BadgeCheck, text: 'DSGVO-konform', description: 'Deutsche Server' },
  { icon: Clock, text: '14 Tage kostenlos testen', description: 'Keine Kreditkarte nötig' },
  { icon: Headphones, text: 'Deutscher Support', description: 'Mo-Fr 9-18 Uhr' },
]

// Testimonials für Pricing
const pricingTestimonials = [
  {
    quote: "Seit ich NICNOA nutze, habe ich 40% mehr Buchungen und viel weniger Verwaltungsaufwand.",
    author: "Sarah M.",
    role: "Stylistin in München",
    avatar: "S"
  },
  {
    quote: "Die beste Investition für meinen Salon-Space. ROI nach nur 2 Monaten.",
    author: "Michael K.",
    role: "Salonbesitzer in Berlin",
    avatar: "M"
  },
  {
    quote: "Endlich eine Software die versteht was wir brauchen. Der Support ist fantastisch!",
    author: "Lisa T.",
    role: "Stylistin in Hamburg",
    avatar: "L"
  },
]

// FAQ für Pricing
const pricingFAQs = [
  {
    question: "Kann ich jederzeit kündigen?",
    answer: "Ja, Sie können Ihr Abonnement jederzeit zum Ende des Abrechnungszeitraums kündigen. Es gibt keine versteckten Gebühren."
  },
  {
    question: "Was passiert nach der Testphase?",
    answer: "Nach 14 Tagen werden Sie automatisch in den gewählten Plan überführt. Sie können vorher jederzeit kündigen oder den Plan wechseln."
  },
  {
    question: "Gibt es Rabatte für Jahresabonnements?",
    answer: "Ja! Bei 12-monatiger Laufzeit sparen Sie bis zu 25% gegenüber der monatlichen Zahlung."
  },
  {
    question: "Kann ich den Plan später wechseln?",
    answer: "Selbstverständlich. Sie können jederzeit upgraden. Bei einem Downgrade wird die Differenz auf Ihr Guthaben angerechnet."
  },
]

export default function PricingPage() {
  const [selectedRole, setSelectedRole] = useState<'stylist' | 'salon'>('stylist')
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('6months')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const currentPlans = selectedRole === 'stylist' ? stylistPlans : salonOwnerPlans
  const currentPeriod = billingPeriods.find(p => p.id === selectedPeriod)!

  const calculatePrice = (monthlyPrice: number) => {
    const discount = currentPeriod.discount / 100
    const discountedMonthly = monthlyPrice * (1 - discount)
    const total = discountedMonthly * currentPeriod.months
    return {
      monthly: Math.round(discountedMonthly),
      total: Math.round(total),
      savings: Math.round(monthlyPrice * currentPeriod.months - total)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <MainNav />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Faire Preise, volle Transparenz
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Investieren Sie in{' '}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Ihren Erfolg
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Wählen Sie den perfekten Plan für Ihre Bedürfnisse. 
              Alle Pläne beinhalten eine 14-tägige kostenlose Testphase.
            </p>

            {/* Role Toggle */}
            <div className="flex justify-center mb-8">
              <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as 'stylist' | 'salon')}>
                <TabsList className="grid w-full max-w-md grid-cols-2 h-14 p-1.5 bg-muted/50 backdrop-blur">
                  <TabsTrigger 
                    value="stylist" 
                    className="flex items-center gap-2 h-full text-base data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all"
                  >
                    <Scissors className="h-5 w-5" />
                    <span>Für Stuhlmieter</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="salon"
                    className="flex items-center gap-2 h-full text-base data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all"
                  >
                    <Building2 className="h-5 w-5" />
                    <span>Für Salonbesitzer</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Period Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-muted/50 backdrop-blur border">
                {billingPeriods.map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id)}
                    className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedPeriod === period.id
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {period.label}
                    {period.popular && (
                      <span className="absolute -top-2 -right-2 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-[10px] text-white font-bold shadow-lg">
                        TOP
                      </span>
                    )}
                    {period.discount > 0 && selectedPeriod !== period.id && (
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-green-500 font-medium whitespace-nowrap">
                        -{period.discount}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {currentPeriod.discount > 0 && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-green-500 font-medium flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Sie sparen {currentPeriod.discount}% bei {currentPeriod.months} Monaten Laufzeit
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedRole}-${selectedPeriod}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
          >
            {currentPlans.map((plan, index) => {
              const price = calculatePrice(plan.monthlyPrice)
              const IconComponent = plan.icon
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl ${
                    plan.popular 
                      ? 'border-primary bg-gradient-to-b from-primary/5 to-background shadow-xl scale-105 z-10' 
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="px-4 py-1.5 bg-gradient-to-r from-primary to-purple-600 text-white border-0 shadow-lg">
                        <Star className="w-3.5 h-3.5 mr-1.5 fill-current" />
                        Meistgewählt
                      </Badge>
                    </div>
                  )}

                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                          plan.popular 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <p className="text-muted-foreground mt-1">{plan.description}</p>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-6 pb-6 border-b">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">€{price.monthly}</span>
                        <span className="text-muted-foreground">/Monat</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          €{price.total} für {currentPeriod.months} Monate
                        </p>
                        {price.savings > 0 && (
                          <p className="text-sm text-green-500 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Sie sparen €{price.savings}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            plan.popular ? 'text-primary' : 'text-green-500'
                          }`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button 
                      className={`w-full h-12 text-base font-semibold ${
                        plan.popular
                          ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href="/register">
                        Jetzt starten
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>

                    <p className="text-center text-xs text-muted-foreground mt-4">
                      14 Tage kostenlos • Keine Kreditkarte
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Trust Elements */}
      <section className="border-y bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustElements.map((element, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <element.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">{element.text}</h4>
                <p className="text-sm text-muted-foreground">{element.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Heart className="w-3.5 h-3.5 mr-2" />
            Das sagen unsere Kunden
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold">
            Über 500+ zufriedene Nutzer
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingTestimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl border p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-muted-foreground mb-4">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 border-y">
        <div className="container py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <MessageCircle className="w-3.5 h-3.5 mr-2" />
              Häufige Fragen
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Noch Fragen?
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-4">
            {pricingFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-background rounded-xl border overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold">{faq.question}</span>
                  <motion.span
                    animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="h-5 w-5 rotate-90" />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {expandedFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-4 text-muted-foreground">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 p-12 text-center text-white"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bereit durchzustarten?
            </h2>
            
            <p className="text-xl text-white/80 mb-8">
              Starten Sie noch heute Ihre 14-tägige kostenlose Testphase. 
              Keine Kreditkarte erforderlich.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-xl h-14 px-8 text-base"
                asChild
              >
                <Link href="/register">
                  Kostenlos testen
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-base"
                asChild
              >
                <Link href="/kontakt">
                  Beratungsgespräch
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                14 Tage kostenlos
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Keine Kreditkarte
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Jederzeit kündbar
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Guarantee Banner */}
      <section className="border-t">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h4 className="font-semibold">30-Tage Geld-zurück-Garantie</h4>
              <p className="text-sm text-muted-foreground">
                Nicht zufrieden? Wir erstatten Ihnen den vollen Betrag – ohne Fragen.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
