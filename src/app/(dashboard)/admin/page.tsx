'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Building2,
  Scissors,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserPlus,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  FileCheck,
  Clock,
  Loader2,
  CalendarDays,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'

interface AdminStats {
  overview: {
    totalUsers: number
    totalStylists: number
    totalSalonOwners: number
    totalSalons: number
    totalBookings: number
    completedBookings: number
    pendingOnboardings: number
    approvedOnboardings: number
    totalRevenue: number
    monthlyRevenue: number
  }
  growth: {
    users: number
    bookings: number
    revenue: number
  }
  recentBookings: Array<{
    id: string
    title: string
    serviceName?: string
    customerName: string
    price: number
    status: string
    startTime: string
  }>
  topStylists: Array<{
    stylistId: string
    name: string
    email?: string
    image?: string
    bookingCount: number
    totalRevenue: number
  }>
  recentUsers: Array<{
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    image?: string
  }>
  bookingsByStatus: Record<string, number>
  onboardingsByStatus: Record<string, number>
}

function StatCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color, 
  index 
}: { 
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down'
  icon: React.ElementType
  color: string
  index: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-3xl font-bold mt-2">{value}</h3>
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {change}
                </span>
                <span className="text-xs text-muted-foreground">vs. letzter Monat</span>
              </div>
            </div>
            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

function RecentUsersTable({ users }: { users: AdminStats['recentUsers'] }) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SALON_OWNER':
        return (
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
            <Building2 className="h-3 w-3 mr-1" />
            Salonbetreiber
          </Badge>
        )
      case 'STYLIST':
        return (
          <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
            <Scissors className="h-3 w-3 mr-1" />
            Stylist
          </Badge>
        )
      case 'ADMIN':
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-500">
            <Users className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Neue Registrierungen
          </CardTitle>
          <CardDescription>Die neuesten Benutzer auf der Plattform</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/users">Alle anzeigen</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40">
                    {user.name?.split(' ').map(n => n[0]).join('') || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name || 'Unbekannt'}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getRoleBadge(user.role)}
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: de })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TopStylistsCard({ stylists }: { stylists: AdminStats['topStylists'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          Top Stylisten
        </CardTitle>
        <CardDescription>Nach Buchungsanzahl</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stylists.map((stylist, index) => (
            <motion.div
              key={stylist.stylistId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-sm">
                {index + 1}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={stylist.image || undefined} />
                <AvatarFallback className="bg-muted">
                  {stylist.name?.split(' ').map(n => n[0]).join('') || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{stylist.name}</p>
                <p className="text-xs text-muted-foreground">{stylist.bookingCount} Buchungen</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-500">€{stylist.totalRevenue.toLocaleString('de-DE')}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentBookingsCard({ bookings }: { bookings: AdminStats['recentBookings'] }) {
  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'bg-yellow-500/10 text-yellow-500', label: 'Ausstehend' },
      CONFIRMED: { color: 'bg-blue-500/10 text-blue-500', label: 'Bestätigt' },
      COMPLETED: { color: 'bg-green-500/10 text-green-500', label: 'Abgeschlossen' },
      CANCELLED: { color: 'bg-red-500/10 text-red-500', label: 'Storniert' },
      NO_SHOW: { color: 'bg-gray-500/10 text-gray-500', label: 'Nicht erschienen' },
    }
    const { color, label } = config[status] || { color: 'bg-gray-500/10 text-gray-500', label: status }
    return <Badge variant="secondary" className={color}>{label}</Badge>
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Letzte Buchungen
          </CardTitle>
          <CardDescription>Die neuesten Termine auf der Plattform</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                  <Scissors className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{booking.serviceName || booking.title}</p>
                  <p className="text-xs text-muted-foreground">{booking.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(booking.status)}
                <span className="font-semibold text-sm">€{booking.price.toFixed(2)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function OnboardingStatusCard({ onboardings }: { onboardings: Record<string, number> }) {
  const statusConfig = [
    { key: 'IN_PROGRESS', label: 'In Bearbeitung', color: 'bg-yellow-500', icon: Clock },
    { key: 'PENDING_REVIEW', label: 'Prüfung ausstehend', color: 'bg-blue-500', icon: FileCheck },
    { key: 'APPROVED', label: 'Genehmigt', color: 'bg-green-500', icon: Activity },
    { key: 'REJECTED', label: 'Abgelehnt', color: 'bg-red-500', icon: Activity },
  ]

  const total = Object.values(onboardings).reduce((sum, val) => sum + val, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          Onboarding Status
        </CardTitle>
        <CardDescription>{total} Stylisten gesamt</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusConfig.map(({ key, label, color, icon: Icon }) => {
            const count = onboardings[key] || 0
            const percentage = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${color} rounded-full`}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/admin/onboarding-review">Alle Anträge anzeigen</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Dashboard wird geladen...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-red-500">{error || 'Fehler beim Laden der Daten'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Erneut versuchen
          </Button>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Gesamtnutzer',
      value: stats.overview.totalUsers.toLocaleString('de-DE'),
      change: `${stats.growth.users > 0 ? '+' : ''}${stats.growth.users.toFixed(1)}%`,
      trend: stats.growth.users >= 0 ? 'up' : 'down' as const,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Aktive Salons',
      value: stats.overview.totalSalons.toLocaleString('de-DE'),
      change: '+0%',
      trend: 'up' as const,
      icon: Building2,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Stylisten',
      value: stats.overview.totalStylists.toLocaleString('de-DE'),
      change: `${stats.growth.users > 0 ? '+' : ''}${stats.growth.users.toFixed(1)}%`,
      trend: stats.growth.users >= 0 ? 'up' : 'down' as const,
      icon: Scissors,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Monatsumsatz',
      value: `€${stats.overview.monthlyRevenue.toLocaleString('de-DE')}`,
      change: `${stats.growth.revenue > 0 ? '+' : ''}${stats.growth.revenue.toFixed(1)}%`,
      trend: stats.growth.revenue >= 0 ? 'up' : 'down' as const,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Willkommen zurück! Hier ist die Übersicht Ihrer Plattform.</p>
        </div>
        <Button>
          <TrendingUp className="mr-2 h-4 w-4" />
          Report generieren
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.overview.completedBookings}</p>
              <p className="text-xs text-muted-foreground">Abgeschlossene Buchungen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.overview.pendingOnboardings}</p>
              <p className="text-xs text-muted-foreground">Ausstehende Prüfungen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.overview.totalSalonOwners}</p>
              <p className="text-xs text-muted-foreground">Salonbetreiber</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">€{stats.overview.totalRevenue.toLocaleString('de-DE')}</p>
              <p className="text-xs text-muted-foreground">Gesamtumsatz</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-3">
        <RecentBookingsCard bookings={stats.recentBookings} />
        <OnboardingStatusCard onboardings={stats.onboardingsByStatus} />
      </div>

      {/* Second Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <RecentUsersTable users={stats.recentUsers} />
        <TopStylistsCard stylists={stats.topStylists} />
      </div>
    </div>
  )
}
