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

const intervals: IntervalOption[] = [
  { id: 'MONTHLY', label: '1 Monat', months: 1 },
  { id: 'QUARTERLY', label: '3 Monate', months: 3, discount: 10 },
  { id: 'SIX_MONTHS', label: '6 Monate', months: 6, discount: 15 },
  { id: 'YEARLY', label: '12 Monate', months: 12, discount: 25 },
]

interface IntervalSelectorProps {
  selected: BillingInterval
  onChange: (interval: BillingInterval) => void
  className?: string
}

export function IntervalSelector({ selected, onChange, className }: IntervalSelectorProps) {
  return (
    <div className={cn(
      "flex flex-wrap justify-center gap-1 p-1 bg-muted/50 rounded-xl",
      className
    )}>
      {intervals.map(interval => (
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

export { intervals }
export type { IntervalOption }

