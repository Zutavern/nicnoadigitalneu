'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Calendar,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

// Mock Analytics Data
const pageViews = [
  { page: '/dashboard', views: 12450, change: 12.5 },
  { page: '/bookings', views: 8320, change: 8.3 },
  { page: '/calendar', views: 6890, change: -2.1 },
  { page: '/clients', views: 5420, change: 15.7 },
  { page: '/settings', views: 2180, change: 4.2 },
]

const userActivity = [
  { hour: '00', users: 120 },
  { hour: '04', users: 45 },
  { hour: '08', users: 890 },
  { hour: '12', users: 1250 },
  { hour: '16', users: 980 },
  { hour: '20', users: 650 },
]

const deviceStats = [
  { device: 'Desktop', percentage: 58, icon: Monitor, color: 'text-blue-500' },
  { device: 'Mobile', percentage: 35, icon: Smartphone, color: 'text-green-500' },
  { device: 'Tablet', percentage: 7, icon: Monitor, color: 'text-purple-500' },
]

const geoData = [
  { country: 'Deutschland', users: 2450, percentage: 68 },
  { country: 'Österreich', users: 580, percentage: 16 },
  { country: 'Schweiz', users: 320, percentage: 9 },
  { country: 'Andere', users: 250, percentage: 7 },
]

const metrics = [
  { label: 'Seitenaufrufe', value: '124,892', change: '+18.2%', trend: 'up', icon: Globe },
  { label: 'Eindeutige Besucher', value: '28,456', change: '+12.5%', trend: 'up', icon: Users },
  { label: 'Durchschn. Sitzungsdauer', value: '4:32 min', change: '+8.3%', trend: 'up', icon: Clock },
  { label: 'Absprungrate', value: '32.4%', change: '-5.2%', trend: 'down', icon: TrendingDown },
]

const weeklyData = [
  { day: 'Mo', visits: 2400, bookings: 180 },
  { day: 'Di', visits: 2100, bookings: 156 },
  { day: 'Mi', visits: 2800, bookings: 210 },
  { day: 'Do', visits: 2600, bookings: 195 },
  { day: 'Fr', visits: 3200, bookings: 240 },
  { day: 'Sa', visits: 3800, bookings: 285 },
  { day: 'So', visits: 1800, bookings: 135 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')

  const maxVisits = Math.max(...weeklyData.map(d => d.visits))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Detaillierte Einblicke in Ihre Plattform-Performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Letzte 24h</SelectItem>
              <SelectItem value="7d">Letzte 7 Tage</SelectItem>
              <SelectItem value="30d">Letzte 30 Tage</SelectItem>
              <SelectItem value="90d">Letzte 90 Tage</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <h3 className="text-2xl font-bold mt-1">{metric.value}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm text-green-500">{metric.change}</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <metric.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Traffic Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Wöchentlicher Traffic</CardTitle>
            <CardDescription>Besuche und Buchungen pro Tag</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-4">
              {weeklyData.map((data, index) => (
                <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.visits / maxVisits) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-full relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-primary to-primary/60 rounded-t-md" />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded px-2 py-1 text-xs whitespace-nowrap">
                      {data.visits.toLocaleString()} Besuche
                    </div>
                  </motion.div>
                  <span className="text-xs text-muted-foreground">{data.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Activity by Hour */}
        <Card>
          <CardHeader>
            <CardTitle>Nutzeraktivität</CardTitle>
            <CardDescription>Aktive Nutzer nach Tageszeit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-2">
              {userActivity.map((data, index) => {
                const maxUsers = Math.max(...userActivity.map(d => d.users))
                return (
                  <div key={data.hour} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.users / maxUsers) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-sm"
                    />
                    <span className="text-xs text-muted-foreground">{data.hour}:00</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Pages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Seiten</CardTitle>
            <CardDescription>Meistbesuchte Seiten</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pageViews.map((page, index) => (
                <motion.div
                  key={page.page}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{page.page}</code>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{page.views.toLocaleString()}</span>
                    <span className={`text-sm flex items-center gap-1 ${page.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {page.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(page.change)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device & Geo Stats */}
        <div className="space-y-6">
          {/* Device Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Geräte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceStats.map((device) => (
                  <div key={device.device} className="flex items-center gap-3">
                    <device.icon className={`h-5 w-5 ${device.color}`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{device.device}</span>
                        <span className="font-medium">{device.percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${device.percentage}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full ${device.color.replace('text-', 'bg-')}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Geo Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Regionen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {geoData.map((geo) => (
                  <div key={geo.country} className="flex items-center justify-between">
                    <span className="text-sm">{geo.country}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{geo.users.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">({geo.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

