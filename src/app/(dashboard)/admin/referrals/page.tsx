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
  DollarSign,
  Check,
  Clock,
  X,
  Filter,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Award,
  Target,
  Percent,
  Plus,
  Edit2,
  Trash2,
  Zap,
  Calendar,
  Settings2,
  Sparkles,
  Save
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

interface ReferralCampaign {
  id: string
  name: string
  slug: string
  description: string
  codePrefix: string
  referrerRewardMonths: number
  referredRewardMonths: number
  referrerRewardText: string
  referredRewardText: string
  marketingText: string
  isActive: boolean
  isDefault: boolean
  validFrom: string | null
  validUntil: string | null
  maxRedemptions: number | null
  currentRedemptions: number
  totalReferrals: number
  successfulReferrals: number
  stripeReferrerCouponId: string | null
  stripeReferredCouponId: string | null
  createdAt: string
}

const emptyCampaign: Partial<ReferralCampaign> = {
  name: '',
  slug: '',
  description: '',
  codePrefix: '',
  referrerRewardMonths: 1,
  referredRewardMonths: 1,
  referrerRewardText: '1 Monat gratis',
  referredRewardText: '1 Monat gratis',
  marketingText: 'Empfehle uns weiter und spare!',
  isActive: false,
  isDefault: false,
  maxRedemptions: null
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
  
  // Kampagnen State
  const [campaigns, setCampaigns] = useState<ReferralCampaign[]>([])
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false)
  const [currentCampaign, setCurrentCampaign] = useState<Partial<ReferralCampaign>>(emptyCampaign)
  const [isEditingCampaign, setIsEditingCampaign] = useState(false)
  const [isSavingCampaign, setIsSavingCampaign] = useState(false)
  const [syncToStripe, setSyncToStripe] = useState(true)
  const [stripeConfigured, setStripeConfigured] = useState(false)

  useEffect(() => {
    fetchReferrals()
    fetchCampaigns()
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

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/referral-campaigns')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data.campaigns || [])
        setStripeConfigured(data.stripeConfigured || false)
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    }
  }

  const openCampaignDialog = (campaign?: ReferralCampaign) => {
    if (campaign) {
      setCurrentCampaign(campaign)
      setIsEditingCampaign(true)
    } else {
      setCurrentCampaign(emptyCampaign)
      setIsEditingCampaign(false)
    }
    setCampaignDialogOpen(true)
  }

  const handleSaveCampaign = async () => {
    if (!currentCampaign.name || !currentCampaign.slug || !currentCampaign.codePrefix) {
      toast.error('Name, Slug und Code-Prefix sind erforderlich')
      return
    }

    setIsSavingCampaign(true)
    try {
      const method = isEditingCampaign ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/referral-campaigns', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentCampaign,
          syncToStripe
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      toast.success(isEditingCampaign ? 'Kampagne aktualisiert!' : 'Kampagne erstellt!')
      setCampaignDialogOpen(false)
      fetchCampaigns()
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Fehler beim Speichern')
    } finally {
      setIsSavingCampaign(false)
    }
  }

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Kampagne wirklich löschen/deaktivieren?')) return

    try {
      const res = await fetch(`/api/admin/referral-campaigns?id=${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Fehler beim Löschen')
      
      toast.success('Kampagne gelöscht/deaktiviert')
      fetchCampaigns()
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  const handleToggleCampaignActive = async (campaign: ReferralCampaign) => {
    try {
      const res = await fetch('/api/admin/referral-campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: campaign.id,
          isActive: !campaign.isActive
        })
      })

      if (!res.ok) throw new Error('Fehler')
      
      toast.success(campaign.isActive ? 'Kampagne deaktiviert' : 'Kampagne aktiviert')
      fetchCampaigns()
    } catch {
      toast.error('Fehler beim Aktualisieren')
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

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Kampagnen
          </TabsTrigger>
          <TabsTrigger value="all">Alle Referrals</TabsTrigger>
          <TabsTrigger value="top">Top Referrer</TabsTrigger>
        </TabsList>

        {/* Kampagnen Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Referral-Kampagnen</h2>
              <p className="text-sm text-muted-foreground">
                Konfiguriere verschiedene Belohnungsaktionen für Empfehlungen
              </p>
            </div>
            <Button onClick={() => openCampaignDialog()} className="gap-2 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white">
              <Plus className="h-4 w-4" />
              Neue Kampagne
            </Button>
          </div>

          {/* Aktive Kampagne hervorheben */}
          {campaigns.filter(c => c.isActive).map(campaign => (
            <Card key={campaign.id} className="border-2 border-green-500/30 bg-green-500/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-green-500 text-white">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {campaign.name}
                        <Badge className="bg-green-500 text-white">Aktiv</Badge>
                      </CardTitle>
                      <CardDescription>{campaign.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openCampaignDialog(campaign)}>
                      <Edit2 className="h-4 w-4 mr-1" />
                      Bearbeiten
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-background border">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Empfehler erhält</h4>
                      <p className="text-2xl font-bold text-green-600">{campaign.referrerRewardMonths} Monat{campaign.referrerRewardMonths > 1 ? 'e' : ''} gratis</p>
                      <p className="text-sm text-muted-foreground mt-1">{campaign.referrerRewardText}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background border">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Geworbener erhält</h4>
                      <p className="text-2xl font-bold text-blue-600">{campaign.referredRewardMonths} Monat{campaign.referredRewardMonths > 1 ? 'e' : ''} gratis</p>
                      <p className="text-sm text-muted-foreground mt-1">{campaign.referredRewardText}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-background border text-center">
                        <p className="text-3xl font-bold">{campaign.totalReferrals}</p>
                        <p className="text-sm text-muted-foreground">Referrals</p>
                      </div>
                      <div className="p-4 rounded-xl bg-background border text-center">
                        <p className="text-3xl font-bold text-green-600">{campaign.successfulReferrals}</p>
                        <p className="text-sm text-muted-foreground">Erfolgreich</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border">
                      <p className="text-sm font-medium mb-2">Marketing-Text</p>
                      <p className="text-muted-foreground italic">&ldquo;{campaign.marketingText}&rdquo;</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <code className="bg-muted px-2 py-1 rounded">{campaign.codePrefix}-XXXXXX</code>
                      {campaign.stripeReferrerCouponId && (
                        <Badge variant="outline" className="gap-1">
                          <Zap className="h-3 w-3" />
                          Stripe
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Inaktive Kampagnen */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.filter(c => !c.isActive).map(campaign => (
              <Card key={campaign.id} className="opacity-60 hover:opacity-100 transition-opacity">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    <Badge variant="outline">Inaktiv</Badge>
                  </div>
                  <CardDescription className="text-xs">{campaign.codePrefix}-XXXXXX</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Empfehler:</span>
                    <span className="font-medium">{campaign.referrerRewardMonths} Monat{campaign.referrerRewardMonths > 1 ? 'e' : ''}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Geworbener:</span>
                    <span className="font-medium">{campaign.referredRewardMonths} Monat{campaign.referredRewardMonths > 1 ? 'e' : ''}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleToggleCampaignActive(campaign)}>
                      Aktivieren
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openCampaignDialog(campaign)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteCampaign(campaign.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {campaigns.length === 0 && (
            <Card className="p-12 text-center border-dashed">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-muted">
                  <Gift className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Keine Kampagnen vorhanden</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Erstelle deine erste Referral-Kampagne
                  </p>
                </div>
                <Button onClick={() => openCampaignDialog()} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Kampagne erstellen
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

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

      {/* Kampagnen Dialog */}
      <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditingCampaign ? (
                <>
                  <Edit2 className="h-5 w-5 text-primary" />
                  Kampagne bearbeiten
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-primary" />
                  Neue Kampagne erstellen
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Definiere die Belohnungen für Empfehler und Geworbene
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Grundinfos */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Grundinformationen
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Name *</Label>
                  <Input
                    id="campaign-name"
                    value={currentCampaign.name || ''}
                    onChange={(e) => {
                      const name = e.target.value
                      setCurrentCampaign({
                        ...currentCampaign,
                        name,
                        slug: currentCampaign.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                      })
                    }}
                    placeholder="z.B. Sommer-Aktion 2024"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-slug">Slug *</Label>
                  <Input
                    id="campaign-slug"
                    value={currentCampaign.slug || ''}
                    onChange={(e) => setCurrentCampaign({ ...currentCampaign, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="z.B. sommer-2024"
                    className="h-11"
                    disabled={isEditingCampaign}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="campaign-prefix">Code-Prefix *</Label>
                  <Input
                    id="campaign-prefix"
                    value={currentCampaign.codePrefix || ''}
                    onChange={(e) => setCurrentCampaign({ ...currentCampaign, codePrefix: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                    placeholder="z.B. SUMMER"
                    className="h-11 font-mono"
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Codes werden: {currentCampaign.codePrefix || 'PREFIX'}-ABC123
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-max">Max. Einlösungen (optional)</Label>
                  <Input
                    id="campaign-max"
                    type="number"
                    min="0"
                    value={currentCampaign.maxRedemptions || ''}
                    onChange={(e) => setCurrentCampaign({ ...currentCampaign, maxRedemptions: parseInt(e.target.value) || null })}
                    placeholder="Unbegrenzt"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-desc">Beschreibung</Label>
                <Textarea
                  id="campaign-desc"
                  value={currentCampaign.description || ''}
                  onChange={(e) => setCurrentCampaign({ ...currentCampaign, description: e.target.value })}
                  placeholder="Interne Beschreibung der Kampagne..."
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            {/* Belohnungen */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Belohnungen (in Monaten gratis)
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4 border-green-500/30 bg-green-500/5">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-green-500 text-white">
                      <UserPlus className="h-4 w-4" />
                    </span>
                    Empfehler erhält
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="12"
                        value={currentCampaign.referrerRewardMonths || 1}
                        onChange={(e) => {
                          const months = parseInt(e.target.value) || 1
                          setCurrentCampaign({
                            ...currentCampaign,
                            referrerRewardMonths: months,
                            referrerRewardText: `${months} Monat${months > 1 ? 'e' : ''} gratis`
                          })
                        }}
                        className="w-20 h-11 text-center text-lg font-bold"
                      />
                      <span className="text-muted-foreground">Monat(e) gratis</span>
                    </div>
                    <Input
                      value={currentCampaign.referrerRewardText || ''}
                      onChange={(e) => setCurrentCampaign({ ...currentCampaign, referrerRewardText: e.target.value })}
                      placeholder="Anzeigetext"
                      className="text-sm"
                    />
                  </div>
                </Card>

                <Card className="p-4 border-blue-500/30 bg-blue-500/5">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-500 text-white">
                      <Users className="h-4 w-4" />
                    </span>
                    Geworbener erhält
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="12"
                        value={currentCampaign.referredRewardMonths || 1}
                        onChange={(e) => {
                          const months = parseInt(e.target.value) || 1
                          setCurrentCampaign({
                            ...currentCampaign,
                            referredRewardMonths: months,
                            referredRewardText: `${months} Monat${months > 1 ? 'e' : ''} gratis`
                          })
                        }}
                        className="w-20 h-11 text-center text-lg font-bold"
                      />
                      <span className="text-muted-foreground">Monat(e) gratis</span>
                    </div>
                    <Input
                      value={currentCampaign.referredRewardText || ''}
                      onChange={(e) => setCurrentCampaign({ ...currentCampaign, referredRewardText: e.target.value })}
                      placeholder="Anzeigetext"
                      className="text-sm"
                    />
                  </div>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Marketing-Text */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Marketing
              </h3>
              <div className="space-y-2">
                <Label htmlFor="campaign-marketing">Marketing-Text (wird den Nutzern angezeigt)</Label>
                <Textarea
                  id="campaign-marketing"
                  value={currentCampaign.marketingText || ''}
                  onChange={(e) => setCurrentCampaign({ ...currentCampaign, marketingText: e.target.value })}
                  placeholder="z.B. Empfehle uns weiter: Du erhältst 2 Monate gratis, dein Freund 1 Monat!"
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            {/* Optionen */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Optionen
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="space-y-0.5">
                    <p className="font-medium">Kampagne aktiv</p>
                    <p className="text-sm text-muted-foreground">Nur eine Kampagne kann gleichzeitig aktiv sein</p>
                  </div>
                  <Switch
                    checked={currentCampaign.isActive ?? false}
                    onCheckedChange={(checked) => setCurrentCampaign({ ...currentCampaign, isActive: checked })}
                  />
                </div>
                {!isEditingCampaign && (
                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    stripeConfigured ? "border-primary/30 bg-primary/5" : "opacity-50"
                  )}>
                    <div className="space-y-0.5">
                      <p className="font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        Mit Stripe synchronisieren
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Erstellt automatisch Stripe-Coupons für die Belohnungen
                      </p>
                    </div>
                    <Switch
                      checked={syncToStripe && stripeConfigured}
                      onCheckedChange={setSyncToStripe}
                      disabled={!stripeConfigured}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCampaignDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSaveCampaign}
              disabled={isSavingCampaign}
              className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white"
            >
              {isSavingCampaign && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {isEditingCampaign ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}







