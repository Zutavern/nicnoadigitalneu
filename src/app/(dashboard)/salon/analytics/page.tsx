'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Euro,
  Star,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
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
  Legend,
} from 'recharts'

interface AnalyticsData {
  revenue: {
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
    change: number
    newCustomers: number
    returningCustomers: number
  }
  stylistPerformance: {
    name: string
    bookings: number
    revenue: number
    rating: number
  }[]
  serviceBreakdown: {
    name: string
    value: number
    color: string
  }[]
  peakHours: {
    hour: string
    bookings: number
  }[]
}

const COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

export default function SalonAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/salon/analytics?period=${period}`)
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

  // Default mock data for display
  const defaultData: AnalyticsData = {
    revenue: {
      total: 24580,
      change: 12.5,
      data: [
        { month: 'Jan', value: 3200 },
        { month: 'Feb', value: 3800 },
        { month: 'Mar', value: 4100 },
        { month: 'Apr', value: 3900 },
        { month: 'Mai', value: 4500 },
        { month: 'Jun', value: 5080 },
      ],
    },
    bookings: {
      total: 342,
      change: 8.2,
      data: [
        { month: 'Jan', value: 45 },
        { month: 'Feb', value: 52 },
        { month: 'Mar', value: 58 },
        { month: 'Apr', value: 55 },
        { month: 'Mai', value: 62 },
        { month: 'Jun', value: 70 },
      ],
    },
    customers: {
      total: 189,
      change: 15.3,
      newCustomers: 42,
      returningCustomers: 147,
    },
    stylistPerformance: [
      { name: 'Maria K.', bookings: 89, revenue: 6780, rating: 4.9 },
      { name: 'Thomas S.', bookings: 76, revenue: 5890, rating: 4.8 },
      { name: 'Lisa M.', bookings: 68, revenue: 5120, rating: 4.7 },
      { name: 'Michael B.', bookings: 54, revenue: 4200, rating: 4.6 },
    ],
    serviceBreakdown: [
      { name: 'Haarschnitt', value: 35, color: '#ec4899' },
      { name: 'Färben', value: 28, color: '#8b5cf6' },
      { name: 'Styling', value: 18, color: '#06b6d4' },
      { name: 'Behandlung', value: 12, color: '#10b981' },
      { name: 'Sonstiges', value: 7, color: '#f59e0b' },
    ],
    peakHours: [
      { hour: '09:00', bookings: 12 },
      { hour: '10:00', bookings: 18 },
      { hour: '11:00', bookings: 22 },
      { hour: '12:00', bookings: 15 },
      { hour: '13:00', bookings: 10 },
      { hour: '14:00', bookings: 20 },
      { hour: '15:00', bookings: 25 },
      { hour: '16:00', bookings: 28 },
      { hour: '17:00', bookings: 24 },
      { hour: '18:00', bookings: 16 },
    ],
  }

  const data = analytics || defaultData

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
            Detaillierte Einblicke in die Performance deines Salons
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
            title: 'Gesamtumsatz',
            value: `€${data.revenue.total.toLocaleString('de-DE')}`,
            change: data.revenue.change,
            icon: Euro,
            color: 'blue',
          },
          {
            title: 'Buchungen',
            value: data.bookings.total.toString(),
            change: data.bookings.change,
            icon: Calendar,
            color: 'green',
          },
          {
            title: 'Kunden',
            value: data.customers.total.toString(),
            change: data.customers.change,
            icon: Users,
            color: 'purple',
          },
          {
            title: 'Durchschn. Bewertung',
            value: '4.8',
            change: 2.1,
            icon: Star,
            color: 'yellow',
          },
        ].map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    'p-2 rounded-lg',
                    kpi.color === 'blue' && 'bg-blue-500/10',
                    kpi.color === 'green' && 'bg-green-500/10',
                    kpi.color === 'purple' && 'bg-purple-500/10',
                    kpi.color === 'yellow' && 'bg-yellow-500/10',
                  )}>
                    <kpi.icon className={cn(
                      'h-5 w-5',
                      kpi.color === 'blue' && 'text-blue-500',
                      kpi.color === 'green' && 'text-green-500',
                      kpi.color === 'purple' && 'text-purple-500',
                      kpi.color === 'yellow' && 'text-yellow-500',
                    )} />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      kpi.change >= 0 ? 'text-green-500 border-green-500/30' : 'text-red-500 border-red-500/30'
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
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-blue-500" />
                Umsatzentwicklung
              </CardTitle>
              <CardDescription>Monatlicher Umsatz im Zeitverlauf</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.revenue.data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                    formatter={(value: number) => [`€${value.toLocaleString('de-DE')}`, 'Umsatz']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
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
                <Calendar className="h-5 w-5 text-green-500" />
                Buchungsentwicklung
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
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
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
              <CardTitle>Services nach Beliebtheit</CardTitle>
              <CardDescription>Verteilung der Buchungen nach Service</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
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
              <CardDescription>Buchungen nach Uhrzeit</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
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
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stylist Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-pink-500" />
                Top Stylisten
              </CardTitle>
              <CardDescription>Performance deiner Stylisten</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.stylistPerformance.map((stylist, index) => (
                  <div 
                    key={stylist.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
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
                        <div className="font-medium">{stylist.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {stylist.bookings} Buchungen
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">€{stylist.revenue.toLocaleString('de-DE')}</div>
                      <div className="flex items-center gap-1 text-xs text-yellow-500">
                        <Star className="h-3 w-3 fill-current" />
                        {stylist.rating}
                      </div>
                    </div>
                  </div>
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
        <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Kundenübersicht</h3>
                <p className="text-sm text-muted-foreground">Neue vs. wiederkehrende Kunden</p>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">{data.customers.newCustomers}</div>
                  <div className="text-sm text-muted-foreground">Neue Kunden</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">{data.customers.returningCustomers}</div>
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
