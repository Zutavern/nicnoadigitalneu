'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useCookieConsent } from '@/components/providers/cookie-consent-provider'
import {
  Cookie,
  Shield,
  Settings2,
  ChevronRight,
  CheckCircle2,
  X,
  Lock,
  BarChart3,
  Target,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

const categoryIcons: Record<string, React.ReactNode> = {
  essential: <Lock className="h-5 w-5" />,
  functional: <Settings2 className="h-5 w-5" />,
  analytics: <BarChart3 className="h-5 w-5" />,
  marketing: <Target className="h-5 w-5" />,
}

export function CookieConsentBanner() {
  const {
    showBanner,
    setShowBanner,
    categories,
    consent,
    acceptAll,
    rejectAll,
    savePreferences,
  } = useCookieConsent()

  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true,
    functional: consent?.functional ?? false,
    analytics: consent?.analytics ?? false,
    marketing: consent?.marketing ?? false,
  })

  const handlePreferenceChange = (category: string, value: boolean) => {
    if (category === 'essential') return // Kann nicht geändert werden
    setPreferences((prev) => ({ ...prev, [category]: value }))
  }

  const handleSavePreferences = () => {
    savePreferences(preferences)
  }

  if (!showBanner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={() => {}} // Verhindere Schließen durch Klick außerhalb
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-x-0 bottom-0 z-[9999] max-h-[90vh] overflow-hidden"
        >
          <div className="relative mx-auto max-w-4xl p-4">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl" />

            {/* Main Container */}
            <div className="relative rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative px-6 py-5 border-b border-border/50">
                {/* Decorative gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
                      <div className="relative bg-gradient-to-br from-primary to-primary/80 p-3 rounded-xl">
                        <Cookie className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        Cookie-Einstellungen
                        <Badge variant="outline" className="ml-2 text-xs">
                          DSGVO
                        </Badge>
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Wir respektieren Ihre Privatsphäre
                      </p>
                    </div>
                  </div>

                  {consent && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => setShowBanner(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 max-h-[50vh] overflow-y-auto">
                {!showDetails ? (
                  // Einfache Ansicht
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Wir verwenden Cookies und ähnliche Technologien, um Ihnen das beste
                      Nutzererlebnis auf unserer Website zu ermöglichen. Einige Cookies sind
                      technisch notwendig, während andere uns helfen, die Website zu verbessern
                      und Ihnen personalisierte Inhalte anzuzeigen.
                    </p>

                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        Ihre Daten werden sicher und gemäß unserer{' '}
                        <Link
                          href="/datenschutz"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Datenschutzerklärung
                          <ExternalLink className="h-3 w-3" />
                        </Link>{' '}
                        verarbeitet.
                      </span>
                    </div>

                    {/* Quick Category Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className={`
                            flex items-center gap-2 p-3 rounded-lg border transition-colors
                            ${category.isRequired
                              ? 'bg-primary/5 border-primary/20'
                              : 'bg-muted/50 border-border/50 hover:border-border'
                            }
                          `}
                        >
                          <div
                            className={`
                              p-1.5 rounded-lg
                              ${category.isRequired ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}
                            `}
                          >
                            {categoryIcons[category.id]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{category.name}</p>
                            {category.isRequired && (
                              <p className="text-xs text-primary">Erforderlich</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Detaillierte Ansicht
                  <div className="space-y-4">
                    <Accordion type="multiple" className="space-y-2">
                      {categories.map((category) => (
                        <AccordionItem
                          key={category.id}
                          value={category.id}
                          className="border border-border/50 rounded-xl overflow-hidden bg-muted/30"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                            <div className="flex items-center gap-4 flex-1">
                              <div
                                className={`
                                  p-2 rounded-lg
                                  ${category.isRequired
                                    ? 'bg-primary/10 text-primary'
                                    : preferences[category.id as keyof typeof preferences]
                                      ? 'bg-green-500/10 text-green-500'
                                      : 'bg-muted text-muted-foreground'
                                  }
                                `}
                              >
                                {categoryIcons[category.id]}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{category.name}</span>
                                  {category.isRequired && (
                                    <Badge variant="secondary" className="text-xs">
                                      Erforderlich
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {category.description}
                                </p>
                              </div>
                              <div
                                className="shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Switch
                                  checked={
                                    category.isRequired ||
                                    preferences[category.id as keyof typeof preferences]
                                  }
                                  onCheckedChange={(checked) =>
                                    handlePreferenceChange(category.id, checked)
                                  }
                                  disabled={category.isRequired}
                                />
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="mt-2 space-y-3">
                              <p className="text-sm text-muted-foreground">
                                {category.description}
                              </p>

                              {category.cookies.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Verwendete Cookies ({category.cookies.length})
                                  </p>
                                  <div className="space-y-2">
                                    {category.cookies.map((cookie) => (
                                      <div
                                        key={cookie.name}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30"
                                      >
                                        <div className="p-1 rounded bg-muted">
                                          <Cookie className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                                              {cookie.name}
                                            </code>
                                            <span className="text-xs text-muted-foreground">
                                              {cookie.provider}
                                            </span>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {cookie.description}
                                          </p>
                                          <p className="text-xs text-muted-foreground/70 mt-1">
                                            Gültigkeit: {cookie.duration}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border/50 bg-muted/30">
                <div className="flex flex-col sm:flex-row gap-3">
                  {!showDetails ? (
                    // Einfache Ansicht Buttons
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        onClick={() => setShowDetails(true)}
                      >
                        <Settings2 className="h-4 w-4 mr-2" />
                        Einstellungen anpassen
                      </Button>
                      <div className="flex gap-3 flex-1 sm:justify-end">
                        <Button
                          variant="outline"
                          className="flex-1 sm:flex-none"
                          onClick={rejectAll}
                        >
                          Nur Notwendige
                        </Button>
                        <Button
                          className="flex-1 sm:flex-none group"
                          onClick={acceptAll}
                        >
                          <Sparkles className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                          Alle akzeptieren
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Detaillierte Ansicht Buttons
                    <>
                      <Button
                        variant="ghost"
                        className="flex-1 sm:flex-none"
                        onClick={() => setShowDetails(false)}
                      >
                        <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                        Zurück
                      </Button>
                      <div className="flex gap-3 flex-1 sm:justify-end">
                        <Button
                          variant="outline"
                          className="flex-1 sm:flex-none"
                          onClick={rejectAll}
                        >
                          Alle ablehnen
                        </Button>
                        <Button
                          className="flex-1 sm:flex-none"
                          onClick={handleSavePreferences}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Auswahl speichern
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer Links */}
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                  <Link href="/datenschutz" className="hover:text-foreground transition-colors">
                    Datenschutz
                  </Link>
                  <Separator orientation="vertical" className="h-3" />
                  <Link href="/impressum" className="hover:text-foreground transition-colors">
                    Impressum
                  </Link>
                  <Separator orientation="vertical" className="h-3" />
                  <Link href="/agb" className="hover:text-foreground transition-colors">
                    AGB
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Kleiner Button um Einstellungen erneut zu öffnen
export function CookieSettingsButton() {
  const { openSettings, hasConsented } = useCookieConsent()

  if (!hasConsented) return null

  return (
    <button
      onClick={openSettings}
      className="fixed bottom-4 left-4 z-50 p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-card transition-colors group"
      title="Cookie-Einstellungen"
    >
      <Cookie className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
    </button>
  )
}
