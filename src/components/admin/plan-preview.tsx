'use client'

import { motion } from 'framer-motion'
import {
  Check,
  Scissors,
  Building2,
  Sparkles,
  Crown,
  Gift,
  Zap,
  Bot,
  Users,
  ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface Plan {
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
  includedAiCreditsEur: number
}

interface PlanPreviewCardProps {
  plan: Plan
  interval?: 'monthly' | 'quarterly' | 'sixMonths' | 'yearly'
  showCTA?: boolean
  compact?: boolean
  currencySign?: string
}

const intervalLabels = {
  monthly: { label: '1 Monat', months: 1 },
  quarterly: { label: '3 Monate', months: 3 },
  sixMonths: { label: '6 Monate', months: 6 },
  yearly: { label: '12 Monate', months: 12 },
}

export function PlanPreviewCard({ 
  plan, 
  interval = 'monthly', 
  showCTA = true, 
  compact = false,
  currencySign = '€'
}: PlanPreviewCardProps) {
  const getPriceForInterval = () => {
    switch (interval) {
      case 'quarterly': return plan.priceQuarterly
      case 'sixMonths': return plan.priceSixMonths
      case 'yearly': return plan.priceYearly
      default: return plan.priceMonthly
    }
  }

  const getMonthlyEquivalent = () => {
    const totalPrice = getPriceForInterval()
    const months = intervalLabels[interval].months
    return Math.round(totalPrice / months)
  }

  const totalPrice = getPriceForInterval()
  const monthlyEquivalent = getMonthlyEquivalent()
  const savings = plan.priceMonthly * intervalLabels[interval].months - totalPrice

  return (
    <div className={cn(
      "relative group",
      plan.isPopular && !compact && "md:-mt-4 md:mb-4"
    )}>
      {/* Glow Effect for Popular */}
      {plan.isPopular && (
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
      )}
      
      <div className={cn(
        "relative h-full rounded-2xl border-2 bg-card transition-all duration-500",
        plan.isPopular 
          ? "border-primary shadow-2xl scale-[1.02]" 
          : "border-border hover:border-primary/50 hover:shadow-xl",
        compact && "rounded-xl"
      )}>
        {/* Popular Badge */}
        {plan.isPopular && !compact && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
            <Badge className="px-5 py-2 text-sm bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 text-white border-0 shadow-xl">
              <Crown className="w-4 h-4 mr-2" />
              Meistgewählt
            </Badge>
          </div>
        )}

        <div className={cn("p-8 md:p-10", compact && "p-5")}>
          {/* Header */}
          <div className={cn("mb-8", compact && "mb-4")}>
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-5",
              plan.isPopular 
                ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg" 
                : "bg-primary/10 text-primary",
              compact && "w-10 h-10 rounded-xl mb-3"
            )}>
              {plan.planType === 'STYLIST' 
                ? <Scissors className={cn("w-7 h-7", compact && "w-5 h-5")} />
                : <Building2 className={cn("w-7 h-7", compact && "w-5 h-5")} />
              }
            </div>
            <h3 className={cn("text-3xl font-bold mb-2", compact && "text-xl")}>{plan.name}</h3>
            <p className={cn("text-muted-foreground text-lg", compact && "text-sm line-clamp-2")}>{plan.description}</p>
          </div>

          {/* Pricing */}
          <div className={cn("mb-8 pb-8 border-b border-border", compact && "mb-4 pb-4")}>
            <div className="flex items-end gap-2 mb-3">
              <span className={cn("text-5xl font-bold tracking-tight", compact && "text-3xl")}>
                {currencySign}{monthlyEquivalent}
              </span>
              <span className={cn("text-xl text-muted-foreground mb-1", compact && "text-base")}>/Monat</span>
            </div>
            <div className="space-y-1.5">
              <p className="text-muted-foreground">
                {currencySign}{totalPrice} für {intervalLabels[interval].months} {intervalLabels[interval].months === 1 ? 'Monat' : 'Monate'}
              </p>
              {savings > 0 && (
                <p className="text-emerald-500 font-semibold flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Sie sparen {currencySign}{Math.round(savings)}
                </p>
              )}
            </div>
          </div>

          {/* Trial Info */}
          {plan.trialDays > 0 && !compact && (
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                {plan.trialDays} Tage kostenlos testen – Voller Zugriff auf alle Features
              </p>
            </div>
          )}

          {/* AI Credits Included - Marketing Style (wie Public Page) */}
          {plan.includedAiCreditsEur > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn("mb-6 relative overflow-hidden", compact && "mb-4")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-orange-500/10 rounded-xl" />
              <div className="relative p-4 rounded-xl border border-violet-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg",
                    compact && "w-8 h-8"
                  )}>
                    <Bot className={cn("w-5 h-5 text-white", compact && "w-4 h-4")} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-500",
                        compact && "text-base"
                      )}>
                        {currencySign}{plan.includedAiCreditsEur}
                      </span>
                      <Badge className="bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/30 text-[10px] uppercase tracking-wide">
                        Included
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      AI Credits every month – Create content, generate images & more
                    </p>
                  </div>
                  <Sparkles className={cn("w-5 h-5 text-violet-400 animate-pulse", compact && "w-4 h-4")} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Features */}
          <div className={cn("space-y-4 mb-10", compact && "space-y-2 mb-4")}>
            {plan.features.slice(0, compact ? 4 : undefined).map((feature, i) => (
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
                    : "bg-emerald-500",
                  compact && "w-4 h-4"
                )}>
                  <Check className={cn("w-3 h-3 text-white", compact && "w-2.5 h-2.5")} />
                </div>
                <span className={cn("text-[15px]", compact && "text-xs")}>{feature}</span>
              </motion.div>
            ))}
            {compact && plan.features.length > 4 && (
              <p className="text-xs text-muted-foreground pl-7">
                + {plan.features.length - 4} weitere Features
              </p>
            )}
          </div>

          {/* Limits Badge */}
          {(plan.maxChairs || plan.maxCustomers) && !compact && (
            <div className="flex flex-wrap gap-2 mb-8">
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
          {showCTA && (
            <>
              <Button 
                className={cn(
                  "w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300",
                  plan.isPopular
                    ? "bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 hover:shadow-lg hover:shadow-pink-500/25 text-white border-0"
                    : "hover:bg-primary hover:text-primary-foreground",
                  compact && "h-10 text-sm"
                )}
                variant={plan.isPopular ? 'default' : 'outline'}
                size={compact ? "sm" : "lg"}
              >
                {plan.trialDays > 0 ? 'Jetzt starten' : 'Plan wählen'}
                <ArrowRight className={cn("ml-2 h-5 w-5", compact && "h-4 w-4")} />
              </Button>

              {!compact && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Keine Kreditkarte erforderlich • Jederzeit kündbar
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
