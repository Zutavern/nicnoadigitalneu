'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Sparkles, ArrowRight, Check, Crown, Zap, Gift, Bot, Scissors, Building2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IntervalSelector } from './interval-selector'
import { PlanCard, type Plan } from './plan-card'
import { BillingInterval } from '@prisma/client'
import { toast } from 'sonner'
import { posthog } from '@/components/providers/posthog-provider'
import { cn } from '@/lib/utils'

// Design-Variante Typ
type DesignVariant = 'compact' | 'expanded' | 'modern'

// Erweiterte Plan-Typ mit AI Credits
interface ExtendedPlan extends Plan {
  includedAiCreditsEur?: number
  planType?: 'STYLIST' | 'SALON_OWNER'
}

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  userType: 'STYLIST' | 'SALON_OWNER'
  trigger?: string
}

interface BillingConfig {
  defaultInterval: string
  trialDays: number
  trialEnabled: boolean
  currencySign: string
  pricingPageDesign: DesignVariant
}

export function PaywallModal({ isOpen, onClose, userType, trigger }: PaywallModalProps) {
  const router = useRouter()
  const [plans, setPlans] = useState<ExtendedPlan[]>([])
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('MONTHLY')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [designVariant, setDesignVariant] = useState<DesignVariant>('compact')
  const [currencySign, setCurrencySign] = useState('€')
  const [configLoaded, setConfigLoaded] = useState(false)

  // Billing-Config laden (einmalig)
  const fetchBillingConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/billing-config')
      if (res.ok) {
        const data: BillingConfig = await res.json()
        if (data.pricingPageDesign) {
          setDesignVariant(data.pricingPageDesign)
        }
        if (data.currencySign) {
          setCurrencySign(data.currencySign)
        }
        if (data.defaultInterval) {
          // Konvertiere zu BillingInterval Format
          const intervalMap: Record<string, BillingInterval> = {
            monthly: 'MONTHLY',
            quarterly: 'QUARTERLY',
            sixMonths: 'SIX_MONTHS',
            yearly: 'YEARLY'
          }
          if (intervalMap[data.defaultInterval]) {
            setSelectedInterval(intervalMap[data.defaultInterval])
          }
        }
      }
    } catch (error) {
      console.error('Error fetching billing config:', error)
    } finally {
      setConfigLoaded(true)
    }
  }, [])

  // Pläne laden wenn Modal geöffnet wird
  useEffect(() => {
    if (isOpen) {
      // Track paywall shown event
      posthog?.capture('paywall_shown', {
        trigger,
        user_type: userType,
      })

      // Billing-Config laden
      if (!configLoaded) {
        fetchBillingConfig()
      }

      setIsLoading(true)
      fetch(`/api/plans?type=${userType}`)
        .then(res => res.json())
        .then(data => {
          setPlans(data.plans || [])
          // Standard: Popular Plan auswählen
          const popularPlan = data.plans?.find((p: ExtendedPlan) => p.isPopular)
          if (popularPlan) {
            setSelectedPlan(popularPlan.id)
          } else if (data.plans?.length > 0) {
            setSelectedPlan(data.plans[0].id)
          }
        })
        .catch(error => {
          console.error('Error loading plans:', error)
          toast.error('Fehler beim Laden der Pläne')
        })
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, userType, trigger, configLoaded, fetchBillingConfig])

  // Checkout starten
  const handleCheckout = async () => {
    if (!selectedPlan) {
      toast.error('Bitte wähle einen Plan aus')
      return
    }

    // Track CTA clicked event
    const selectedPlanData = plans.find(p => p.id === selectedPlan)
    posthog?.capture('paywall_cta_clicked', {
      plan_id: selectedPlan,
      plan_name: selectedPlanData?.name,
      interval: selectedInterval,
    })

    setIsCheckingOut(true)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          interval: selectedInterval
        })
      })

      if (!response.ok) {
        const error = await response.json()
        // Demo-Modus: Stripe nicht konfiguriert
        if (error.error?.includes('nicht konfiguriert') || error.error?.includes('not configured')) {
          toast.info('Demo-Modus: Stripe ist nicht konfiguriert. In der Live-Version würdest du jetzt zum Checkout weitergeleitet werden.', {
            duration: 5000
          })
          onClose()
          return
        }
        throw new Error(error.error || 'Checkout konnte nicht gestartet werden')
      }

      const { url } = await response.json()

      if (url) {
        // Redirect zu Stripe Checkout
        window.location.href = url
      } else {
        throw new Error('Keine Checkout-URL erhalten')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Checkout'
      // Demo-Modus Fallback
      if (errorMessage.includes('nicht konfiguriert') || errorMessage.includes('not configured')) {
        toast.info('Demo-Modus: Stripe ist nicht konfiguriert', { duration: 3000 })
        onClose()
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsCheckingOut(false)
    }
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  // Preis berechnen Helper
  const getPriceForInterval = (plan: ExtendedPlan): number => {
    switch (selectedInterval) {
      case 'QUARTERLY': return plan.priceQuarterly
      case 'SIX_MONTHS': return plan.priceSixMonths
      case 'YEARLY': return plan.priceYearly
      default: return plan.priceMonthly
    }
  }

  const getMonthsForInterval = (): number => {
    switch (selectedInterval) {
      case 'QUARTERLY': return 3
      case 'SIX_MONTHS': return 6
      case 'YEARLY': return 12
      default: return 1
    }
  }

  // Dynamische Grid-Klassen basierend auf Plananzahl
  const getGridClass = () => {
    const count = plans.length
    if (count === 1) return 'max-w-md mx-auto'
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
    if (count === 3) return 'grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto'
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto'
  }

  // Rendere Plan-Karte basierend auf Design-Variante
  const renderPlanCard = (plan: ExtendedPlan) => {
    const price = getPriceForInterval(plan)
    const months = getMonthsForInterval()
    const monthlyEquivalent = Math.round(price / months)
    const savings = plan.priceMonthly * months - price
    const savingsPercent = plan.priceMonthly > 0 ? Math.round((savings / (plan.priceMonthly * months)) * 100) : 0
    const isSelected = selectedPlan === plan.id

    // COMPACT Design (Standard für schnelle Auswahl)
    if (designVariant === 'compact') {
      return (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative cursor-pointer transition-all duration-200 rounded-xl border-2 p-5",
            isSelected 
              ? "border-primary ring-2 ring-primary/20 shadow-lg bg-primary/5" 
              : "border-border hover:border-primary/50 hover:shadow-md bg-card",
            plan.isPopular && !isSelected && "border-primary/50"
          )}
          onClick={() => setSelectedPlan(plan.id)}
        >
          {/* Popular Badge */}
          {plan.isPopular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md px-3">
                <Crown className="h-3 w-3 mr-1" />
                Beliebt
              </Badge>
            </div>
          )}

          {/* Selected Indicator */}
          {isSelected && (
            <div className="absolute top-3 right-3">
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}

          <div className={cn("text-center", plan.isPopular && "pt-2")}>
            <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
            {plan.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{plan.description}</p>
            )}

            {/* Preis */}
            <div className="mb-3">
              <span className="text-3xl font-bold">{currencySign}{monthlyEquivalent}</span>
              <span className="text-muted-foreground">/Monat</span>
            </div>

            {savingsPercent > 0 && (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 mb-3">
                {savingsPercent}% günstiger
              </Badge>
            )}

            {/* AI Credits */}
            {plan.includedAiCreditsEur && plan.includedAiCreditsEur > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-3">
                <Bot className="h-3 w-3" />
                <span>{currencySign}{plan.includedAiCreditsEur} AI-Guthaben/Monat</span>
              </div>
            )}

            {/* Features (kurz) */}
            <div className="space-y-1.5 text-left mb-3">
              {plan.features.slice(0, 4).map((feature, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
              {plan.features.length > 4 && (
                <p className="text-[10px] text-muted-foreground/70 pl-5">
                  + {plan.features.length - 4} weitere
                </p>
              )}
            </div>

            {/* Trial Badge */}
            {plan.trialDays > 0 && (
              <div className="p-2 bg-primary/5 rounded-lg">
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary">
                  <Zap className="h-3.5 w-3.5" />
                  {plan.trialDays} Tage kostenlos
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )
    }

    // MODERN Design (Poppiger, mehr Farbe)
    if (designVariant === 'modern') {
      return (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: isSelected ? 1 : 1.02 }}
          className="relative group"
          onClick={() => setSelectedPlan(plan.id)}
        >
          {/* Glow Effect for Popular */}
          {plan.isPopular && (
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
          )}

          <div className={cn(
            "relative h-full cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300",
            isSelected 
              ? "border-primary shadow-2xl bg-gradient-to-br from-primary/10 to-background scale-[1.02]" 
              : "border-border bg-card hover:border-primary/50 hover:shadow-xl",
            plan.isPopular && "border-primary/50"
          )}>
            {/* Popular Badge */}
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <Badge className="px-4 py-1.5 bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 text-white border-0 shadow-xl">
                  <Crown className="w-3.5 h-3.5 mr-1.5" />
                  Meistgewählt
                </Badge>
              </div>
            )}

            {/* Selected Indicator */}
            {isSelected && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              </motion.div>
            )}

            {/* Header */}
            <div className={cn("mb-5", plan.isPopular && "pt-2")}>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                plan.isPopular 
                  ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg" 
                  : "bg-primary/10 text-primary"
              )}>
                {userType === 'STYLIST' 
                  ? <Scissors className="w-6 h-6" />
                  : <Building2 className="w-6 h-6" />
                }
              </div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              {plan.description && (
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              )}
            </div>

            {/* Preis */}
            <div className="mb-5 pb-5 border-b border-border">
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-bold tracking-tight">{currencySign}{monthlyEquivalent}</span>
                <span className="text-muted-foreground mb-1">/Monat</span>
              </div>
              {selectedInterval !== 'MONTHLY' && (
                <p className="text-sm text-muted-foreground">
                  {currencySign}{price} für {months} Monate
                </p>
              )}
              {savingsPercent > 0 && (
                <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  {savingsPercent}% Ersparnis
                </Badge>
              )}
            </div>

            {/* AI Credits */}
            {plan.includedAiCreditsEur && plan.includedAiCreditsEur > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium">{currencySign}{plan.includedAiCreditsEur} AI-Guthaben/Monat</span>
                  <Sparkles className="w-3 h-3 text-violet-400 animate-pulse ml-auto" />
                </div>
              </div>
            )}

            {/* Features */}
            <div className="space-y-2 mb-4">
              {plan.features.slice(0, 5).map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-start gap-2"
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    plan.isPopular 
                      ? "bg-gradient-to-br from-violet-500 to-pink-500" 
                      : "bg-emerald-500"
                  )}>
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
              {plan.features.length > 5 && (
                <p className="text-xs text-muted-foreground pl-6">
                  + {plan.features.length - 5} weitere Features
                </p>
              )}
            </div>

            {/* Trial Badge */}
            {plan.trialDays > 0 && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600">
                  <Gift className="w-4 h-4" />
                  {plan.trialDays} Tage kostenlos testen
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )
    }

    // EXPANDED Design (Ausführlich, wie Public Page)
    return (
      <PlanCard
        key={plan.id}
        plan={plan}
        interval={selectedInterval}
        isSelected={isSelected}
        onSelect={() => setSelectedPlan(plan.id)}
      />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "max-h-[90vh] overflow-y-auto p-0",
        designVariant === 'compact' ? "max-w-3xl" : "max-w-5xl"
      )}>
        {/* Header */}
        <DialogHeader className={cn(
          "px-6 pt-6 pb-4 border-b",
          designVariant === 'modern' 
            ? "bg-gradient-to-br from-violet-500/10 via-pink-500/5 to-background" 
            : "bg-gradient-to-br from-primary/5 via-background to-background"
        )}>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              designVariant === 'modern' 
                ? "bg-gradient-to-br from-violet-500 to-pink-500" 
                : "bg-gradient-to-br from-primary to-primary/70"
            )}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Wähle deinen Plan</DialogTitle>
              <DialogDescription>
                Starte jetzt durch und nutze alle Funktionen von NICNOA
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className={cn(
          "px-6 py-6 space-y-6",
          designVariant === 'modern' && "bg-gradient-to-b from-background to-muted/30"
        )}>
          {/* Interval Selector */}
          <IntervalSelector 
            selected={selectedInterval} 
            onChange={setSelectedInterval} 
          />

          {/* Plans Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Keine Pläne verfügbar. Bitte kontaktiere den Support.
              </p>
            </div>
          ) : (
            <div className={cn("grid gap-4", getGridClass())}>
              {plans.map(plan => renderPlanCard(plan))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className={cn(
          "px-6 py-4 border-t flex-col sm:flex-row gap-3",
          designVariant === 'modern' ? "bg-muted/50" : "bg-muted/30"
        )}>
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isCheckingOut}
            className="order-2 sm:order-1"
          >
            Später
          </Button>
          <Button 
            onClick={handleCheckout}
            disabled={!selectedPlan || isCheckingOut || isLoading}
            className={cn(
              "order-1 sm:order-2",
              designVariant === 'modern' 
                ? "bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 hover:shadow-lg hover:shadow-pink-500/25 text-white" 
                : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            )}
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Weiterleiten...
              </>
            ) : (
              <>
                Jetzt starten
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>

        {/* Trust Indicators */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-muted-foreground">
            {selectedPlanData?.trialDays && selectedPlanData.trialDays > 0 
              ? `${selectedPlanData.trialDays} Tage kostenlos testen • ` 
              : ''
            }
            Sichere Zahlung über Stripe • Jederzeit kündbar
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

