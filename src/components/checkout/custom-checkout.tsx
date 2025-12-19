'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  LinkAuthenticationElement,
  AddressElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle, Shield, Lock, CreditCard, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { BillingInterval } from '@prisma/client'
import { cn } from '@/lib/utils'
import { getStripeAppearance } from '@/lib/stripe/appearance'
import confetti from 'canvas-confetti'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Plan Interface
interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  priceQuarterly: number
  priceSixMonths: number
  priceYearly: number
  features: string[]
  trialDays: number
  includedAiCreditsEur?: number
}

// Checkout Form Component (innerhalb von Elements)
function CheckoutForm({ 
  plan, 
  interval, 
  clientSecret,
  intentType,
  userType,
  onSuccess 
}: { 
  plan: Plan
  interval: BillingInterval
  clientSecret: string
  intentType: 'payment' | 'setup'
  userType: 'STYLIST' | 'SALON_OWNER'
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Submit elements first
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || 'Validierungsfehler')
        setIsProcessing(false)
        return
      }

      const returnUrl = `${window.location.origin}/${userType === 'STYLIST' ? 'stylist' : 'salon'}/checkout/success`

      // Use confirmSetup for SetupIntent (trial periods) or confirmPayment for PaymentIntent
      if (intentType === 'setup') {
        // SetupIntent: für Trial-Perioden ohne sofortige Zahlung
        const { error: confirmError } = await stripe.confirmSetup({
          elements,
          clientSecret,
          confirmParams: {
            return_url: returnUrl,
          },
          redirect: 'if_required',
        })

        if (confirmError) {
          setError(confirmError.message || 'Setup fehlgeschlagen')
          setIsProcessing(false)
        } else {
          // Setup erfolgreich (ohne Redirect)
          onSuccess()
        }
      } else {
        // PaymentIntent: für sofortige Zahlung
        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: returnUrl,
            receipt_email: email || undefined,
          },
          redirect: 'if_required',
        })

        if (confirmError) {
          setError(confirmError.message || 'Zahlung fehlgeschlagen')
          setIsProcessing(false)
        } else {
          // Zahlung erfolgreich (ohne Redirect)
          onSuccess()
        }
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* E-Mail mit Link Authentication */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">E-Mail-Adresse</label>
        <LinkAuthenticationElement 
          options={{
            defaultValues: { email: '' }
          }}
          onChange={(e) => {
            if (e.complete) {
              setEmail(e.value.email)
            }
          }}
        />
      </div>

      {/* Payment Element */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Zahlungsmethode</label>
        <PaymentElement 
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
            fields: {
              billingDetails: {
                address: {
                  country: 'auto',
                },
              },
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
          }}
        />
      </div>

      {/* Billing Address */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Rechnungsadresse</label>
        <AddressElement 
          options={{
            mode: 'billing',
            defaultValues: {
              address: {
                country: 'DE',
              },
            },
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full h-12 text-base font-medium"
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Wird verarbeitet...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            {intentType === 'setup' ? 'Kostenlos starten' : 'Jetzt zahlungspflichtig bestellen'}
          </>
        )}
      </Button>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          <span>SSL-verschlüsselt</span>
        </div>
        <div className="flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          <span>Sichere Zahlung via Stripe</span>
        </div>
      </div>
    </form>
  )
}

// Success View
function SuccessView({ plan, userType }: { plan: Plan; userType: 'STYLIST' | 'SALON_OWNER' }) {
  const router = useRouter()

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }, [])

  return (
    <div className="text-center space-y-6 py-8">
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Willkommen bei NICNOA Pro! 🎉</h2>
        <p className="text-muted-foreground">
          Deine Zahlung war erfolgreich. Du hast jetzt Zugriff auf alle Features von{' '}
          <span className="font-medium text-foreground">{plan.name}</span>.
        </p>
      </div>

      {plan.trialDays > 0 && (
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
          {plan.trialDays} Tage kostenlos testen
        </Badge>
      )}

      <Button 
        onClick={() => router.push(`/${userType === 'STYLIST' ? 'stylist' : 'salon'}/dashboard`)}
        className="w-full max-w-xs"
      >
        Zum Dashboard
      </Button>
    </div>
  )
}

// Main Checkout Component
interface CustomCheckoutProps {
  planId: string
  interval: BillingInterval
  userType: 'STYLIST' | 'SALON_OWNER'
}

export function CustomCheckout({ planId, interval, userType }: CustomCheckoutProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [intentType, setIntentType] = useState<'payment' | 'setup'>('payment')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Plan-Details und PaymentIntent/SetupIntent laden
  const initCheckout = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Plan laden
      const planRes = await fetch(`/api/plans/${planId}`)
      if (!planRes.ok) {
        throw new Error('Plan nicht gefunden')
      }
      const planData = await planRes.json()
      setPlan(planData.plan || planData)

      // PaymentIntent / SetupIntent erstellen
      const checkoutRes = await fetch('/api/stripe/create-checkout-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          interval,
          userType,
        }),
      })

      if (!checkoutRes.ok) {
        const errorData = await checkoutRes.json()
        throw new Error(errorData.error || 'Checkout-Session konnte nicht erstellt werden')
      }

      const checkoutData = await checkoutRes.json()
      setClientSecret(checkoutData.clientSecret)
      // Speichern ob es ein SetupIntent (Trial) oder PaymentIntent ist
      setIntentType(checkoutData.type === 'setup' ? 'setup' : 'payment')
    } catch (err) {
      console.error('Checkout init error:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
      toast.error(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }, [planId, interval, userType])

  useEffect(() => {
    initCheckout()
  }, [initCheckout])

  // Preis-Helper
  const getPriceForInterval = (p: Plan): number => {
    switch (interval) {
      case 'MONTHLY': return p.priceMonthly
      case 'QUARTERLY': return p.priceQuarterly
      case 'SIX_MONTHS': return p.priceSixMonths
      case 'YEARLY': return p.priceYearly
      default: return p.priceMonthly
    }
  }

  const getIntervalLabel = (): string => {
    switch (interval) {
      case 'MONTHLY': return 'monatlich'
      case 'QUARTERLY': return 'vierteljährlich'
      case 'SIX_MONTHS': return 'halbjährlich'
      case 'YEARLY': return 'jährlich'
      default: return ''
    }
  }

  const getMonthsForInterval = (): number => {
    switch (interval) {
      case 'QUARTERLY': return 3
      case 'SIX_MONTHS': return 6
      case 'YEARLY': return 12
      default: return 1
    }
  }

  // Dark Mode erkennen
  const isDarkMode = resolvedTheme === 'dark'

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Lade Checkout...</p>
      </div>
    )
  }

  // Error State
  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Fehler beim Laden</h2>
        <p className="text-muted-foreground mb-6">{error || 'Plan nicht gefunden'}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
      </div>
    )
  }

  // Success State
  if (isSuccess) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardContent className="pt-6">
          <SuccessView plan={plan} userType={userType} />
        </CardContent>
      </Card>
    )
  }

  const price = getPriceForInterval(plan)
  const months = getMonthsForInterval()
  const monthlyEquivalent = months > 0 ? Math.round(price / months) : price

  // Elements Options mit angepasstem Appearance
  const elementsOptions: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: getStripeAppearance(isDarkMode),
    locale: 'de',
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
      },
    ],
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Order Summary (Left/Top on Mobile) */}
      <div className="lg:w-[380px] flex-shrink-0 order-2 lg:order-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="text-xl">Deine Bestellung</CardTitle>
            <CardDescription>
              Upgrade zu {plan.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Laufzeit</span>
                <span className="font-medium capitalize">{getIntervalLabel()}</span>
              </div>
              
              <Separator />

              {/* Preis */}
              <div className="flex items-center justify-between text-lg">
                <span className="text-muted-foreground">Gesamt</span>
                <span className="font-bold">€{price.toFixed(2)}</span>
              </div>

              {monthlyEquivalent !== price && (
                <p className="text-sm text-muted-foreground text-right">
                  (entspricht €{monthlyEquivalent.toFixed(2)}/Monat)
                </p>
              )}
            </div>

            {/* AI Credits */}
            {plan.includedAiCreditsEur && plan.includedAiCreditsEur > 0 && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xl">🤖</span>
                  <span>
                    <span className="font-medium">€{plan.includedAiCreditsEur}</span>
                    {' '}AI-Guthaben/Monat inklusive
                  </span>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Inklusive:</p>
              <ul className="space-y-1.5">
                {plan.features.slice(0, 5).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
                {plan.features.length > 5 && (
                  <li className="text-xs text-muted-foreground/70 pl-6">
                    + {plan.features.length - 5} weitere Features
                  </li>
                )}
              </ul>
            </div>

            {/* Trial Badge */}
            {plan.trialDays > 0 && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  {plan.trialDays} Tage kostenlos testen
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checkout Form (Right/Bottom on Mobile) */}
      <Card className="flex-1 order-1 lg:order-2">
        <CardHeader>
          <CardTitle className="text-xl">Zahlungsinformationen</CardTitle>
          <CardDescription>
            Sichere Zahlung über Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientSecret ? (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <CheckoutForm 
                plan={plan}
                interval={interval}
                clientSecret={clientSecret}
                intentType={intentType}
                userType={userType}
                onSuccess={() => setIsSuccess(true)}
              />
            </Elements>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



