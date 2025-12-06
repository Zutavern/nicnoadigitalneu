'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Scissors, 
  Calendar, 
  Euro, 
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  MapPin,
  User,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Shield,
  ArrowRight,
  Sparkles,
  Users,
  Building2
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format, formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface OnboardingStatus {
  exists: boolean
  status: 'IN_PROGRESS' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | null
  currentStep: number
  documentsUploaded: number
  documentsTotal: number
  adminNotes?: string
}

interface StylistStats {
  overview: {
    totalCustomers: number
    totalBookings: number
    completedBookings: number
    upcomingBookings: number
    weeklyBookings: number
    monthlyRevenue: number
    totalRevenue: number
    averageRating: number
    totalReviews: number
  }
  growth: {
    bookings: number
    revenue: number
  }
  todaysBookings: Array<{
    id: string
    title: string
    serviceName?: string
    customerName: string
    startTime: string
    endTime: string
    price: number
    status: string
  }>
  recentBookings: Array<{
    id: string
    title: string
    serviceName?: string
    customerName: string
    price: number
    status: string
    startTime: string
  }>
  popularServices: Array<{
    serviceId: string
    serviceName: string
    bookingCount: number
    totalRevenue: number
  }>
  chairRental: {
    id: string
    chairName: string
    salonName: string
    salonCity: string
    salonStreet: string
    monthlyRent: number
    startDate: string
    pendingPayments: number
  } | null
  recentReviews: Array<{
    id: string
    rating: number
    title: string
    comment: string
    reviewerName: string
    createdAt: string
  }>
}

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

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle>Zugriff nicht möglich</CardTitle>
          <CardDescription>
            {error === 'Failed to fetch stats' 
              ? 'Du hast keine Berechtigung, auf dieses Dashboard zuzugreifen. Nur Stylisten können das Stylist-Dashboard sehen.'
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

export default function StylistDashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<StylistStats | null>(null)
  const [complianceStatus, setComplianceStatus] = useState<OnboardingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, complianceRes] = await Promise.all([
          fetch('/api/stylist/stats'),
          fetch('/api/onboarding/stylist/status'),
        ])

        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
        } else if (statsRes.status === 403) {
          setError('Keine Berechtigung')
        } else {
          setError('Failed to fetch stats')
        }

        if (complianceRes.ok) {
          const data = await complianceRes.json()
          setComplianceStatus(data)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
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
      fetchData()
    }
  }, [session, status])

  if (status === 'loading' || isLoading) return <LoadingState />
  
  if (error) return <ErrorState error={error} />

  // Render Compliance Banner based on status
  const renderComplianceBanner = () => {
    if (isLoading) return null

    // No compliance onboarding started yet
    if (!complianceStatus?.exists || complianceStatus.status === 'IN_PROGRESS' || !complianceStatus.status) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Compliance-Onboarding ausstehend
                  </h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Um vollständig freigeschaltet zu werden und alle Funktionen nutzen zu können, 
                    musst du noch deine Geschäftsdokumente hochladen und den Selbstständigkeits-Check abschließen.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/onboarding/stylist">
                      <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        <FileText className="mr-2 h-4 w-4" />
                        Jetzt vervollständigen
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      5 Dokumente erforderlich
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      ca. 10 Minuten
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    // Pending Review
    if (complianceStatus.status === 'PENDING_REVIEW') {
      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-blue-500/50 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Prüfung durch NICNOA läuft
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Deine Unterlagen werden gerade geprüft. Das dauert in der Regel 1-2 Werktage.
                    Du wirst benachrichtigt, sobald die Prüfung abgeschlossen ist.
                  </p>
                  <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 text-sm">
                      <FileCheck className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">
                        {complianceStatus.documentsUploaded} von {complianceStatus.documentsTotal} Dokumenten hochgeladen
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    // Approved
    if (complianceStatus.status === 'APPROVED') {
      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                    Vollständig freigeschaltet!
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Glückwunsch! Dein Account ist vollständig geprüft und freigeschaltet. 
                    Du kannst jetzt alle Funktionen der Plattform nutzen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    // Rejected
    if (complianceStatus.status === 'REJECTED') {
      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-red-500/50 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-red-500/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Nachbesserung erforderlich
                  </h3>
                  <p className="text-muted-foreground mt-1 mb-3">
                    Bei der Prüfung deiner Unterlagen wurden Probleme festgestellt. 
                    Bitte überprüfe die Hinweise und lade die erforderlichen Dokumente erneut hoch.
                  </p>
                  {complianceStatus.adminNotes && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                      <p className="text-sm font-medium text-red-400">Admin-Hinweis:</p>
                      <p className="text-sm text-muted-foreground mt-1">{complianceStatus.adminNotes}</p>
                    </div>
                  )}
                  <Link href="/onboarding/stylist">
                    <Button variant="destructive">
                      <FileText className="mr-2 h-4 w-4" />
                      Dokumente überprüfen
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    return null
  }

  if (isLoading) return <LoadingState />

  const statCards = [
    { 
      label: 'Buchungen diese Woche', 
      value: stats?.overview.weeklyBookings || 0, 
      icon: Calendar, 
      change: stats?.growth.bookings ? `${stats.growth.bookings > 0 ? '+' : ''}${stats.growth.bookings.toFixed(0)}%` : '0%', 
      trend: (stats?.growth.bookings || 0) >= 0 ? 'up' : 'down',
      color: 'pink' 
    },
    { 
      label: 'Einnahmen (Monat)', 
      value: `€${(stats?.overview.monthlyRevenue || 0).toLocaleString('de-DE')}`, 
      icon: Euro, 
      change: stats?.growth.revenue ? `${stats.growth.revenue > 0 ? '+' : ''}${stats.growth.revenue.toFixed(0)}%` : '0%', 
      trend: (stats?.growth.revenue || 0) >= 0 ? 'up' : 'down',
      color: 'green' 
    },
    { 
      label: 'Bewertung', 
      value: (stats?.overview.averageRating || 0).toFixed(1), 
      icon: Star, 
      change: `${stats?.overview.totalReviews || 0} Bewertungen`, 
      trend: 'up',
      color: 'yellow' 
    },
    { 
      label: 'Kunden', 
      value: stats?.overview.totalCustomers || 0, 
      icon: Users, 
      change: `${stats?.overview.upcomingBookings || 0} anstehend`, 
      trend: 'up',
      color: 'blue' 
    },
  ]

  return (
    <div className="space-y-6">
      {/* Compliance Status Banner */}
      {renderComplianceBanner()}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
            <Scissors className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Stylist Dashboard</h1>
            <p className="text-muted-foreground">
              Willkommen zurück{session?.user?.name ? `, ${session.user.name}` : ''}!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
                  </div>
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-xs text-muted-foreground">{stat.change}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Heutige Termine
              </CardTitle>
              <Badge variant="secondary">{stats?.todaysBookings.length || 0} Termine</Badge>
            </CardHeader>
            <CardContent>
              {!stats?.todaysBookings || stats.todaysBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Keine Termine für heute</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.todaysBookings.map((booking, index) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-pink-500" />
                        </div>
                        <div>
                          <div className="font-medium">{booking.customerName}</div>
                          <div className="text-sm text-muted-foreground">{booking.serviceName || booking.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-medium">
                          {format(new Date(booking.startTime), 'HH:mm', { locale: de })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(booking.startTime), 'HH:mm', { locale: de })} - {format(new Date(booking.endTime), 'HH:mm', { locale: de })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Workspace */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Aktueller Arbeitsplatz
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.chairRental ? (
                <>
                  <div className="rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center text-2xl">
                        💇
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{stats.chairRental.salonName}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{stats.chairRental.salonStreet}, {stats.chairRental.salonCity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                            Aktiv
                          </Badge>
                          <span className="text-xs text-muted-foreground">{stats.chairRental.chairName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">Monatliche Miete</span>
                      <span className="font-semibold">€{stats.chairRental.monthlyRent}</span>
                    </div>
                    {stats.chairRental.pendingPayments > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <span className="text-sm text-amber-600">Offene Zahlungen</span>
                        <span className="font-semibold text-amber-600">€{stats.chairRental.pendingPayments}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">Mietbeginn</span>
                      <span className="font-semibold">
                        {format(new Date(stats.chairRental.startDate), 'dd.MM.yyyy', { locale: de })}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="mb-4">Noch keinen Arbeitsplatz gemietet</p>
                  <Button variant="outline" asChild>
                    <Link href="/stylist/workspace">Arbeitsplatz finden</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Popular Services & Recent Reviews */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Popular Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Beliebteste Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.popularServices || stats.popularServices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Scissors className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Noch keine Services durchgeführt</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.popularServices.map((service, index) => (
                    <div key={service.serviceId} className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{service.serviceName}</p>
                        <p className="text-xs text-muted-foreground">{service.bookingCount} Buchungen</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-green-500">€{service.totalRevenue.toLocaleString('de-DE')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Neueste Bewertungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.recentReviews || stats.recentReviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Noch keine Bewertungen</p>
                </div>
              ) : (
                <div className="space-y-4">
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
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">— {review.reviewerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: de })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Übersicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-green-500">{stats?.overview.completedBookings || 0}</div>
                <div className="text-sm text-muted-foreground">Abgeschlossene Buchungen</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-blue-500">{stats?.overview.upcomingBookings || 0}</div>
                <div className="text-sm text-muted-foreground">Anstehende Termine</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-purple-500">{stats?.overview.totalCustomers || 0}</div>
                <div className="text-sm text-muted-foreground">Kunden gesamt</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-amber-500">€{(stats?.overview.totalRevenue || 0).toLocaleString('de-DE')}</div>
                <div className="text-sm text-muted-foreground">Gesamtumsatz</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
