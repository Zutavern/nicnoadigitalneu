'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Search,
  MoreHorizontal,
  Eye,
  Pause,
  Play,
  XCircle,
  RefreshCw,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface SubscriptionUser {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
}

interface Subscription {
  id: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  plan: {
    id: string
    name: string
    amount: number
    interval: string
  } | null
  user: SubscriptionUser | null
  stripeSubscriptionId: string | null
}

interface Stats {
  total: number
  active: number
  trialing: number
  pastDue: number
  canceled: number
  mrr: number
  arr: number
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    trialing: 0,
    pastDue: 0,
    canceled: 0,
    mrr: 0,
    arr: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dataSource, setDataSource] = useState<'stripe' | 'local'>('local')

  const itemsPerPage = 20

  useEffect(() => {
    fetchSubscriptions()
  }, [currentPage, statusFilter])

  const fetchSubscriptions = async () => {
    setIsLoading(true)
    try {
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : ''
      const res = await fetch(`/api/admin/subscriptions?page=${currentPage}&limit=${itemsPerPage}${statusParam}`)
      if (!res.ok) throw new Error('Failed to fetch subscriptions')
      const data = await res.json()
      setSubscriptions(data.subscriptions)
      setStats(data.stats)
      setTotalPages(data.pagination.totalPages)
      setDataSource(data.source)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Fehler beim Laden der Abonnements')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      sub.user?.name?.toLowerCase().includes(searchLower) ||
      sub.user?.email.toLowerCase().includes(searchLower) ||
      sub.plan?.name.toLowerCase().includes(searchLower)
    )
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount / 100) // Amount is in cents
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="mr-1 h-3 w-3" />Aktiv</Badge>
      case 'trialing':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Clock className="mr-1 h-3 w-3" />Testphase</Badge>
      case 'past_due':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><AlertCircle className="mr-1 h-3 w-3" />Überfällig</Badge>
      case 'canceled':
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20"><XCircle className="mr-1 h-3 w-3" />Gekündigt</Badge>
      case 'paused':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Pause className="mr-1 h-3 w-3" />Pausiert</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPlanBadge = (plan: Subscription['plan']) => {
    if (!plan) return null
    
    const planName = plan.name.toLowerCase()
    if (planName.includes('enterprise')) {
      return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">{plan.name}</Badge>
    } else if (planName.includes('pro')) {
      return <Badge className="bg-primary/10 text-primary border-primary/20">{plan.name}</Badge>
    } else {
      return <Badge variant="outline">{plan.name}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            Abonnements
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie alle Plattform-Abonnements
            {dataSource === 'stripe' && (
              <Badge variant="outline" className="ml-2">
                <Zap className="mr-1 h-3 w-3" />
                Live-Daten von Stripe
              </Badge>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSubscriptions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('https://dashboard.stripe.com/subscriptions', '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Stripe Dashboard
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(stats.mrr * 100)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ARR: {formatCurrency(stats.arr * 100)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aktive Abos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                von {stats.total} gesamt
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Testphase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.trialing}</div>
              <p className="text-xs text-muted-foreground mt-1">
                potenzielle Kunden
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Überfällig</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.pastDue}</div>
              <p className="text-xs text-muted-foreground mt-1">
                benötigen Aktion
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Name oder E-Mail..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="trialing">Testphase</SelectItem>
                <SelectItem value="past_due">Überfällig</SelectItem>
                <SelectItem value="canceled">Gekündigt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Abonnements</CardTitle>
          <CardDescription>
            {filteredSubscriptions.length} Abonnements gefunden
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Keine Abonnements gefunden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Kunde</th>
                    <th className="text-left p-4 font-medium">Plan</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Betrag</th>
                    <th className="text-left p-4 font-medium">Periode</th>
                    <th className="text-left p-4 font-medium">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b hover:bg-muted/30"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={sub.user?.image || undefined} />
                            <AvatarFallback>
                              {sub.user?.name?.charAt(0) || sub.user?.email?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{sub.user?.name || 'Unbekannt'}</p>
                            <p className="text-sm text-muted-foreground">{sub.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{getPlanBadge(sub.plan)}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(sub.status)}
                          {sub.cancelAtPeriodEnd && (
                            <span className="text-xs text-yellow-500">Endet zum Periodenende</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {sub.plan ? formatCurrency(sub.plan.amount) : '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          /{sub.plan?.interval === 'year' ? 'Jahr' : 'Monat'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {formatDate(sub.currentPeriodStart)} - {formatDate(sub.currentPeriodEnd)}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Details anzeigen
                            </DropdownMenuItem>
                            {sub.stripeSubscriptionId && (
                              <DropdownMenuItem 
                                onClick={() => window.open(
                                  `https://dashboard.stripe.com/subscriptions/${sub.stripeSubscriptionId}`,
                                  '_blank'
                                )}
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                In Stripe öffnen
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {sub.status === 'active' && (
                              <DropdownMenuItem>
                                <Pause className="mr-2 h-4 w-4" />
                                Pausieren
                              </DropdownMenuItem>
                            )}
                            {sub.status === 'paused' && (
                              <DropdownMenuItem>
                                <Play className="mr-2 h-4 w-4" />
                                Fortsetzen
                              </DropdownMenuItem>
                            )}
                            {!['canceled', 'incomplete_expired'].includes(sub.status) && (
                              <DropdownMenuItem className="text-red-500">
                                <XCircle className="mr-2 h-4 w-4" />
                                Kündigen
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Seite {currentPage} von {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
