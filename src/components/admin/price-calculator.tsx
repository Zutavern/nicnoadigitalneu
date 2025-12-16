'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  Percent,
  TrendingDown,
  Sparkles,
  Lock,
  Unlock,
  RefreshCw,
  Check,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface IntervalConfig {
  key: string
  label: string
  months: number
  discount: number
  field: string
}

interface PriceCalculatorProps {
  basePrice: number
  onBasePriceChange: (price: number) => void
  prices: {
    priceMonthly: number
    priceQuarterly: number
    priceSixMonths: number
    priceYearly: number
  }
  onPricesChange: (prices: {
    priceMonthly: number
    priceQuarterly: number
    priceSixMonths: number
    priceYearly: number
  }) => void
  discounts: {
    monthly: number
    quarterly: number
    sixMonths: number
    yearly: number
  }
  onDiscountsChange: (discounts: {
    monthly: number
    quarterly: number
    sixMonths: number
    yearly: number
  }) => void
  roundingEnabled: boolean
  onRoundingChange: (enabled: boolean) => void
  roundingTarget?: number
  className?: string
}

const INTERVALS: IntervalConfig[] = [
  { key: 'monthly', label: '1 Monat', months: 1, discount: 0, field: 'priceMonthly' },
  { key: 'quarterly', label: '3 Monate', months: 3, discount: 10, field: 'priceQuarterly' },
  { key: 'sixMonths', label: '6 Monate', months: 6, discount: 15, field: 'priceSixMonths' },
  { key: 'yearly', label: '12 Monate', months: 12, discount: 25, field: 'priceYearly' },
]

// Marketing-konformes Runden (auf Zielziffer enden)
function roundToMarketing(price: number, target: number = 9): number {
  if (price <= 0) return 0
  const base = Math.floor(price / 10) * 10
  const result = base + target
  // Wenn der gerundete Wert zu weit vom Original entfernt ist, korrigieren
  if (result > price + 5) {
    return result - 10 > 0 ? result - 10 : result
  }
  return result
}

// Preis mit Rabatt berechnen
function calculateDiscountedPrice(
  basePrice: number,
  months: number,
  discountPercent: number,
  roundingEnabled: boolean,
  roundingTarget: number = 9
): number {
  if (basePrice <= 0) return 0
  const total = basePrice * months * (1 - discountPercent / 100)
  if (roundingEnabled) {
    return roundToMarketing(total, roundingTarget)
  }
  return Math.round(total * 100) / 100
}

// Ersparnis berechnen
function calculateSavings(basePrice: number, months: number, actualPrice: number): number {
  const fullPrice = basePrice * months
  return Math.max(0, fullPrice - actualPrice)
}

export function PriceCalculator({
  basePrice,
  onBasePriceChange,
  prices,
  onPricesChange,
  discounts,
  onDiscountsChange,
  roundingEnabled,
  onRoundingChange,
  roundingTarget = 9,
  className
}: PriceCalculatorProps) {
  const [autoCalculate, setAutoCalculate] = useState(true)
  const [localDiscounts, setLocalDiscounts] = useState(discounts)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  // Sync local discounts with props (only on initial load)
  useEffect(() => {
    if (!hasUserInteracted) {
      setLocalDiscounts(discounts)
    }
  }, [discounts, hasUserInteracted])

  // Funktion zur Preisberechnung (ohne automatisches Aufrufen von onPricesChange)
  const calculateAllPrices = useCallback((
    base: number, 
    disc: typeof localDiscounts,
    rounding: boolean,
    target: number
  ) => {
    return {
      priceMonthly: rounding ? roundToMarketing(base, target) : base,
      priceQuarterly: calculateDiscountedPrice(base, 3, disc.quarterly, rounding, target),
      priceSixMonths: calculateDiscountedPrice(base, 6, disc.sixMonths, rounding, target),
      priceYearly: calculateDiscountedPrice(base, 12, disc.yearly, rounding, target),
    }
  }, [])

  // Manuelle Neuberechnung (nur wenn User den Button drückt oder Wert ändert)
  const triggerRecalculate = useCallback(() => {
    if (!autoCalculate || basePrice <= 0) return
    const newPrices = calculateAllPrices(basePrice, localDiscounts, roundingEnabled, roundingTarget)
    onPricesChange(newPrices)
  }, [basePrice, localDiscounts, roundingEnabled, roundingTarget, autoCalculate, calculateAllPrices, onPricesChange])

  const handleDiscountChange = (key: keyof typeof localDiscounts, value: number) => {
    setHasUserInteracted(true)
    const newDiscounts = { ...localDiscounts, [key]: value }
    setLocalDiscounts(newDiscounts)
    onDiscountsChange(newDiscounts)
    
    // Wenn Auto-Berechnung aktiv ist, Preise neu berechnen
    if (autoCalculate && basePrice > 0) {
      const newPrices = calculateAllPrices(basePrice, newDiscounts, roundingEnabled, roundingTarget)
      onPricesChange(newPrices)
    }
  }

  const handlePriceChange = (field: string, value: number) => {
    setHasUserInteracted(true)
    onPricesChange({
      ...prices,
      [field]: value
    })
  }
  
  const handleBasePriceChange = (value: number) => {
    setHasUserInteracted(true)
    onBasePriceChange(value)
    
    // Wenn Auto-Berechnung aktiv ist, Preise neu berechnen
    if (autoCalculate && value > 0) {
      const newPrices = calculateAllPrices(value, localDiscounts, roundingEnabled, roundingTarget)
      onPricesChange(newPrices)
    }
  }
  
  const handleRoundingChange = (enabled: boolean) => {
    setHasUserInteracted(true)
    onRoundingChange(enabled)
    
    // Preise neu berechnen mit neuer Rundungseinstellung
    if (autoCalculate && basePrice > 0) {
      const newPrices = calculateAllPrices(basePrice, localDiscounts, enabled, roundingTarget)
      onPricesChange(newPrices)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getDiscountKey = (intervalKey: string): keyof typeof localDiscounts => {
    const mapping: Record<string, keyof typeof localDiscounts> = {
      monthly: 'monthly',
      quarterly: 'quarterly',
      sixMonths: 'sixMonths',
      yearly: 'yearly'
    }
    return mapping[intervalKey] || 'monthly'
  }

  const getPriceField = (intervalKey: string): keyof typeof prices => {
    const mapping: Record<string, keyof typeof prices> = {
      monthly: 'priceMonthly',
      quarterly: 'priceQuarterly',
      sixMonths: 'priceSixMonths',
      yearly: 'priceYearly'
    }
    return mapping[intervalKey] || 'priceMonthly'
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-4 bg-gradient-to-br from-violet-500/5 via-pink-500/5 to-orange-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Preis-Kalkulator</CardTitle>
              <p className="text-sm text-muted-foreground">
                Dynamische Preisberechnung mit Rabatten
              </p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoCalculate(!autoCalculate)}
                  className={cn(
                    "gap-2 transition-all",
                    autoCalculate && "bg-primary/10 border-primary/30"
                  )}
                >
                  {autoCalculate ? (
                    <>
                      <Lock className="h-4 w-4" />
                      Auto
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4" />
                      Manuell
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{autoCalculate ? 'Preise werden automatisch berechnet' : 'Preise manuell eingeben'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Rounding Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <Label className="font-medium">Marketing-konforme Preise</Label>
              <p className="text-xs text-muted-foreground">
                Rundet auf {roundingTarget} (z.B. 147€ → 149€)
              </p>
            </div>
          </div>
          <Switch
            checked={roundingEnabled}
            onCheckedChange={handleRoundingChange}
          />
        </div>

        {/* Base Price */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Basispreis (pro Monat)
            </Label>
            {autoCalculate && (
              <Badge variant="secondary" className="text-xs gap-1">
                <RefreshCw className="h-3 w-3" />
                Auto-Berechnung aktiv
              </Badge>
            )}
          </div>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={basePrice || ''}
              onChange={(e) => handleBasePriceChange(parseFloat(e.target.value) || 0)}
              className="h-14 text-2xl font-bold pr-12 bg-gradient-to-r from-violet-500/5 to-pink-500/5"
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">€</span>
          </div>
        </div>

        {/* Price Intervals */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Laufzeit-Rabatte & Preise
          </Label>
          
          <div className="space-y-4">
            {INTERVALS.map((interval, index) => {
              const discountKey = getDiscountKey(interval.key)
              const priceField = getPriceField(interval.key)
              const currentDiscount = localDiscounts[discountKey]
              const currentPrice = prices[priceField]
              const savings = calculateSavings(basePrice, interval.months, currentPrice)
              const pricePerMonth = interval.months > 1 ? currentPrice / interval.months : currentPrice

              return (
                <motion.div
                  key={interval.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    interval.key === 'yearly' 
                      ? "bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 border-amber-500/20" 
                      : "bg-card hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{interval.label}</span>
                      {interval.key === 'yearly' && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                          Beliebteste
                        </Badge>
                      )}
                    </div>
                    {currentDiscount > 0 && (
                      <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                        <TrendingDown className="h-3 w-3" />
                        -{currentDiscount}%
                      </Badge>
                    )}
                  </div>

                  {/* Discount Slider */}
                  {interval.months > 1 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Rabatt</span>
                        <span className="font-mono font-medium">{currentDiscount}%</span>
                      </div>
                      <Slider
                        value={[currentDiscount]}
                        onValueChange={([value]) => handleDiscountChange(discountKey, value)}
                        min={0}
                        max={50}
                        step={1}
                        className="w-full"
                        disabled={!autoCalculate}
                      />
                    </div>
                  )}

                  {/* Price Input */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentPrice || ''}
                        onChange={(e) => handlePriceChange(priceField, parseFloat(e.target.value) || 0)}
                        disabled={autoCalculate && interval.key !== 'monthly'}
                        className={cn(
                          "h-12 text-lg font-semibold pr-8",
                          autoCalculate && interval.key !== 'monthly' && "opacity-60"
                        )}
                        placeholder="0.00"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                    </div>
                    
                    {interval.months > 1 && (
                      <div className="text-right min-w-[100px]">
                        <div className="text-xs text-muted-foreground">pro Monat</div>
                        <div className="font-mono text-sm font-medium text-primary">
                          {formatPrice(pricePerMonth)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Savings Display */}
                  <AnimatePresence>
                    {savings > 0 && interval.months > 1 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-dashed"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Check className="h-3 w-3 text-green-500" />
                            Ersparnis für Kunde
                          </span>
                          <span className="font-semibold text-green-600">
                            {formatPrice(savings)}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-muted-foreground">
            <strong className="text-foreground">Tipp:</strong> Im Auto-Modus werden alle Preise basierend auf dem 
            Basispreis und den Rabatten berechnet. Wechseln Sie zu "Manuell" um jeden Preis 
            individuell festzulegen.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PriceCalculator

