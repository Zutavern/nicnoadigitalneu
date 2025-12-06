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
  Shield
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

function BillingContent() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null)

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
  }, [])

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

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchSubscription}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Aktualisieren
                </Button>
                {!data.subscription.cancelAtPeriodEnd && (
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
                  ) : (
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
                      {data.hasActiveSubscription ? 'Wechseln' : 'Jetzt starten'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          )
        })}
      </div>

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

