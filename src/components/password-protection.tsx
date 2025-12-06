'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'

export function PasswordProtection() {
  const [isVisible, setIsVisible] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSparkles, setShowSparkles] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const hasEnteredPassword = localStorage.getItem('passwordEntered')
    if (!hasEnteredPassword) {
      setIsVisible(true)
    }
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isLoading && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0) {
      localStorage.setItem('passwordEntered', 'true')
      setIsVisible(false)
      setIsLoading(false)
    }
    return () => clearTimeout(timer)
  }, [isLoading, countdown])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'zukunft') {
      setError(false)
      setIsLoading(true)
      setShowSparkles(true)
      setCountdown(3)
    } else {
      setError(true)
      // Schüttel-Animation beim Fehler
      const form = e.target as HTMLFormElement
      form.classList.add('shake')
      setTimeout(() => form.classList.remove('shake'), 500)
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl"
      >
        <div className="fixed inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30,
              duration: 0.8 
            }}
            className="relative w-full max-w-sm rounded-xl border bg-card/50 backdrop-blur-sm p-8 shadow-2xl ring-1 ring-white/10"
          >
            {showSparkles && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-4 -right-4"
              >
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </motion.div>
            )}
            
            <motion.div 
              className="space-y-4 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary/80 via-primary to-primary/80 bg-clip-text text-transparent">
                NICNOA Dev Preview
              </h2>
              <div className="space-y-2">
                <p className="text-lg text-foreground">
                  🚀 Hey Nico!
                </p>
                <p className="text-sm text-muted-foreground">
                  Psst... das geheime Passwort bitte! 
                  <br />
                  <span className="text-xs">(Tipp: Es hat was mit der Zukunft zu tun 😉)</span>
                </p>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <motion.div 
                className="space-y-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Input
                  type="password"
                  placeholder="Das magische Wort..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-background/50 backdrop-blur-sm transition-all ${error ? 'border-destructive' : 'focus:ring-2 ring-primary/20'}`}
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                  >
                    Ups! Das war leider nicht das Zauberwort 🙈
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-primary/80 hover:bg-primary transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starte die Zeitmaschine... {countdown}s
                    </motion.div>
                  ) : (
                    'Beam mich rein! 🚀'
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 