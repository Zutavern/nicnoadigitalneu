'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { BillingInterval } from '@prisma/client'

interface IntervalOption {
  id: BillingInterval
  label: string
  months: number
  discount?: number
}

// Default-Intervalle (werden verwendet wenn keine activeIntervals übergeben werden)
const defaultIntervals: IntervalOption[] = [
  { id: 'MONTHLY', label: '1 Monat', months: 1 },
  { id: 'QUARTERLY', label: '3 Monate', months: 3, discount: 10 },
  { id: 'SIX_MONTHS', label: '6 Monate', months: 6, discount: 15 },
  { id: 'YEARLY', label: '12 Monate', months: 12, discount: 25 },
]

// Mapping von Config-IDs zu BillingInterval
const intervalIdMap: Record<string, BillingInterval> = {
  monthly: 'MONTHLY',
  quarterly: 'QUARTERLY',
  sixMonths: 'SIX_MONTHS',
  yearly: 'YEARLY'
}

interface ActiveInterval {
  id: string
  label: string
  months: number
  enabled: boolean
}

interface IntervalSelectorProps {
  selected: BillingInterval
  onChange: (interval: BillingInterval) => void
  className?: string
  /** Optionale Liste aktiver Intervalle (gefiltert nach Plänen mit Preis > 0) */
  activeIntervals?: ActiveInterval[]
}

export function IntervalSelector({ selected, onChange, className, activeIntervals }: IntervalSelectorProps) {
  // Wenn activeIntervals übergeben werden, nur diese anzeigen
  const displayIntervals: IntervalOption[] = activeIntervals && activeIntervals.length > 0
    ? activeIntervals
        .filter(ai => intervalIdMap[ai.id]) // Nur bekannte Intervalle
        .map(ai => ({
          id: intervalIdMap[ai.id],
          label: ai.label,
          months: ai.months,
          discount: ai.months > 1 
            ? Math.round(((ai.months - 1) / ai.months) * 25) // Dynamische Berechnung
            : undefined
        }))
    : defaultIntervals

  // Wenn keine Intervalle verfügbar sind, nichts anzeigen
  if (displayIntervals.length === 0) {
    return null
  }

  // Wenn nur ein Intervall verfügbar ist, versteckten State setzen aber nichts anzeigen
  if (displayIntervals.length === 1) {
    return null
  }

  return (
    <div className={cn(
      "flex flex-wrap justify-center gap-1 p-1 bg-muted/50 rounded-xl",
      className
    )}>
      {displayIntervals.map(interval => (
        <button
          key={interval.id}
          type="button"
          onClick={() => onChange(interval.id)}
          className={cn(
            "relative px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-all",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            selected === interval.id 
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <span className="flex items-center gap-1.5">
            {interval.label}
            {interval.discount && interval.discount > 0 && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  selected === interval.id 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted-foreground/10"
                )}
              >
                -{interval.discount}%
              </Badge>
            )}
          </span>
        </button>
      ))}
    </div>
  )
}

export { defaultIntervals as intervals }
export type { IntervalOption }

