'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Building2,
  Scissors,
  TrendingUp,
  DollarSign,
  UserPlus,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  FileCheck,
  Clock,
  Loader2,
  CalendarDays,
  Settings2,
  Eye,
  EyeOff,
  GripVertical,
  RotateCcw,
  X,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'

// ============== TYPES ==============

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

interface WidgetConfig {
  id: string
  name: string
  description: string
  enabled: boolean
  icon: React.ElementType
}

// ============== WIDGET CONFIG ==============

const DEFAULT_WIDGET_CONFIG: WidgetConfig[] = [
  { id: 'statCards', name: 'Hauptstatistiken', description: 'Nutzer, Salons, Stylisten, Umsatz', enabled: true, icon: TrendingUp },
  { id: 'quickStats', name: 'Schnellübersicht', description: 'Kompakte Statistiken', enabled: true, icon: Activity },
  { id: 'recentBookings', name: 'Letzte Buchungen', description: 'Die neuesten Termine', enabled: true, icon: CalendarDays },
  { id: 'onboardingStatus', name: 'Onboarding Status', description: 'Stuhlmieter-Anträge Übersicht', enabled: true, icon: FileCheck },
  { id: 'recentUsers', name: 'Neue Registrierungen', description: 'Neueste Benutzer', enabled: true, icon: UserPlus },
  { id: 'topStylists', name: 'Top Stylisten', description: 'Nach Buchungsanzahl', enabled: true, icon: Scissors },
]

const STORAGE_KEY = 'admin-dashboard-widgets'

// ============== HOOKS ==============

function useWidgetConfig() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGET_CONFIG)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Merge saved config with defaults to handle new widgets
        const merged = DEFAULT_WIDGET_CONFIG.map(defaultWidget => {
          const savedWidget = parsed.find((w: WidgetConfig) => w.id === defaultWidget.id)
          return savedWidget ? { ...defaultWidget, enabled: savedWidget.enabled } : defaultWidget
        })
        setWidgets(merged)
      } catch {
        setWidgets(DEFAULT_WIDGET_CONFIG)
      }
    }
    setIsLoaded(true)
  }, [])

  const saveWidgets = useCallback((newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets.map(w => ({ id: w.id, enabled: w.enabled }))))
  }, [])

  const toggleWidget = useCallback((id: string) => {
    const newWidgets = widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    saveWidgets(newWidgets)
  }, [widgets, saveWidgets])

  const resetWidgets = useCallback(() => {
    saveWidgets(DEFAULT_WIDGET_CONFIG)
  }, [saveWidgets])

  const isEnabled = useCallback((id: string) => {
    return widgets.find(w => w.id === id)?.enabled ?? true
  }, [widgets])

  return { widgets, toggleWidget, resetWidgets, isEnabled, isLoaded }
}

// ============== WIDGET COMPONENTS ==============

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
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 truncate">{value}</h3>
              <div className="flex items-center gap-1 mt-1 sm:mt-2 flex-wrap">
                {trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 shrink-0" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 shrink-0" />
                )}
                <span className={`text-xs sm:text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {change}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">vs. letzter Monat</span>
              </div>
            </div>
            <div className={`h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shrink-0`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function QuickStatCard({ icon: Icon, value, label, color }: { icon: React.ElementType; value: string | number; label: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
        <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg sm:text-2xl font-bold truncate">{value}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
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
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 sm:p-6">
        <div>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Neue Registrierungen
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Die neuesten Benutzer auf der Plattform</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
          <Link href="/admin/users">Alle anzeigen</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-3 sm:space-y-4">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-xs sm:text-sm">
                    {user.name?.split(' ').map(n => n[0]).join('') || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">{user.name || 'Unbekannt'}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 ml-10 sm:ml-0">
                {getRoleBadge(user.role)}
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Scissors className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Top Stylisten
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Nach Buchungsanzahl</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-3 sm:space-y-4">
          {stylists.map((stylist, index) => (
            <motion.div
              key={stylist.stylistId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 sm:gap-3"
            >
              <div className="flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-xs sm:text-sm shrink-0">
                {index + 1}
              </div>
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                <AvatarImage src={stylist.image || undefined} />
                <AvatarFallback className="bg-muted text-xs sm:text-sm">
                  {stylist.name?.split(' ').map(n => n[0]).join('') || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs sm:text-sm truncate">{stylist.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{stylist.bookingCount} Buchungen</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-xs sm:text-sm text-green-500">€{stylist.totalRevenue.toLocaleString('de-DE')}</p>
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
    <Card className="lg:col-span-2">
      <CardHeader className="p-4 sm:p-6">
        <div>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Letzte Buchungen
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Die neuesten Termine auf der Plattform</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-2 sm:space-y-3">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center shrink-0">
                  <Scissors className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm truncate">{booking.serviceName || booking.title}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{booking.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 ml-10 sm:ml-0">
                {getStatusBadge(booking.status)}
                <span className="font-semibold text-xs sm:text-sm">€{booking.price.toFixed(2)}</span>
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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Onboarding Status
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">{total} Stylisten gesamt</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-3 sm:space-y-4">
          {statusConfig.map(({ key, label, color, icon: Icon }) => {
            const count = onboardings[key] || 0
            const percentage = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={key} className="space-y-1 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm">{label}</span>
                  </div>
                  <span className="font-semibold text-sm">{count}</span>
                </div>
                <div className="h-1.5 sm:h-2 rounded-full bg-muted overflow-hidden">
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

// ============== WIDGET SETTINGS PANEL ==============

function WidgetSettingsPanel({ 
  widgets, 
  onToggle, 
  onReset 
}: { 
  widgets: WidgetConfig[]
  onToggle: (id: string) => void
  onReset: () => void
}) {
  const enabledCount = widgets.filter(w => w.enabled).length

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Settings2 className="h-4 w-4" />
          {enabledCount < widgets.length && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
              {enabledCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Dashboard Widgets
          </SheetTitle>
          <SheetDescription>
            Wähle aus, welche Widgets auf deinem Dashboard angezeigt werden sollen.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {enabledCount} von {widgets.length} Widgets aktiv
            </p>
            <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              Zurücksetzen
            </Button>
          </div>
          
          <Separator className="mb-4" />
          
          <div className="space-y-4">
            {widgets.map((widget) => {
              const Icon = widget.icon
              return (
                <motion.div
                  key={widget.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    widget.enabled 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/30 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${
                      widget.enabled 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <Label 
                        htmlFor={widget.id} 
                        className={`font-medium cursor-pointer ${!widget.enabled && 'text-muted-foreground'}`}
                      >
                        {widget.name}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {widget.enabled ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      id={widget.id}
                      checked={widget.enabled}
                      onCheckedChange={() => onToggle(widget.id)}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
        
        <SheetFooter>
          <p className="text-xs text-muted-foreground">
            Deine Einstellungen werden automatisch gespeichert.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ============== MAIN COMPONENT ==============

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { widgets, toggleWidget, resetWidgets, isEnabled, isLoaded } = useWidgetConfig()

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

  if (isLoading || !isLoaded) {
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
      title: 'Stuhlmieter',
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

  const quickStats = [
    { icon: Activity, value: stats.overview.completedBookings, label: 'Abgeschlossene Buchungen', color: 'bg-green-500/10 text-green-500' },
    { icon: Clock, value: stats.overview.pendingOnboardings, label: 'Ausstehende Prüfungen', color: 'bg-yellow-500/10 text-yellow-500' },
    { icon: Building2, value: stats.overview.totalSalonOwners, label: 'Salonbetreiber', color: 'bg-blue-500/10 text-blue-500' },
    { icon: DollarSign, value: `€${stats.overview.totalRevenue.toLocaleString('de-DE')}`, label: 'Gesamtumsatz', color: 'bg-purple-500/10 text-purple-500' },
  ]

  const noWidgetsEnabled = widgets.every(w => !w.enabled)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Willkommen zurück! Hier ist die Übersicht Ihrer Plattform.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="sm:size-default">
            <TrendingUp className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Report generieren</span>
            <span className="sm:hidden">Report</span>
          </Button>
          <WidgetSettingsPanel 
            widgets={widgets} 
            onToggle={toggleWidget} 
            onReset={resetWidgets}
          />
        </div>
      </div>

      {/* No Widgets Message */}
      {noWidgetsEnabled && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <EyeOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Widgets aktiviert</h3>
            <p className="text-muted-foreground text-center mb-4">
              Aktiviere Widgets über die Einstellungen, um dein Dashboard anzupassen.
            </p>
            <WidgetSettingsPanel 
              widgets={widgets} 
              onToggle={toggleWidget} 
              onReset={resetWidgets}
            />
          </CardContent>
        </Card>
      )}

      <AnimatePresence mode="popLayout">
        {/* Stats Grid */}
        {isEnabled('statCards') && (
          <motion.div
            key="statCards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4"
          >
            {statCards.map((stat, index) => (
              <StatCard key={stat.title} {...stat} index={index} />
            ))}
          </motion.div>
        )}

        {/* Quick Stats Row */}
        {isEnabled('quickStats') && (
          <motion.div
            key="quickStats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4"
          >
            {quickStats.map((stat, index) => (
              <QuickStatCard key={index} {...stat} />
            ))}
          </motion.div>
        )}

        {/* Main Content */}
        {(isEnabled('recentBookings') || isEnabled('onboardingStatus')) && (
          <motion.div
            key="mainContent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-3"
          >
            {isEnabled('recentBookings') && (
              <RecentBookingsCard bookings={stats.recentBookings} />
            )}
            {isEnabled('onboardingStatus') && (
              <OnboardingStatusCard onboardings={stats.onboardingsByStatus} />
            )}
          </motion.div>
        )}

        {/* Second Row */}
        {(isEnabled('recentUsers') || isEnabled('topStylists')) && (
          <motion.div
            key="secondRow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-3"
          >
            {isEnabled('recentUsers') && (
              <RecentUsersTable users={stats.recentUsers} />
            )}
            {isEnabled('topStylists') && (
              <TopStylistsCard stylists={stats.topStylists} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
