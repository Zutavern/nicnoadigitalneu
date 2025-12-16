'use client'

import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  NotConnectedBanner,
  ChecklistCard,
  QuickActions,
  ReviewsList,
  GooglePreview,
} from '@/components/google-business'
import { DemoBanner, DemoIndicator } from '@/components/google-business/demo-banner'
import {
  MOCK_GOOGLE_BUSINESS_DATA,
  AI_REPLY_SUGGESTIONS,
} from '@/lib/google-business/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useGoogleBusinessStatus } from '@/hooks/use-google-business-status'
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
  Loader2,
} from 'lucide-react'

export default function GoogleBusinessPage() {
  const { showDemo, reason, isLoading, isPremium, isConnected } = useGoogleBusinessStatus()
  
  const data = MOCK_GOOGLE_BUSINESS_DATA

  const handleReplyToReview = (reviewId: string, text: string) => {
    toast.success('Antwort gesendet!', {
      description: showDemo ? 'Die Antwort wurde erfolgreich veröffentlicht. (Demo)' : 'Die Antwort wurde erfolgreich veröffentlicht.',
    })
  }

  // Ladescreen
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Score Ampel Farbe - immer gut sichtbar auf dunklem Hintergrund
  const scoreColor = data.score && data.score.total >= 80 
    ? 'text-emerald-400' 
    : data.score && data.score.total >= 50 
      ? 'text-amber-400' 
      : 'text-red-400'
  
  // Akzent-Border basierend auf Score
  const scoreBorderColor = data.score && data.score.total >= 80 
    ? 'border-emerald-500/50' 
    : data.score && data.score.total >= 50 
      ? 'border-amber-500/50' 
      : 'border-red-500/50'

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
              Google Business
            </h1>
            {showDemo && <DemoIndicator />}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {data.profile?.name}
          </p>
        </div>
      </div>

      {/* Demo Banner - shows for non-premium or non-connected users */}
      {showDemo && reason !== 'connected' && (
        <DemoBanner type={reason} basePath="/salon" />
      )}

      {/* KPI Hero Section - Score + Metriken - Immer dunkler Hintergrund */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={cn(
          "relative overflow-hidden border-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          scoreBorderColor
        )}>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
          
          <CardContent className="relative p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Score Circle */}
              <div className="flex items-center gap-4 lg:gap-6 lg:border-r lg:pr-6 border-white/10">
                <div className="relative">
                  <svg className="w-24 h-24 lg:w-28 lg:h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-white/10"
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
                    <span className="text-xs text-slate-400">von 100</span>
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-sm font-medium text-slate-400">Profil-Score</p>
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
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="p-2 rounded-full bg-amber-500/20">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{data.reviewStats?.average.toFixed(1)}</p>
                      <p className="text-xs text-slate-400">{data.reviewStats?.total} Bewertungen</p>
                    </div>
                  </div>

                  {/* Views */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="p-2 rounded-full bg-blue-500/20">
                      <Eye className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{data.insights?.views.current.toLocaleString()}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        {data.insights && data.insights.views.change > 0 ? (
                          <TrendingUp className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        {data.insights?.views.change}%
                      </p>
                    </div>
                  </div>

                  {/* Unanswered */}
                  <div className={cn(
                    "flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm",
                    data.reviewStats && data.reviewStats.unanswered > 0 
                      ? "bg-amber-500/20 border-2 border-amber-500/50" 
                      : "bg-white/5 border border-white/10"
                  )}>
                    <div className="p-2 rounded-full bg-amber-500/20">
                      <MessageSquare className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{data.reviewStats?.unanswered}</p>
                      <p className="text-xs text-slate-400">Unbeantwortet</p>
                    </div>
                  </div>

                  {/* Clicks */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="p-2 rounded-full bg-purple-500/20">
                      <MousePointerClick className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{data.insights?.websiteClicks.current}</p>
                      <p className="text-xs text-slate-400">Website-Klicks</p>
                    </div>
                  </div>

                  {/* Buchungen */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="p-2 rounded-full bg-emerald-500/20">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{data.insights?.bookingClicks?.current || 0}</p>
                      <p className="text-xs text-slate-400">Buchungs-Klicks</p>
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
            <Card className="border-slate-200 dark:border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Weitere Interaktionen (letzte 28 Tage)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-xl bg-slate-100 dark:bg-muted/50 border border-slate-200 dark:border-transparent">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-foreground">{data.insights?.phoneClicks.current}</p>
                    <p className="text-xs text-slate-600 dark:text-muted-foreground font-medium">Anrufe</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-100 dark:bg-muted/50 border border-slate-200 dark:border-transparent">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                      <Navigation className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-foreground">{data.insights?.directionRequests.current}</p>
                    <p className="text-xs text-slate-600 dark:text-muted-foreground font-medium">Routen</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-100 dark:bg-muted/50 border border-slate-200 dark:border-transparent">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-foreground">{data.insights?.searches.current}</p>
                    <p className="text-xs text-slate-600 dark:text-muted-foreground font-medium">Suchanfragen</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-100 dark:bg-muted/50 border border-slate-200 dark:border-transparent">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                      <MousePointerClick className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-foreground">{data.insights?.websiteClicks.current}</p>
                    <p className="text-xs text-slate-600 dark:text-muted-foreground font-medium">Website-Klicks</p>
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
            <Card className="overflow-hidden border-slate-200 dark:border-border">
              <CardHeader className="pb-2 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <Monitor className="h-4 w-4 text-blue-400" />
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

