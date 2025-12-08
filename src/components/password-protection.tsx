'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from 'lucide-react'

export function PasswordProtection() {
  const [isVisible, setIsVisible] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true) // Default: enabled
  const [isChecking, setIsChecking] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Prüfe zuerst, ob Passwort-Schutz aktiviert ist
    const checkPasswordProtection = async () => {
      try {
        const res = await fetch('/api/platform/password-protection-status')
        if (res.ok) {
          const data = await res.json()
          setIsEnabled(data.enabled ?? true)
        }
      } catch (error) {
        console.error('Error checking password protection status:', error)
        // Bei Fehler: Standardmäßig aktiviert lassen
        setIsEnabled(true)
      } finally {
        setIsChecking(false)
      }
    }

    checkPasswordProtection()
  }, [])

  useEffect(() => {
    // Nur prüfen, wenn nicht mehr geladen wird und Passwort-Schutz aktiviert ist
    if (isChecking || !isEnabled) {
      return
    }

    // Prüfe sessionStorage statt localStorage für Session-basierte Prüfung
    const hasEnteredPassword = sessionStorage.getItem('passwordEntered')
    if (!hasEnteredPassword) {
      setIsVisible(true)
      // Fokus auf Input setzen nach kurzer Verzögerung
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isChecking, isEnabled])

  // Caps Lock Erkennung
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockOn(true)
    } else {
      setCapsLockOn(false)
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockOn(true)
    } else {
      setCapsLockOn(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'Letsmakemoney') {
      setError(false)
      setIsLoading(true)
      
      // Kurze Verzögerung für besseres UX
      setTimeout(() => {
        sessionStorage.setItem('passwordEntered', 'true')
        setIsVisible(false)
        setIsLoading(false)
      }, 800)
    } else {
      setError(true)
      setPassword('')
      // Schüttel-Animation beim Fehler
      const form = e.target as HTMLFormElement
      form.classList.add('shake')
      setTimeout(() => {
        form.classList.remove('shake')
        inputRef.current?.focus()
      }, 500)
    }
  }

  // Nicht anzeigen, wenn noch geladen wird oder Passwort-Schutz deaktiviert ist
  if (isChecking || !isEnabled || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl"
      >
        {/* Dekorativer Hintergrund */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30,
              duration: 0.6 
            }}
            className="relative w-full max-w-md rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-primary/10"
          >
            {/* Header */}
            <motion.div 
              className="space-y-6 text-center mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                  <div className="relative bg-primary/10 p-4 rounded-full">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent mb-2">
                  Willkommen bei NICNOA
                </h2>
                <p className="text-muted-foreground">
                  Bitte geben Sie das Zugangspasswort ein, um fortzufahren
                </p>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div 
                className="space-y-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <Input
                    ref={inputRef}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Passwort eingeben..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(false)
                    }}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    className={`pr-10 bg-background/50 backdrop-blur-sm transition-all text-lg h-12 ${
                      error 
                        ? 'border-destructive focus-visible:ring-destructive' 
                        : 'focus-visible:ring-primary/20'
                    }`}
                    autoComplete="off"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Caps Lock Warnung */}
                {capsLockOn && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Caps Lock ist aktiviert</span>
                  </motion.div>
                )}

                {/* Fehler-Meldung */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Falsches Passwort. Bitte versuchen Sie es erneut.</span>
                  </motion.div>
                )}

                {/* Passwort-Hinweis */}
                <p className="text-xs text-muted-foreground text-center">
                  Tipp: Das Passwort ist case-sensitive
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  disabled={isLoading || !password.trim()}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Zugang wird gewährt...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Zugang anfordern
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center"
            >
              <p className="text-xs text-muted-foreground">
                Geschützt durch Session-basierte Authentifizierung
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 