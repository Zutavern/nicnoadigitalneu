'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomCheckout } from '@/components/checkout/custom-checkout'
import { BillingInterval } from '@prisma/client'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const planId = searchParams.get('plan')
  const interval = (searchParams.get('interval') || 'MONTHLY') as BillingInterval

  // Validiere Interval
  const validIntervals: BillingInterval[] = ['MONTHLY', 'QUARTERLY', 'SIX_MONTHS', 'YEARLY']
  const selectedInterval = validIntervals.includes(interval) ? interval : 'MONTHLY'

  if (!planId) {
    return (
      <div className="max-w-md mx-auto p-4 md:p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Kein Plan ausgewählt</h2>
        <p className="text-muted-foreground mb-6">
          Bitte wähle zuerst einen Plan aus.
        </p>
        <Button onClick={() => router.push('/preise')}>
          Zu den Preisen
        </Button>
      </div>
    )
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Upgrade zu NICNOA Pro</h1>
        <p className="text-muted-foreground">
          Schließe dein Abonnement sicher ab
        </p>
      </div>

      {/* Custom Checkout */}
      <CustomCheckout 
        planId={planId} 
        interval={selectedInterval} 
        userType="STYLIST" 
      />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
