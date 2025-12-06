'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Star, 
  Loader2,
  TrendingUp,
  Filter,
  MapPin
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Review {
  id: string
  customerName: string
  salonName: string
  rating: number
  comment?: string
  createdAt: string
  serviceName?: string
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
}

export default function StylistReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/stylist/reviews')
        if (response.ok) {
          const data = await response.json()
          setReviews(data.reviews || [])
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filter))

  const defaultStats: ReviewStats = {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  }

  const reviewStats = stats || defaultStats

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Meine Bewertungen</h1>
        <p className="text-muted-foreground">
          Feedback von deinen Kunden
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-pink-500">
                  {reviewStats.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-5 w-5',
                        star <= Math.round(reviewStats.averageRating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Basierend auf {reviewStats.totalReviews} Bewertungen
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviewStats.ratingDistribution[rating] || 0
                  const percentage = reviewStats.totalReviews > 0 
                    ? (count / reviewStats.totalReviews) * 100 
                    : 0
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-6">{rating}★</span>
                      <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: rating * 0.1, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>

              {reviewStats.totalReviews > 0 && (
                <div className="mt-6 pt-4 border-t border-pink-500/20">
                  <div className="flex items-center gap-2 text-sm text-pink-500">
                    <TrendingUp className="h-4 w-4" />
                    <span>Super Bewertungen! Weiter so!</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Reviews List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Alle Bewertungen</CardTitle>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="5">5 Sterne</SelectItem>
                    <SelectItem value="4">4 Sterne</SelectItem>
                    <SelectItem value="3">3 Sterne</SelectItem>
                    <SelectItem value="2">2 Sterne</SelectItem>
                    <SelectItem value="1">1 Stern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredReviews.length > 0 ? (
                <div className="space-y-4">
                  {filteredReviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                              {review.customerName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{review.customerName}</div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {review.salonName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  'h-4 w-4',
                                  star <= review.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-muted-foreground'
                                )}
                              />
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(parseISO(review.createdAt), 'dd.MM.yyyy', { locale: de })}
                          </div>
                        </div>
                      </div>
                      {review.serviceName && (
                        <Badge variant="outline" className="mb-2 border-pink-500/30 text-pink-500">
                          {review.serviceName}
                        </Badge>
                      )}
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">
                          "{review.comment}"
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold">Keine Bewertungen</h3>
                  <p className="text-muted-foreground">
                    {filter === 'all' 
                      ? 'Du hast noch keine Bewertungen erhalten.'
                      : 'Keine Bewertungen für den ausgewählten Filter.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
