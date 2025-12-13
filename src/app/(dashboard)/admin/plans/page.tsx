'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Users,
  Building2,
  Scissors,
  Star,
  Loader2,
  Save,
  RefreshCw,
  ExternalLink,
  Zap,
  Crown,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
import { toast } from 'sonner'

interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string | null
  planType: 'SALON_OWNER' | 'STYLIST'
  priceMonthly: number
  priceQuarterly: number
  priceYearly: number
  features: string[]
  maxChairs: number | null
  maxBookings: number | null
  maxCustomers: number | null
  isActive: boolean
  isPopular: boolean
  sortOrder: number
  trialDays: number
  stripeProductId: string | null
  stripePriceMonthly: string | null
  stripePriceQuarterly: string | null
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
  priceYearly: 0,
  features: [],
  maxChairs: null,
  maxBookings: null,
  maxCustomers: null,
  isActive: true,
  isPopular: false,
  sortOrder: 0,
  trialDays: 14
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

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/plans?includeInactive=true')
      if (!res.ok) throw new Error('Failed to fetch plans')
      const data = await res.json()
      setPlans(data.plans)
      setGroupedPlans(data.groupedPlans)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast.error('Fehler beim Laden der Pläne')
    } finally {
      setIsLoading(false)
    }
  }

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
    } catch (error) {
      toast.error('Fehler beim Deaktivieren')
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

  const calculateSavings = (monthly: number, yearly: number) => {
    const yearlyFromMonthly = monthly * 12
    const savings = ((yearlyFromMonthly - yearly) / yearlyFromMonthly) * 100
    return Math.round(savings)
  }

  if (isLoading) {
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
            <CreditCard className="h-8 w-8 text-primary" />
            Abonnement-Pläne
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie die Preispläne für Salon-Besitzer und Stylisten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPlans}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openEditDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Neuer Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Plan bearbeiten' : 'Neuen Plan erstellen'}</DialogTitle>
                <DialogDescription>
                  Definieren Sie die Details und Preise für den Abonnement-Plan.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Grundinfos */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={currentPlan.name || ''}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                      placeholder="z.B. Professional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={currentPlan.slug || ''}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      placeholder="z.B. professional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={currentPlan.description || ''}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, description: e.target.value })}
                    placeholder="Kurze Beschreibung des Plans..."
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Plan-Typ *</Label>
                    <Select
                      value={currentPlan.planType}
                      onValueChange={(value) => setCurrentPlan({ ...currentPlan, planType: value as 'SALON_OWNER' | 'STYLIST' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SALON_OWNER">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Salon-Besitzer
                          </div>
                        </SelectItem>
                        <SelectItem value="STYLIST">
                          <div className="flex items-center gap-2">
                            <Scissors className="h-4 w-4" />
                            Stylist (Stuhlmieter)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trialDays">Testphase (Tage)</Label>
                    <Input
                      id="trialDays"
                      type="number"
                      min="0"
                      max="90"
                      value={currentPlan.trialDays || 14}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, trialDays: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Preise */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Preise</Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="priceMonthly">Monatlich (€) *</Label>
                      <Input
                        id="priceMonthly"
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentPlan.priceMonthly || ''}
                        onChange={(e) => {
                          const monthly = parseFloat(e.target.value) || 0
                          setCurrentPlan({
                            ...currentPlan,
                            priceMonthly: monthly,
                            priceQuarterly: currentPlan.priceQuarterly || Math.round(monthly * 3 * 0.9 * 100) / 100,
                            priceYearly: currentPlan.priceYearly || Math.round(monthly * 12 * 0.8 * 100) / 100
                          })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceQuarterly">Quartal (€)</Label>
                      <Input
                        id="priceQuarterly"
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentPlan.priceQuarterly || ''}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, priceQuarterly: parseFloat(e.target.value) || 0 })}
                      />
                      <p className="text-xs text-muted-foreground">~10% Ersparnis</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceYearly">Jährlich (€)</Label>
                      <Input
                        id="priceYearly"
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentPlan.priceYearly || ''}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, priceYearly: parseFloat(e.target.value) || 0 })}
                      />
                      <p className="text-xs text-muted-foreground">~20% Ersparnis</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Features</Label>
                  <div className="flex gap-2">
                    <Input
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="Neues Feature hinzufügen..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button type="button" onClick={addFeature} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {currentPlan.features?.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <span className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          {feature}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limits (für Salon-Besitzer) */}
                {currentPlan.planType === 'SALON_OWNER' && (
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Limits</Label>
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
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Optionen */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Optionen</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Plan aktiv</p>
                        <p className="text-sm text-muted-foreground">Plan ist für neue Abonnements verfügbar</p>
                      </div>
                      <Switch
                        checked={currentPlan.isActive ?? true}
                        onCheckedChange={(checked) => setCurrentPlan({ ...currentPlan, isActive: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Als "Beliebt" markieren</p>
                        <p className="text-sm text-muted-foreground">Wird hervorgehoben angezeigt</p>
                      </div>
                      <Switch
                        checked={currentPlan.isPopular ?? false}
                        onCheckedChange={(checked) => setCurrentPlan({ ...currentPlan, isPopular: checked })}
                      />
                    </div>
                    {!isEditing && (
                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            Mit Stripe synchronisieren
                          </p>
                          <p className="text-sm text-muted-foreground">Produkt und Preise in Stripe erstellen</p>
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

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleSavePlan} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Speichern' : 'Erstellen'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: 'Gesamt', value: stats.total, icon: CreditCard, color: 'text-primary' },
          { label: 'Aktiv', value: stats.active, icon: Check, color: 'text-green-500' },
          { label: 'Salon-Besitzer', value: stats.salonOwnerPlans, icon: Building2, color: 'text-blue-500' },
          { label: 'Stylisten', value: stats.stylistPlans, icon: Scissors, color: 'text-purple-500' },
          { label: 'Mit Stripe', value: stats.withStripe, icon: Zap, color: 'text-yellow-500' }
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans by Type */}
      <Tabs defaultValue="stylist" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stylist" className="flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Stylisten-Pläne ({groupedPlans.STYLIST.length})
          </TabsTrigger>
          <TabsTrigger value="salon" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Salon-Besitzer-Pläne ({groupedPlans.SALON_OWNER.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stylist" className="space-y-6">
          <PlanGrid
            plans={groupedPlans.STYLIST}
            onEdit={openEditDialog}
            onDelete={handleDeletePlan}
            formatPrice={formatPrice}
            calculateSavings={calculateSavings}
          />
        </TabsContent>

        <TabsContent value="salon" className="space-y-6">
          <PlanGrid
            plans={groupedPlans.SALON_OWNER}
            onEdit={openEditDialog}
            onDelete={handleDeletePlan}
            formatPrice={formatPrice}
            calculateSavings={calculateSavings}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Plan Grid Component
function PlanGrid({
  plans,
  onEdit,
  onDelete,
  formatPrice,
  calculateSavings
}: {
  plans: SubscriptionPlan[]
  onEdit: (plan: SubscriptionPlan) => void
  onDelete: (id: string) => void
  formatPrice: (price: number) => string
  calculateSavings: (monthly: number, yearly: number) => number
}) {
  if (plans.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Keine Pläne vorhanden</p>
        <p className="text-sm text-muted-foreground mt-2">
          Erstellen Sie einen neuen Plan, um zu beginnen.
        </p>
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
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`relative overflow-hidden ${plan.isPopular ? 'border-primary ring-2 ring-primary/20' : ''} ${!plan.isActive ? 'opacity-60' : ''}`}>
            {plan.isPopular && (
              <div className="absolute top-0 right-0">
                <Badge className="rounded-none rounded-bl-lg bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Beliebt
                </Badge>
              </div>
            )}

            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.isPopular ? <Crown className="h-5 w-5 text-yellow-500" /> : <Sparkles className="h-5 w-5 text-primary" />}
                    {plan.name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                {!plan.isActive && (
                  <Badge variant="outline" className="text-red-500">
                    Inaktiv
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Preise */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{formatPrice(Number(plan.priceMonthly))}</span>
                  <span className="text-muted-foreground">/Monat</span>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{formatPrice(Number(plan.priceQuarterly))}/Quartal</span>
                  <span className="flex items-center gap-1">
                    {formatPrice(Number(plan.priceYearly))}/Jahr
                    <Badge variant="secondary" className="text-xs">
                      -{calculateSavings(Number(plan.priceMonthly), Number(plan.priceYearly))}%
                    </Badge>
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                {plan.features.slice(0, 5).map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
                {plan.features.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    +{plan.features.length - 5} weitere Features
                  </p>
                )}
              </div>

              {/* Limits */}
              {(plan.maxChairs || plan.maxBookings || plan.maxCustomers) && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Limits:</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {plan.maxChairs && (
                      <Badge variant="outline">{plan.maxChairs} Stühle</Badge>
                    )}
                    {plan.maxBookings && (
                      <Badge variant="outline">{plan.maxBookings} Buchungen/Monat</Badge>
                    )}
                    {plan.maxCustomers && (
                      <Badge variant="outline">{plan.maxCustomers} Kunden</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Stripe Status */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stripe</span>
                  {plan.stripeProductId ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      <Check className="h-3 w-3 mr-1" />
                      Verbunden
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Nicht konfiguriert
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onEdit(plan)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Button>
                {plan.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => onDelete(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}










