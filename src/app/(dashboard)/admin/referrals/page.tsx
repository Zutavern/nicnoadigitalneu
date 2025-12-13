'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserPlus,
  TrendingUp,
  Gift,
  Building2,
  Scissors,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Mail,
  Check,
  Clock,
  X,
  Filter,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Award,
  Target,
  Percent
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface ReferralStats {
  total: number
  pending: number
  registered: number
  converted: number
  rewarded: number
  expired: number
  totalRevenue: number
  totalCommission: number
  registrationRate: number
  conversionRate: number
}

interface RoleStats {
  salonOwner: { count: number; revenue: number }
  stylist: { count: number; revenue: number }
}

interface MonthlyTrend {
  month: string
  total: number
  registered: number
  converted: number
  revenue: number
}

interface TopReferrer {
  userId: string
  referralCode: string
  userRole: string
  totalReferrals: number
  successfulReferrals: number
  totalEarnings: number
  totalReferredRevenue: number
  totalClicks: number
  user: {
    id: string
    name: string | null
    email: string
    role: string
    image: string | null
  } | null
}

interface Referral {
  id: string
  referrerId: string
  referrerEmail: string
  referrerRole: string
  referredEmail: string
  referredId: string | null
  referredName: string | null
  referredRole: string | null
  code: string
  status: string
  invitedAt: string
  registeredAt: string | null
  convertedAt: string | null
  rewardedAt: string | null
  totalRevenue: number
  totalCommission: number
  referrer: {
    id: string
    name: string | null
    email: string
    role: string
  } | null
  referred: {
    id: string
    name: string | null
    email: string
    role: string
  } | null
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [roleStats, setRoleStats] = useState<RoleStats | null>(null)
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    fetchReferrals()
  }, [page, statusFilter, roleFilter])

  const fetchReferrals = async () => {
    setIsLoading(true)
    try {
      let url = `/api/admin/referrals?page=${page}&limit=20`
      if (statusFilter !== 'all') url += `&status=${statusFilter}`
      if (roleFilter !== 'all') url += `&role=${roleFilter}`

      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch referrals')
      const data = await res.json()

      setReferrals(data.referrals)
      setStats(data.stats)
      setRoleStats(data.roleStats)
      setMonthlyTrends(data.monthlyTrends || [])
      setTopReferrers(data.topReferrers || [])
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching referrals:', error)
      toast.error('Fehler beim Laden der Referral-Daten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (action: string, referralId: string) => {
    try {
      const res = await fetch('/api/admin/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, referralId })
      })

      if (!res.ok) throw new Error('Failed to perform action')

      toast.success('Aktion erfolgreich ausgeführt')
      fetchReferrals()
    } catch (error) {
      toast.error('Fehler bei der Aktion')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Ausstehend</Badge>
      case 'REGISTERED':
        return <Badge variant="outline" className="text-blue-500 border-blue-500/30"><UserPlus className="h-3 w-3 mr-1" />Registriert</Badge>
      case 'CONVERTED':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><Check className="h-3 w-3 mr-1" />Konvertiert</Badge>
      case 'REWARDED':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20"><Gift className="h-3 w-3 mr-1" />Belohnt</Badge>
      case 'EXPIRED':
        return <Badge variant="outline" className="text-gray-500"><Clock className="h-3 w-3 mr-1" />Abgelaufen</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Storniert</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    if (role === 'SALON_OWNER') {
      return <Badge variant="outline" className="text-blue-500 border-blue-500/30"><Building2 className="h-3 w-3 mr-1" />Salon</Badge>
    }
    return <Badge variant="outline" className="text-purple-500 border-purple-500/30"><Scissors className="h-3 w-3 mr-1" />Stylist</Badge>
  }

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Gift className="h-8 w-8 text-primary" />
            Referral-Programm
          </h1>
          <p className="text-muted-foreground">
            Übersicht über alle Empfehlungen und Belohnungen
          </p>
        </div>
        <Button variant="outline" onClick={fetchReferrals}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Aktualisieren
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Empfehlungen</p>
                <p className="text-3xl font-bold">{stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.pending || 0} ausstehend
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registrierungsrate</p>
                <p className="text-3xl font-bold">{stats?.registrationRate || 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats?.registered || 0) + (stats?.converted || 0) + (stats?.rewarded || 0)} registriert
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Konversionsrate</p>
                <p className="text-3xl font-bold">{stats?.conversionRate || 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats?.converted || 0) + (stats?.rewarded || 0)} konvertiert
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Percent className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Referral-Umsatz</p>
                <p className="text-3xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats?.totalCommission || 0)} Provision
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Salon-Besitzer Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{roleStats?.salonOwner.count || 0}</span>
                <span className="text-muted-foreground">Empfehlungen</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg">{formatCurrency(roleStats?.salonOwner.revenue || 0)}</span>
                <span className="text-muted-foreground">Generierter Umsatz</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-purple-500" />
              Stylisten Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{roleStats?.stylist.count || 0}</span>
                <span className="text-muted-foreground">Empfehlungen</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg">{formatCurrency(roleStats?.stylist.revenue || 0)}</span>
                <span className="text-muted-foreground">Generierter Umsatz</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Alle Referrals</TabsTrigger>
          <TabsTrigger value="top">Top Referrer</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="PENDING">Ausstehend</SelectItem>
                <SelectItem value="REGISTERED">Registriert</SelectItem>
                <SelectItem value="CONVERTED">Konvertiert</SelectItem>
                <SelectItem value="REWARDED">Belohnt</SelectItem>
                <SelectItem value="EXPIRED">Abgelaufen</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Rolle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Rollen</SelectItem>
                <SelectItem value="SALON_OWNER">Salon-Besitzer</SelectItem>
                <SelectItem value="STYLIST">Stylisten</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Referrals Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empfehler</TableHead>
                    <TableHead>Empfohlener</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Eingeladen</TableHead>
                    <TableHead>Umsatz</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : referrals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Keine Referrals gefunden
                      </TableCell>
                    </TableRow>
                  ) : (
                    referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium">{referral.referrer?.name || referral.referrerEmail}</p>
                              <p className="text-xs text-muted-foreground">{referral.referrerEmail}</p>
                            </div>
                            {getRoleBadge(referral.referrerRole)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{referral.referredName || referral.referred?.name || '-'}</p>
                            <p className="text-xs text-muted-foreground">{referral.referredEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{referral.code}</code>
                        </TableCell>
                        <TableCell>{getStatusBadge(referral.status)}</TableCell>
                        <TableCell>{formatDate(referral.invitedAt)}</TableCell>
                        <TableCell>{formatCurrency(Number(referral.totalRevenue))}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">•••</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {referral.status === 'CONVERTED' && (
                                <DropdownMenuItem onClick={() => handleAction('mark_rewarded', referral.id)}>
                                  <Gift className="h-4 w-4 mr-2" />
                                  Als belohnt markieren
                                </DropdownMenuItem>
                              )}
                              {['PENDING', 'REGISTERED'].includes(referral.status) && (
                                <DropdownMenuItem 
                                  onClick={() => handleAction('cancel', referral.id)}
                                  className="text-red-500"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Stornieren
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Seite {page} von {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="top" className="space-y-4">
          {/* Top Referrers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Referrer
              </CardTitle>
              <CardDescription>Die erfolgreichsten Empfehler auf der Plattform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topReferrers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Noch keine Referrer</p>
                ) : (
                  topReferrers.map((referrer, index) => (
                    <motion.div
                      key={referrer.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          index === 1 ? 'bg-gray-300/20 text-gray-400' :
                          index === 2 ? 'bg-orange-500/20 text-orange-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <Avatar>
                          <AvatarImage src={referrer.user?.image || undefined} />
                          <AvatarFallback>
                            {referrer.user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{referrer.user?.name || 'Unbekannt'}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <code className="bg-muted px-1 rounded">{referrer.referralCode}</code>
                            {getRoleBadge(referrer.userRole)}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-8 text-right">
                        <div>
                          <p className="font-bold">{referrer.totalClicks}</p>
                          <p className="text-xs text-muted-foreground">Klicks</p>
                        </div>
                        <div>
                          <p className="font-bold">{referrer.totalReferrals}</p>
                          <p className="text-xs text-muted-foreground">Gesendet</p>
                        </div>
                        <div>
                          <p className="font-bold text-green-500">{referrer.successfulReferrals}</p>
                          <p className="text-xs text-muted-foreground">Erfolgreich</p>
                        </div>
                        <div>
                          <p className="font-bold">{formatCurrency(Number(referrer.totalEarnings))}</p>
                          <p className="text-xs text-muted-foreground">Verdient</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}











