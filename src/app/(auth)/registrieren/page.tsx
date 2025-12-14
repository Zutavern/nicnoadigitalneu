'use client'

import { useState, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Loader2, Mail, Lock, Eye, EyeOff, User, Building2, Scissors, Check, X, 
  MapPin, Phone, Globe, Instagram, Facebook, ArrowLeft, Sparkles, PartyPopper
} from 'lucide-react'
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

// Generiere eine Session-ID für die SMS-Verifizierung
function generateSessionId(): string {
  return 'reg_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export default function RegisterPage() {
  const router = useRouter()
  const [config, setConfig] = useState<AuthPageConfig>(defaultConfig)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  
  // Session-ID für SMS-Verifizierung
  const [sessionId] = useState(() => generateSessionId())
  
  // SMS-Verifizierung State
  const [smsCode, setSmsCode] = useState(['', '', '', ''])
  const [smsSent, setSmsSent] = useState(false)
  const [smsError, setSmsError] = useState('')
  const [remainingSms, setRemainingSms] = useState(3)
  const [isResending, setIsResending] = useState(false)
  const [maskedPhone, setMaskedPhone] = useState('')
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null)
  
  // Code Input Refs
  const codeInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]
  
  // PLZ Lookup
  const plzDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const [isLookingUpPlz, setIsLookingUpPlz] = useState(false)
  
  // Created User ID (nach Registrierung)
  const [createdUserId, setCreatedUserId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
    // Kontaktdaten
    street: '',
    zipCode: '',
    city: '',
    phone: '',
    // Social Media
    website: '',
    instagram: '',
    facebook: '',
    tiktok: '',
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
  
  // Kontakt-Validierung
  const isContactValid = 
    formData.street.length >= 3 &&
    /^\d{5}$/.test(formData.zipCode) &&
    formData.city.length >= 2 &&
    /^\+?[\d\s\-()]{8,20}$/.test(formData.phone.replace(/\s/g, ''))

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role })
    setStep(2)
  }
  
  // PLZ Lookup via OpenPLZ API
  const lookupPLZ = async (plz: string) => {
    if (plz.length !== 5) return
    
    setIsLookingUpPlz(true)
    try {
      const response = await fetch(`https://openplzapi.org/de/Localities?postalCode=${plz}`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          setFormData(prev => ({ ...prev, city: data[0].name }))
        }
      }
    } catch (error) {
      console.error('PLZ lookup error:', error)
    } finally {
      setIsLookingUpPlz(false)
    }
  }
  
  const handlePLZChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 5)
    setFormData(prev => ({ ...prev, zipCode: cleanValue }))
    
    if (plzDebounceRef.current) {
      clearTimeout(plzDebounceRef.current)
    }
    if (cleanValue.length === 5) {
      plzDebounceRef.current = setTimeout(() => {
        lookupPLZ(cleanValue)
      }, 300)
    } else {
      setFormData(prev => ({ ...prev, city: '' }))
    }
  }

  // Step 2 -> Step 3 (Account erstellen)
  const handleAccountSubmit = async (e: React.FormEvent) => {
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

    setFormError('')
    setStep(3)
  }
  
  // Step 3 -> Step 4 (Kontakt speichern & SMS senden)
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isContactValid) {
      setFormError('Bitte füllen Sie alle Pflichtfelder korrekt aus')
      return
    }
    
    setIsLoading(true)
    setFormError('')
    
    try {
      // User registrieren
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          street: formData.street,
          zipCode: formData.zipCode,
          city: formData.city,
          phone: formData.phone,
          website: formData.website || '',
          instagram: formData.instagram || '',
          facebook: formData.facebook || '',
          tiktok: formData.tiktok || '',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        AuthEvents.signupFailed(data.error || 'registration_failed')
        setFormError(data.error || 'Registrierung fehlgeschlagen')
        return
      }
      
      setCreatedUserId(data.user.id)
      
      // SMS senden
      await sendSms()
      
      setStep(4)
      
    } catch {
      AuthEvents.signupFailed('unknown_error')
      setFormError('Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }
  
  // SMS senden
  const sendSms = async () => {
    setIsResending(true)
    setSmsError('')
    
    try {
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          sessionId,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (data.blockedUntil) {
          setBlockedUntil(new Date(data.blockedUntil))
        }
        setSmsError(data.message || data.error)
        return false
      }
      
      setSmsSent(true)
      setMaskedPhone(data.maskedPhone)
      setRemainingSms(data.remainingSms)
      
      // Im Testmodus: Code im Console anzeigen
      if (data.testCode) {
        console.log('🔐 Test-Code:', data.testCode)
      }
      
      return true
    } catch {
      setSmsError('Fehler beim Senden der SMS')
      return false
    } finally {
      setIsResending(false)
    }
  }
  
  // Code Input Handler
  const handleCodeInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    
    const newCode = [...smsCode]
    newCode[index] = value.slice(-1)
    setSmsCode(newCode)
    
    // Auto-fokus zum nächsten Input
    if (value && index < 3) {
      codeInputRefs[index + 1].current?.focus()
    }
    
    // Wenn alle 4 Ziffern eingegeben wurden, automatisch verifizieren
    if (newCode.every(c => c !== '') && index === 3) {
      verifyCode(newCode.join(''))
    }
  }
  
  // Backspace Handler
  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !smsCode[index] && index > 0) {
      codeInputRefs[index - 1].current?.focus()
    }
  }
  
  // Code verifizieren
  const verifyCode = async (code: string) => {
    setIsLoading(true)
    setSmsError('')
    
    try {
      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          code,
          sessionId,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setSmsError(data.message || data.error)
        setSmsCode(['', '', '', ''])
        codeInputRefs[0].current?.focus()
        return
      }
      
      // Registrierung abschließen
      if (createdUserId) {
        await fetch('/api/auth/complete-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: createdUserId,
            sessionId,
            phone: formData.phone,
          }),
        })
      }
      
      AuthEvents.signupCompleted('email')
      
      // Auto-login
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })
      
      if (result?.error) {
        setFormError('Verifizierung erfolgreich, aber Anmeldung fehlgeschlagen')
      } else {
        if (createdUserId) {
          identifyUser(createdUserId, { 
            email: formData.email, 
            name: formData.name,
            role: formData.role 
          })
        }
        setStep(5) // Willkommen
      }
      
    } catch {
      setSmsError('Fehler bei der Verifizierung')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Telefonnummer ändern
  const handleChangePhone = () => {
    setStep(3)
    setSmsSent(false)
    setSmsCode(['', '', '', ''])
  }

  const handleOAuthSignIn = (provider: string) => {
    AuthEvents.signupStarted(provider)
    if (formData.role) {
      localStorage.setItem('pendingRole', formData.role)
    }
    setIsLoading(true)
    signIn(provider, { callbackUrl: '/onboarding' })
  }
  
  // Zur Guided Tour
  const handleStartTour = () => {
    router.push('/onboarding?tour=true')
    router.refresh()
  }

  // Benefits
  const benefits = [
    { icon: config.registerBenefit1Icon, text: config.registerBenefit1Text },
    { icon: config.registerBenefit2Icon, text: config.registerBenefit2Text },
    { icon: config.registerBenefit3Icon, text: config.registerBenefit3Text },
  ].filter(b => b.text)
  
  // Step Titles
  const stepTitles: Record<number, string> = {
    1: 'Wählen Sie Ihre Rolle',
    2: 'Konto erstellen',
    3: 'Kontakt & Social Media',
    4: 'Telefon verifizieren',
    5: 'Willkommen!',
  }

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

            {/* Progress Indicator */}
            {step > 1 && step < 5 && (
              <div className="flex items-center gap-2 mb-4">
                {[2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      s <= step ? 'bg-primary' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">
                {step === 5 ? 'Willkommen bei NICNOA&CO!' : stepTitles[step]}
              </h1>
              {step === 1 && config.registerSubtitle && (
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

            <AnimatePresence mode="wait">
              {/* Step 1: Role Selection */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
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

              {/* Step 2: Account Form */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-slate-400 hover:text-white flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Rolle ändern
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
                  <form onSubmit={handleAccountSubmit} className="space-y-4">
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
                      Weiter
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Contact & Social Media */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm text-slate-400 hover:text-white flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Zurück
                  </button>
                  
                  <p className="text-slate-400 text-sm">
                    Wir benötigen Ihre Kontaktdaten für die Verifizierung.
                  </p>

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    {/* Straße */}
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-slate-300">
                        Straße und Hausnummer <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input
                          id="street"
                          type="text"
                          placeholder="Musterstraße 123"
                          className="pl-10 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* PLZ & Stadt */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode" className="text-slate-300">
                          PLZ <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="zipCode"
                          type="text"
                          placeholder="12345"
                          maxLength={5}
                          className="h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                          value={formData.zipCode}
                          onChange={(e) => handlePLZChange(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-slate-300">
                          Stadt <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="city"
                            type="text"
                            placeholder="Stadt"
                            className="h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                          />
                          {isLookingUpPlz && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Telefon */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-300">
                        Telefon (Mobil) <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+49 170 1234567"
                          className="pl-10 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Wir senden Ihnen einen SMS-Code zur Verifizierung.
                      </p>
                    </div>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-800" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-950 px-2 text-slate-600">
                          Social Media (optional)
                        </span>
                      </div>
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-slate-300">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://ihre-website.de"
                          className="pl-10 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Social Media Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="text-slate-300">Instagram</Label>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                          <Input
                            id="instagram"
                            type="text"
                            placeholder="@username"
                            className="pl-10 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                            value={formData.instagram}
                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook" className="text-slate-300">Facebook</Label>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                          <Input
                            id="facebook"
                            type="text"
                            placeholder="@pagename"
                            className="pl-10 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                            value={formData.facebook}
                            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tiktok" className="text-slate-300">TikTok</Label>
                      <Input
                        id="tiktok"
                        type="text"
                        placeholder="@username"
                        className="h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary"
                        value={formData.tiktok}
                        onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-white text-black hover:bg-slate-200" 
                      disabled={isLoading || !isContactValid}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird verarbeitet...
                        </>
                      ) : (
                        'SMS-Code anfordern'
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Step 4: SMS Verification */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Phone className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-slate-400">
                      Wir haben dir eine SMS mit einem Bestätigungscode an
                    </p>
                    <p className="text-white font-mono text-lg">
                      {maskedPhone || formData.phone}
                    </p>
                    <p className="text-slate-400 text-sm">gesendet.</p>
                  </div>

                  {smsError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
                    >
                      {smsError}
                    </motion.div>
                  )}

                  {/* Code Input */}
                  <div className="flex justify-center gap-3">
                    {smsCode.map((digit, index) => (
                      <Input
                        key={index}
                        ref={codeInputRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeInput(index, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        className="w-14 h-14 text-center text-2xl font-bold bg-slate-900 border-slate-700 text-white focus:border-primary"
                        disabled={isLoading}
                      />
                    ))}
                  </div>

                  {isLoading && (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleChangePhone}
                      className="text-sm text-slate-400 hover:text-white flex items-center gap-2 mx-auto"
                    >
                      Falsche Nummer? <span className="text-primary">Telefonnummer ändern</span>
                    </button>

                    <div className="text-center">
                      <p className="text-slate-500 text-sm mb-2">Keine SMS erhalten?</p>
                      {blockedUntil && blockedUntil > new Date() ? (
                        <p className="text-red-400 text-sm">
                          Bitte warte {Math.ceil((blockedUntil.getTime() - Date.now()) / 60000)} Minuten.
                        </p>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={sendSms}
                          disabled={isResending || remainingSms <= 0}
                          className="border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                          {isResending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Erneut senden {remainingSms > 0 && `(noch ${remainingSms})`}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Welcome */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto"
                  >
                    <PartyPopper className="h-12 w-12 text-primary" />
                  </motion.div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">
                      Willkommen bei NICNOA&CO.online!
                    </h2>
                    <p className="text-slate-400">
                      Dein Konto wurde erfolgreich erstellt und verifiziert.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Check className="h-5 w-5" />
                    <span>E-Mail verifiziert</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Check className="h-5 w-5" />
                    <span>Telefon verifiziert</span>
                  </div>

                  <Button
                    onClick={handleStartTour}
                    className="w-full h-12 bg-white text-black hover:bg-slate-200"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Zur Guided Tour
                  </Button>

                  <p className="text-slate-500 text-xs">
                    Wir zeigen dir alles, was du wissen musst.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA to Login */}
            {step < 5 && (
              <p className="text-slate-400 text-sm">
                {config.registerCtaText}{' '}
                <Link href="/login" className="text-primary hover:underline">
                  {config.registerCtaLink}
                </Link>
              </p>
            )}
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
