'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock, Eye, EyeOff, Shield, Building2, Scissors, Wand2, CheckCircle2 } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { AuthEvents, identifyUser } from '@/lib/analytics'

// Dev Login Credentials
const DEV_USERS = {
  admin: { email: 'admin@nicnoa.online', password: 'test123', redirect: '/admin' },
  salon: { email: 'salon@nicnoa.online', password: 'test123', redirect: '/salon' },
  stylist: { email: 'stylist@nicnoa.online', password: 'test123', redirect: '/stylist' },
}

// Icon-Komponente Helper
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ElementType> = {
    'scissors': LucideIcons.Scissors,
    'briefcase': LucideIcons.Briefcase,
    'bar-chart-3': LucideIcons.BarChart3,
    'users': LucideIcons.Users,
    'calendar': LucideIcons.Calendar,
    'credit-card': LucideIcons.CreditCard,
    'shield': LucideIcons.Shield,
    'check-circle': LucideIcons.CheckCircle,
    'star': LucideIcons.Star,
    'zap': LucideIcons.Zap,
    'heart': LucideIcons.Heart,
    'clock': LucideIcons.Clock,
    'sparkles': LucideIcons.Sparkles,
    'trending-up': LucideIcons.TrendingUp,
    'lock': LucideIcons.Lock,
  }
  return iconMap[iconName] || LucideIcons.CheckCircle
}

interface AuthPageConfig {
  loginImageUrl: string | null
  loginImageAlt: string | null
  loginImageOverlay: number
  loginTitle: string
  loginSubtitle: string | null
  loginCtaText: string | null
  loginCtaLink: string | null
  showLoginFeatures: boolean
  loginFeature1Icon: string | null
  loginFeature1Text: string | null
  loginFeature2Icon: string | null
  loginFeature2Text: string | null
  loginFeature3Icon: string | null
  loginFeature3Text: string | null
  showGoogleLogin: boolean
  showAppleLogin: boolean
  showLinkedInLogin: boolean
  showFacebookLogin: boolean
  showLogo: boolean
}

const defaultConfig: AuthPageConfig = {
  loginImageUrl: null,
  loginImageAlt: null,
  loginImageOverlay: 0,
  loginTitle: 'Anmelden',
  loginSubtitle: 'Willkommen zurück! Melden Sie sich an, um fortzufahren.',
  loginCtaText: 'Noch kein Konto?',
  loginCtaLink: 'Jetzt registrieren',
  showLoginFeatures: true,
  loginFeature1Icon: 'scissors',
  loginFeature1Text: 'Termine verwalten',
  loginFeature2Icon: 'briefcase',
  loginFeature2Text: 'Stuhlvermietung optimieren',
  loginFeature3Icon: 'bar-chart-3',
  loginFeature3Text: 'Umsätze analysieren',
  showGoogleLogin: true,
  showAppleLogin: false,
  showLinkedInLogin: true,
  showFacebookLogin: true,
  showLogo: true,
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')
  const reason = searchParams.get('reason')

  const [config, setConfig] = useState<AuthPageConfig>(defaultConfig)
  const [isLoading, setIsLoading] = useState(false)
  const [quickLoginLoading, setQuickLoginLoading] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loginMode, setLoginMode] = useState<'password' | 'magic-link'>('password')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState('')

  // Lade Auth Page Config
  useEffect(() => {
    fetch('/api/auth-page-config')
      .then(res => res.json())
      .then(data => setConfig({ ...defaultConfig, ...data }))
      .catch(() => {})
  }, [])

  // Session-Terminierung Nachricht
  const sessionTerminatedMessage = reason === 'session_terminated' 
    ? 'Ihre Sitzung wurde von einem Administrator beendet. Bitte melden Sie sich erneut an.'
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError('')
    AuthEvents.loginStarted('email_form')

    try {
      // First check if 2FA is required
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const loginData = await loginResponse.json()

      if (!loginResponse.ok) {
        AuthEvents.loginFailed(loginData.error || 'invalid_credentials')
        setFormError(loginData.error || 'Ungültige Anmeldedaten')
        return
      }

      // Check if 2FA is required
      if (loginData.requires2FA) {
        AuthEvents.twoFactorChallengeShown()
        // Store credentials temporarily for 2FA flow
        sessionStorage.setItem('pending2FA', JSON.stringify({
          email: formData.email,
          password: formData.password,
          token: loginData.token,
        }))
        
        // Redirect to 2FA page
        router.push(`/login/2fa?callbackUrl=${encodeURIComponent(callbackUrl)}`)
        return
      }

      // No 2FA required - proceed with normal login
      // Track analytics before redirect
      AuthEvents.loginCompleted('email', false)
      if (loginData.userId) {
        identifyUser(loginData.userId, { email: formData.email })
      }
      
      // Use redirect: true to ensure browser properly stores the session cookie
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        callbackUrl,
        redirect: true,
      })
    } catch {
      AuthEvents.loginFailed('unknown_error')
      setFormError('Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError('')
    AuthEvents.loginStarted('magic_link')

    try {
      const response = await fetch('/api/auth/magic-link/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        AuthEvents.magicLinkFailed()
        setFormError(data.error || 'Ein Fehler ist aufgetreten')
        return
      }

      AuthEvents.magicLinkRequested()
      setMagicLinkSent(true)
    } catch {
      AuthEvents.magicLinkFailed()
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
      
      console.log('[QuickLogin] Starting for:', user.email)
      
      // First check if 2FA is required via new login API
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      })

      const loginData = await loginResponse.json()
      console.log('[QuickLogin] /api/auth/login response:', { status: loginResponse.status, ok: loginResponse.ok, data: loginData })

      if (!loginResponse.ok) {
        const errMsg = `API Error: ${loginData.error || 'Unknown'} (Status: ${loginResponse.status})`
        console.error('[QuickLogin] Login API failed:', errMsg)
        setFormError(errMsg)
        return
      }

      // Check if 2FA is required (unlikely for test users but handle it)
      if (loginData.requires2FA) {
        sessionStorage.setItem('pending2FA', JSON.stringify({
          email: user.email,
          password: user.password,
          token: loginData.token,
        }))
        router.push(`/login/2fa?callbackUrl=${encodeURIComponent(user.redirect)}`)
        return
      }

      // No 2FA - proceed with normal login using redirect: true
      // This ensures the browser properly stores the session cookie
      await signIn('credentials', {
        email: user.email,
        password: user.password,
        callbackUrl: user.redirect,
        redirect: true,
      })
    } catch (err) {
      const errMsg = `Exception: ${err instanceof Error ? err.message : String(err)}`
      console.error('[QuickLogin] Exception:', errMsg)
      setFormError(errMsg)
    } finally {
      setQuickLoginLoading(null)
    }
  }

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true)
    signIn(provider, { callbackUrl })
  }

  // Feature Icons
  const features = [
    { icon: config.loginFeature1Icon, text: config.loginFeature1Text },
    { icon: config.loginFeature2Icon, text: config.loginFeature2Text },
    { icon: config.loginFeature3Icon, text: config.loginFeature3Text },
  ].filter(f => f.text)

  return (
    <div className="min-h-screen flex flex-row-reverse">
      {/* Right Side - Form (Dark Background) */}
      <div className="w-full lg:w-1/2 bg-slate-950 flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto space-y-8"
          >
            {/* Logo */}
            {config.showLogo && (
              <Link href="/" className="flex items-center space-x-2 mb-6">
                <span className="text-2xl font-bold tracking-tight text-white">
                  NICNOA<span className="text-primary">&CO</span><span className="text-primary">.online</span>
                </span>
              </Link>
            )}

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">{config.loginTitle}</h1>
              {config.loginSubtitle && (
                <p className="text-slate-400">{config.loginSubtitle}</p>
              )}
            </div>

            {/* Session wurde beendet Info */}
            {sessionTerminatedMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm flex items-start gap-3"
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
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                {formError || 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'}
              </motion.div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-3">
              {config.showGoogleLogin && (
                <Button
                  variant="outline"
                  className="w-full h-12 bg-transparent border-slate-700 text-white hover:bg-primary/10 hover:border-primary/50 hover:text-white"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Mit Google fortfahren
                </Button>
              )}

              {config.showAppleLogin && (
                <Button
                  variant="outline"
                  className="w-full h-12 bg-transparent border-slate-700 text-white hover:bg-primary/10 hover:border-primary/50 hover:text-white"
                  onClick={() => handleOAuthSignIn('apple')}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Mit Apple fortfahren
                </Button>
              )}

              {config.showLinkedInLogin && (
                <Button
                  variant="outline"
                  className="w-full h-12 bg-transparent border-slate-700 text-white hover:bg-primary/10 hover:border-primary/50 hover:text-white"
                  onClick={() => handleOAuthSignIn('linkedin')}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Mit LinkedIn fortfahren
                </Button>
              )}

              {config.showFacebookLogin && (
                <Button
                  variant="outline"
                  className="w-full h-12 bg-transparent border-slate-700 text-white hover:bg-primary/10 hover:border-primary/50 hover:text-white"
                  onClick={() => handleOAuthSignIn('facebook')}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Mit Facebook fortfahren
                </Button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-950 px-2 text-slate-500">
                  Oder mit E-Mail
                </span>
              </div>
            </div>

            {/* Login Mode Toggle */}
            <div className="flex rounded-lg bg-slate-900 p-1">
              <button
                type="button"
                onClick={() => { setLoginMode('password'); setMagicLinkSent(false); setFormError('') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMode === 'password'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="h-4 w-4" />
                Mit Passwort
              </button>
              <button
                type="button"
                onClick={() => { setLoginMode('magic-link'); setFormError('') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMode === 'magic-link'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wand2 className="h-4 w-4" />
                Magic Link
              </button>
            </div>

            {/* Password Login Form */}
            {loginMode === 'password' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">E-Mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ihre@email.de"
                      className="pl-10 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-300">Passwort</Label>
                    <Link href="/passwort-vergessen" className="text-sm text-primary hover:underline">
                      Passwort vergessen?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-slate-200" disabled={isLoading}>
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
            )}

            {/* Magic Link Form */}
            {loginMode === 'magic-link' && !magicLinkSent && (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email" className="text-slate-300">E-Mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder="ihre@email.de"
                      className="pl-10 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-slate-200" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Magic Link senden
                    </>
                  )}
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  Wir senden dir einen Link per E-Mail, mit dem du dich ohne Passwort anmelden kannst.
                </p>
              </form>
            )}

            {/* Magic Link Sent Success */}
            {loginMode === 'magic-link' && magicLinkSent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 py-4"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">E-Mail gesendet!</h3>
                  <p className="text-slate-400 text-sm mt-2">
                    Falls ein Konto mit <strong className="text-white">{formData.email}</strong> existiert, 
                    haben wir dir einen Magic Link gesendet.
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  Der Link ist 15 Minuten gültig. Prüfe auch deinen Spam-Ordner.
                </p>
                <Button
                  variant="outline"
                  onClick={() => { setMagicLinkSent(false); setFormData({ ...formData, email: '' }) }}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Anderen Account verwenden
                </Button>
              </motion.div>
            )}

            {/* Features */}
            {config.showLoginFeatures && features.length > 0 && (
              <div className="space-y-3 pt-4">
                {features.map((feature, i) => {
                  const IconComp = getIconComponent(feature.icon || 'check-circle')
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                      <IconComp className="h-5 w-5 text-primary" />
                      <span>{feature.text}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* CTA to Register */}
            <p className="text-slate-400 text-sm">
              {config.loginCtaText}{' '}
              <Link href="/registrieren" className="text-primary hover:underline">
                {config.loginCtaLink}
              </Link>
            </p>

            {/* Quick Login Buttons - TEMPORÄR AKTIVIERT BIS GO-LIVE */}
            {/* TODO: Vor Go-Live wieder auf: (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_DEV_LOGIN === 'true') ändern */}
            {(true) && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-dashed border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-950 px-2 text-slate-500">
                      🚀 Quick Login (Dev)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto py-3 flex-col gap-1 border-primary/30 bg-transparent hover:bg-primary/10 hover:border-primary/50 text-white"
                    onClick={() => handleQuickLogin('admin')}
                    disabled={quickLoginLoading !== null}
                  >
                    {quickLoginLoading === 'admin' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Shield className="h-5 w-5 text-primary" />
                    )}
                    <span className="text-xs font-medium">Admin</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto py-3 flex-col gap-1 border-primary/30 bg-transparent hover:bg-primary/10 hover:border-primary/50 text-white"
                    onClick={() => handleQuickLogin('salon')}
                    disabled={quickLoginLoading !== null}
                  >
                    {quickLoginLoading === 'salon' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Building2 className="h-5 w-5 text-primary" />
                    )}
                    <span className="text-xs font-medium">Salon</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto py-3 flex-col gap-1 border-primary/30 bg-transparent hover:bg-primary/10 hover:border-primary/50 text-white"
                    onClick={() => handleQuickLogin('stylist')}
                    disabled={quickLoginLoading !== null}
                  >
                    {quickLoginLoading === 'stylist' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Scissors className="h-5 w-5 text-primary" />
                    )}
                    <span className="text-xs font-medium">Stylist</span>
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Left Side - Image (nur Desktop) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        {config.loginImageUrl ? (
          <>
            <Image
              src={config.loginImageUrl}
              alt={config.loginImageAlt || 'Login'}
              fill
              className="object-cover"
              priority
            />
            {config.loginImageOverlay > 0 && (
              <div 
                className="absolute inset-0 bg-black" 
                style={{ opacity: config.loginImageOverlay / 100 }}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-purple-500/30">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white/50">
                <div className="h-32 w-32 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-6xl">✂️</span>
                </div>
                <p className="text-lg font-medium">NICNOA&CO.online</p>
                <p className="text-sm mt-1 opacity-75">Die Zukunft des Salon-Managements</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LoginPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
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
