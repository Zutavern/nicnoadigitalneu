'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock, Eye, EyeOff, User, Building2, Scissors, Check, X } from 'lucide-react'

type UserRole = 'SALON_OWNER' | 'STYLIST'

const passwordRequirements = [
  { id: 'length', label: 'Mindestens 8 Zeichen', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'Ein Großbuchstabe', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Ein Kleinbuchstabe', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'Eine Zahl', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'Ein Sonderzeichen', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function RegisterPage() {
  const router = useRouter()
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

  const isPasswordValid = passwordRequirements.every(req => req.test(formData.password))
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ''

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role })
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isPasswordValid) {
      setFormError('Bitte erfüllen Sie alle Passwort-Anforderungen')
      return
    }

    if (!doPasswordsMatch) {
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
        setFormError(data.error || 'Registrierung fehlgeschlagen')
        return
      }

      // Auto-login after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setFormError('Registrierung erfolgreich, aber Anmeldung fehlgeschlagen')
      } else {
        router.push('/onboarding')
        router.refresh()
      }
    } catch {
      setFormError('Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = (provider: string) => {
    // Store role selection for OAuth flow
    if (formData.role) {
      localStorage.setItem('pendingRole', formData.role)
    }
    setIsLoading(true)
    signIn(provider, { callbackUrl: '/onboarding' })
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
              NICNOA <span className="text-primary">&</span> CO.
            </span>
            <span className="text-lg font-medium text-muted-foreground">DIGITAL</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4">
            Starten Sie durch!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Registrieren Sie sich jetzt und erleben Sie, wie einfach Salon-Management sein kann.
          </p>
          
          <div className="space-y-6">
            <div className="rounded-xl border bg-card/50 p-6">
              <div className="flex items-center gap-4 mb-3">
                <Building2 className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Für Salonbetreiber</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Verwalten Sie Ihren Salon-Space, vermieten Sie Stühle und maximieren Sie Ihre Auslastung.
              </p>
            </div>
            
            <div className="rounded-xl border bg-card/50 p-6">
              <div className="flex items-center gap-4 mb-3">
                <Scissors className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Für Stuhlmieter</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Finden Sie den perfekten Arbeitsplatz, verwalten Sie Ihre Termine und bauen Sie Ihr Business auf.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Registration Form */}
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
                  NICNOA <span className="text-primary">&</span> CO.
                </span>
              </Link>
            </div>
            <h2 className="text-3xl font-bold">Registrieren</h2>
            <p className="mt-2 text-muted-foreground">
              Bereits ein Konto?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Jetzt anmelden
              </Link>
            </p>
          </div>

          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm"
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
              <p className="text-center text-muted-foreground mb-6">
                Wählen Sie Ihre Rolle
              </p>
              
              <button
                onClick={() => handleRoleSelect('SALON_OWNER')}
                className="w-full p-6 rounded-xl border bg-card hover:border-primary hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Salonbetreiber</h3>
                    <p className="text-sm text-muted-foreground">
                      Ich möchte meinen Salon verwalten und Stühle vermieten
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('STYLIST')}
                className="w-full p-6 rounded-xl border bg-card hover:border-primary hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Scissors className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Stuhlmieter / Stylist</h3>
                    <p className="text-sm text-muted-foreground">
                      Ich suche einen Arbeitsplatz in einem Salon
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          )}

          {/* Step 2: Registration Form */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <button
                onClick={() => setStep(1)}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
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
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Mit Google registrieren
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
                  Mit LinkedIn registrieren
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ihr Name"
                      className="pl-10 h-12"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password">Passwort</Label>
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
                  
                  {/* Password Requirements */}
                  <div className="mt-3 space-y-2">
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.id}
                        className={`flex items-center gap-2 text-xs ${
                          req.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'
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
                  <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 h-12"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  {formData.confirmPassword && (
                    <div className={`flex items-center gap-2 text-xs ${doPasswordsMatch ? 'text-green-600' : 'text-destructive'}`}>
                      {doPasswordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {doPasswordsMatch ? 'Passwörter stimmen überein' : 'Passwörter stimmen nicht überein'}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12" 
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

                <p className="text-xs text-center text-muted-foreground">
                  Mit der Registrierung akzeptieren Sie unsere{' '}
                  <Link href="/agb" className="text-primary hover:underline">AGB</Link>
                  {' '}und{' '}
                  <Link href="/datenschutz" className="text-primary hover:underline">Datenschutzrichtlinie</Link>.
                </p>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
