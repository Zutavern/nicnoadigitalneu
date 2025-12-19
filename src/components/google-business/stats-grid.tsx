'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Eye, MousePointer, Phone, MapPin, Calendar, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import type { BusinessInsights } from '@/lib/google-business/types'

interface StatsGridProps {
  insights: BusinessInsights
  className?: string
}

const PERIOD_LABELS = {
  '7d': 'letzte 7 Tage',
  '28d': 'letzte 28 Tage',
  '90d': 'letzte 90 Tage',
}

export function StatsGrid({ insights, className }: StatsGridProps) {
  const stats = [
    {
      label: 'Aufrufe',
      value: insights.views.current,
      change: insights.views.change,
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Website-Klicks',
      value: insights.websiteClicks.current,
      change: insights.websiteClicks.change,
      icon: MousePointer,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Anrufe',
      value: insights.phoneClicks.current,
      change: insights.phoneClicks.change,
      icon: Phone,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Routenplanung',
      value: insights.directionRequests.current,
      change: insights.directionRequests.change,
      icon: MapPin,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ]

  // Zusätzliche Stats wenn vorhanden
  if (insights.bookingClicks) {
    stats.push({
      label: 'Buchungen',
      value: insights.bookingClicks.current,
      change: insights.bookingClicks.change,
      icon: Calendar,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    })
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <span>Performance</span>
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {PERIOD_LABELS[insights.period]}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', stat.bgColor)}>
                  <stat.icon className={cn('h-4 w-4', stat.color)} />
                </div>
                {/* Change Badge */}
                <div
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded',
                    stat.change >= 0
                      ? 'text-green-600 bg-green-500/10'
                      : 'text-red-600 bg-red-500/10'
                  )}
                >
                  {stat.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(stat.change).toFixed(1)}%</span>
                </div>
              </div>
              <div className="text-2xl font-bold">{stat.value.toLocaleString('de-DE')}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}




