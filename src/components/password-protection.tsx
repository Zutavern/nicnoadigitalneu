'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from 'lucide-react'

export function PasswordProtection() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  const [isChecking, setIsChecking] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkPasswordProtection = async () => {
      try {
        const res = await fetch('/api/platform/password-protection-status')
        if (res.ok) {
          const data = await res.json()
          setIsEnabled(data.enabled ?? true)
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
    const hasEnteredPassword = sessionStorage.getItem('passwordEntered')
    if (hasEnteredPassword) {
      setIsUnlocked(true)
    } else {
      setTimeout(() => inputRef.current?.focus(), 500)
    }
  }, [isChecking, isEnabled])

  // Countdown-Logik
  useEffect(() => {
    if (countdown === null) return
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setTimeout(() => {
        sessionStorage.setItem('passwordEntered', 'true')
        setIsAnimatingOut(true)
        setTimeout(() => setIsUnlocked(true), 800)
      }, 500)
    }
  }, [countdown])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState?.('CapsLock') ?? false)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState?.('CapsLock') ?? false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'Letsmakemoney') {
      setError(false)
      setCountdown(3)
    } else {
      setError(true)
      setPassword('')
      const form = e.target as HTMLFormElement
      form.classList.add('shake')
      setTimeout(() => {
        form.classList.remove('shake')
        inputRef.current?.focus()
      }, 500)
    }
  }

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
          {/* Dunkler NICNOA Hintergrund */}
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{
              background: 'linear-gradient(135deg, #030304 0%, #050506 25%, #080809 50%, #050506 75%, #030304 100%)',
            }}
          >
            {/* Subtiles Grid-Muster */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(151, 30%, 50%) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(151, 30%, 50%) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
              }}
            />

            {/* Animierte Partikel - kleine */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div className="absolute w-1 h-1 bg-[hsl(151,40%,50%)]/40 rounded-full" style={{ left: '5%', top: '10%' }} animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.8, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0 }} />
              <motion.div className="absolute w-1 h-1 bg-[hsl(151,40%,50%)]/40 rounded-full" style={{ left: '12%', top: '75%' }} animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.8, 1] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }} />
              <motion.div className="absolute w-1 h-1 bg-[hsl(151,40%,50%)]/40 rounded-full" style={{ left: '22%', top: '30%' }} animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.8, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1 }} />
              <motion.div className="absolute w-1 h-1 bg-[hsl(151,40%,50%)]/40 rounded-full" style={{ left: '33%', top: '88%' }} animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.8, 1] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.3 }} />
              <motion.div className="absolute w-1 h-1 bg-[hsl(151,40%,50%)]/40 rounded-full" style={{ left: '42%', top: '15%' }} animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.8, 1] }} transition={{ duration: 4.5, repeat: Infinity, delay: 1.5 }} />
              <motion.div className="absolute w-1 h-1 bg-[hsl(151,40%,50%)]/40 rounded-full" style={{ left: '55%', top: '65%' }} animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.8, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
              <motion.div className="absolute w-1 h-1 bg-[hsl(151,40%,50%)]/40 rounded-full" style={{ left: '68%', top: '92%' }} animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.8, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
              <motion.div className="absolute w-1 h-1 bg-[hsl(151,40%,50%)]/40 rounded-full" style={{ left: '78%', top: '25%' }} animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.8, 1] }} transition={{ duration: 3.8, repeat: Infinity, delay: 0.2 }} />
              <motion.div className="absolute w-1 h-1 bg-[hsl(151,40%,50%)]/40 rounded-full" style={{ left: '88%', top: '55%' }} animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.8, 1] }} transition={{ duration: 4.2, repeat: Infinity, delay: 1.8 }} />
              <motion.div className="absolute w-1 h-1 bg-[hsl(151,40%,50%)]/40 rounded-full" style={{ left: '95%', top: '82%' }} animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.8, 1] }} transition={{ duration: 2.8, repeat: Infinity, delay: 0.6 }} />
              
              {/* Mittlere Partikel */}
              <motion.div className="absolute w-1.5 h-1.5 bg-[hsl(151,35%,45%)]/30 rounded-full" style={{ left: '8%', top: '45%' }} animate={{ opacity: [0.1, 0.7, 0.1], scale: [1, 1.5, 1] }} transition={{ duration: 5, repeat: Infinity, delay: 0.7 }} />
              <motion.div className="absolute w-1.5 h-1.5 bg-[hsl(151,35%,45%)]/30 rounded-full" style={{ left: '18%', top: '58%' }} animate={{ opacity: [0.1, 0.7, 0.1], scale: [1, 1.5, 1] }} transition={{ duration: 4.5, repeat: Infinity, delay: 1.4 }} />
              <motion.div className="absolute w-1.5 h-1.5 bg-[hsl(151,35%,45%)]/30 rounded-full" style={{ left: '28%', top: '12%' }} animate={{ opacity: [0.1, 0.7, 0.1], scale: [1, 1.5, 1] }} transition={{ duration: 5.2, repeat: Infinity, delay: 0.9 }} />
              <motion.div className="absolute w-1.5 h-1.5 bg-[hsl(151,35%,45%)]/30 rounded-full" style={{ left: '48%', top: '78%' }} animate={{ opacity: [0.1, 0.7, 0.1], scale: [1, 1.5, 1] }} transition={{ duration: 4.8, repeat: Infinity, delay: 2.1 }} />
              <motion.div className="absolute w-1.5 h-1.5 bg-[hsl(151,35%,45%)]/30 rounded-full" style={{ left: '62%', top: '35%' }} animate={{ opacity: [0.1, 0.7, 0.1], scale: [1, 1.5, 1] }} transition={{ duration: 5.5, repeat: Infinity, delay: 1.1 }} />
              <motion.div className="absolute w-1.5 h-1.5 bg-[hsl(151,35%,45%)]/30 rounded-full" style={{ left: '82%', top: '68%' }} animate={{ opacity: [0.1, 0.7, 0.1], scale: [1, 1.5, 1] }} transition={{ duration: 4.3, repeat: Infinity, delay: 0.4 }} />
              <motion.div className="absolute w-1.5 h-1.5 bg-[hsl(151,35%,45%)]/30 rounded-full" style={{ left: '92%', top: '18%' }} animate={{ opacity: [0.1, 0.7, 0.1], scale: [1, 1.5, 1] }} transition={{ duration: 5.8, repeat: Infinity, delay: 1.7 }} />
              
              {/* Große, langsam pulsierende Partikel */}
              <motion.div className="absolute w-2 h-2 bg-[hsl(151,30%,40%)]/20 rounded-full" style={{ left: '15%', top: '22%' }} animate={{ opacity: [0.05, 0.4, 0.05], scale: [1, 1.3, 1] }} transition={{ duration: 6, repeat: Infinity, delay: 0 }} />
              <motion.div className="absolute w-2 h-2 bg-[hsl(151,30%,40%)]/20 rounded-full" style={{ left: '38%', top: '42%' }} animate={{ opacity: [0.05, 0.4, 0.05], scale: [1, 1.3, 1] }} transition={{ duration: 7, repeat: Infinity, delay: 1.5 }} />
              <motion.div className="absolute w-2 h-2 bg-[hsl(151,30%,40%)]/20 rounded-full" style={{ left: '72%', top: '48%' }} animate={{ opacity: [0.05, 0.4, 0.05], scale: [1, 1.3, 1] }} transition={{ duration: 6.5, repeat: Infinity, delay: 3 }} />
              <motion.div className="absolute w-2 h-2 bg-[hsl(151,30%,40%)]/20 rounded-full" style={{ left: '85%', top: '85%' }} animate={{ opacity: [0.05, 0.4, 0.05], scale: [1, 1.3, 1] }} transition={{ duration: 5.5, repeat: Infinity, delay: 2 }} />
              
              {/* Winzige, schnell blinkende Sterne */}
              <motion.div className="absolute w-0.5 h-0.5 bg-white/50 rounded-full" style={{ left: '3%', top: '5%' }} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} />
              <motion.div className="absolute w-0.5 h-0.5 bg-white/50 rounded-full" style={{ left: '97%', top: '8%' }} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }} />
              <motion.div className="absolute w-0.5 h-0.5 bg-white/50 rounded-full" style={{ left: '25%', top: '95%' }} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.7 }} />
              <motion.div className="absolute w-0.5 h-0.5 bg-white/50 rounded-full" style={{ left: '75%', top: '3%' }} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 1.1 }} />
              <motion.div className="absolute w-0.5 h-0.5 bg-white/50 rounded-full" style={{ left: '50%', top: '50%' }} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.5 }} />
              <motion.div className="absolute w-0.5 h-0.5 bg-white/50 rounded-full" style={{ left: '35%', top: '70%' }} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.9 }} />
              <motion.div className="absolute w-0.5 h-0.5 bg-white/50 rounded-full" style={{ left: '65%', top: '15%' }} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.7, repeat: Infinity, delay: 1.3 }} />
              <motion.div className="absolute w-0.5 h-0.5 bg-white/50 rounded-full" style={{ left: '8%', top: '88%' }} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.3, repeat: Infinity, delay: 0.2 }} />
              
              {/* Aufsteigende Partikel */}
              <motion.div 
                className="absolute w-1 h-1 bg-[hsl(151,40%,55%)]/50 rounded-full" 
                style={{ left: '20%', bottom: '0%' }} 
                animate={{ y: [0, -800], opacity: [0, 0.8, 0] }} 
                transition={{ duration: 8, repeat: Infinity, delay: 0, ease: "linear" }} 
              />
              <motion.div 
                className="absolute w-1 h-1 bg-[hsl(151,40%,55%)]/50 rounded-full" 
                style={{ left: '40%', bottom: '0%' }} 
                animate={{ y: [0, -900], opacity: [0, 0.8, 0] }} 
                transition={{ duration: 10, repeat: Infinity, delay: 2, ease: "linear" }} 
              />
              <motion.div 
                className="absolute w-1 h-1 bg-[hsl(151,40%,55%)]/50 rounded-full" 
                style={{ left: '60%', bottom: '0%' }} 
                animate={{ y: [0, -700], opacity: [0, 0.8, 0] }} 
                transition={{ duration: 7, repeat: Infinity, delay: 4, ease: "linear" }} 
              />
              <motion.div 
                className="absolute w-1 h-1 bg-[hsl(151,40%,55%)]/50 rounded-full" 
                style={{ left: '80%', bottom: '0%' }} 
                animate={{ y: [0, -850], opacity: [0, 0.8, 0] }} 
                transition={{ duration: 9, repeat: Infinity, delay: 1, ease: "linear" }} 
              />
              <motion.div 
                className="absolute w-0.5 h-0.5 bg-white/40 rounded-full" 
                style={{ left: '30%', bottom: '0%' }} 
                animate={{ y: [0, -600], opacity: [0, 0.6, 0] }} 
                transition={{ duration: 6, repeat: Infinity, delay: 3, ease: "linear" }} 
              />
              <motion.div 
                className="absolute w-0.5 h-0.5 bg-white/40 rounded-full" 
                style={{ left: '70%', bottom: '0%' }} 
                animate={{ y: [0, -750], opacity: [0, 0.6, 0] }} 
                transition={{ duration: 8, repeat: Infinity, delay: 5, ease: "linear" }} 
              />
            </div>

            {/* NICNOA Teal Glow-Effekte - intensiver */}
            <motion.div 
              className="absolute top-0 left-0 w-[900px] h-[900px] bg-[hsl(151,35%,25%)]/15 rounded-full blur-[180px]"
              animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.2, 0.15] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-[hsl(151,40%,22%)]/12 rounded-full blur-[150px]"
              animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.18, 0.12] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            <motion.div 
              className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[hsl(151,30%,30%)]/10 rounded-full blur-[100px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(151,25%,20%)]/8 rounded-full blur-[120px]" />
            
            {/* Subtiler Aurora-Effekt */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
              <motion.div 
                className="absolute -top-1/2 left-0 right-0 h-full bg-gradient-to-b from-[hsl(151,40%,30%)]/20 via-transparent to-transparent"
                style={{ transform: 'skewY(-12deg)' }}
                animate={{ x: ['-50%', '50%', '-50%'] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute -top-1/2 left-0 right-0 h-full bg-gradient-to-b from-[hsl(151,35%,25%)]/15 via-transparent to-transparent"
                style={{ transform: 'skewY(12deg)' }}
                animate={{ x: ['50%', '-50%', '50%'] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            
            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
          </motion.div>

          {/* Login Box */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, y: 60, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.8 }}
              className="relative w-full max-w-md"
            >
              {/* Animierter Glow hinter der Box */}
              <motion.div 
                className="absolute -inset-2 bg-gradient-to-r from-[hsl(151,40%,40%)] via-[hsl(151,35%,35%)] to-[hsl(151,40%,40%)] rounded-3xl blur-2xl"
                animate={{ 
                  opacity: [0.25, 0.4, 0.25],
                  scale: [1, 1.02, 1],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
              {/* Zweiter Glow-Layer für mehr Tiefe */}
              <div className="absolute -inset-1 bg-gradient-to-b from-[hsl(151,35%,45%)]/30 to-transparent rounded-3xl blur-xl" />
              
              {/* Die Box selbst - mit subtiler Border-Glow */}
              <div className="relative rounded-2xl border border-[hsl(151,30%,40%)]/30 bg-[#1a1a1c]/95 backdrop-blur-2xl p-8 shadow-2xl shadow-[hsl(151,30%,30%)]/20">
                
                {/* Header mit Logo */}
                <motion.div 
                  className="relative space-y-4 text-center mb-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Lock Icon */}
                  <div className="flex justify-center mb-6">
                    <motion.div 
                      className="relative"
                      animate={countdown !== null ? { rotateY: 180, scale: 1.1 } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
                      <div className="relative bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg">
                        <Lock className="w-8 h-8 text-primary-foreground" />
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* NICNOA&CO.online Logo - wie im Header */}
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">
                      <span className="text-foreground">NICNOA</span>
                      <span className="text-primary">&CO</span>
                      <span className="text-primary">.online</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Session-geschützter Preview-Zugang
                    </p>
                  </div>
                </motion.div>

                {/* Countdown Display */}
                <AnimatePresence mode="wait">
                  {countdown !== null ? (
                    <motion.div
                      key="countdown"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        key={countdown}
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="relative"
                      >
                        <span className="text-8xl font-black text-primary">
                          {countdown === 0 ? '✓' : countdown}
                        </span>
                        {countdown > 0 && (
                          <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <span className="text-8xl font-black text-primary/30">
                              {countdown}
                            </span>
                          </motion.div>
                        )}
                      </motion.div>
                      <p className="mt-4 text-muted-foreground text-sm">
                        {countdown === 0 ? 'Willkommen!' : 'Zugang wird freigeschaltet...'}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="form"
                      onSubmit={handleSubmit} 
                      className="space-y-6"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <motion.div 
                        className="space-y-3"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="relative">
                          <Input
                            ref={inputRef}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Session-Passwort eingeben..."
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value)
                              setError(false)
                            }}
                            onKeyDown={handleKeyDown}
                            onKeyUp={handleKeyUp}
                            className={`
                              h-14 pl-4 pr-12 text-lg
                              bg-background/50 border-border 
                              text-foreground placeholder:text-muted-foreground/50
                              focus:border-primary/50 focus:ring-2 focus:ring-primary/20
                              transition-all duration-300
                              ${error ? 'border-destructive/50' : ''}
                            `}
                            autoComplete="off"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                              className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>Falsches Passwort. Bitte versuchen Sie es erneut.</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full h-14 text-lg font-semibold"
                          disabled={!password.trim()}
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Zugang freischalten
                        </Button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Footer */}
                {countdown === null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <div className="w-8 h-px bg-border" />
                      <Lock className="w-3 h-3" />
                      <span>Session-basierte Authentifizierung</span>
                      <div className="w-8 h-px bg-border" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        /* Unlock Animation */
        <motion.div
          key="unlock-animation"
          className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none"
        >
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              background: 'linear-gradient(135deg, #050505 0%, #0a0a0b 25%, #0d0d0e 50%, #0a0a0b 75%, #050505 100%)',
            }}
          >
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[hsl(151,30%,25%)]/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[hsl(151,35%,20%)]/10 rounded-full blur-[120px]" />
          </motion.div>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 1, y: 0, opacity: 1 }}
              animate={{ scale: 0.8, y: -200, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-md"
            >
              <div className="absolute -inset-1 bg-primary/20 rounded-3xl blur-xl opacity-75" />
              <div className="relative rounded-2xl border border-primary/30 bg-[#1a1a1c]/95 backdrop-blur-2xl p-8 shadow-2xl">
                <div className="text-center">
                  <motion.div 
                    className="flex justify-center mb-4"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-primary p-4 rounded-2xl">
                      <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Willkommen!
                  </h2>
                  <p className="text-primary">
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
