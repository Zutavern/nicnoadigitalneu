'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Check,
  X,
  Crown,
  Sparkles,
  Star,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  RefreshCw,
  ExternalLink,
  Zap,
  Shield,
  FileText,
  Download,
  Receipt,
  Pause,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
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
  isPopular: boolean
  trialDays: number
}

interface SubscriptionData {
  subscription: {
    status: string
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
    billingInterval: string
  }
  currentPlan: SubscriptionPlan | null
  availablePlans: SubscriptionPlan[]
  hasActiveSubscription: boolean
}

interface Invoice {
  id: string
  number: string | null
  status: string | null
  amount: number
  currency: string
  created: number
  periodStart: number
  periodEnd: number
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
  paid: boolean
  description: string
}

function BillingContent() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
  const [isPausing, setIsPausing] = useState(false)
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false)
  const [selectedNewPlan, setSelectedNewPlan] = useState<string | null>(null)
  const [prorationPreview, setProrationPreview] = useState<{
    immediateCharge: number
    nextInvoice: number
    isUpgrade: boolean
  } | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [isChangingPlan, setIsChangingPlan] = useState(false)

  // Handle success/cancel from Stripe
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    
    if (success === 'true') {
      toast.success('Abonnement erfolgreich abgeschlossen!')
    } else if (canceled === 'true') {
      toast.info('Checkout abgebrochen')
    }
  }, [searchParams])

  useEffect(() => {
    fetchSubscription()
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setIsLoadingInvoices(true)
    try {
      const res = await fetch('/api/stripe/invoices')
      if (!res.ok) throw new Error('Failed to fetch invoices')
      const { invoices: invoiceData } = await res.json()
      setInvoices(invoiceData || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setIsLoadingInvoices(false)
    }
  }

  const fetchSubscription = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/user/subscription')
      if (!res.ok) throw new Error('Failed to fetch subscription')
      const subscriptionData = await res.json()
      setData(subscriptionData)
    } catch (error) {
      console.error('Error fetching subscription:', error)
      toast.error('Fehler beim Laden der Abonnement-Daten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    setIsSubscribing(planId)
    try {
      const res = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, interval: selectedInterval })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Erstellen des Abonnements')
      }

      const { checkoutUrl } = await res.json()
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      }
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Fehler beim Abonnieren')
    } finally {
      setIsSubscribing(null)
    }
  }

  const handlePauseSubscription = async () => {
    setIsPausing(true)
    try {
      const res = await fetch('/api/stripe/subscription/pause', {
        method: data?.subscription?.status === 'paused' ? 'DELETE' : 'POST'
      })

      if (!res.ok) throw new Error('Failed to pause/resume subscription')

      const result = await res.json()
      toast.success(result.message)
      fetchSubscription()
    } catch (error) {
      toast.error('Fehler beim Ändern des Abonnement-Status')
      console.error(error)
    } finally {
      setIsPausing(false)
    }
  }

  const handleLoadProrationPreview = async (planId: string) => {
    setSelectedNewPlan(planId)
    setIsLoadingPreview(true)
    try {
      const res = await fetch(`/api/stripe/subscription/change?planId=${planId}&interval=${selectedInterval.toUpperCase()}`)
      if (!res.ok) throw new Error('Failed to load preview')
      
      const result = await res.json()
      setProrationPreview(result.preview)
      setChangePlanDialogOpen(true)
    } catch (error) {
      toast.error('Fehler beim Laden der Vorschau')
      console.error(error)
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleChangePlan = async () => {
    if (!selectedNewPlan) return
    
    setIsChangingPlan(true)
    try {
      const res = await fetch('/api/stripe/subscription/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedNewPlan,
          interval: selectedInterval.toUpperCase()
        })
      })

      if (!res.ok) throw new Error('Failed to change plan')

      const result = await res.json()
      toast.success(result.message)
      setChangePlanDialogOpen(false)
      setProrationPreview(null)
      setSelectedNewPlan(null)
      fetchSubscription()
    } catch (error) {
      toast.error('Fehler beim Plan-Wechsel')
      console.error(error)
    } finally {
      setIsChangingPlan(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCanceling(true)
    try {
      const res = await fetch('/api/user/subscription', {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to cancel subscription')

      const result = await res.json()
      toast.success(result.message)
      setCancelDialogOpen(false)
      fetchSubscription()
    } catch (error) {
      toast.error('Fehler beim Kündigen des Abonnements')
    } finally {
      setIsCanceling(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getPrice = (plan: SubscriptionPlan) => {
    switch (selectedInterval) {
      case 'yearly':
        return Number(plan.priceYearly)
      case 'quarterly':
        return Number(plan.priceQuarterly)
      default:
        return Number(plan.priceMonthly)
    }
  }

  const getMonthlyEquivalent = (plan: SubscriptionPlan) => {
    switch (selectedInterval) {
      case 'yearly':
        return Number(plan.priceYearly) / 12
      case 'quarterly':
        return Number(plan.priceQuarterly) / 3
      default:
        return Number(plan.priceMonthly)
    }
  }

  const calculateSavings = (plan: SubscriptionPlan) => {
    const monthly = Number(plan.priceMonthly)
    let total: number
    let periods: number

    switch (selectedInterval) {
      case 'yearly':
        total = Number(plan.priceYearly)
        periods = 12
        break
      case 'quarterly':
        total = Number(plan.priceQuarterly)
        periods = 3
        break
      default:
        return 0
    }

    const regularTotal = monthly * periods
    return Math.round(((regularTotal - total) / regularTotal) * 100)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Aktiv</Badge>
      case 'trialing':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Testphase</Badge>
      case 'past_due':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Überfällig</Badge>
      case 'canceled':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Gekündigt</Badge>
      default:
        return <Badge variant="outline">Kein Abo</Badge>
    }
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
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-primary" />
          Abonnement & Abrechnung
        </h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihr Abonnement und Ihre Zahlungsinformationen
        </p>
      </div>

      {/* Success/Error Messages */}
      {searchParams.get('success') === 'true' && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Erfolgreich!</AlertTitle>
          <AlertDescription>
            Ihr Abonnement wurde erfolgreich aktiviert. Willkommen bei NICNOA!
          </AlertDescription>
        </Alert>
      )}

      {/* Current Subscription */}
      {data?.currentPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Aktuelles Abonnement
                  </CardTitle>
                  <CardDescription>Ihr aktiver Plan</CardDescription>
                </div>
                {getStatusBadge(data.subscription.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{data.currentPlan.name}</h3>
                  <p className="text-muted-foreground">{data.currentPlan.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">
                    {formatPrice(getPrice(data.currentPlan))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    /{data.subscription.billingInterval === 'yearly' ? 'Jahr' : 
                      data.subscription.billingInterval === 'quarterly' ? 'Quartal' : 'Monat'}
                  </p>
                </div>
              </div>

              {data.subscription.currentPeriodEnd && (
                <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {data.subscription.cancelAtPeriodEnd 
                        ? 'Abonnement endet am'
                        : 'Nächste Abrechnung'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(data.subscription.currentPeriodEnd).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {data.subscription.cancelAtPeriodEnd && (
                    <Badge variant="outline" className="ml-auto text-yellow-500 border-yellow-500/30">
                      Wird gekündigt
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={fetchSubscription}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Aktualisieren
                </Button>
                
                {/* Pause/Resume Button */}
                {data.subscription.status === 'active' && !data.subscription.cancelAtPeriodEnd && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePauseSubscription}
                    disabled={isPausing}
                  >
                    {isPausing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Pause className="mr-2 h-4 w-4" />
                    )}
                    Pausieren
                  </Button>
                )}
                
                {data.subscription.status === 'paused' && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handlePauseSubscription}
                    disabled={isPausing}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isPausing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    Fortsetzen
                  </Button>
                )}
                
                {!data.subscription.cancelAtPeriodEnd && data.subscription.status !== 'paused' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    Abonnement kündigen
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Active Subscription */}
      {!data?.hasActiveSubscription && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kein aktives Abonnement</AlertTitle>
          <AlertDescription>
            Wählen Sie einen Plan aus, um alle Funktionen von NICNOA zu nutzen.
          </AlertDescription>
        </Alert>
      )}

      {/* Billing Interval Selector */}
      <div className="flex justify-center">
        <div className="inline-flex items-center p-1 bg-muted rounded-lg">
          {[
            { value: 'monthly', label: 'Monatlich' },
            { value: 'quarterly', label: 'Quartal', discount: '10%' },
            { value: 'yearly', label: 'Jährlich', discount: '20%' }
          ].map((interval) => (
            <button
              key={interval.value}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedInterval === interval.value
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setSelectedInterval(interval.value as typeof selectedInterval)}
            >
              {interval.label}
              {interval.discount && (
                <Badge variant="secondary" className="text-xs">
                  -{interval.discount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Available Plans */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.availablePlans.map((plan, index) => {
          const isCurrentPlan = data.currentPlan?.id === plan.id
          const savings = calculateSavings(plan)

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full flex flex-col ${
                plan.isPopular ? 'border-primary ring-2 ring-primary/20' : ''
              } ${isCurrentPlan ? 'border-green-500 bg-green-500/5' : ''}`}>
                {plan.isPopular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Beliebt
                    </Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-500 text-white">
                      <Check className="h-3 w-3 mr-1" />
                      Aktueller Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {plan.isPopular ? (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-primary" />
                    )}
                    {plan.name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">
                        {formatPrice(getMonthlyEquivalent(plan))}
                      </span>
                      <span className="text-muted-foreground">/Monat</span>
                    </div>
                    {selectedInterval !== 'monthly' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatPrice(getPrice(plan))} pro {selectedInterval === 'yearly' ? 'Jahr' : 'Quartal'}
                        {savings > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Spare {savings}%
                          </Badge>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Trial */}
                  {!data.hasActiveSubscription && plan.trialDays > 0 && (
                    <div className="flex items-center justify-center gap-2 p-2 bg-primary/5 rounded-lg">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm">{plan.trialDays} Tage kostenlos testen</span>
                    </div>
                  )}

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limits */}
                  {(plan.maxBookings || plan.maxCustomers || plan.maxChairs) && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Inklusive:</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.maxChairs && (
                          <Badge variant="outline">{plan.maxChairs === null ? '∞' : plan.maxChairs} Stühle</Badge>
                        )}
                        {plan.maxBookings && (
                          <Badge variant="outline">{plan.maxBookings === null ? '∞' : plan.maxBookings} Buchungen/Monat</Badge>
                        )}
                        {plan.maxCustomers && (
                          <Badge variant="outline">{plan.maxCustomers === null ? '∞' : plan.maxCustomers} Kunden</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      <Check className="mr-2 h-4 w-4" />
                      Aktiver Plan
                    </Button>
                  ) : data.hasActiveSubscription && data.currentPlan?.id !== plan.id ? (
                    // Plan-Wechsel Button mit Proration-Vorschau
                    <Button
                      className="w-full"
                      variant={plan.isPopular ? 'default' : 'outline'}
                      onClick={() => handleLoadProrationPreview(plan.id)}
                      disabled={isLoadingPreview || isSubscribing !== null}
                    >
                      {isLoadingPreview && selectedNewPlan === plan.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : Number(plan.priceMonthly) > Number(data.currentPlan?.priceMonthly || 0) ? (
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="mr-2 h-4 w-4" />
                      )}
                      {Number(plan.priceMonthly) > Number(data.currentPlan?.priceMonthly || 0) 
                        ? 'Upgrade' 
                        : 'Downgrade'}
                    </Button>
                  ) : !data.hasActiveSubscription ? (
                    // Neu-Abo Button
                    <Button
                      className="w-full"
                      variant={plan.isPopular ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isSubscribing !== null}
                    >
                      {isSubscribing === plan.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      Jetzt starten
                    </Button>
                  ) : (
                    // Aktueller Plan
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      Aktueller Plan
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Invoices Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Rechnungen
                </CardTitle>
                <CardDescription>Ihre bisherigen Rechnungen und Zahlungen</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchInvoices} disabled={isLoadingInvoices}>
                {isLoadingInvoices ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingInvoices ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Noch keine Rechnungen vorhanden</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 6).map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        invoice.paid 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Rechnung {invoice.number || invoice.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.created).toLocaleDateString('de-DE', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(invoice.amount)}
                        </p>
                        <Badge 
                          variant={invoice.paid ? 'default' : 'secondary'}
                          className={invoice.paid ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                        >
                          {invoice.paid ? 'Bezahlt' : invoice.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {invoice.hostedInvoiceUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="Rechnung ansehen"
                          >
                            <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {invoice.invoicePdf && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="PDF herunterladen"
                          >
                            <a href={invoice.invoicePdf} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {invoices.length > 6 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm" asChild>
                      <a href="#" onClick={async (e) => {
                        e.preventDefault()
                        const res = await fetch('/api/stripe/portal', { method: 'POST' })
                        const { url } = await res.json()
                        if (url) window.location.href = url
                      }}>
                        Alle Rechnungen anzeigen
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Notice */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Sichere Zahlung</h3>
              <p className="text-sm text-muted-foreground">
                Alle Zahlungen werden sicher über Stripe abgewickelt. Ihre Kreditkartendaten werden 
                nie auf unseren Servern gespeichert.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abonnement kündigen?</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie Ihr Abonnement kündigen möchten? Sie können NICNOA bis 
              zum Ende Ihrer aktuellen Abrechnungsperiode weiter nutzen.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription>
                Nach der Kündigung verlieren Sie den Zugriff auf alle Premium-Funktionen.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={isCanceling}
            >
              {isCanceling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ja, kündigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan-Wechsel Dialog */}
      <Dialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {prorationPreview?.isUpgrade ? (
                <>
                  <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                  Upgrade bestätigen
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-5 w-5 text-amber-500" />
                  Downgrade bestätigen
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {prorationPreview?.isUpgrade 
                ? 'Sie wechseln zu einem höheren Plan mit mehr Funktionen.'
                : 'Sie wechseln zu einem niedrigeren Plan mit weniger Funktionen.'}
            </DialogDescription>
          </DialogHeader>
          
          {prorationPreview && (
            <div className="py-4 space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sofort fällig:</span>
                  <span className="font-semibold text-lg">
                    {prorationPreview.immediateCharge > 0 
                      ? `€${prorationPreview.immediateCharge.toFixed(2)}`
                      : '€0,00 (Gutschrift)'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Nächste Rechnung:</span>
                  <span>€{prorationPreview.nextInvoice.toFixed(2)}</span>
                </div>
              </div>
              
              {prorationPreview.immediateCharge > 0 && (
                <Alert className="bg-blue-500/10 border-blue-500/20">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-sm">
                    Der Betrag wird anteilig berechnet und sofort von Ihrer Zahlungsmethode abgebucht.
                  </AlertDescription>
                </Alert>
              )}
              
              {prorationPreview.immediateCharge <= 0 && (
                <Alert className="bg-emerald-500/10 border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <AlertDescription className="text-sm">
                    Die Differenz wird Ihrem Guthaben gutgeschrieben und bei der nächsten Rechnung verrechnet.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setChangePlanDialogOpen(false)
                setProrationPreview(null)
                setSelectedNewPlan(null)
              }}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleChangePlan}
              disabled={isChangingPlan}
              className={prorationPreview?.isUpgrade 
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'}
            >
              {isChangingPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Plan wechseln
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BillingLoading() {
  return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingLoading />}>
      <BillingContent />
    </Suspense>
  )
}

