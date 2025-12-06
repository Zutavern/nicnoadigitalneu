'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Euro,
  Calendar,
  Star,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  Scissors
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface AnalyticsData {
  earnings: {
    total: number
    change: number
    data: { month: string; value: number }[]
  }
  bookings: {
    total: number
    change: number
    data: { month: string; value: number }[]
  }
  customers: {
    total: number
    newCustomers: number
    returningCustomers: number
  }
  serviceBreakdown: {
    name: string
    value: number
    color: string
  }[]
  peakHours: {
    hour: string
    bookings: number
  }[]
  salonPerformance: {
    name: string
    bookings: number
    earnings: number
  }[]
}

const COLORS = ['#ec4899', '#f472b6', '#fb7185', '#fda4af', '#fecdd3', '#fce7f3']

export default function StylistAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/stylist/analytics?period=${period}`)
        if (res.ok) {
          const data = await res.json()
          setAnalytics(data)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalytics()
  }, [period])

  // Default data for display
  const defaultData: AnalyticsData = {
    earnings: {
      total: 4580,
      change: 15.2,
      data: [
        { month: 'Jan', value: 620 },
        { month: 'Feb', value: 780 },
        { month: 'Mar', value: 850 },
        { month: 'Apr', value: 720 },
        { month: 'Mai', value: 890 },
        { month: 'Jun', value: 720 },
      ],
    },
    bookings: {
      total: 87,
      change: 8.5,
      data: [
        { month: 'Jan', value: 12 },
        { month: 'Feb', value: 14 },
        { month: 'Mar', value: 16 },
        { month: 'Apr', value: 13 },
        { month: 'Mai', value: 17 },
        { month: 'Jun', value: 15 },
      ],
    },
    customers: {
      total: 45,
      newCustomers: 12,
      returningCustomers: 33,
    },
    serviceBreakdown: [
      { name: 'Haarschnitt', value: 40, color: '#ec4899' },
      { name: 'Färben', value: 25, color: '#f472b6' },
      { name: 'Styling', value: 20, color: '#fb7185' },
      { name: 'Behandlung', value: 10, color: '#fda4af' },
      { name: 'Sonstiges', value: 5, color: '#fce7f3' },
    ],
    peakHours: [
      { hour: '09:00', bookings: 5 },
      { hour: '10:00', bookings: 8 },
      { hour: '11:00', bookings: 12 },
      { hour: '12:00', bookings: 6 },
      { hour: '13:00', bookings: 4 },
      { hour: '14:00', bookings: 9 },
      { hour: '15:00', bookings: 14 },
      { hour: '16:00', bookings: 16 },
      { hour: '17:00', bookings: 11 },
      { hour: '18:00', bookings: 7 },
    ],
    salonPerformance: [
      { name: 'Hair Studio Berlin', bookings: 35, earnings: 1890 },
      { name: 'Style & Cut', bookings: 28, earnings: 1450 },
      { name: 'Beauty Corner', bookings: 24, earnings: 1240 },
    ],
  }

  const data = analytics || defaultData

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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Detaillierte Einblicke in deine Performance
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Letzte 7 Tage</SelectItem>
            <SelectItem value="30">Letzte 30 Tage</SelectItem>
            <SelectItem value="90">Letzte 90 Tage</SelectItem>
            <SelectItem value="365">Dieses Jahr</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Verdienst',
            value: `€${data.earnings.total.toLocaleString('de-DE')}`,
            change: data.earnings.change,
            icon: Euro,
            gradient: 'from-pink-500 to-rose-500',
          },
          {
            title: 'Buchungen',
            value: data.bookings.total.toString(),
            change: data.bookings.change,
            icon: Calendar,
            gradient: 'from-purple-500 to-pink-500',
          },
          {
            title: 'Kunden',
            value: data.customers.total.toString(),
            change: 12.3,
            icon: Users,
            gradient: 'from-blue-500 to-purple-500',
          },
          {
            title: 'Durchschn. Bewertung',
            value: '4.8',
            change: 2.1,
            icon: Star,
            gradient: 'from-yellow-500 to-orange-500',
          },
        ].map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    'p-2 rounded-lg bg-gradient-to-br',
                    kpi.gradient,
                  )}>
                    <kpi.icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      kpi.change >= 0 
                        ? 'text-green-500 border-green-500/30' 
                        : 'text-red-500 border-red-500/30'
                    )}
                  >
                    {kpi.change >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(kpi.change)}%
                  </Badge>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="text-sm text-muted-foreground">{kpi.title}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-pink-500" />
                Verdienst-Entwicklung
              </CardTitle>
              <CardDescription>Monatlicher Verdienst im Zeitverlauf</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.earnings.data}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `€${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`€${value.toLocaleString('de-DE')}`, 'Verdienst']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#ec4899"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEarnings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bookings Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Buchungs-Entwicklung
              </CardTitle>
              <CardDescription>Monatliche Buchungen im Zeitverlauf</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.bookings.data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value, 'Buchungen']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#barGradient)" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Service Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5 text-pink-500" />
                Services
              </CardTitle>
              <CardDescription>Verteilung nach Service-Art</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.serviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Anteil']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {data.serviceBreakdown.map((service) => (
                  <div key={service.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: service.color }}
                      />
                      <span>{service.name}</span>
                    </div>
                    <span className="font-medium">{service.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Peak Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Stoßzeiten
              </CardTitle>
              <CardDescription>Deine beliebtesten Zeiten</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value, 'Buchungen']}
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="url(#lineGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#ec4899' }}
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Salon Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-pink-500" />
                Top Salons
              </CardTitle>
              <CardDescription>Deine erfolgreichsten Standorte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.salonPerformance.map((salon, index) => (
                  <motion.div
                    key={salon.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-500/5 to-purple-500/5 border border-pink-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-sm',
                        index === 0 && 'bg-gradient-to-br from-yellow-400 to-orange-500',
                        index === 1 && 'bg-gradient-to-br from-gray-300 to-gray-400',
                        index === 2 && 'bg-gradient-to-br from-amber-600 to-amber-700',
                        index > 2 && 'bg-muted-foreground',
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{salon.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {salon.bookings} Buchungen
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-pink-500">
                        €{salon.earnings.toLocaleString('de-DE')}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Customer Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-gradient-to-br from-pink-500/5 to-purple-500/5 border-pink-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Kundenübersicht</h3>
                <p className="text-sm text-muted-foreground">Neue vs. wiederkehrende Kunden</p>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-500">{data.customers.newCustomers}</div>
                  <div className="text-sm text-muted-foreground">Neue Kunden</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500">{data.customers.returningCustomers}</div>
                  <div className="text-sm text-muted-foreground">Wiederkehrend</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{data.customers.total}</div>
                  <div className="text-sm text-muted-foreground">Gesamt</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
