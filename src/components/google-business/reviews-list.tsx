'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Star, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { ReviewCard } from './review-card'
import type { Review, ReviewStats } from '@/lib/google-business/types'

interface ReviewsListProps {
  reviews: Review[]
  stats: ReviewStats | null
  aiSuggestions?: Record<string, string>
  onReply?: (reviewId: string, text: string) => void
  maxItems?: number
  showHeader?: boolean
  className?: string
  scrollable?: boolean
}

export function ReviewsList({
  reviews,
  stats,
  aiSuggestions = {},
  onReply,
  maxItems = 3,
  showHeader = true,
  className,
  scrollable = false,
}: ReviewsListProps) {
  // Sortiere: neue und unbeantwortete zuerst, dann nach Datum
  const sortedReviews = [...reviews].sort((a, b) => {
    // Unbeantwortete zuerst
    if (!a.reply && b.reply) return -1
    if (a.reply && !b.reply) return 1
    // Kritische (1-2 Sterne) zuerst
    if (a.rating <= 2 && b.rating > 2) return -1
    if (a.rating > 2 && b.rating <= 2) return 1
    // Dann nach Datum
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const displayReviews = sortedReviews.slice(0, maxItems)
  const unansweredCount = reviews.filter((r) => !r.reply).length

  const ReviewsContent = () => (
    <>
      {displayReviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Noch keine Bewertungen vorhanden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              aiSuggestion={aiSuggestions[review.id]}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </>
  )

  return (
    <Card className={cn('overflow-hidden flex flex-col border-slate-200 dark:border-border', className)}>
      {showHeader && (
        <CardHeader className="pb-3 shrink-0 bg-slate-50 dark:bg-transparent border-b border-slate-100 dark:border-transparent">
          <CardTitle className="flex items-center justify-between text-slate-900 dark:text-foreground">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span>Bewertungen</span>
              {stats && (
                <Badge variant="secondary" className="ml-2 bg-slate-100 dark:bg-muted text-slate-700 dark:text-foreground">
                  {stats.average.toFixed(1)} ⭐ ({stats.total})
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unansweredCount > 0 && (
                <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 dark:border-yellow-500/30 dark:text-yellow-500 dark:bg-transparent">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {unansweredCount} offen
                </Badge>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/stylist/marketing/google-business/reviews">
                  Alle anzeigen
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      )}
      
      {scrollable ? (
        <CardContent className={cn('flex-1 min-h-0 p-0', !showHeader && 'pt-6')}>
          <ScrollArea className="h-full px-6 pb-4">
            <ReviewsContent />
            {reviews.length > maxItems && (
              <div className="pt-4 border-t mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/stylist/marketing/google-business/reviews">
                    Alle {reviews.length} Bewertungen anzeigen
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      ) : (
        <CardContent className={cn(!showHeader && 'pt-6')}>
          <ReviewsContent />
          {reviews.length > maxItems && (
            <div className="pt-4 border-t mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/stylist/marketing/google-business/reviews">
                  Alle {reviews.length} Bewertungen anzeigen
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

