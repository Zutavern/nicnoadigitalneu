'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Building2,
  Scissors,
  Star,
  Loader2,
  Save,
  RefreshCw,
  Zap,
  Crown,
  Sparkles,
  Clock,
  Package,
  AlertCircle,
  Cloud,
  CloudOff,
  Settings2,
  Users,
  Bot,
  Gift
} from 'lucide-react'
import { PriceCalculator } from '@/components/admin/price-calculator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string | null
  planType: 'SALON_OWNER' | 'STYLIST'
  priceMonthly: number
  priceQuarterly: number
  priceSixMonths: number
  priceYearly: number
  features: string[]
  maxChairs: number | null
  maxBookings: number | null
  maxCustomers: number | null
  isActive: boolean
  isPopular: boolean
  sortOrder: number
  trialDays: number
  includedAiCreditsEur: number // AI Credits inklusive pro Monat
  stripeProductId: string | null
  stripePriceMonthly: string | null
  stripePriceQuarterly: string | null
  stripePriceSixMonths: string | null
  stripePriceYearly: string | null
  createdAt: string
}

const emptyPlan: Partial<SubscriptionPlan> = {
  name: '',
  slug: '',
  description: '',
  planType: 'STYLIST',
  priceMonthly: 0,
  priceQuarterly: 0,
  priceSixMonths: 0,
  priceYearly: 0,
  features: [],
  maxChairs: null,
  maxBookings: null,
  maxCustomers: null,
  isActive: true,
  isPopular: false,
  sortOrder: 0,
  trialDays: 14,
  includedAiCreditsEur: 0
}

const INTERVALS = [
  { key: 'monthly', label: '1 Monat', field: 'priceMonthly', stripePriceField: 'stripePriceMonthly', months: 1, discount: 0 },
  { key: 'quarterly', label: '3 Monate', field: 'priceQuarterly', stripePriceField: 'stripePriceQuarterly', months: 3, discount: 10 },
  { key: 'sixMonths', label: '6 Monate', field: 'priceSixMonths', stripePriceField: 'stripePriceSixMonths', months: 6, discount: 15 },
  { key: 'yearly', label: '12 Monate', field: 'priceYearly', stripePriceField: 'stripePriceYearly', months: 12, discount: 25 },
] as const

interface BillingSettings {
  monthlyDiscount: number
  quarterlyDiscount: number
  sixMonthsDiscount: number
  yearlyDiscount: number
  priceRoundingEnabled: boolean
  priceRoundingTarget: number
}

const defaultBillingSettings: BillingSettings = {
  monthlyDiscount: 0,
  quarterlyDiscount: 10,
  sixMonthsDiscount: 15,
  yearlyDiscount: 25,
  priceRoundingEnabled: true,
  priceRoundingTarget: 9
}

export default function PlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [groupedPlans, setGroupedPlans] = useState<{
    SALON_OWNER: SubscriptionPlan[]
    STYLIST: SubscriptionPlan[]
  }>({ SALON_OWNER: [], STYLIST: [] })
  const [stats, setStats] = useState({ total: 0, active: 0, salonOwnerPlans: 0, stylistPlans: 0, withStripe: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<Partial<SubscriptionPlan>>(emptyPlan)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [featureInput, setFeatureInput] = useState('')
  const [syncToStripe, setSyncToStripe] = useState(false)
  const [activeTab, setActiveTab] = useState<'stylist' | 'salon'>('stylist')
  const [isSyncing, setIsSyncing] = useState(false)
  const [billingSettings, setBillingSettings] = useState<BillingSettings>(defaultBillingSettings)
  const [planDiscounts, setPlanDiscounts] = useState({
    monthly: 0,
    quarterly: 10,
    sixMonths: 15,
    yearly: 25
  })
  const [priceRoundingEnabled, setPriceRoundingEnabled] = useState(true)

  const fetchPlans = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/plans?includeInactive=true')
      if (!res.ok) throw new Error('Failed to fetch plans')
      const data = await res.json()
      setPlans(data.plans || [])
      setGroupedPlans(data.groupedPlans || { SALON_OWNER: [], STYLIST: [] })
      setStats(data.stats || { total: 0, active: 0, salonOwnerPlans: 0, stylistPlans: 0, withStripe: 0 })
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast.error('Fehler beim Laden der Pläne')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch billing settings on mount
  useEffect(() => {
    const fetchBillingSettings = async () => {
      try {
        const res = await fetch('/api/admin/billing-settings')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setBillingSettings({
              monthlyDiscount: data.settings.monthlyDiscount ?? 0,
              quarterlyDiscount: data.settings.quarterlyDiscount ?? 10,
              sixMonthsDiscount: data.settings.sixMonthsDiscount ?? 15,
              yearlyDiscount: data.settings.yearlyDiscount ?? 25,
              priceRoundingEnabled: data.settings.priceRoundingEnabled ?? true,
              priceRoundingTarget: data.settings.priceRoundingTarget ?? 9
            })
            setPlanDiscounts({
              monthly: data.settings.monthlyDiscount ?? 0,
              quarterly: data.settings.quarterlyDiscount ?? 10,
              sixMonths: data.settings.sixMonthsDiscount ?? 15,
              yearly: data.settings.yearlyDiscount ?? 25
            })
            setPriceRoundingEnabled(data.settings.priceRoundingEnabled ?? true)
          }
        }
      } catch (error) {
        console.error('Error fetching billing settings:', error)
      }
    }
    
    fetchBillingSettings()
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleSavePlan = async () => {
    if (!currentPlan.name || !currentPlan.slug || !currentPlan.planType) {
      toast.error('Name, Slug und Plan-Typ sind erforderlich')
      return
    }

    setIsSaving(true)
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/plans', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentPlan,
          syncToStripe
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      toast.success(isEditing ? 'Plan aktualisiert!' : 'Plan erstellt!')
      setEditDialogOpen(false)
      setCurrentPlan(emptyPlan)
      fetchPlans()
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Möchten Sie diesen Plan wirklich deaktivieren?')) return

    try {
      const res = await fetch(`/api/admin/plans?id=${planId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete plan')

      toast.success('Plan deaktiviert')
      fetchPlans()
    } catch {
      toast.error('Fehler beim Deaktivieren')
    }
  }

  const handleSyncToStripe = async (planId: string) => {
    setIsSyncing(true)
    try {
      const res = await fetch('/api/admin/stripe/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Sync fehlgeschlagen')
      }

      toast.success('Plan mit Stripe synchronisiert!')
      fetchPlans()
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Fehler bei der Synchronisierung')
    } finally {
      setIsSyncing(false)
    }
  }

  const openEditDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setCurrentPlan(plan)
      setIsEditing(true)
    } else {
      setCurrentPlan(emptyPlan)
      setIsEditing(false)
    }
    setSyncToStripe(false)
    setEditDialogOpen(true)
  }

  const addFeature = () => {
    if (!featureInput.trim()) return
    setCurrentPlan({
      ...currentPlan,
      features: [...(currentPlan.features || []), featureInput.trim()]
    })
    setFeatureInput('')
  }

  const removeFeature = (index: number) => {
    setCurrentPlan({
      ...currentPlan,
      features: currentPlan.features?.filter((_, i) => i !== index) || []
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const calculateSavings = (monthly: number, total: number, months: number) => {
    const regularTotal = monthly * months
    if (regularTotal === 0) return 0
    const savings = ((regularTotal - total) / regularTotal) * 100
    return Math.round(savings)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 blur-xl opacity-30 animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
        </div>
        <p className="text-muted-foreground">Lade Preispläne...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header mit Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 via-pink-500/10 to-orange-500/10 p-8 border">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              Preispläne verwalten
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Erstellen und verwalten Sie Abonnement-Pläne für Stylisten und Salon-Besitzer. 
              Jeder Plan kann mit Stripe synchronisiert werden.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchPlans} disabled={isLoading}>
              <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
              Aktualisieren
            </Button>
            <Button 
              onClick={() => openEditDialog()} 
              className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Neuer Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: 'Gesamt', value: stats.total, icon: Package, gradient: 'from-slate-500 to-slate-600' },
          { label: 'Aktiv', value: stats.active, icon: Check, gradient: 'from-emerald-500 to-green-600' },
          { label: 'Salon-Besitzer', value: stats.salonOwnerPlans, icon: Building2, gradient: 'from-blue-500 to-cyan-600' },
          { label: 'Stylisten', value: stats.stylistPlans, icon: Scissors, gradient: 'from-purple-500 to-violet-600' },
          { label: 'Stripe verbunden', value: stats.withStripe, icon: Zap, gradient: 'from-amber-500 to-orange-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br",
                stat.gradient
              )} style={{ opacity: 0.05 }} />
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-xl bg-gradient-to-br text-white", stat.gradient)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Info Alert */}
      <Alert className="bg-blue-500/5 border-blue-500/20">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-700 dark:text-blue-400">Wie funktioniert die Stripe-Integration?</AlertTitle>
        <AlertDescription className="text-blue-600/80 dark:text-blue-300/80">
          Jeder Plan entspricht einem <strong>Stripe-Produkt</strong> mit 4 verschiedenen <strong>Preisen</strong> (1/3/6/12 Monate). 
          Die Testphase (Trial) wird automatisch beim Checkout angewendet. Beim Erstellen mit &quot;Mit Stripe synchronisieren&quot; 
          werden Produkt und Preise automatisch in Stripe angelegt.
        </AlertDescription>
      </Alert>

      {/* Plans Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'stylist' | 'salon')} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 p-1 h-12">
          <TabsTrigger value="stylist" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white">
            <Scissors className="h-4 w-4" />
            Stylisten ({groupedPlans.STYLIST.length})
          </TabsTrigger>
          <TabsTrigger value="salon" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
            <Building2 className="h-4 w-4" />
            Salon-Besitzer ({groupedPlans.SALON_OWNER.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stylist" className="space-y-6">
          <PlanGrid
            plans={groupedPlans.STYLIST}
            onEdit={openEditDialog}
            onDelete={handleDeletePlan}
            onSync={handleSyncToStripe}
            isSyncing={isSyncing}
            formatPrice={formatPrice}
            calculateSavings={calculateSavings}
          />
        </TabsContent>

        <TabsContent value="salon" className="space-y-6">
          <PlanGrid
            plans={groupedPlans.SALON_OWNER}
            onEdit={openEditDialog}
            onDelete={handleDeletePlan}
            onSync={handleSyncToStripe}
            isSyncing={isSyncing}
            formatPrice={formatPrice}
            calculateSavings={calculateSavings}
          />
        </TabsContent>
      </Tabs>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Edit2 className="h-5 w-5 text-primary" />
                  Plan bearbeiten
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-primary" />
                  Neuen Plan erstellen
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Definieren Sie die Details, Preise und Features für den Abonnement-Plan.
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
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={currentPlan.name || ''}
                    onChange={(e) => {
                      const name = e.target.value
                      setCurrentPlan({ 
                        ...currentPlan, 
                        name,
                        slug: currentPlan.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                      })
                    }}
                    placeholder="z.B. Professional"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL-Slug *</Label>
                  <Input
                    id="slug"
                    value={currentPlan.slug || ''}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="z.B. professional"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={currentPlan.description || ''}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, description: e.target.value })}
                  placeholder="Kurze Beschreibung für die Preisseite..."
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Zielgruppe *</Label>
                  <Select
                    value={currentPlan.planType}
                    onValueChange={(value) => setCurrentPlan({ ...currentPlan, planType: value as 'SALON_OWNER' | 'STYLIST' })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STYLIST">
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-purple-500" />
                          Stuhlmieter / Stylist
                        </div>
                      </SelectItem>
                      <SelectItem value="SALON_OWNER">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          Salon-Besitzer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trialDays" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Testphase (Tage)
                  </Label>
                  <Input
                    id="trialDays"
                    type="number"
                    min="0"
                    max="90"
                    value={currentPlan.trialDays || 14}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, trialDays: parseInt(e.target.value) || 0 })}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nutzer können den Plan {currentPlan.trialDays || 14} Tage kostenlos testen
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Preis-Kalkulator */}
            <PriceCalculator
              basePrice={currentPlan.priceMonthly || 0}
              onBasePriceChange={(price) => setCurrentPlan({ ...currentPlan, priceMonthly: price })}
              prices={{
                priceMonthly: currentPlan.priceMonthly || 0,
                priceQuarterly: currentPlan.priceQuarterly || 0,
                priceSixMonths: currentPlan.priceSixMonths || 0,
                priceYearly: currentPlan.priceYearly || 0
              }}
              onPricesChange={(prices) => setCurrentPlan({ ...currentPlan, ...prices })}
              discounts={planDiscounts}
              onDiscountsChange={setPlanDiscounts}
              roundingEnabled={priceRoundingEnabled}
              onRoundingChange={setPriceRoundingEnabled}
              roundingTarget={billingSettings.priceRoundingTarget}
            />

            <Separator />

            {/* AI Credits inklusive */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI-Credits inklusive
              </h3>
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/5 via-pink-500/5 to-orange-500/5 border">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="includedAiCreditsEur" className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-primary" />
                      Inkludiertes AI-Budget (€/Monat)
                    </Label>
                    <div className="relative">
                      <Input
                        id="includedAiCreditsEur"
                        type="number"
                        min="0"
                        step="0.50"
                        value={currentPlan.includedAiCreditsEur || ''}
                        onChange={(e) => setCurrentPlan({ 
                          ...currentPlan, 
                          includedAiCreditsEur: parseFloat(e.target.value) || 0 
                        })}
                        placeholder="0.00"
                        className="h-11 pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Monatliches AI-Budget, das im Abo enthalten ist
                    </p>
                  </div>
                  <div className="flex items-center justify-center p-4">
                    <div className="text-center space-y-2">
                      <div className="p-3 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white mx-auto w-fit">
                        <Bot className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium">
                        {currentPlan.includedAiCreditsEur ? (
                          <>
                            <span className="text-lg font-bold text-primary">{currentPlan.includedAiCreditsEur}€</span>
                            <br />
                            <span className="text-muted-foreground">AI-Credits / Monat</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Keine AI-Credits inklusive</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                  💡 Diese Credits werden automatisch vom monatlichen AI-Verbrauch abgezogen. 
                  Verbrauch darüber hinaus wird per Metered Billing berechnet.
                </p>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Features
              </h3>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Feature hinzufügen (z.B. 'Unbegrenzte Buchungen')..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  className="h-11"
                />
                <Button type="button" onClick={addFeature} variant="secondary" className="h-11 px-4">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {currentPlan.features?.map((feature, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
                {(!currentPlan.features || currentPlan.features.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Noch keine Features hinzugefügt
                  </p>
                )}
              </div>
            </div>

            {/* Limits für Salon-Besitzer */}
            {currentPlan.planType === 'SALON_OWNER' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Limits
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="maxChairs">Max. Stühle</Label>
                      <Input
                        id="maxChairs"
                        type="number"
                        min="0"
                        value={currentPlan.maxChairs || ''}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, maxChairs: parseInt(e.target.value) || null })}
                        placeholder="Unbegrenzt"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxBookings">Max. Buchungen/Monat</Label>
                      <Input
                        id="maxBookings"
                        type="number"
                        min="0"
                        value={currentPlan.maxBookings || ''}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, maxBookings: parseInt(e.target.value) || null })}
                        placeholder="Unbegrenzt"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxCustomers">Max. Kunden</Label>
                      <Input
                        id="maxCustomers"
                        type="number"
                        min="0"
                        value={currentPlan.maxCustomers || ''}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, maxCustomers: parseInt(e.target.value) || null })}
                        placeholder="Unbegrenzt"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Optionen */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Optionen
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="space-y-0.5">
                    <p className="font-medium">Plan aktiv</p>
                    <p className="text-sm text-muted-foreground">Plan ist für neue Abonnements verfügbar</p>
                  </div>
                  <Switch
                    checked={currentPlan.isActive ?? true}
                    onCheckedChange={(checked) => setCurrentPlan({ ...currentPlan, isActive: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="space-y-0.5">
                    <p className="font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      Als &quot;Beliebt&quot; markieren
                    </p>
                    <p className="text-sm text-muted-foreground">Wird hervorgehoben auf der Preisseite angezeigt</p>
                  </div>
                  <Switch
                    checked={currentPlan.isPopular ?? false}
                    onCheckedChange={(checked) => setCurrentPlan({ ...currentPlan, isPopular: checked })}
                  />
                </div>
                {!isEditing && (
                  <div className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5">
                    <div className="space-y-0.5">
                      <p className="font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        Mit Stripe synchronisieren
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Erstellt automatisch ein Stripe-Produkt mit 4 Preisen
                      </p>
                    </div>
                    <Switch
                      checked={syncToStripe}
                      onCheckedChange={setSyncToStripe}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSavePlan} 
              disabled={isSaving}
              className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Plan Grid Component
function PlanGrid({
  plans,
  onEdit,
  onDelete,
  onSync,
  isSyncing,
  formatPrice,
  calculateSavings
}: {
  plans: SubscriptionPlan[]
  onEdit: (plan: SubscriptionPlan) => void
  onDelete: (id: string) => void
  onSync: (id: string) => void
  isSyncing: boolean
  formatPrice: (price: number) => string
  calculateSavings: (monthly: number, total: number, months: number) => number
}) {
  if (plans.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Keine Pläne vorhanden</p>
            <p className="text-sm text-muted-foreground mt-1">
              Erstellen Sie einen neuen Plan, um zu beginnen.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan, index) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="h-full"
        >
          <Card className={cn(
            "relative h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl",
            plan.isPopular && "ring-2 ring-primary shadow-lg shadow-primary/10",
            !plan.isActive && "opacity-60"
          )}>
            {/* Popular Badge */}
            {plan.isPopular && (
              <div className="absolute -right-12 top-6 rotate-45 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold py-1 px-12 shadow-lg">
                Beliebt
              </div>
            )}

            {/* Status Badge */}
            {!plan.isActive && (
              <div className="absolute left-4 top-4">
                <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Inaktiv
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    {plan.isPopular ? (
                      <Crown className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-primary" />
                    )}
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
                </div>
              </div>

              {/* Trial Badge */}
              {plan.trialDays > 0 && (
                <Badge variant="outline" className="w-fit mt-2 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                  <Clock className="h-3 w-3 mr-1" />
                  {plan.trialDays} Tage kostenlos testen
                </Badge>
              )}

              {/* AI Credits Badge */}
              {plan.includedAiCreditsEur > 0 && (
                <Badge variant="outline" className="w-fit mt-2 bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800">
                  <Bot className="h-3 w-3 mr-1" />
                  {plan.includedAiCreditsEur}€ AI-Credits/Monat
                </Badge>
              )}
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              {/* Main Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {formatPrice(Number(plan.priceMonthly))}
                  </span>
                  <span className="text-muted-foreground">/Monat</span>
                </div>
                
                {/* All Prices Grid */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {INTERVALS.slice(1).map((interval) => {
                    const priceValue = interval.field === 'priceQuarterly' ? plan.priceQuarterly 
                      : interval.field === 'priceSixMonths' ? plan.priceSixMonths 
                      : plan.priceYearly
                    const price = Number(priceValue)
                    const savings = calculateSavings(Number(plan.priceMonthly), price, interval.months)
                    return (
                      <div key={interval.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">{interval.label}</span>
                        <div className="text-right">
                          <span className="font-medium">{formatPrice(price)}</span>
                          {savings > 0 && (
                            <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                              -{savings}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div className="space-y-2 min-h-[120px]">
                {plan.features.slice(0, 5).map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
                {plan.features.length > 5 && (
                  <p className="text-sm text-muted-foreground pl-6">
                    +{plan.features.length - 5} weitere
                  </p>
                )}
                {plan.features.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Keine Features definiert
                  </p>
                )}
              </div>

              {/* Limits */}
              {(plan.maxChairs || plan.maxBookings || plan.maxCustomers) && (
                <>
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {plan.maxChairs && (
                      <Badge variant="outline" className="text-xs">
                        {plan.maxChairs} Stühle
                      </Badge>
                    )}
                    {plan.maxBookings && (
                      <Badge variant="outline" className="text-xs">
                        {plan.maxBookings} Buchungen/M
                      </Badge>
                    )}
                    {plan.maxCustomers && (
                      <Badge variant="outline" className="text-xs">
                        {plan.maxCustomers} Kunden
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="flex-col gap-3 pt-4 border-t bg-muted/30">
              {/* Stripe Status */}
              <div className="w-full flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Stripe Status</span>
                {plan.stripeProductId ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 cursor-help">
                          <Cloud className="h-3 w-3 mr-1" />
                          Verbunden
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono text-xs">{plan.stripeProductId}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    <CloudOff className="h-3 w-3 mr-1" />
                    Nicht verbunden
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="w-full flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onEdit(plan)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Button>
                {!plan.stripeProductId && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSync(plan.id)}
                          disabled={isSyncing}
                        >
                          {isSyncing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mit Stripe synchronisieren</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {plan.isActive && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => onDelete(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Plan deaktivieren</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
