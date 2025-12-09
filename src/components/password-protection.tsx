'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'

export function PasswordProtection() {
  // Initial: Overlay ist IMMER sichtbar (verhindert Flash of Content)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  const [isChecking, setIsChecking] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Prüfe, ob Passwort-Schutz aktiviert ist
    const checkPasswordProtection = async () => {
      try {
        const res = await fetch('/api/platform/password-protection-status')
        if (res.ok) {
          const data = await res.json()
          setIsEnabled(data.enabled ?? true)
          
          // Wenn deaktiviert, sofort entsperren
          if (!data.enabled) {
            setIsUnlocked(true)
          }
        }
      } catch (error) {
        console.error('Error checking password protection status:', error)
        setIsEnabled(true)
      } finally {
        setIsChecking(false)
      }
    }

    checkPasswordProtection()
  }, [])

  useEffect(() => {
    if (isChecking || !isEnabled) return

    // Prüfe sessionStorage
    const hasEnteredPassword = sessionStorage.getItem('passwordEntered')
    if (hasEnteredPassword) {
      setIsUnlocked(true)
    } else {
      // Fokus auf Input setzen
      setTimeout(() => {
        inputRef.current?.focus()
      }, 500)
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
      
      // Animation starten
      setTimeout(() => {
        sessionStorage.setItem('passwordEntered', 'true')
        setIsAnimatingOut(true)
        
        // Nach Animation komplett ausblenden
        setTimeout(() => {
          setIsUnlocked(true)
          setIsLoading(false)
        }, 1200)
      }, 600)
    } else {
      setError(true)
      setPassword('')
      // Schüttel-Animation
      const form = e.target as HTMLFormElement
      form.classList.add('shake')
      setTimeout(() => {
        form.classList.remove('shake')
        inputRef.current?.focus()
      }, 500)
    }
  }

  // Wenn entsperrt oder deaktiviert, nichts anzeigen
  if (isUnlocked) return null

  return (
    <AnimatePresence mode="wait">
      {!isAnimatingOut ? (
        <motion.div
          key="password-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] overflow-hidden"
        >
          {/* Dunkler Gradient-Hintergrund */}
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{
              background: 'linear-gradient(135deg, #0a0a0f 0%, #0f1419 25%, #121827 50%, #0d1117 75%, #0a0a0f 100%)',
            }}
          >
            {/* Animierte Partikel/Sterne im Hintergrund */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Große blaue Glow-Effekte */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px]" />
          </motion.div>

          {/* Login Box */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, y: 60, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -100, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                duration: 0.8
              }}
              className="relative w-full max-w-md"
            >
              {/* Glow hinter der Box */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-75" />
              
              {/* Die Box selbst */}
              <div className="relative rounded-2xl border border-blue-500/20 bg-slate-900/90 backdrop-blur-2xl p-8 shadow-2xl shadow-blue-500/10">
                {/* Subtiler Gradient-Border-Effekt */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-500/10 to-transparent opacity-50 pointer-events-none" />
                
                {/* Header */}
                <motion.div 
                  className="relative space-y-6 text-center mb-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Logo/Icon */}
                  <div className="flex justify-center mb-6">
                    <motion.div 
                      className="relative"
                      animate={{ 
                        boxShadow: [
                          '0 0 20px rgba(59, 130, 246, 0.3)',
                          '0 0 40px rgba(59, 130, 246, 0.5)',
                          '0 0 20px rgba(59, 130, 246, 0.3)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl" />
                      <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-lg">
                        <Lock className="w-10 h-10 text-white" />
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Titel */}
                  <div>
                    <motion.div 
                      className="flex items-center justify-center gap-2 mb-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Sparkles className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400 tracking-wider uppercase">
                        Exklusiver Zugang
                      </span>
                      <Sparkles className="w-5 h-5 text-blue-400" />
                    </motion.div>
                    
                    <h2 className="text-4xl font-bold tracking-tight mb-2">
                      <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                        NICNOA & Co
                      </span>
                    </h2>
                    <p className="text-lg text-blue-200/80 font-medium">
                      ist online
                    </p>
                    <p className="text-sm text-slate-400 mt-3">
                      Bitte geben Sie das Zugangspasswort ein
                    </p>
                  </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="relative space-y-6">
                  <motion.div 
                    className="space-y-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
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
                        className={`pr-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 text-lg h-14 rounded-xl transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                          error 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                            : ''
                        }`}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
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
                    <AnimatePresence>
                      {capsLockOn && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>Caps Lock ist aktiviert</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Fehler-Meldung */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>Falsches Passwort. Bitte versuchen Sie es erneut.</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Passwort-Hinweis */}
                    <p className="text-xs text-slate-500 text-center">
                      Das Passwort ist case-sensitive
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all shadow-lg shadow-blue-500/25 rounded-xl border-0"
                      disabled={isLoading || !password.trim()}
                    >
                      {isLoading ? (
                        <motion.span 
                          className="flex items-center gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Zugang wird gewährt...
                        </motion.span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Eintreten
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <div className="w-8 h-px bg-slate-700" />
                    <Lock className="w-3 h-3" />
                    <span>Session-basierte Authentifizierung</span>
                    <div className="w-8 h-px bg-slate-700" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        /* Unlock Animation - Box fährt raus, dann Hintergrund */
        <motion.div
          key="unlock-animation"
          className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none"
        >
          {/* Hintergrund faded aus */}
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            style={{
              background: 'linear-gradient(135deg, #0a0a0f 0%, #0f1419 25%, #121827 50%, #0d1117 75%, #0a0a0f 100%)',
            }}
          >
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
          </motion.div>

          {/* Success Message */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 1, y: 0, opacity: 1 }}
              animate={{ scale: 0.8, y: -200, opacity: 0 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.4, 0, 0.2, 1]
              }}
              className="relative w-full max-w-md"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 via-emerald-500/30 to-green-500/30 rounded-3xl blur-xl opacity-75" />
              <div className="relative rounded-2xl border border-green-500/30 bg-slate-900/90 backdrop-blur-2xl p-8 shadow-2xl">
                <div className="text-center">
                  <motion.div 
                    className="flex justify-center mb-4"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Willkommen!
                  </h2>
                  <p className="text-green-400">
                    Zugang gewährt
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
