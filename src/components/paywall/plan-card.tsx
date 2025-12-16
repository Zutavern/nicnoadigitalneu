'use client'

import { Check, Star, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { BillingInterval } from '@prisma/client'

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  priceQuarterly: number
  priceSixMonths: number
  priceYearly: number
  features: string[]
  isPopular: boolean
  trialDays: number
  maxChairs: number | null
  maxBookings: number | null
  maxCustomers: number | null
}

interface PlanCardProps {
  plan: Plan
  interval: BillingInterval
  isSelected: boolean
  onSelect: () => void
}

function getPriceForInterval(plan: Plan, interval: BillingInterval): number {
  switch (interval) {
    case 'MONTHLY':
      return plan.priceMonthly
    case 'QUARTERLY':
      return plan.priceQuarterly
    case 'SIX_MONTHS':
      return plan.priceSixMonths
    case 'YEARLY':
      return plan.priceYearly
    default:
      return plan.priceMonthly
  }
}

function getMonthsForInterval(interval: BillingInterval): number {
  switch (interval) {
    case 'MONTHLY': return 1
    case 'QUARTERLY': return 3
    case 'SIX_MONTHS': return 6
    case 'YEARLY': return 12
    default: return 1
  }
}

function calculateSavings(plan: Plan, interval: BillingInterval): number {
  const monthly = plan.priceMonthly
  const price = getPriceForInterval(plan, interval)
  const months = getMonthsForInterval(interval)
  const regularTotal = monthly * months
  if (regularTotal <= 0) return 0
  return Math.round(((regularTotal - price) / regularTotal) * 100)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

export function PlanCard({ plan, interval, isSelected, onSelect }: PlanCardProps) {
  const price = getPriceForInterval(plan, interval)
  const months = getMonthsForInterval(interval)
  const monthlyEquivalent = price / months
  const savings = calculateSavings(plan, interval)

  return (
    <Card 
      className={cn(
        "relative cursor-pointer transition-all duration-200 hover:shadow-lg",
        "border-2",
        isSelected 
          ? "border-primary ring-2 ring-primary/20 shadow-lg" 
          : "border-border hover:border-muted-foreground/30",
        plan.isPopular && !isSelected && "border-primary/50"
      )}
      onClick={onSelect}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md">
            <Star className="h-3 w-3 mr-1 fill-current" />
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

      <CardHeader className={cn("text-center pb-2", plan.isPopular && "pt-6")}>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        {plan.description && (
          <CardDescription className="text-sm">{plan.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Display */}
        <div className="text-center py-2">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold tracking-tight">
              {formatCurrency(monthlyEquivalent)}
            </span>
            <span className="text-muted-foreground text-sm">/Monat</span>
          </div>
          
          {interval !== 'MONTHLY' && (
            <div className="mt-1 space-y-1">
              <p className="text-sm text-muted-foreground">
                {formatCurrency(price)} für {months} Monate
              </p>
              {savings > 0 && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                  {savings}% günstiger
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="space-y-2 pt-2">
          {plan.features.slice(0, 6).map((feature, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
          {plan.features.length > 6 && (
            <p className="text-xs text-muted-foreground pl-6">
              + {plan.features.length - 6} weitere Features
            </p>
          )}
        </div>

        {/* Trial Badge */}
        {plan.trialDays > 0 && (
          <div className="mt-4 p-2 bg-primary/5 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              {plan.trialDays} Tage kostenlos testen
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export type { Plan }

