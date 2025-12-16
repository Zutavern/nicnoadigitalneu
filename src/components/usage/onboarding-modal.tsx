'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Check,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OnboardingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export function OnboardingModal({ open, onOpenChange, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!open) {
      setStep(0)
    }
  }, [open])

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      // Mark as seen in localStorage
      localStorage.setItem('metered-billing-onboarding', 'completed')
      onComplete?.()
      onOpenChange(false)
    }
  }

  const steps = [
    {
      icon: Sparkles,
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      title: 'Neues Abrechnungsmodell',
      subtitle: 'Fair & Transparent',
      content: (
        <div className="space-y-6">
          <p className="text-lg text-center text-muted-foreground">
            Ab sofort zahlst du nur, was du wirklich verbrauchst!
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="font-semibold text-sm text-muted-foreground mb-2">VORHER</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 line-through text-muted-foreground">
                  <span className="h-4 w-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-xs">✕</span>
                  </span>
                  100 Credits kaufen
                </li>
                <li className="flex items-center gap-2 line-through text-muted-foreground">
                  <span className="h-4 w-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-xs">✕</span>
                  </span>
                  Ungenutzte verfallen
                </li>
                <li className="flex items-center gap-2 line-through text-muted-foreground">
                  <span className="h-4 w-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-xs">✕</span>
                  </span>
                  Pakete nachkaufen
                </li>
              </ul>
            </div>
            
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50">
              <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-300 mb-2">JETZT</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <Check className="h-4 w-4" />
                  Nutzen & am Monatsende zahlen
                </li>
                <li className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <Check className="h-4 w-4" />
                  Nur zahlen was du brauchst
                </li>
                <li className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <Check className="h-4 w-4" />
                  Alles transparent
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: DollarSign,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      title: 'Transparente Preise',
      subtitle: 'Du siehst alles',
      content: (
        <div className="space-y-6">
          <p className="text-lg text-center text-muted-foreground">
            Jede Nutzung wird transparent berechnet und aufgelistet.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Social Media Posts</p>
                <p className="text-sm text-muted-foreground">Text-Generierung</p>
              </div>
              <p className="font-mono">~€0.02</p>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-xl">🖼️</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Bild-Generierung</p>
                <p className="text-sm text-muted-foreground">Flux, SDXL, etc.</p>
              </div>
              <p className="font-mono">~€0.01</p>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <span className="text-xl">🎬</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Video-Erstellung</p>
                <p className="text-sm text-muted-foreground">Minimax, etc.</p>
              </div>
              <p className="font-mono">~€0.35</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Shield,
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
      title: 'Du hast die Kontrolle',
      subtitle: 'Limits setzen',
      content: (
        <div className="space-y-6">
          <p className="text-lg text-center text-muted-foreground">
            Setze ein monatliches Limit und behalte die volle Kontrolle.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50">
              <Check className="h-6 w-6 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-semibold">Keine versteckten Kosten</p>
                <p className="text-sm text-muted-foreground">
                  Du siehst genau, was jede Aktion kostet
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50">
              <Check className="h-6 w-6 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-semibold">€10 inkl. in deinem Abo</p>
                <p className="text-sm text-muted-foreground">
                  Jeden Monat sind €10 AI-Guthaben inklusive
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50">
              <Check className="h-6 w-6 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-semibold">Jederzeit Limit setzen</p>
                <p className="text-sm text-muted-foreground">
                  Bestimme selbst, wie viel du maximal ausgeben möchtest
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const currentStep = steps[step]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6 pb-0">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg",
                  currentStep.iconBg
                )}>
                  <currentStep.icon className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {currentStep.subtitle}
                </p>
                <h2 className="text-2xl font-bold">{currentStep.title}</h2>
              </div>

              {/* Content */}
              {currentStep.content}
            </div>

            {/* Footer */}
            <div className="p-6 pt-8 flex items-center justify-between">
              {/* Progress dots */}
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === step
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>

              {/* Action button */}
              <Button onClick={handleNext} size="lg">
                {step === steps.length - 1 ? (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Verstanden!
                  </>
                ) : (
                  <>
                    Weiter
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

