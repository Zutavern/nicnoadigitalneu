'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock, Eye, EyeOff, User, Building2, Scissors, Check, X } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { AuthEvents, identifyUser } from '@/lib/analytics'

type UserRole = 'SALON_OWNER' | 'STYLIST'

const passwordRequirements = [
  { id: 'length', label: 'Mindestens 8 Zeichen', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'Ein Großbuchstabe', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Ein Kleinbuchstabe', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'Eine Zahl', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'Ein Sonderzeichen', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

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
  registerImageUrl: string | null
  registerImageAlt: string | null
  registerImageOverlay: number
  registerTitle: string
  registerSubtitle: string | null
  registerCtaText: string | null
  registerCtaLink: string | null
  showRegisterBenefits: boolean
  registerBenefit1Icon: string | null
  registerBenefit1Text: string | null
  registerBenefit2Icon: string | null
  registerBenefit2Text: string | null
  registerBenefit3Icon: string | null
  registerBenefit3Text: string | null
  showGoogleLogin: boolean
  showAppleLogin: boolean
  showLinkedInLogin: boolean
  showFacebookLogin: boolean
  showLogo: boolean
}

const defaultConfig: AuthPageConfig = {
  registerImageUrl: null,
  registerImageAlt: null,
  registerImageOverlay: 0,
  registerTitle: 'Konto erstellen',
  registerSubtitle: 'Starten Sie jetzt und revolutionieren Sie Ihr Salon-Management.',
  registerCtaText: 'Bereits ein Konto?',
  registerCtaLink: 'Jetzt anmelden',
  showRegisterBenefits: true,
  registerBenefit1Icon: 'check-circle',
  registerBenefit1Text: '14 Tage kostenlos testen',
  registerBenefit2Icon: 'credit-card',
  registerBenefit2Text: 'Keine Kreditkarte erforderlich',
  registerBenefit3Icon: 'shield',
  registerBenefit3Text: 'DSGVO-konform & sicher',
  showGoogleLogin: true,
  showAppleLogin: false,
  showLinkedInLogin: true,
  showFacebookLogin: true,
  showLogo: true,
}

export default function RegisterPage() {
  const router = useRouter()
  const [config, setConfig] = useState<AuthPageConfig>(defaultConfig)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
  })

  // Lade Auth Page Config
  useEffect(() => {
    fetch('/api/auth-page-config')
      .then(res => res.json())
      .then(data => setConfig({ ...defaultConfig, ...data }))
      .catch(() => {})
  }, [])

  const isPasswordValid = passwordRequirements.every(req => req.test(formData.password))
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ''

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role })
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    AuthEvents.signupStarted('email_form')

    if (!isPasswordValid) {
      AuthEvents.signupFailed('password_invalid')
      setFormError('Bitte erfüllen Sie alle Passwort-Anforderungen')
      return
    }

    if (!doPasswordsMatch) {
      AuthEvents.signupFailed('password_mismatch')
      setFormError('Die Passwörter stimmen nicht überein')
      return
    }

    setIsLoading(true)
    setFormError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        AuthEvents.signupFailed(data.error || 'registration_failed')
        setFormError(data.error || 'Registrierung fehlgeschlagen')
        return
      }

      AuthEvents.signupCompleted('email')

      // Auto-login after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setFormError('Registrierung erfolgreich, aber Anmeldung fehlgeschlagen')
      } else {
        if (data.userId) {
          identifyUser(data.userId, { 
            email: formData.email, 
            name: formData.name,
            role: formData.role 
          })
        }
        router.push('/onboarding')
        router.refresh()
      }
    } catch {
      AuthEvents.signupFailed('unknown_error')
      setFormError('Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = (provider: string) => {
    AuthEvents.signupStarted(provider)
    // Store role selection for OAuth flow
    if (formData.role) {
      localStorage.setItem('pendingRole', formData.role)
    }
    setIsLoading(true)
    signIn(provider, { callbackUrl: '/onboarding' })
  }

  // Benefits
  const benefits = [
    { icon: config.registerBenefit1Icon, text: config.registerBenefit1Text },
    { icon: config.registerBenefit2Icon, text: config.registerBenefit2Text },
    { icon: config.registerBenefit3Icon, text: config.registerBenefit3Text },
  ].filter(b => b.text)

  return (
    <div className="min-h-screen flex flex-row-reverse">
      {/* Right Side - Form (Dark Background) */}
      <div className="w-full lg:w-1/2 bg-slate-950 flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto space-y-6"
          >
            {/* Logo */}
            {config.showLogo && (
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <span className="text-2xl font-bold tracking-tight text-white">
                  NICNOA<span className="text-primary">&CO</span><span className="text-primary">.online</span>
                </span>
              </Link>
            )}

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">{config.registerTitle}</h1>
              {config.registerSubtitle && (
                <p className="text-slate-400">{config.registerSubtitle}</p>
              )}
            </div>

            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                {formError}
              </motion.div>
            )}

            {/* Step 1: Role Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <p className="text-slate-400 text-sm">
                  Wählen Sie Ihre Rolle
                </p>
                
                <button
                  onClick={() => handleRoleSelect('SALON_OWNER')}
                  className="w-full p-5 rounded-xl border border-slate-700 bg-slate-900 hover:border-primary hover:bg-slate-800 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">Salonbetreiber</h3>
                      <p className="text-sm text-slate-400">
                        Ich möchte meinen Salon verwalten
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('STYLIST')}
                  className="w-full p-5 rounded-xl border border-slate-700 bg-slate-900 hover:border-primary hover:bg-slate-800 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Scissors className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">Stuhlmieter / Stylist</h3>
                      <p className="text-sm text-slate-400">
                        Ich suche einen Arbeitsplatz
                      </p>
                    </div>
                  </div>
                </button>

                {/* Benefits */}
                {config.showRegisterBenefits && benefits.length > 0 && (
                  <div className="space-y-2 pt-4">
                    {benefits.map((benefit, i) => {
                      const IconComp = getIconComponent(benefit.icon || 'check-circle')
                      return (
                        <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                          <IconComp className="h-4 w-4 text-green-400" />
                          <span>{benefit.text}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Registration Form */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-slate-400 hover:text-white flex items-center gap-2"
                >
                  ← Rolle ändern
                </button>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {formData.role === 'SALON_OWNER' ? (
                    <>
                      <Building2 className="h-4 w-4" />
                      Salonbetreiber
                    </>
                  ) : (
                    <>
                      <Scissors className="h-4 w-4" />
                      Stuhlmieter
                    </>
                  )}
                </div>

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
                      Mit Google registrieren
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
                      Mit LinkedIn registrieren
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

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Ihr Name"
                        className="pl-10 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

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
                    <Label htmlFor="password" className="text-slate-300">Passwort</Label>
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
                    
                    {/* Password Requirements */}
                    <div className="mt-3 space-y-1">
                      {passwordRequirements.map((req) => (
                        <div
                          key={req.id}
                          className={`flex items-center gap-2 text-xs ${
                            req.test(formData.password) ? 'text-green-400' : 'text-slate-500'
                          }`}
                        >
                          {req.test(formData.password) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          {req.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-300">Passwort bestätigen</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                    {formData.confirmPassword && (
                      <div className={`flex items-center gap-2 text-xs ${doPasswordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                        {doPasswordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {doPasswordsMatch ? 'Passwörter stimmen überein' : 'Passwörter stimmen nicht überein'}
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-white text-black hover:bg-slate-200" 
                    disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wird registriert...
                      </>
                    ) : (
                      'Registrieren'
                    )}
                  </Button>

                  <p className="text-xs text-center text-slate-500">
                    Mit der Registrierung akzeptieren Sie unsere{' '}
                    <Link href="/agb" className="text-primary hover:underline">AGB</Link>
                    {' '}und{' '}
                    <Link href="/datenschutz" className="text-primary hover:underline">Datenschutzrichtlinie</Link>.
                  </p>
                </form>
              </motion.div>
            )}

            {/* CTA to Login */}
            <p className="text-slate-400 text-sm">
              {config.registerCtaText}{' '}
              <Link href="/login" className="text-primary hover:underline">
                {config.registerCtaLink}
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Left Side - Image (nur Desktop) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        {config.registerImageUrl ? (
          <>
            <Image
              src={config.registerImageUrl}
              alt={config.registerImageAlt || 'Registrierung'}
              fill
              className="object-cover"
              priority
            />
            {config.registerImageOverlay > 0 && (
              <div 
                className="absolute inset-0 bg-black" 
                style={{ opacity: config.registerImageOverlay / 100 }}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-purple-500/30">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white/50">
                <div className="h-32 w-32 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-6xl">💇</span>
                </div>
                <p className="text-lg font-medium">NICNOA&CO.online</p>
                <p className="text-sm mt-1 opacity-75">Starten Sie jetzt durch!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
