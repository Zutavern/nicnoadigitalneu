'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  Scissors,
  Building2,
  Sparkles,
  Shield,
  Clock,
  Star,
  ArrowRight,
  Zap,
  Heart,
  Crown,
  Loader2,
  BadgeCheck,
  TrendingUp,
  Headphones,
  ChevronDown,
  BarChart3,
  Rocket,
  Gift,
  Users,
  CreditCard,
  Globe,
  Lock,
  Bot
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Plan-Interface
interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  planType: 'STYLIST' | 'SALON_OWNER'
  priceMonthly: number
  priceQuarterly: number
  priceSixMonths: number
  priceYearly: number
  features: string[]
  maxChairs: number | null
  maxBookings: number | null
  maxCustomers: number | null
  isPopular: boolean
  trialDays: number
  sortOrder: number
  includedAiCreditsEur: number // Inkludierte AI-Credits pro Monat
}

// Laufzeit-Optionen (werden aus der API geladen)
type BillingInterval = 'monthly' | 'quarterly' | 'sixMonths' | 'yearly'

interface BillingIntervalConfig {
  id: BillingInterval
  label: string
  months: number
  discount: number
  enabled: boolean
  badge?: string
}

// Default-Intervalle (Fallback)
const defaultIntervals: BillingIntervalConfig[] = [
  { id: 'monthly', label: '1 Monat', months: 1, discount: 0, enabled: true },
  { id: 'quarterly', label: '3 Monate', months: 3, discount: 10, enabled: true },
  { id: 'sixMonths', label: '6 Monate', months: 6, discount: 15, enabled: true, badge: 'Beliebt' },
  { id: 'yearly', label: '12 Monate', months: 12, discount: 25, enabled: true, badge: 'Beste Ersparnis' },
]

interface BillingConfig {
  intervals: BillingIntervalConfig[]
  defaultInterval: string
  trialDays: number
  trialEnabled: boolean
  currency: string
  currencySign: string
  couponsEnabled: boolean
  showCouponOnPricing: boolean
  moneyBackEnabled: boolean
  moneyBackDays: number
}

// Trust-Elemente (statisch, Trial-Tage werden dynamisch eingefügt)
const getTrustElements = (trialDays: number) => [
  { icon: Shield, text: '256-bit SSL', description: 'Bankensichere Verschlüsselung' },
  { icon: BadgeCheck, text: 'DSGVO-konform', description: 'Server in Deutschland' },
  { icon: Clock, text: `${trialDays} Tage gratis`, description: 'Keine Kreditkarte nötig' },
  { icon: Headphones, text: 'Deutscher Support', description: 'Mo-Fr 9-18 Uhr' },
]

// Testimonials nach Rolle getrennt
const testimonialsByRole = {
  stylist: [
    {
      quote: "Seit ich NICNOA nutze, habe ich 40% mehr Buchungen und viel weniger Verwaltungsaufwand. Die Analytics helfen mir, mein Business zu optimieren.",
      author: "Sarah M.",
      role: "Stuhlmieterin, München",
      rating: 5
    },
    {
      quote: "Endlich eine Software, die versteht, was wir Stuhlmieter brauchen. Der Support ist fantastisch und die Marketing-Tools sind ein Game-Changer!",
      author: "Lisa T.",
      role: "Stuhlmieterin, Hamburg",
      rating: 5
    },
    {
      quote: "Als Teilzeit-Stylistin ist Flexibilität für mich das A und O. NICNOA gibt mir genau das – plus einen professionellen Auftritt gegenüber meinen Kunden.",
      author: "Maria K.",
      role: "Stuhlmieterin, Köln",
      rating: 5
    },
  ],
  salon: [
    {
      quote: "Die beste Investition für meinen Salon-Space. Die Belvo-Integration und automatisierte Buchhaltung sparen mir Stunden pro Woche.",
      author: "Michael K.",
      role: "Salonbesitzer, Berlin",
      rating: 5
    },
    {
      quote: "Mit NICNOA verwalte ich 12 Stuhlmieter problemlos. Die Abrechnungen laufen automatisch und meine Auslastung ist auf 95% gestiegen!",
      author: "Sandra W.",
      role: "Salonbesitzerin, Frankfurt",
      rating: 5
    },
    {
      quote: "Das ERP-System hat unseren gesamten Workflow revolutioniert. Endlich alles an einem Ort – von der Buchung bis zur Buchhaltung.",
      author: "Thomas R.",
      role: "Salonbesitzer, Stuttgart",
      rating: 5
    },
  ]
}

// FAQs
const faqs = [
  {
    question: "Kann ich jederzeit kündigen?",
    answer: "Ja, du kannst dein Abo jederzeit zum Ende des Abrechnungszeitraums kündigen. Keine versteckten Gebühren, keine langen Kündigungsfristen."
  },
  {
    question: "Was passiert nach der Testphase?",
    answer: "Nach 14 Tagen wirst du automatisch in den gewählten Plan überführt. Du kannst vorher jederzeit kündigen oder den Plan wechseln. Deine Daten bleiben erhalten."
  },
  {
    question: "Gibt es Rabatte für längere Laufzeiten?",
    answer: "Ja! Bei 6 Monaten sparst du 15%, bei 12 Monaten sogar 25% gegenüber der monatlichen Zahlung."
  },
  {
    question: "Kann ich den Plan später wechseln?",
    answer: "Klar! Du kannst jederzeit upgraden. Bei einem Downgrade wird die Differenz als Guthaben für deine nächste Zahlung angerechnet."
  },
  {
    question: "Welche Zahlungsmethoden werden akzeptiert?",
    answer: "Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, American Express), SEPA-Lastschrift sowie PayPal und Apple Pay."
  },
]

// Feature-Kategorien für bessere Darstellung
const featureCategories = {
  booking: { icon: Clock, label: 'Buchung & Kalender' },
  analytics: { icon: BarChart3, label: 'Analytics & Reports' },
  marketing: { icon: Rocket, label: 'Marketing & Werbung' },
  payment: { icon: CreditCard, label: 'Zahlungen & Abrechnung' },
  support: { icon: Headphones, label: 'Support & Service' },
}

export default function PricingPage() {
  const [selectedRole, setSelectedRole] = useState<'stylist' | 'salon'>('stylist')
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('sixMonths')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [config, setConfig] = useState<BillingConfig>({
    intervals: defaultIntervals,
    defaultInterval: 'sixMonths',
    trialDays: 14,
    trialEnabled: true,
    currency: 'EUR',
    currencySign: '€',
    couponsEnabled: true,
    showCouponOnPricing: false,
    moneyBackEnabled: true,
    moneyBackDays: 30
  })
  const [configLoaded, setConfigLoaded] = useState(false)

  // Billing-Konfiguration aus der API laden
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/billing-config')
        if (res.ok) {
          const data = await res.json()
          setConfig(data)
          // Default-Intervall setzen, wenn es aktiv ist
          if (data.defaultInterval && data.intervals.find((i: BillingIntervalConfig) => i.id === data.defaultInterval)) {
            setSelectedInterval(data.defaultInterval as BillingInterval)
          } else if (data.intervals.length > 0) {
            setSelectedInterval(data.intervals[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching billing config:', error)
      } finally {
        setConfigLoaded(true)
      }
    }
    fetchConfig()
  }, [])

  // Pläne aus der API laden
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true)
      try {
        const planType = selectedRole === 'stylist' ? 'STYLIST' : 'SALON_OWNER'
        const res = await fetch(`/api/plans?type=${planType}`)
        if (res.ok) {
          const data = await res.json()
          setPlans(data.plans || [])
        }
      } catch (error) {
        console.error('Error fetching plans:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPlans()
  }, [selectedRole])

  // Nur aktive Intervalle verwenden UND nur solche, bei denen mindestens ein Plan einen Preis > 0 hat
  const getPriceForIntervalStatic = (plan: Plan, interval: BillingInterval): number => {
    switch (interval) {
      case 'monthly': return plan.priceMonthly
      case 'quarterly': return plan.priceQuarterly
      case 'sixMonths': return plan.priceSixMonths
      case 'yearly': return plan.priceYearly
      default: return plan.priceMonthly
    }
  }

  // Filtere Intervalle: nur anzeigen wenn enabled UND mindestens ein Plan einen Preis > 0 hat
  // useMemo verhindert infinite loops durch stabile Referenz
  const activeIntervals = useMemo(() => {
    return config.intervals.filter(interval => {
      if (interval.enabled === false) return false
      // Prüfe ob mindestens ein Plan einen Preis > 0 für dieses Intervall hat
      const hasPlansWithPrice = plans.some(plan => getPriceForIntervalStatic(plan, interval.id) > 0)
      return hasPlansWithPrice
    })
  }, [config.intervals, plans])
  
  const currentInterval = activeIntervals.find(i => i.id === selectedInterval) || activeIntervals[0]

  // Auto-select erstes verfügbares Intervall wenn das aktuelle nicht mehr verfügbar ist
  useEffect(() => {
    if (activeIntervals.length > 0 && !activeIntervals.find(i => i.id === selectedInterval)) {
      setSelectedInterval(activeIntervals[0].id)
    }
  }, [activeIntervals, selectedInterval])

  const getPriceForInterval = (plan: Plan, interval: BillingInterval): number => {
    switch (interval) {
      case 'monthly': return plan.priceMonthly
      case 'quarterly': return plan.priceQuarterly
      case 'sixMonths': return plan.priceSixMonths
      case 'yearly': return plan.priceYearly
      default: return plan.priceMonthly
    }
  }

  const calculateMonthlyEquivalent = (plan: Plan, interval: BillingInterval): number => {
    const total = getPriceForInterval(plan, interval)
    const months = activeIntervals.find(i => i.id === interval)?.months || 1
    return Math.round(total / months)
  }

  const calculateSavings = (plan: Plan, interval: BillingInterval): number => {
    const totalPrice = getPriceForInterval(plan, interval)
    const months = activeIntervals.find(i => i.id === interval)?.months || 1
    const regularTotal = plan.priceMonthly * months
    return Math.round(regularTotal - totalPrice)
  }

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <MainNav />

      {/* Hero Section mit dramatischem Gradient */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-violet-500/30 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-primary/10 to-transparent rounded-full blur-3xl" />
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="mb-6 px-5 py-2 text-sm bg-gradient-to-r from-violet-500/10 to-pink-500/10 text-primary border-primary/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                {config.trialEnabled ? `${config.trialDays} Tage kostenlos testen • Keine Kreditkarte` : 'Sofort starten'}
              </Badge>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="block">Dein Erfolg beginnt</span>
              <span className="relative">
                <span className="bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  mit dem richtigen Plan
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Wähl den perfekten Plan für deine Bedürfnisse. 
              Transparent, fair und ohne versteckte Kosten.
            </p>

            {/* Role Toggle - Modern Pill Design */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex p-1.5 rounded-2xl bg-muted/50 backdrop-blur-lg border border-white/10 shadow-xl">
                {[
                  { id: 'stylist', label: 'Stuhlmieter', icon: Scissors, color: 'from-violet-500 to-purple-600' },
                  { id: 'salon', label: 'Salonbesitzer', icon: Building2, color: 'from-blue-500 to-cyan-500' }
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id as 'stylist' | 'salon')}
                    className={cn(
                      "relative flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300",
                      selectedRole === role.id
                        ? "text-white shadow-lg"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {selectedRole === role.id && (
                      <motion.div
                        layoutId="rolePill"
                        className={cn("absolute inset-0 rounded-xl bg-gradient-to-r", role.color)}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <role.icon className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interval Selector - Floating Cards */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 mb-8">
              {activeIntervals.map((interval) => (
                <button
                  key={interval.id}
                  onClick={() => setSelectedInterval(interval.id)}
                  className={cn(
                    "relative px-7 py-3.5 rounded-xl font-medium transition-all duration-300",
                    selectedInterval === interval.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
                  )}
                >
                  <span>{interval.label}</span>
                  {interval.badge && (
                    <span className={cn(
                      "absolute -top-3 -right-3 px-2.5 py-1 text-[10px] font-bold rounded-full shadow-lg",
                      interval.id === 'yearly' 
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                    )}>
                      {interval.badge}
                    </span>
                  )}
                  {interval.discount > 0 && selectedInterval !== interval.id && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-emerald-500 font-semibold whitespace-nowrap">
                      -{interval.discount}%
                    </span>
                  )}
                </button>
              ))}
            </div>

            {currentInterval && currentInterval.discount > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 mb-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20"
              >
                <Gift className="h-4 w-4" />
                Du sparst {currentInterval.discount}% bei {currentInterval.months} Monaten Laufzeit
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container pb-24 mt-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Lade Preispläne...</p>
            </motion.div>
          ) : (() => {
            // Filtere Pläne mit Preis 0 für das aktuelle Intervall heraus
            const visiblePlans = plans.filter(plan => {
              const price = getPriceForInterval(plan, selectedInterval)
              return price > 0
            })
            
            if (visiblePlans.length === 0) {
              return (
                <motion.div
                  key="no-plans"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <p className="text-muted-foreground text-lg">
                    Keine Preispläne für dieses Intervall verfügbar.
                  </p>
                </motion.div>
              )
            }
            
            return (
            <motion.div
              key={`${selectedRole}-${selectedInterval}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "grid gap-8 lg:gap-6 mx-auto px-4 items-stretch",
                // Dynamisches Grid basierend auf Plananzahl - extra breit
                visiblePlans.length === 1 && "max-w-xl",
                visiblePlans.length === 2 && "max-w-5xl grid-cols-1 md:grid-cols-2",
                visiblePlans.length === 3 && "max-w-[1200px] grid-cols-1 md:grid-cols-3",
                visiblePlans.length >= 4 && "max-w-[1600px] grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              )}
            >
              {visiblePlans.map((plan, index) => {
                const monthlyEquivalent = calculateMonthlyEquivalent(plan, selectedInterval)
                const totalPrice = getPriceForInterval(plan, selectedInterval)
                const savings = calculateSavings(plan, selectedInterval)
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 }}
                    className={cn(
                      "relative group h-full flex",
                      // Populärer Plan: größer und hervorgehoben
                      plan.isPopular && "md:-mt-8 md:-mb-2 lg:scale-[1.03] z-10"
                    )}
                  >
                    {/* Glow Effect for Popular */}
                    {plan.isPopular && (
                      <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                    )}
                    
                    <div className={cn(
                      "relative w-full flex flex-col rounded-2xl border-2 bg-card transition-all duration-500",
                      plan.isPopular 
                        ? "border-primary shadow-2xl" 
                        : "border-border hover:border-primary/50 hover:shadow-xl"
                    )}>
                      {/* Popular Badge */}
                      {plan.isPopular && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                          <Badge className="px-5 py-2 text-sm bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 text-white border-0 shadow-xl">
                            <Crown className="w-4 h-4 mr-2" />
                            Meistgewählt
                          </Badge>
                        </div>
                      )}

                      <div className={cn(
                        "p-6 sm:p-8 md:p-10 lg:p-12 flex-1 flex flex-col",
                        // Populärer Plan: etwas mehr Padding für extra Höhe
                        plan.isPopular && "md:pt-12 md:pb-14"
                      )}>
                        {/* Header */}
                        <div className="mb-8">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center mb-5",
                            plan.isPopular 
                              ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg" 
                              : "bg-primary/10 text-primary"
                          )}>
                            {selectedRole === 'stylist' 
                              ? <Scissors className="w-7 h-7" />
                              : <Building2 className="w-7 h-7" />
                            }
                          </div>
                          <h3 className="text-3xl font-bold mb-2">{plan.name}</h3>
                          <p className="text-muted-foreground text-lg">{plan.description}</p>
                        </div>

                        {/* Pricing */}
                        <div className="mb-8 pb-8 border-b border-border">
                          <div className="flex items-end gap-2 mb-3">
                            <span className="text-5xl font-bold tracking-tight">
                              {config.currencySign}{monthlyEquivalent}
                            </span>
                            <span className="text-xl text-muted-foreground mb-1">/Monat</span>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-muted-foreground">
                              {config.currencySign}{totalPrice} für {currentInterval?.months || 1} {currentInterval?.months === 1 ? 'Monat' : 'Monate'}
                            </p>
                            {savings > 0 && (
                              <p className="text-emerald-500 font-semibold flex items-center gap-1.5">
                                <Zap className="w-4 h-4" />
                                Du sparst {config.currencySign}{savings}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Trial Info */}
                        {config.trialEnabled && plan.trialDays > 0 && (
                          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                              <Gift className="w-4 h-4" />
                              {plan.trialDays} Tage kostenlos testen – Voller Zugriff auf alle Features
                            </p>
                          </div>
                        )}

                        {/* Features */}
                        <div className="space-y-4 mb-6 flex-1">
                          {plan.features.map((feature, i) => (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + i * 0.03 }}
                              className="flex items-start gap-3"
                            >
                              <div className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                                plan.isPopular 
                                  ? "bg-gradient-to-br from-violet-500 to-pink-500" 
                                  : "bg-emerald-500"
                              )}>
                                <Check className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-[15px]">{feature}</span>
                            </motion.div>
                          ))}
                        </div>

                        {/* AI Credits - Dezentes Design-Element unter Features */}
                        {plan.includedAiCreditsEur > 0 && (
                          <div className="flex items-center gap-2 mb-6 py-2 px-3 rounded-lg bg-gradient-to-r from-violet-500/5 to-pink-500/5 border border-violet-500/10">
                            <Bot className="w-4 h-4 text-violet-500" />
                            <span className="text-sm text-muted-foreground">
                              <span className="font-semibold text-foreground">{config.currencySign}{plan.includedAiCreditsEur}</span>
                              {' '}AI-Guthaben/Monat inklusive
                            </span>
                          </div>
                        )}

                        {/* Limits Badge + CTA am Ende */}
                        <div className="mt-auto">
                          {(plan.maxChairs || plan.maxCustomers) && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {plan.maxChairs && (
                                <Badge variant="secondary" className="text-xs">
                                  <Users className="w-3 h-3 mr-1" />
                                  Max. {plan.maxChairs} Stühle
                                </Badge>
                              )}
                              {plan.maxCustomers && (
                                <Badge variant="secondary" className="text-xs">
                                  <Users className="w-3 h-3 mr-1" />
                                  Bis {plan.maxCustomers} Kunden
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* CTA */}
                          <Button 
                          className={cn(
                            "w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300",
                            plan.isPopular
                              ? "bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 hover:shadow-lg hover:shadow-pink-500/25 text-white border-0"
                              : "hover:bg-primary hover:text-primary-foreground"
                          )}
                          variant={plan.isPopular ? 'default' : 'outline'}
                          size="lg"
                          asChild
                        >
                          <Link href="/register">
                            Jetzt starten
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>

                          <p className="text-center text-sm text-muted-foreground mt-4">
                            Keine Kreditkarte erforderlich • Jederzeit kündbar
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
            )
          })()}
        </AnimatePresence>
      </section>

      {/* Trust Elements - Floating Cards */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="container relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {getTrustElements(config.trialDays).map((element, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6 rounded-2xl bg-card border hover:border-primary/30 transition-colors text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                    <element.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h4 className="font-bold mb-1">{element.text}</h4>
                  <p className="text-sm text-muted-foreground">{element.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Heart className="w-4 h-4 mr-2 fill-current" />
            {selectedRole === 'stylist' ? 'Das sagen unsere Stuhlmieter' : 'Das sagen unsere Salonbesitzer'}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {selectedRole === 'stylist' 
              ? 'Über 500+ zufriedene Stuhlmieter' 
              : 'Vertrauen von 200+ Salonbesitzern'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {selectedRole === 'stylist'
              ? 'Schließ dich der wachsenden Community von Stuhlmietern an'
              : 'Entdecke, wie Salonbesitzer ihre Spaces erfolgreicher verwalten'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonialsByRole[selectedRole].map((testimonial, index) => (
            <motion.div
              key={`${selectedRole}-${testimonial.author}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full p-8 rounded-2xl bg-card border hover:border-primary/30 transition-all duration-300">
                {/* Rating Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <blockquote className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                
                <div className="flex items-center gap-4 pt-5 border-t border-border">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg",
                    selectedRole === 'stylist' 
                      ? "bg-gradient-to-br from-violet-500 to-purple-600"
                      : "bg-gradient-to-br from-blue-500 to-cyan-500"
                  )}>
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-background" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Lock className="w-4 h-4 mr-2" />
              Häufige Fragen
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Noch Fragen?
            </h2>
            <p className="text-xl text-muted-foreground">
              Hier findest du Antworten auf die wichtigsten Fragen
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-lg pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
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
                      <p className="px-6 pb-5 text-muted-foreground leading-relaxed">
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

      {/* Final CTA - Immersive Design */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2.5rem]"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-pink-600 to-orange-500" />
          
          {/* Animated Blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 -left-20 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

          <div className="relative z-10 px-8 py-20 md:px-16 md:py-28 text-center text-white">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-8"
            >
              <Rocket className="w-10 h-10" />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Bereit durchzustarten?
            </h2>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10">
              Starte noch heute deine 14-tägige kostenlose Testphase. 
              Voller Zugriff auf alle Features – keine Kreditkarte erforderlich.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-violet-600 hover:bg-white/90 shadow-2xl h-16 px-10 text-lg font-semibold rounded-xl"
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
                className="border-2 border-white/30 text-white hover:bg-white/10 h-16 px-10 text-lg font-semibold rounded-xl backdrop-blur"
                asChild
              >
                <Link href="/kontakt">
                  <Globe className="mr-2 h-5 w-5" />
                  Demo vereinbaren
                </Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-white/70">
              {[
                { icon: Check, text: config.trialEnabled ? `${config.trialDays} Tage kostenlos` : 'Sofort starten' },
                { icon: CreditCard, text: 'Keine Kreditkarte' },
                { icon: Lock, text: 'DSGVO-konform' },
                { icon: Zap, text: 'Sofort startklar' },
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Guarantee Banner */}
      {config.moneyBackEnabled && (
        <section className="border-t">
          <div className="container py-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-1">{config.moneyBackDays}-Tage Geld-zurück-Garantie</h4>
                <p className="text-muted-foreground">
                  Nicht zufrieden? Wir erstatten dir den vollen Betrag – ohne Fragen zu stellen.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
