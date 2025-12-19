'use client'

import { useCallback, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'
import { Loader2 } from 'lucide-react'

// Stripe Promise initialisieren
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface EmbeddedCheckoutProps {
  planId: string
  interval: 'MONTHLY' | 'QUARTERLY' | 'SIX_MONTHS' | 'YEARLY'
  onComplete?: () => void
  onError?: (error: string) => void
}

export function EmbeddedCheckoutForm({
  planId,
  interval,
  onComplete,
  onError,
}: EmbeddedCheckoutProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    try {
      const response = await fetch('/api/stripe/create-embedded-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          interval,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Checkout konnte nicht erstellt werden')
      }

      const data = await response.json()
      setLoading(false)
      return data.clientSecret
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler'
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    }
  }, [planId, interval, onError])

  const options = {
    fetchClientSecret,
    onComplete: () => {
      onComplete?.()
    },
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Fehler beim Laden
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          {error}
        </p>
        <button
          onClick={() => {
            setError(null)
            setLoading(true)
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    )
  }

  return (
    <div id="checkout" className="min-h-[400px]">
      {loading && (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Checkout wird geladen...
          </p>
        </div>
      )}
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout className="embedded-checkout" />
      </EmbeddedCheckoutProvider>
    </div>
  )
}



