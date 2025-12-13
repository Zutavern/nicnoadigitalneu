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
  Users,
  Armchair,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'

interface RevenueStats {
  totalRevenue: number
  rentalIncome: number
  bookingCommission: number
  previousMonthRevenue: number
  growth: number
  monthlyData: Array<{
    month: string
    rental: number
    commission: number
    total: number
  }>
  topStylists: Array<{
    id: string
    name: string
    revenue: number
    bookings: number
  }>
}

export default function SalonRevenuePage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('6months')

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await fetch(`/api/salon/revenue?period=${period}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching revenue:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchRevenue()
    }
  }, [session, period])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const defaultStats: RevenueStats = {
    totalRevenue: 0,
    rentalIncome: 0,
    bookingCommission: 0,
    previousMonthRevenue: 0,
    growth: 0,
    monthlyData: [],
    topStylists: [],
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
          <h1 className="text-3xl font-bold">Einnahmen</h1>
          <p className="text-muted-foreground">
            Übersicht deiner Salon-Einnahmen
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
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
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
                €{data.totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">
                Gesamteinnahmen
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
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Armchair className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold">
                €{data.rentalIncome.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">
                Mieteinnahmen
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
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold">
                €{data.bookingCommission.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">
                Buchungsprovision
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
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold">
                €{data.previousMonthRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">
                Vormonat
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Einnahmenentwicklung</CardTitle>
              <CardDescription>
                Monatliche Aufschlüsselung nach Einnahmequelle
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.monthlyData.length > 0 ? (
                <div className="space-y-4">
                  {data.monthlyData.map((month, index) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{month.month}</span>
                        <span className="text-muted-foreground">
                          €{month.total.toLocaleString('de-DE')}
                        </span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${(month.rental / month.total) * 100}%` }}
                        />
                        <div 
                          className="h-full bg-purple-500"
                          style={{ width: `${(month.commission / month.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-4 pt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-blue-500" />
                      <span>Miete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-purple-500" />
                      <span>Provision</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Keine Daten verfügbar
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Stylists */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Top Stylisten</CardTitle>
              <CardDescription>
                Nach generiertem Umsatz
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.topStylists.length > 0 ? (
                <div className="space-y-4">
                  {data.topStylists.map((stylist, index) => (
                    <div 
                      key={stylist.id}
                      className="flex items-center gap-3"
                    >
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
                        index === 0 && 'bg-yellow-500/20 text-yellow-500',
                        index === 1 && 'bg-gray-300/20 text-gray-400',
                        index === 2 && 'bg-orange-500/20 text-orange-500',
                        index > 2 && 'bg-muted text-muted-foreground'
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{stylist.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {stylist.bookings} Buchungen
                        </div>
                      </div>
                      <div className="font-semibold">
                        €{stylist.revenue.toLocaleString('de-DE')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  Keine Daten verfügbar
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}











