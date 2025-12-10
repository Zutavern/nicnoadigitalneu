'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
  TrendingUp,
  TrendingDown,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  PiggyBank
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subMonths } from 'date-fns'
import { de } from 'date-fns/locale'

interface EarningsStats {
  totalEarnings: number
  thisMonth: number
  lastMonth: number
  growth: number
  pendingPayments: number
  monthlyData: Array<{
    month: string
    earnings: number
    bookings: number
  }>
  recentPayments: Array<{
    id: string
    amount: number
    type: string
    date: string
    status: 'PAID' | 'PENDING'
  }>
}

export default function StylistEarningsPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<EarningsStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('6months')

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch(`/api/stylist/earnings?period=${period}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching earnings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchEarnings()
    }
  }, [session, period])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const defaultStats: EarningsStats = {
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
    pendingPayments: 0,
    monthlyData: [],
    recentPayments: [],
  }

  const data = stats || defaultStats

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Meine Einnahmen</h1>
          <p className="text-muted-foreground">
            Übersicht deiner Verdienste und Zahlungen
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Letzter Monat</SelectItem>
            <SelectItem value="3months">Letzte 3 Monate</SelectItem>
            <SelectItem value="6months">Letzte 6 Monate</SelectItem>
            <SelectItem value="12months">Letztes Jahr</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Euro className="h-6 w-6 text-white" />
                </div>
                {data.growth >= 0 ? (
                  <Badge className="bg-green-500/20 text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +{data.growth.toFixed(1)}%
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-500">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {data.growth.toFixed(1)}%
                  </Badge>
                )}
              </div>
              <div className="text-3xl font-bold">
                €{data.totalEarnings.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">
                Gesamtverdienst
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold">
                €{data.thisMonth.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">
                Dieser Monat
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold">
                €{data.lastMonth.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">
                Letzter Monat
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold">
                €{data.pendingPayments.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">
                Ausstehend
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Einnahmenentwicklung</CardTitle>
              <CardDescription>
                Monatliche Verdienste und Buchungsanzahl
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.monthlyData.length > 0 ? (
                <div className="space-y-4">
                  {data.monthlyData.map((month) => {
                    const maxEarnings = Math.max(...data.monthlyData.map(m => m.earnings))
                    const percentage = maxEarnings > 0 ? (month.earnings / maxEarnings) * 100 : 0
                    
                    return (
                      <div key={month.month} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{month.month}</span>
                          <span className="text-muted-foreground">
                            {month.bookings} Buchungen · €{month.earnings.toLocaleString('de-DE')}
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Keine Daten verfügbar
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Letzte Zahlungen</CardTitle>
              <CardDescription>
                Deine letzten Einnahmen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentPayments.length > 0 ? (
                <div className="space-y-3">
                  {data.recentPayments.map((payment) => (
                    <div 
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <div className="font-medium">
                          €{payment.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.type === 'BOOKING_COMMISSION' ? 'Buchung' : 'Sonstige'}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline"
                          className={payment.status === 'PAID' 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-yellow-500/20 text-yellow-500'
                          }
                        >
                          {payment.status === 'PAID' ? 'Bezahlt' : 'Ausstehend'}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(payment.date), 'dd.MM.yyyy', { locale: de })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  Keine Zahlungen
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}







