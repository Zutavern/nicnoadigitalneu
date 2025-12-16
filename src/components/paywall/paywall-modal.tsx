'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles, ArrowRight, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IntervalSelector } from './interval-selector'
import { PlanCard, type Plan } from './plan-card'
import { BillingInterval } from '@prisma/client'
import { toast } from 'sonner'
import { posthog } from '@/components/providers/posthog-provider'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  userType: 'STYLIST' | 'SALON_OWNER'
  trigger?: string
}

export function PaywallModal({ isOpen, onClose, userType, trigger }: PaywallModalProps) {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('MONTHLY')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Pläne laden wenn Modal geöffnet wird
  useEffect(() => {
    if (isOpen) {
      // Track paywall shown event
      posthog?.capture('paywall_shown', {
        trigger,
        user_type: userType,
      })

      setIsLoading(true)
      fetch(`/api/plans?type=${userType}`)
        .then(res => res.json())
        .then(data => {
          setPlans(data.plans || [])
          // Standard: Popular Plan auswählen
          const popularPlan = data.plans?.find((p: Plan) => p.isPopular)
          if (popularPlan) {
            setSelectedPlan(popularPlan.id)
          } else if (data.plans?.length > 0) {
            setSelectedPlan(data.plans[0].id)
          }
        })
        .catch(error => {
          console.error('Error loading plans:', error)
          toast.error('Fehler beim Laden der Pläne')
        })
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, userType, trigger])

  // Checkout starten
  const handleCheckout = async () => {
    if (!selectedPlan) {
      toast.error('Bitte wähle einen Plan aus')
      return
    }

    // Track CTA clicked event
    const selectedPlanData = plans.find(p => p.id === selectedPlan)
    posthog?.capture('paywall_cta_clicked', {
      plan_id: selectedPlan,
      plan_name: selectedPlanData?.name,
      interval: selectedInterval,
    })

    setIsCheckingOut(true)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          interval: selectedInterval
        })
      })

      if (!response.ok) {
        const error = await response.json()
        // Demo-Modus: Stripe nicht konfiguriert
        if (error.error?.includes('nicht konfiguriert') || error.error?.includes('not configured')) {
          toast.info('Demo-Modus: Stripe ist nicht konfiguriert. In der Live-Version würdest du jetzt zum Checkout weitergeleitet werden.', {
            duration: 5000
          })
          onClose()
          return
        }
        throw new Error(error.error || 'Checkout konnte nicht gestartet werden')
      }

      const { url } = await response.json()

      if (url) {
        // Redirect zu Stripe Checkout
        window.location.href = url
      } else {
        throw new Error('Keine Checkout-URL erhalten')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Checkout'
      // Demo-Modus Fallback
      if (errorMessage.includes('nicht konfiguriert') || errorMessage.includes('not configured')) {
        toast.info('Demo-Modus: Stripe ist nicht konfiguriert', { duration: 3000 })
        onClose()
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsCheckingOut(false)
    }
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">Wähle deinen Plan</DialogTitle>
              <DialogDescription>
                Starte jetzt durch und nutze alle Funktionen von NICNOA
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Interval Selector */}
          <IntervalSelector 
            selected={selectedInterval} 
            onChange={setSelectedInterval} 
          />

          {/* Plans Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Keine Pläne verfügbar. Bitte kontaktiere den Support.
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 ${plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {plans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  interval={selectedInterval}
                  isSelected={selectedPlan === plan.id}
                  onSelect={() => setSelectedPlan(plan.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-col sm:flex-row gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isCheckingOut}
            className="order-2 sm:order-1"
          >
            Später
          </Button>
          <Button 
            onClick={handleCheckout}
            disabled={!selectedPlan || isCheckingOut || isLoading}
            className="order-1 sm:order-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Weiterleiten...
              </>
            ) : (
              <>
                Jetzt starten
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>

        {/* Trust Indicators */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-muted-foreground">
            {selectedPlanData?.trialDays && selectedPlanData.trialDays > 0 
              ? `${selectedPlanData.trialDays} Tage kostenlos testen • ` 
              : ''
            }
            Sichere Zahlung über Stripe • Jederzeit kündbar
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

