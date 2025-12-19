'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import confetti from 'canvas-confetti'

export default function CheckoutSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Konfetti-Animation
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader className="pt-10 pb-6">
          <div className="mx-auto mb-6 relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400" />
          </div>
          
          <CardTitle className="text-3xl font-bold mb-2">
            Willkommen bei NICNOA Pro! 🎉
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Deine Zahlung war erfolgreich. Du hast jetzt Zugriff auf alle Premium-Features.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 pb-10">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 py-6 border-y">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">∞</div>
              <div className="text-xs text-muted-foreground">Stühle</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">∞</div>
              <div className="text-xs text-muted-foreground">Buchungen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">AI</div>
              <div className="text-xs text-muted-foreground">Features</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/salon/dashboard')}
              className="w-full h-12 text-base"
              size="lg"
            >
              Zum Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              onClick={() => router.push('/salon/chairs')}
              variant="outline"
              className="w-full"
            >
              Stuhlmieter verwalten
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Du erhältst in Kürze eine Bestätigung per E-Mail.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}



