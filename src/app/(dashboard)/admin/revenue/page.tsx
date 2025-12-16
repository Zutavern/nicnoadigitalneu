'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Zap,
  PieChart,
  Target,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PRICING_PLANS, formatCurrency } from '@/lib/stripe'

// Mock Revenue Data
const revenueByMonth = [
  { month: 'Jan', revenue: 12500, subscriptions: 45 },
  { month: 'Feb', revenue: 15800, subscriptions: 52 },
  { month: 'Mär', revenue: 18200, subscriptions: 61 },
  { month: 'Apr', revenue: 21500, subscriptions: 72 },
  { month: 'Mai', revenue: 24800, subscriptions: 85 },
  { month: 'Jun', revenue: 28400, subscriptions: 98 },
  { month: 'Jul', revenue: 32100, subscriptions: 112 },
  { month: 'Aug', revenue: 35800, subscriptions: 125 },
  { month: 'Sep', revenue: 38500, subscriptions: 138 },
  { month: 'Okt', revenue: 42200, subscriptions: 152 },
  { month: 'Nov', revenue: 45800, subscriptions: 165 },
  { month: 'Dez', revenue: 48500, subscriptions: 178 },
]

const revenueByPlan = [
  { plan: 'Enterprise', revenue: 28600, percentage: 59, color: 'bg-purple-500' },
  { plan: 'Pro', revenue: 16800, percentage: 35, color: 'bg-blue-500' },
  { plan: 'Free (Upgrades)', revenue: 3100, percentage: 6, color: 'bg-gray-500' },
]

const recentTransactions = [
  { id: 'pi_1', customer: 'Beauty Space Berlin', amount: 9900, type: 'subscription', status: 'succeeded', date: new Date('2024-12-03') },
  { id: 'pi_2', customer: 'Hair Art Studio', amount: 2900, type: 'subscription', status: 'succeeded', date: new Date('2024-12-03') },
  { id: 'pi_3', customer: 'Style Factory', amount: 9900, type: 'subscription', status: 'pending', date: new Date('2024-12-02') },
  { id: 'pi_4', customer: 'Coiffeur Elegance', amount: 2900, type: 'subscription', status: 'failed', date: new Date('2024-12-02') },
  { id: 'pi_5', customer: 'Urban Cuts', amount: 2900, type: 'subscription', status: 'succeeded', date: new Date('2024-12-01') },
]

const metrics = [
  { label: 'MRR', value: 48500, change: 12.5, trend: 'up', icon: TrendingUp, prefix: '€' },
  { label: 'ARR', value: 582000, change: 18.2, trend: 'up', icon: Target, prefix: '€' },
  { label: 'ARPU', value: 272, change: 5.3, trend: 'up', icon: DollarSign, prefix: '€' },
  { label: 'Churn Rate', value: 2.4, change: -0.5, trend: 'down', icon: TrendingDown, suffix: '%' },
]

const paymentMethods = [
  { method: 'Kreditkarte', percentage: 68, icon: CreditCard },
  { method: 'SEPA-Lastschrift', percentage: 24, icon: Receipt },
  { method: 'Andere', percentage: 8, icon: DollarSign },
]

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState('12m')

  const maxRevenue = Math.max(...revenueByMonth.map(d => d.revenue))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Erfolgreich</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Ausstehend</Badge>
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Fehlgeschlagen</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Umsatz-Dashboard
          </h1>
          <p className="text-muted-foreground">
            Stripe Einnahmen und Finanzmetriken
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Letzte 7 Tage</SelectItem>
              <SelectItem value="30d">Letzte 30 Tage</SelectItem>
              <SelectItem value="3m">Letzte 3 Monate</SelectItem>
              <SelectItem value="12m">Letzte 12 Monate</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Report
          </Button>
        </div>
      </div>

      {/* Stripe Integration Hint */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Stripe Integration bereit</p>
              <p className="text-sm text-muted-foreground">
                Diese Seite zeigt Mock-Daten. Mit <code className="bg-muted px-1 rounded">STRIPE_SECRET_KEY</code> werden echte Stripe-Daten geladen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
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
                    <h3 className="text-2xl font-bold mt-1">
                      {metric.prefix}{metric.value.toLocaleString('de-DE')}{metric.suffix}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      {metric.change > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm text-green-500">
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Umsatzentwicklung</CardTitle>
            <CardDescription>Monatliche Einnahmen der letzten 12 Monate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-2">
              {revenueByMonth.map((data, index) => (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    className="w-full relative group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-sm hover:from-green-400 hover:to-emerald-300 transition-colors" />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                      €{data.revenue.toLocaleString('de-DE')}
                    </div>
                  </motion.div>
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Umsatz nach Plan</CardTitle>
            <CardDescription>Verteilung der Einnahmen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Simple Pie Chart Representation */}
              <div className="relative h-40 w-40 mx-auto">
                <svg className="transform -rotate-90 w-full h-full">
                  {revenueByPlan.reduce((acc, plan, index) => {
                    const prevOffset = acc.offset
                    const circumference = 2 * Math.PI * 60
                    const strokeDasharray = (plan.percentage / 100) * circumference
                    acc.offset += strokeDasharray
                    acc.elements.push(
                      <circle
                        key={plan.plan}
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke={plan.color.replace('bg-', 'hsl(var(--')}
                        strokeWidth="24"
                        strokeDasharray={`${strokeDasharray} ${circumference}`}
                        strokeDashoffset={-prevOffset}
                        className={plan.color.replace('bg-', 'stroke-')}
                      />
                    )
                    return acc
                  }, { offset: 0, elements: [] as JSX.Element[] }).elements}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">€48.5k</p>
                    <p className="text-xs text-muted-foreground">MRR</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                {revenueByPlan.map((plan) => (
                  <div key={plan.plan} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${plan.color}`} />
                      <span className="text-sm">{plan.plan}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">€{plan.revenue.toLocaleString('de-DE')}</span>
                      <span className="text-xs text-muted-foreground ml-1">({plan.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Letzte Transaktionen</CardTitle>
            <CardDescription>Aktuelle Zahlungen via Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      tx.status === 'succeeded' ? 'bg-green-500/10' : 
                      tx.status === 'pending' ? 'bg-yellow-500/10' : 'bg-red-500/10'
                    }`}>
                      <Receipt className={`h-5 w-5 ${
                        tx.status === 'succeeded' ? 'text-green-500' : 
                        tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{tx.customer}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.date.toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(tx.status)}
                    <span className="font-medium w-20 text-right">
                      €{(tx.amount / 100).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Zahlungsmethoden</CardTitle>
            <CardDescription>Bevorzugte Zahlungsarten</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.method} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <method.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{method.method}</span>
                    </div>
                    <span className="font-medium">{method.percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${method.percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Stripe Gebühren (MTD)</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaktionsgebühren</span>
                <span>€1.256,34</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Netto-Einnahmen</span>
                <span className="font-medium">€47.243,66</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

