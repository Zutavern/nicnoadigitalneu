'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Verifizierung fehlgeschlagen')
        }

        setStatus('success')
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 3000)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      }
    }

    verifyEmail()
  }, [token, router])

  if (status === 'loading') {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-500 mb-4" />
          <p className="text-muted-foreground">E-Mail wird verifiziert...</p>
        </CardContent>
      </Card>
    )
  }

  if (status === 'no-token') {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Mail className="h-6 w-6 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">E-Mail verifizieren</CardTitle>
          <CardDescription>
            Bitte überprüfe dein E-Mail-Postfach und klicke auf den Verifizierungslink.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Du hast keine E-Mail erhalten? Klicke unten, um eine neue zu senden.
          </p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/settings')}
            className="w-full"
          >
            Neue E-Mail anfordern
          </Button>
          <Link href="/login">
            <Button variant="ghost" className="w-full">
              Zurück zum Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (status === 'error') {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Verifizierung fehlgeschlagen</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Der Link ist möglicherweise abgelaufen oder ungültig.
          </p>
          <Link href="/login">
            <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500">
              Zum Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
      <CardHeader className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center"
        >
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </motion.div>
        <CardTitle className="text-2xl">E-Mail verifiziert!</CardTitle>
        <CardDescription>
          Deine E-Mail-Adresse wurde erfolgreich verifiziert.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Du wirst in Kürze zum Login weitergeleitet...
        </p>
        <Link href="/login">
          <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500">
            Jetzt einloggen
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Suspense fallback={
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-pink-500" />
            </CardContent>
          </Card>
        }>
          <VerifyEmailContent />
        </Suspense>
      </motion.div>
    </div>
  )
}


