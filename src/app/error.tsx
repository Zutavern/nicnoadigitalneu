'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [errorMessage, setErrorMessage] = useState('Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.')

  useEffect(() => {
    // Log error to an error reporting service
    console.error('Application error:', error)

    // Hole zufällige Fehlermeldung
    fetch('/api/error-messages/500')
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setErrorMessage(data.message)
        }
      })
      .catch(() => {
        // Fallback bleibt bestehen
      })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Etwas ist schiefgelaufen</h1>
          <p className="text-muted-foreground mb-6">
            {errorMessage}
          </p>
          
          {error.digest && (
            <p className="text-xs text-muted-foreground mb-4 font-mono">
              Fehler-ID: {error.digest}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Erneut versuchen
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Zur Startseite
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}



