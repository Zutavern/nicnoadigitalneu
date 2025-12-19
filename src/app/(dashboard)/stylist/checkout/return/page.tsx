'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import confetti from 'canvas-confetti'

type CheckoutStatus = 'loading' | 'success' | 'failed'

interface SessionStatus {
  status: 'complete' | 'open' | 'expired'
  customerEmail?: string
  planName?: string
}

export default function CheckoutReturnPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<CheckoutStatus>('loading')
  const [sessionData, setSessionData] = useState<SessionStatus | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      setStatus('failed')
      return
    }

    // Session-Status prüfen
    fetch(`/api/stripe/checkout-status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'complete') {
          setStatus('success')
          setSessionData(data)
          
          // Konfetti! 🎉
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
        } else {
          setStatus('failed')
        }
      })
      .catch(() => {
        setStatus('failed')
      })
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">Zahlung wird überprüft...</p>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center"
            >
              <XCircle className="w-8 h-8 text-red-600" />
            </motion.div>
            <CardTitle>Zahlung nicht abgeschlossen</CardTitle>
            <CardDescription>
              Die Zahlung konnte nicht verarbeitet werden oder wurde abgebrochen.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => router.push('/stylist')} className="w-full">
              Zurück zum Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.push('/preise')} className="w-full">
              Pläne ansehen
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center"
          >
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </motion.div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Willkommen bei NICNOA Pro!
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </CardTitle>
          <CardDescription>
            Dein Abonnement wurde erfolgreich aktiviert.
            {sessionData?.planName && (
              <span className="block mt-2 font-medium text-primary">
                Plan: {sessionData.planName}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Das kannst du jetzt nutzen:</h4>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              <li>✓ Unbegrenzte Termine</li>
              <li>✓ Homepage-Builder mit KI</li>
              <li>✓ Marketing-Tools</li>
              <li>✓ Prioritäts-Support</li>
            </ul>
          </div>
          
          <Button 
            onClick={() => router.push('/stylist')} 
            className="w-full"
          >
            Zum Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}



