'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { AuthEvents } from '@/lib/analytics'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        AuthEvents.passwordResetFailed(data.error || 'request_failed')
        throw new Error(data.error || 'Ein Fehler ist aufgetreten')
      }

      AuthEvents.passwordResetRequested()
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Passwort vergessen?</CardTitle>
            <CardDescription>
              {isSuccess 
                ? 'Überprüfe dein E-Mail-Postfach'
                : 'Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-muted-foreground">
                  Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link zum Zurücksetzen gesendet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Der Link ist 1 Stunde gültig.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="w-full mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück zum Login
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="max@beispiel.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-background"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-500 text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    'Link zum Zurücksetzen senden'
                  )}
                </Button>

                <div className="text-center">
                  <Link 
                    href="/login" 
                    className="text-sm text-muted-foreground hover:text-pink-500 inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Zurück zum Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}









