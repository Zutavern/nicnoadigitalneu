'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  Crown,
  Star,
  TrendingUp,
  MessageSquare,
  Camera,
  Calendar,
  Users,
  Zap,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

const features = {
  free: [
    'Grundlegende Profilverwaltung',
    'Preislisten erstellen',
    'Nachrichten-System',
    'Terminkalender (Basic)',
  ],
  premium: [
    'Alles aus Free',
    'Google Business Integration',
    'Bewertungen verwalten & beantworten',
    'Performance-Insights & Analytics',
    'KI-gestützte Antwortvorschläge',
    'Unbegrenzte Posts erstellen',
    'Foto-Management',
    'Prioritäts-Support',
    'Social Media Integration',
    'Automatische Synchronisierung',
  ],
}

const plans = [
  {
    id: 'monthly',
    name: 'Monatlich',
    price: 29,
    interval: 'Monat',
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Jährlich',
    price: 249,
    interval: 'Jahr',
    savings: '2 Monate gratis',
    popular: true,
  },
]

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState('yearly')
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan }),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Erstellen der Checkout-Session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      toast.error('Fehler beim Starten des Upgrades')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-6">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Werde Premium-Mitglied
            </span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Entfessle das volle Potenzial
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verbinde dein Google Business Profil und erreiche mehr Kunden 
            mit professionellen Tools und KI-gestützten Features.
          </p>
        </motion.div>

        {/* Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-2 border-primary ring-4 ring-primary/10'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  Beliebteste Wahl
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">€{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
                {plan.savings && (
                  <Badge variant="secondary" className="mt-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {plan.savings}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="text-center">
                <div className={`h-5 w-5 mx-auto rounded-full border-2 transition-all ${
                  selectedPlan === plan.id
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground/30'
                }`}>
                  {selectedPlan === plan.id && (
                    <Check className="h-4 w-4 text-primary-foreground mx-auto" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Free */}
          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                Free
              </CardTitle>
              <CardDescription>Grundfunktionen für den Start</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.free.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                Premium
              </CardTitle>
              <CardDescription>Voller Zugang zu allen Features</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.premium.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-center">
            <Star className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="font-medium text-blue-700 dark:text-blue-400">Bewertungen</p>
            <p className="text-xs text-muted-foreground">Verwalten & Antworten</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
            <p className="font-medium text-emerald-700 dark:text-emerald-400">Insights</p>
            <p className="text-xs text-muted-foreground">Performance-Daten</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-center">
            <MessageSquare className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="font-medium text-purple-700 dark:text-purple-400">KI-Antworten</p>
            <p className="text-xs text-muted-foreground">Smart Suggestions</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-center">
            <Camera className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <p className="font-medium text-amber-700 dark:text-amber-400">Medien</p>
            <p className="text-xs text-muted-foreground">Fotos & Posts</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={handleUpgrade}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 text-lg shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Crown className="h-5 w-5 mr-2" />
            )}
            Jetzt Premium werden
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            14 Tage Geld-zurück-Garantie • Jederzeit kündbar
          </p>
        </motion.div>
      </div>
    </div>
  )
}

