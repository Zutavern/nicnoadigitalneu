'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle, Circle, ListChecks, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { ChecklistItem } from '@/lib/google-business/types'

interface ChecklistCardProps {
  items: ChecklistItem[]
  className?: string
  maxItems?: number
}

export function ChecklistCard({ items, className, maxItems = 6 }: ChecklistCardProps) {
  // Sortiere: incomplete > warning > complete
  const sortedItems = [...items].sort((a, b) => {
    const order = { incomplete: 0, warning: 1, complete: 2 }
    return order[a.status] - order[b.status]
  })

  const displayItems = sortedItems.slice(0, maxItems)
  const completedCount = items.filter((i) => i.status === 'complete').length
  const totalCount = items.length

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-blue-500" />
            <span>Nächste Schritte</span>
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {completedCount}/{totalCount} erledigt
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                  item.status === 'complete' && 'bg-emerald-50 border-emerald-200 dark:bg-green-500/5 dark:border-green-500/20',
                  item.status === 'warning' && 'bg-amber-50 border-amber-200 dark:bg-yellow-500/5 dark:border-yellow-500/20',
                  item.status === 'incomplete' && 'bg-rose-50 border-rose-200 dark:bg-red-500/5 dark:border-red-500/20'
                )}
            >
              {/* Status Icon */}
              <div className="mt-0.5">
                {item.status === 'complete' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : item.status === 'warning' ? (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Circle className="h-5 w-5 text-red-500" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium',
                    item.status === 'complete' && 'text-muted-foreground line-through'
                  )}
                >
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Action Button */}
              {item.status !== 'complete' && item.actionUrl && (
                <Button variant="ghost" size="sm" className="flex-shrink-0" asChild>
                  <Link href={item.actionUrl}>
                    {item.actionLabel || 'Beheben'}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        {items.length > maxItems && (
          <div className="pt-3 border-t mt-3">
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
              Alle {totalCount} Aufgaben anzeigen
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

