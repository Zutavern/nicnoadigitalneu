'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Building2, 
  Users, 
  Calendar, 
  Settings,
  ChevronRight,
  Scissors,
  Euro,
  Clock,
  Star,
  Loader2,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Armchair,
  TrendingUp,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useWidgetConfig, WidgetSettingsPanel, type WidgetConfig } from '@/components/dashboard/widget-settings'
import { Sparkles, ArrowRight } from 'lucide-react'
import { usePaywall } from '@/components/providers/paywall-provider'

// ============== WIDGET CONFIG ==============

const DEFAULT_SALON_WIDGETS: WidgetConfig[] = [
  { id: 'statCards', name: 'Hauptstatistiken', description: 'Stühle, Mietverhältnisse, Einnahmen, Bewertung', enabled: true, icon: TrendingUp },
  { id: 'pendingRequests', name: 'Offene Anfragen', description: 'Mietanfragen von Stylisten', enabled: true, icon: AlertCircle },
  { id: 'quickActions', name: 'Schnellaktionen', description: 'Wichtige Aktionen schnell erreichen', enabled: true, icon: Zap },
  { id: 'chairOverview', name: 'Stühle & Auslastung', description: 'Übersicht deiner Arbeitsplätze', enabled: true, icon: Armchair },
  { id: 'activeRentals', name: 'Aktive Mietverhältnisse', description: 'Deine aktuellen Mieter', enabled: true, icon: Users },
  { id: 'recentReviews', name: 'Neueste Bewertungen', description: 'Feedback zu deinem Salon', enabled: true, icon: Star },
]

const WIDGET_STORAGE_KEY = 'salon-dashboard-widgets'

interface SalonStats {
  salon: {
    id: string
    name: string
    city: string
    isVerified: boolean
  }
  overview: {
    totalChairs: number
    availableChairs: number
    rentedChairs: number
    totalRentals: number
    monthlyRentalIncome: number
    averageRating: number
    totalReviews: number
    pendingRequests: number
  }
  chairs: Array<{
    id: string
    name: string
    description: string
    monthlyRate: number
    isAvailable: boolean
    isRented: boolean
    amenities: string[]
  }>
  rentals: Array<{
    id: string
    chairName: string
    monthlyRent: number
    startDate: string
    stylist: {
      id: string
      name: string
      email: string
      image?: string
    }
  }>
  recentReviews: Array<{
    id: string
    rating: number
    title: string
    comment: string
    reviewerName: string
    createdAt: string
  }>
  monthlyIncome: Array<{
    month: string
    income: number
  }>
  _source?: 'demo' | 'live'
  _message?: string
}

const quickActions = [
  { label: 'Neuen Stuhl anlegen', icon: Armchair, href: '/salon/chairs/new' },
  { label: 'Stylisten verwalten', icon: Users, href: '/salon/stylists' },
  { label: 'Einstellungen', icon: Settings, href: '/salon/settings' },
]

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Dashboard wird geladen...</p>
      </div>
    </div>
  )
}

function NoSalonState() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Kein Salon gefunden</CardTitle>
          <CardDescription>
            Du hast noch keinen Salon angelegt. Erstelle jetzt deinen ersten Salon, um Stühle zu vermieten.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild>
            <Link href="/salon/new">
              <Building2 className="mr-2 h-4 w-4" />
              Salon erstellen
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle>Zugriff nicht möglich</CardTitle>
          <CardDescription>
            {error === 'Failed to fetch stats' 
              ? 'Du hast keine Berechtigung, auf dieses Dashboard zuzugreifen. Nur Salon-Besitzer können das Salon-Dashboard sehen.'
              : error}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild variant="outline">
            <Link href="/">
              Zur Startseite
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SalonDashboardPage() {
  const { data: session, status } = useSession()
  const { openPaywall } = usePaywall()
  const [stats, setStats] = useState<SalonStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  
  // Widget configuration
  const defaultWidgets = useMemo(() => DEFAULT_SALON_WIDGETS, [])
  const { widgets, toggleWidget, resetWidgets, isEnabled, isLoaded } = useWidgetConfig(WIDGET_STORAGE_KEY, defaultWidgets)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/salon/stats')
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Keine Berechtigung')
          }
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
        setStats(data)
        // Check if we're in demo mode
        if (data._source === 'demo') {
          setIsDemoMode(true)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      setError('Nicht angemeldet')
      setIsLoading(false)
      return
    }

    if (session?.user) {
      fetchStats()
    }
  }, [session, status])

  if (status === 'loading' || isLoading) return <LoadingState />
  
  if (error) return <ErrorState error={error} />
  
  if (!stats?.salon) return <NoSalonState />

  const occupancyRate = stats.overview.totalChairs > 0 
    ? Math.round((stats.overview.rentedChairs / stats.overview.totalChairs) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <CardContent className="relative py-8 px-6 md:py-10 md:px-8">
              <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                {/* Icon & Badge */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Building2 className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-amber-500 text-white border-0 shadow-md text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Demo
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left space-y-3">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
                      Das sind Demodaten
                    </h2>
                    <p className="text-slate-300 text-base lg:text-lg leading-relaxed max-w-2xl">
                      Erstelle jetzt deinen eigenen Salon und starte mit der Stuhlvermietung! 
                      Mit <span className="font-semibold text-cyan-400">nicnoa.online</span> findest du 
                      schnell und einfach passende Stuhlmieter für dein Geschäft.
                    </p>
                  </div>
                  
                  {/* Features */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-2">
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Kostenlos starten</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Stylisten finden</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Einnahmen steigern</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col items-center gap-2">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25 font-semibold"
                    onClick={() => openPaywall({ trigger: 'demo-banner' })}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Jetzt upgraden
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-slate-200"
                    asChild
                  >
                    <Link href="/salon/onboarding">
                      Salon einrichten
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isDemoMode ? 0.1 : 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{stats.salon.name}</h1>
                {isDemoMode && (
                  <Badge variant="outline" className="border-amber-500 text-amber-500 animate-pulse">
                    Demo
                  </Badge>
                )}
                {stats.salon.isVerified && !isDemoMode && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verifiziert
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {stats.salon.city}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Widget Settings */}
            {isLoaded && (
              <WidgetSettingsPanel
                widgets={widgets}
                onToggle={toggleWidget}
                onReset={resetWidgets}
              />
            )}
            <Button asChild>
              <Link href="/salon/settings">
                <Settings className="mr-2 h-4 w-4" />
                Einstellungen
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      {isEnabled('statCards') && (
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Armchair className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">{stats.overview.availableChairs} verfügbar</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{stats.overview.totalChairs}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Stühle gesamt</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">{occupancyRate}% Auslastung</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{stats.overview.rentedChairs}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Vermietete Stühle</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Euro className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                </div>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold truncate">€{stats.overview.monthlyRentalIncome.toLocaleString('de-DE')}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Mieteinnahmen/Monat</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">{stats.overview.totalReviews} Bewertungen</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{stats.overview.averageRating.toFixed(1)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Durchschnittsbewertung</div>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      )}

      {/* Pending Requests Alert */}
      {isEnabled('pendingRequests') && stats.overview.pendingRequests > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{stats.overview.pendingRequests} offene Mietanfragen</p>
                  <p className="text-sm text-muted-foreground">Stylisten warten auf deine Antwort</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/salon/requests">Anfragen anzeigen</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      {isEnabled('quickActions') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Schnellaktionen</h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <action.icon className="h-5 w-5 text-blue-500" />
                        </div>
                        <span className="font-medium">{action.label}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      {(isEnabled('chairOverview') || isEnabled('activeRentals')) && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Chair Overview */}
          {isEnabled('chairOverview') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Stühle & Auslastung</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/salon/chairs">Alle anzeigen</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Gesamtauslastung</span>
                        <span className="font-semibold">{occupancyRate}%</span>
                      </div>
                      <Progress value={occupancyRate} className="h-2" />
                    </div>

                    <div className="space-y-3 mt-6">
                      {stats.chairs.slice(0, 4).map((chair) => (
                        <div key={chair.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className={`h-3 w-3 rounded-full ${chair.isRented ? 'bg-green-500' : chair.isAvailable ? 'bg-blue-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium text-sm">{chair.name}</p>
                          <p className="text-xs text-muted-foreground">€{chair.monthlyRate}/Monat</p>
                        </div>
                      </div>
                      <Badge variant={chair.isRented ? 'default' : chair.isAvailable ? 'secondary' : 'outline'}>
                        {chair.isRented ? 'Vermietet' : chair.isAvailable ? 'Verfügbar' : 'Inaktiv'}
                      </Badge>
                    </div>
                  ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Active Rentals */}
          {isEnabled('activeRentals') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Aktive Mietverhältnisse</CardTitle>
                  <Badge variant="secondary">{stats.rentals.length} aktiv</Badge>
                </CardHeader>
                <CardContent>
                  {stats.rentals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Noch keine aktiven Mietverhältnisse</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stats.rentals.map((rental) => (
                        <div key={rental.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={rental.stylist?.image} />
                              <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                                {rental.stylist?.name?.split(' ').map(n => n[0]).join('') || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{rental.stylist?.name || 'Unbekannt'}</p>
                              <p className="text-xs text-muted-foreground">{rental.chairName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm text-green-500">€{rental.monthlyRent}/Mo</p>
                            <p className="text-xs text-muted-foreground">
                              Seit {new Date(rental.startDate).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Recent Reviews */}
      {isEnabled('recentReviews') && stats.recentReviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Neueste Bewertungen
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/salon/reviews">Alle anzeigen</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.recentReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                    <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">— {review.reviewerName}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
