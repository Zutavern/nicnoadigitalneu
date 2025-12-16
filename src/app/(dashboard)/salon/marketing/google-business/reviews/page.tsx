'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Star,
  Search,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react'
import { ReviewCard, DevelopmentBadge } from '@/components/google-business'
import { MOCK_REVIEWS, MOCK_REVIEW_STATS, AI_REPLY_SUGGESTIONS } from '@/lib/google-business/mock-data'
import type { Review } from '@/lib/google-business/types'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const stats = MOCK_REVIEW_STATS

  const filteredReviews = reviews.filter((review) => {
    if (searchQuery && !review.text.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !review.author.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (activeTab === 'unanswered' && review.reply) return false
    if (activeTab === 'critical' && review.rating > 2) return false
    if (activeTab === 'positive' && review.rating < 4) return false
    return true
  })

  const handleReply = (reviewId: string, text: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, reply: { text, date: new Date() }, isNew: false }
          : r
      )
    )
    toast.success('Antwort gesendet!', {
      description: 'Die Antwort wurde erfolgreich veröffentlicht. (Demo)',
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/salon/marketing/google-business">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Bewertungen</h1>
            <DevelopmentBadge variant="badge" />
          </div>
          <p className="text-muted-foreground ml-12">
            Verwalte und beantworte deine Google-Bewertungen
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="text-2xl font-bold">{stats.average.toFixed(1)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Durchschnitt ({stats.total} Bewertungen)
            </p>
          </CardContent>
        </Card>
        <Card className={stats.unanswered > 0 ? 'border-yellow-500/30 bg-yellow-500/5' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.unanswered}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Unbeantwortet</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{stats.distribution[5] + stats.distribution[4]}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Positiv (4-5 Sterne)</p>
          </CardContent>
        </Card>
        <Card className={(stats.distribution[1] + stats.distribution[2]) > 0 ? 'border-red-500/30 bg-red-500/5' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{stats.distribution[1] + stats.distribution[2]}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Kritisch (1-2 Sterne)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Alle Bewertungen
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Mobile: Horizontal scrollable filter pills */}
            <div className="mb-4 -mx-4 px-4 overflow-x-auto scrollbar-hide sm:mx-0 sm:px-0 sm:overflow-visible">
              <TabsList className="inline-flex w-max sm:w-auto gap-1 bg-transparent sm:bg-muted p-1 rounded-lg touch-pan-x">
                <TabsTrigger 
                  value="all" 
                  className="gap-1.5 whitespace-nowrap rounded-full sm:rounded-md px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  Alle
                  <Badge variant="secondary" className="ml-1 bg-background/50">{reviews.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="unanswered" 
                  className="gap-1.5 whitespace-nowrap rounded-full sm:rounded-md px-4 py-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  <MessageSquare className="h-3.5 w-3.5 sm:hidden" />
                  <span className="hidden sm:inline">Unbeantwortet</span>
                  <span className="sm:hidden">Offen</span>
                  <Badge variant="secondary" className="ml-1 bg-yellow-500/20 text-yellow-600 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                    {reviews.filter((r) => !r.reply).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="critical" 
                  className="gap-1.5 whitespace-nowrap rounded-full sm:rounded-md px-4 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  <AlertTriangle className="h-3.5 w-3.5 sm:hidden" />
                  <span>Kritisch</span>
                  <Badge variant="secondary" className="ml-1 bg-red-500/20 text-red-600 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                    {reviews.filter((r) => r.rating <= 2).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="positive" 
                  className="gap-1.5 whitespace-nowrap rounded-full sm:rounded-md px-4 py-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 sm:hidden" />
                  <span>Positiv</span>
                  <Badge variant="secondary" className="ml-1 bg-green-500/20 text-green-600 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                    {reviews.filter((r) => r.rating >= 4).length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Keine Bewertungen gefunden</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ReviewCard
                        review={review}
                        aiSuggestion={AI_REPLY_SUGGESTIONS[review.id]}
                        onReply={handleReply}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

