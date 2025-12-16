'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  NotConnectedBanner,
  ChecklistCard,
  QuickActions,
  ReviewsList,
  DevelopmentBadge,
  GooglePreview,
} from '@/components/google-business'
import {
  MOCK_GOOGLE_BUSINESS_DATA,
  AI_REPLY_SUGGESTIONS,
} from '@/lib/google-business/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Monitor, 
  Eye, 
  MousePointerClick, 
  Star, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Phone,
  Navigation,
  Calendar,
} from 'lucide-react'

export default function GoogleBusinessPage() {
  // Für Demo: Toggle zwischen verbunden/nicht verbunden
  const [isConnected, setIsConnected] = useState(true)
  
  const data = MOCK_GOOGLE_BUSINESS_DATA

  // Handler für Review-Antworten (Mock)
  const handleReplyToReview = (reviewId: string, text: string) => {
    toast.success('Antwort gesendet!', {
      description: 'Die Antwort wurde erfolgreich veröffentlicht. (Demo)',
    })
  }

  // Nicht verbunden -> Banner anzeigen
  if (!isConnected) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Google Business Profil</h1>
              <DevelopmentBadge variant="badge" />
            </div>
            <p className="text-muted-foreground mt-1">
              Verwalte dein Google-Profil und erreiche mehr Kunden
            </p>
          </div>
        </div>

        <NotConnectedBanner />
      </div>
    )
  }

  // Score Ampel Farbe
  const scoreColor = data.score && data.score.total >= 80 
    ? 'text-green-500' 
    : data.score && data.score.total >= 50 
      ? 'text-yellow-500' 
      : 'text-red-500'
  
  const scoreBgColor = data.score && data.score.total >= 80 
    ? 'from-green-500/20 to-green-500/5 border-green-500/30' 
    : data.score && data.score.total >= 50 
      ? 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30' 
      : 'from-red-500/20 to-red-500/5 border-red-500/30'

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
              Google Business
            </h1>
            <DevelopmentBadge variant="badge" />
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {data.profile?.name}
          </p>
        </div>
      </div>

      {/* Development Banner */}
      <DevelopmentBadge variant="banner" />

      {/* KPI Hero Section - Score + Metriken */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={cn("border bg-gradient-to-br", scoreBgColor)}>
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Score Circle */}
              <div className="flex items-center gap-4 lg:gap-6 lg:border-r lg:pr-6 border-border/50">
                <div className="relative">
                  <svg className="w-24 h-24 lg:w-28 lg:h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(data.score?.total || 0) * 2.64} 264`}
                      className={scoreColor}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-3xl lg:text-4xl font-bold", scoreColor)}>
                      {data.score?.total || 0}
                    </span>
                    <span className="text-xs text-muted-foreground">von 100</span>
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-sm font-medium text-muted-foreground">Profil-Score</p>
                  <p className={cn("text-lg font-semibold", scoreColor)}>
                    {data.score && data.score.total >= 80 ? 'Ausgezeichnet' : 
                     data.score && data.score.total >= 50 ? 'Verbesserungswürdig' : 'Kritisch'}
                  </p>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
                  {/* Rating */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <div className="p-2 rounded-full bg-yellow-500/10">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{data.reviewStats?.average.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">{data.reviewStats?.total} Bewertungen</p>
                    </div>
                  </div>

                  {/* Views */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <div className="p-2 rounded-full bg-blue-500/10">
                      <Eye className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{data.insights?.views.current.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {data.insights && data.insights.views.change > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        {data.insights?.views.change}%
                      </p>
                    </div>
                  </div>

                  {/* Unanswered */}
                  <div className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    data.reviewStats && data.reviewStats.unanswered > 0 
                      ? "bg-yellow-500/10 border border-yellow-500/30" 
                      : "bg-background/50"
                  )}>
                    <div className="p-2 rounded-full bg-yellow-500/10">
                      <MessageSquare className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{data.reviewStats?.unanswered}</p>
                      <p className="text-xs text-muted-foreground">Unbeantwortet</p>
                    </div>
                  </div>

                  {/* Clicks */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <div className="p-2 rounded-full bg-purple-500/10">
                      <MousePointerClick className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{data.insights?.websiteClicks.current}</p>
                      <p className="text-xs text-muted-foreground">Website-Klicks</p>
                    </div>
                  </div>

                  {/* Buchungen */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <div className="p-2 rounded-full bg-green-500/10">
                      <Calendar className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{data.insights?.bookingClicks?.current || 0}</p>
                      <p className="text-xs text-muted-foreground">Buchungs-Klicks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Split Screen: Content + Preview */}
      <div className="grid xl:grid-cols-[1fr_420px] gap-4 lg:gap-6">
        {/* Linke Spalte: Dashboard Content */}
        <div className="space-y-4 lg:space-y-6 order-2 xl:order-1">
          {/* Quick Actions + Checklist links, Reviews rechts - gleiche Höhe */}
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 lg:items-stretch">
            {/* Linke Seite: Quick Actions + Checklist gestapelt */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <QuickActions unansweredReviews={data.reviewStats?.unanswered || 0} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ChecklistCard items={data.checklist} maxItems={8} />
              </motion.div>
            </div>

            {/* Rechte Seite: Reviews - füllt die Höhe aus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:self-stretch"
            >
              <ReviewsList
                reviews={data.reviews}
                stats={data.reviewStats}
                aiSuggestions={AI_REPLY_SUGGESTIONS}
                onReply={handleReplyToReview}
                maxItems={10}
                className="h-full"
                scrollable
              />
            </motion.div>
          </div>

          {/* Weitere Statistiken */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Weitere Interaktionen (letzte 28 Tage)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Phone className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xl font-bold">{data.insights?.phoneClicks.current}</p>
                    <p className="text-xs text-muted-foreground">Anrufe</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Navigation className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xl font-bold">{data.insights?.directionRequests.current}</p>
                    <p className="text-xs text-muted-foreground">Routen</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Eye className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xl font-bold">{data.insights?.searches.current}</p>
                    <p className="text-xs text-muted-foreground">Suchanfragen</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <MousePointerClick className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xl font-bold">{data.insights?.websiteClicks.current}</p>
                    <p className="text-xs text-muted-foreground">Website-Klicks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Rechte Spalte: Google Preview (größer) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="order-1 xl:order-2"
        >
          <div className="sticky top-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-500/10 via-red-500/10 to-yellow-500/10">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Monitor className="h-4 w-4" />
                  So sehen Kunden dich auf Google
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {data.profile && (
                  <div className="flex justify-center">
                    <GooglePreview
                      profile={data.profile}
                      reviews={data.reviews}
                      services={data.services}
                      photos={data.photos}
                      hours={data.hours}
                      reviewStats={data.reviewStats}
                      showFullscreen={true}
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

