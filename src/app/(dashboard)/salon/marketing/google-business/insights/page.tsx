'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Search,
  MousePointer,
  Phone,
  MapPin,
  Calendar,
  Star,
} from 'lucide-react'
import { DevelopmentBadge } from '@/components/google-business'
import { MOCK_INSIGHTS, MOCK_REVIEW_STATS } from '@/lib/google-business/mock-data'
import type { BusinessInsights } from '@/lib/google-business/types'

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Letzte 7 Tage' },
  { value: '28d', label: 'Letzte 28 Tage' },
  { value: '90d', label: 'Letzte 90 Tage' },
]

export default function InsightsPage() {
  const [period, setPeriod] = useState<BusinessInsights['period']>('28d')
  const insights = MOCK_INSIGHTS
  const reviewStats = MOCK_REVIEW_STATS

  const mainStats = [
    {
      label: 'Profilaufrufe',
      value: insights.views.current,
      change: insights.views.change,
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Wie oft dein Profil angesehen wurde',
    },
    {
      label: 'Suchanfragen',
      value: insights.searches.current,
      change: insights.searches.change,
      icon: Search,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Wie oft du in Suchergebnissen erschienen bist',
    },
  ]

  const actionStats = [
    {
      label: 'Website-Klicks',
      value: insights.websiteClicks.current,
      change: insights.websiteClicks.change,
      icon: MousePointer,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Anrufe',
      value: insights.phoneClicks.current,
      change: insights.phoneClicks.change,
      icon: Phone,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Routenplanung',
      value: insights.directionRequests.current,
      change: insights.directionRequests.change,
      icon: MapPin,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Buchungen',
      value: insights.bookingClicks?.current || 0,
      change: insights.bookingClicks?.change || 0,
      icon: Calendar,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
  ]

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
            <h1 className="text-3xl font-bold">Insights & Performance</h1>
            <DevelopmentBadge variant="badge" />
          </div>
          <p className="text-muted-foreground ml-12">
            Analysiere die Performance deines Google Business Profils
          </p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as BusinessInsights['period'])}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <Badge
                    variant="secondary"
                    className={stat.change >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}
                  >
                    {stat.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(stat.change).toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-4xl font-bold mb-1">{stat.value.toLocaleString('de-DE')}</div>
                <div className="text-sm font-medium">{stat.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.description}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Kundenaktionen
            </CardTitle>
            <CardDescription>
              Was Kunden tun, nachdem sie dein Profil gesehen haben
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {actionStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div
                      className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
                        stat.change >= 0 ? 'text-green-600 bg-green-500/10' : 'text-red-600 bg-red-500/10'
                      }`}
                    >
                      {stat.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(stat.change).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{stat.value.toLocaleString('de-DE')}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Bewertungs-Übersicht
            </CardTitle>
            <CardDescription>
              Wie Kunden deinen Service bewerten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="text-center md:text-left">
                <div className="text-5xl font-bold mb-2">{reviewStats.average.toFixed(1)}</div>
                <div className="flex justify-center md:justify-start mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(reviewStats.average)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Basierend auf {reviewStats.total} Bewertungen
                </p>
              </div>

              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviewStats.distribution[rating as 1 | 2 | 3 | 4 | 5]
                  const percentage = (count / reviewStats.total) * 100
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="w-12 text-sm text-muted-foreground flex items-center gap-1">
                        {rating} <Star className="h-3 w-3 fill-current" />
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            rating >= 4
                              ? 'bg-green-500'
                              : rating === 3
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm text-muted-foreground text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}




