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
}

const intervalLabels = {
  monthly: { label: '1 Monat', months: 1 },
  quarterly: { label: '3 Monate', months: 3 },
  sixMonths: { label: '6 Monate', months: 6 },
  yearly: { label: '12 Monate', months: 12 },
}

export function PlanPreviewCard({ plan, interval = 'monthly', showCTA = true, compact = false }: PlanPreviewCardProps) {
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
    return Math.round((totalPrice / months) * 100) / 100
  }

  const totalPrice = getPriceForInterval()
  const monthlyEquivalent = getMonthlyEquivalent()
  const savings = plan.priceMonthly * intervalLabels[interval].months - totalPrice

  return (
    <div className={cn(
      "relative group",
      plan.isPopular && !compact && "scale-[1.02]"
    )}>
      {/* Glow Effect for Popular */}
      {plan.isPopular && (
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
      )}
      
      <div className={cn(
        "relative h-full rounded-2xl border-2 bg-card transition-all duration-500",
        plan.isPopular 
          ? "border-primary shadow-2xl" 
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

        <div className={cn("p-8", compact && "p-5")}>
          {/* Header */}
          <div className={cn("mb-6", compact && "mb-4")}>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
              plan.isPopular 
                ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg" 
                : "bg-primary/10 text-primary",
              compact && "w-10 h-10 rounded-lg mb-3"
            )}>
              {plan.planType === 'STYLIST' 
                ? <Scissors className={cn("w-6 h-6", compact && "w-5 h-5")} />
                : <Building2 className={cn("w-6 h-6", compact && "w-5 h-5")} />
              }
            </div>
            <h3 className={cn("text-2xl font-bold mb-1", compact && "text-xl")}>{plan.name}</h3>
            <p className={cn("text-muted-foreground", compact && "text-sm line-clamp-2")}>{plan.description}</p>
          </div>

          {/* Pricing */}
          <div className={cn("mb-6 pb-6 border-b border-border", compact && "mb-4 pb-4")}>
            <div className="flex items-end gap-2 mb-2">
              <span className={cn("text-4xl font-bold tracking-tight", compact && "text-3xl")}>
                €{monthlyEquivalent.toFixed(0)}
              </span>
              <span className="text-lg text-muted-foreground mb-1">/Monat</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                €{totalPrice.toFixed(0)} für {intervalLabels[interval].months} {intervalLabels[interval].months === 1 ? 'Monat' : 'Monate'}
              </p>
              {savings > 0 && (
                <p className="text-sm text-emerald-500 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Sie sparen €{savings.toFixed(0)}
                </p>
              )}
            </div>
          </div>

          {/* Trial Info */}
          {plan.trialDays > 0 && !compact && (
            <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Gift className="w-3 h-3" />
                {plan.trialDays} Tage kostenlos testen
              </p>
            </div>
          )}

          {/* AI Credits */}
          {plan.includedAiCreditsEur > 0 && (
            <div className={cn("mb-4 relative overflow-hidden", compact && "mb-3")}>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-orange-500/10 rounded-xl" />
              <div className="relative p-3 rounded-xl border border-violet-500/20">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center",
                    compact && "w-7 h-7"
                  )}>
                    <Bot className={cn("w-4 h-4 text-white", compact && "w-3 h-3")} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-500", compact && "text-sm")}>
                        €{plan.includedAiCreditsEur}
                      </span>
                      <Badge className="bg-violet-500/20 text-violet-600 border-violet-500/30 text-[9px] uppercase">
                        Included
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      AI Credits / Monat
                    </p>
                  </div>
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className={cn("space-y-2", compact && "space-y-1.5")}>
            {plan.features.slice(0, compact ? 4 : undefined).map((feature, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  plan.isPopular 
                    ? "bg-gradient-to-br from-violet-500 to-pink-500" 
                    : "bg-emerald-500"
                )}>
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <span className={cn("text-sm", compact && "text-xs")}>{feature}</span>
              </div>
            ))}
            {compact && plan.features.length > 4 && (
              <p className="text-xs text-muted-foreground pl-6">
                + {plan.features.length - 4} weitere Features
              </p>
            )}
          </div>

          {/* Limits */}
          {(plan.maxChairs || plan.maxCustomers) && !compact && (
            <div className="flex flex-wrap gap-2 mt-4 mb-6">
              {plan.maxChairs && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Max. {plan.maxChairs} Stühle
                </Badge>
              )}
              {plan.maxCustomers && (
                <Badge variant="secondary" className="text-xs">
                  Max. {plan.maxCustomers} Kunden
                </Badge>
              )}
            </div>
          )}

          {/* CTA */}
          {showCTA && (
            <Button 
              className={cn(
                "w-full mt-4",
                plan.isPopular && "bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
              )}
              size={compact ? "sm" : "lg"}
            >
              {plan.trialDays > 0 ? 'Kostenlos testen' : 'Jetzt starten'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

