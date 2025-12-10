'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock, Eye, EyeOff, Shield, Building2, Scissors } from 'lucide-react'

// Dev Login Credentials
const DEV_USERS = {
  admin: { email: 'admin@nicnoa.de', password: 'test123', redirect: '/admin' },
  salon: { email: 'salon@nicnoa.de', password: 'test123', redirect: '/salon' },
  stylist: { email: 'stylist@nicnoa.de', password: 'test123', redirect: '/stylist' },
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')
  const reason = searchParams.get('reason')

  const [isLoading, setIsLoading] = useState(false)
  const [quickLoginLoading, setQuickLoginLoading] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState('')

  // Session-Terminierung Nachricht
  const sessionTerminatedMessage = reason === 'session_terminated' 
    ? 'Ihre Sitzung wurde von einem Administrator beendet. Bitte melden Sie sich erneut an.'
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setFormError('Ungültige Anmeldedaten')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setFormError('Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async (role: keyof typeof DEV_USERS) => {
    setQuickLoginLoading(role)
    setFormError('')

    try {
      const user = DEV_USERS[role]
      const result = await signIn('credentials', {
        email: user.email,
        password: user.password,
        redirect: false,
      })

      if (result?.error) {
        setFormError('Quick-Login fehlgeschlagen. Bitte Seed ausführen.')
      } else {
        router.push(user.redirect)
        router.refresh()
      }
    } catch {
      setFormError('Ein Fehler ist aufgetreten')
    } finally {
      setQuickLoginLoading(null)
    }
  }

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true)
    signIn(provider, { callbackUrl })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <Link href="/" className="flex items-center space-x-2 mb-8">
            <span className="text-3xl font-bold tracking-tight">
              NICNOA<span className="text-primary">&CO</span><span className="text-primary">.online</span>
            </span>
            <span className="text-lg font-medium text-muted-foreground">DIGITAL</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4">
            Willkommen zurück!
          </h1>
          <p className="text-lg text-muted-foreground">
            Verwalten Sie Ihren Salon-Space mit der führenden Plattform für Salon-Coworking.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl">✂️</span>
              </div>
              <span className="text-muted-foreground">Termine verwalten</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl">💼</span>
              </div>
              <span className="text-muted-foreground">Stuhlvermietung optimieren</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <span className="text-muted-foreground">Umsätze analysieren</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <div className="lg:hidden mb-8">
              <Link href="/" className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-bold tracking-tight">
                  NICNOA<span className="text-primary">&CO</span><span className="text-primary">.online</span>
                </span>
              </Link>
            </div>
            <h2 className="text-3xl font-bold">Anmelden</h2>
            <p className="mt-2 text-muted-foreground">
              Noch kein Konto?{' '}
              <Link href="/registrieren" className="text-primary hover:underline">
                Jetzt registrieren
              </Link>
            </p>
          </div>

          {/* Session wurde beendet Info */}
          {sessionTerminatedMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm flex items-start gap-3"
            >
              <Shield className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Sitzung beendet</p>
                <p className="text-sm opacity-90 mt-1">{sessionTerminatedMessage}</p>
              </div>
            </motion.div>
          )}

          {(error || formError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm"
            >
              {formError || 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'}
            </motion.div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Mit Google anmelden
            </Button>

            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => handleOAuthSignIn('linkedin')}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Mit LinkedIn anmelden
            </Button>

            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => handleOAuthSignIn('facebook')}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Mit Facebook anmelden
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Oder mit E-Mail
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ihre@email.de"
                  className="pl-10 h-12"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                <Link href="/passwort-vergessen" className="text-sm text-primary hover:underline">
                  Passwort vergessen?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird angemeldet...
                </>
              ) : (
                'Anmelden'
              )}
            </Button>
          </form>

          {/* Quick Login Buttons (Dev Mode) - Steuerbar via Umgebungsvariable */}
          {(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_DEV_LOGIN === 'true') && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-dashed" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    🚀 Quick Login (Dev)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto py-3 flex-col gap-1 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={quickLoginLoading !== null}
                >
                  {quickLoginLoading === 'admin' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                  ) : (
                    <Shield className="h-5 w-5 text-purple-500" />
                  )}
                  <span className="text-xs font-medium">Admin</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto py-3 flex-col gap-1 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50"
                  onClick={() => handleQuickLogin('salon')}
                  disabled={quickLoginLoading !== null}
                >
                  {quickLoginLoading === 'salon' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  ) : (
                    <Building2 className="h-5 w-5 text-blue-500" />
                  )}
                  <span className="text-xs font-medium">Salonbetreiber</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto py-3 flex-col gap-1 border-pink-500/30 hover:bg-pink-500/10 hover:border-pink-500/50"
                  onClick={() => handleQuickLogin('stylist')}
                  disabled={quickLoginLoading !== null}
                >
                  {quickLoginLoading === 'stylist' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
                  ) : (
                    <Scissors className="h-5 w-5 text-pink-500" />
                  )}
                  <span className="text-xs font-medium">Stylist</span>
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function LoginPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginForm />
    </Suspense>
  )
}
