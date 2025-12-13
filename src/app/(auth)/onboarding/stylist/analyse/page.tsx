'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Loader2, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Phone,
  BookOpen,
  CreditCard,
  Tag,
  User,
  FileText,
  ArrowRight,
  Lightbulb,
  ExternalLink,
  Clock,
  TrendingUp,
  Star,
  Rocket,
  HelpCircle,
  ChevronRight,
  ClipboardCheck,
  MessageCircle,
} from 'lucide-react'
import Link from 'next/link'

interface OnboardingData {
  compliance: {
    ownPhone: string | null
    ownAppointmentBook: string | null
    ownCashRegister: string | null
    ownPriceList: string | null
    ownBranding: string | null
  }
  documents: {
    masterCertificate: { uploaded: boolean; notAvailable: boolean }
    businessRegistration: { uploaded: boolean; notAvailable: boolean }
    liabilityInsurance: { uploaded: boolean; notAvailable: boolean }
    statusDetermination: { uploaded: boolean; notAvailable: boolean }
    craftsChamber: { uploaded: boolean; notAvailable: boolean }
  }
  status?: 'IN_PROGRESS' | 'PENDING_DOCUMENTS' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
}

// Tipps für jeden Compliance-Punkt
const COMPLIANCE_TIPS = {
  ownPhone: {
    title: 'Eigenes Telefon für Kundenkommunikation',
    icon: Phone,
    color: 'blue',
    needsHelp: {
      title: 'Kein eigenes Geschäftstelefon?',
      description: 'Wir können dir zwar kein Telefon besorgen, aber das ist schnell gelöst!',
      tips: [
        'Geh zu einem Telefonanbieter deiner Wahl und buche einen günstigen Tarif',
        'Viele Anbieter haben spezielle Selbstständigen-Tarife ab 10€/Monat',
        'Eine separate Nummer hilft dir, Privat und Geschäft zu trennen',
      ],
      cta: null,
    },
    success: {
      title: 'Super! Du hast ein eigenes Telefon',
      description: 'Damit bist du für deine Kunden immer erreichbar.',
    }
  },
  ownAppointmentBook: {
    title: 'Eigene Terminverwaltung',
    icon: BookOpen,
    color: 'purple',
    needsHelp: {
      title: 'Noch keine eigene Terminverwaltung?',
      description: 'Kein Problem – wir haben die Lösung bereits für dich!',
      tips: [
        'In deinem NICNOA-Abo ist eine vollständige Terminverwaltung enthalten',
        'Verwalte Termine, sende automatische Erinnerungen und reduziere No-Shows',
        'Wir sind kompatibel mit gängigen Buchungslösungen wie Treatwell & Co.',
      ],
      cta: {
        label: 'Terminverwaltung entdecken',
        href: '/stylist/calendar',
      },
    },
    success: {
      title: 'Perfekt! Du koordinierst Termine selbstständig',
      description: 'Das ist ein wichtiges Merkmal deiner Selbstständigkeit.',
    }
  },
  ownCashRegister: {
    title: 'Eigene Kasse & EC-Terminal',
    icon: CreditCard,
    color: 'emerald',
    needsHelp: {
      title: 'Noch keine eigene Kasse oder EC-Terminal?',
      description: 'Auch hier haben wir Tipps für dich!',
      tips: [
        'Wir empfehlen iZettle (jetzt Zettle by PayPal) – günstig und einfach',
        'Zettle ist voll kompatibel mit NICNOA Online',
        'Deine Umsatzstatistiken und Analysen siehst du direkt im Dashboard',
        'Wir helfen dir bei der Einrichtung!',
      ],
      cta: {
        label: 'Mehr über Zettle erfahren',
        href: 'https://www.zettle.com/de',
        external: true,
      },
    },
    success: {
      title: 'Toll! Du rechnest eigenständig ab',
      description: 'Deine Kunden zahlen direkt bei dir – unternehmerische Unabhängigkeit!',
    }
  },
  ownPriceList: {
    title: 'Eigene Preisliste',
    icon: Tag,
    color: 'amber',
    needsHelp: {
      title: 'Noch keine eigene Preisliste?',
      description: 'Das ist überhaupt kein Problem!',
      tips: [
        'Als Stuhlmieter über NICNOA kannst du deine Preise frei bestimmen',
        'Nutze unseren Preislisten-Generator, um professionelle Listen zu erstellen',
        'Teile sie brandkonform mit dem jeweiligen Salon',
        'Passe Preise jederzeit flexibel an deine Strategie an',
      ],
      cta: {
        label: 'Preislisten-Generator öffnen',
        href: '/stylist/pricing',
      },
    },
    success: {
      title: 'Prima! Du bestimmst deine Preise selbst',
      description: 'Freie Preisgestaltung ist ein Kernmerkmal der Selbstständigkeit.',
    }
  },
  ownBranding: {
    title: 'Eigenes Logo & Branding',
    icon: User,
    color: 'pink',
    needsHelp: {
      title: 'Noch kein eigenes Logo oder Branding?',
      description: 'Wir unterstützen dich dabei!',
      tips: [
        'Nutze unsere Brand- und Marketing-Tools, um ein Logo zu erstellen',
        'Wir haben in unserem Netzwerk passende Designer',
        'Günstige Logo-Pakete speziell für Friseure ab 99€',
        'Ein starkes Branding hilft beim Aufbau deines Kundenstamms',
      ],
      cta: {
        label: 'Brand-Tools entdecken',
        href: '/stylist/branding',
      },
    },
    success: {
      title: 'Großartig! Du hast eine eigene Markenidentität',
      description: 'Das unterscheidet dich und macht dich unverwechselbar.',
    }
  },
}

// Tipps für Dokumente
const DOCUMENT_TIPS = {
  masterCertificate: {
    title: 'Meisterbrief / Ausnahmebewilligung',
    tips: [
      'Ohne Meisterbrief kannst du eine Ausnahmebewilligung bei der Handwerkskammer beantragen',
      'Die Bearbeitungszeit beträgt ca. 4-8 Wochen',
      'In unserem FAQ findest du eine Schritt-für-Schritt-Anleitung',
    ],
  },
  businessRegistration: {
    title: 'Gewerbeanmeldung',
    tips: [
      'Besuche das Gewerbeamt deiner Stadt/Gemeinde',
      'Die Anmeldung kostet ca. 20-60€ je nach Gemeinde',
      'Du kannst sie oft auch online erledigen',
    ],
  },
  liabilityInsurance: {
    title: 'Betriebshaftpflichtversicherung',
    tips: [
      'Vergleiche Angebote bei Check24 oder Verivox',
      'Spezielle Friseur-Policen gibt es ab ca. 80€/Jahr',
      'Achte auf ausreichende Deckungssummen (mind. 3 Mio.€)',
    ],
  },
  statusDetermination: {
    title: 'Statusfeststellung (V027)',
    tips: [
      'Das Formular V027 gibt es online bei der Deutschen Rentenversicherung',
      'Die Bearbeitung dauert ca. 6-12 Wochen',
      'Es ist kostenlos und schützt dich rechtlich ab',
    ],
  },
  craftsChamber: {
    title: 'Eintragung Handwerkskammer',
    tips: [
      'Kontaktiere die Handwerkskammer deiner Region',
      'Du benötigst den Meisterbrief oder eine Ausnahmebewilligung',
      'Die Eintragung ist Voraussetzung für die Gewerbeanmeldung',
    ],
  },
}

export default function OnboardingAnalysePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analysisPhase, setAnalysisPhase] = useState<'loading' | 'analyzing' | 'complete'>('loading')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)

  // Lade Onboarding-Daten
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchOnboardingData()
    }
  }, [status, router])

  const fetchOnboardingData = async () => {
    try {
      const res = await fetch('/api/onboarding/stylist/status')
      if (res.ok) {
        const data = await res.json()
        setOnboardingData(data)
        startAnalysis()
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error)
    }
  }

  const startAnalysis = () => {
    setAnalysisPhase('analyzing')
    
    // Simuliere Analyse-Animation
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setTimeout(() => {
          setAnalysisPhase('complete')
        }, 500)
      }
      setAnalysisProgress(progress)
    }, 200)
  }

  // Berechne Statistiken
  const getComplianceStats = () => {
    if (!onboardingData?.compliance) return { ready: 0, pending: 0, missing: 0 }
    
    let ready = 0, pending = 0, missing = 0
    Object.values(onboardingData.compliance).forEach(value => {
      if (value === 'yes') ready++
      else if (value === 'pending') pending++
      else missing++
    })
    return { ready, pending, missing }
  }

  const getDocumentStats = () => {
    if (!onboardingData?.documents) return { uploaded: 0, pending: 0 }
    
    let uploaded = 0, pending = 0
    Object.values(onboardingData.documents).forEach(doc => {
      if (doc.uploaded) uploaded++
      else pending++
    })
    return { uploaded, pending }
  }

  const complianceStats = getComplianceStats()
  const documentStats = getDocumentStats()
  const overallScore = Math.round(
    ((complianceStats.ready * 20) + (documentStats.uploaded * 10)) / 1.5
  )

  // Render Loading
  if (status === 'loading' || analysisPhase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  // Render Analyse-Animation
  if (analysisPhase === 'analyzing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-8"
          >
            <div className="w-full h-full rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Analysiere deine Daten...
          </h2>
          <p className="text-muted-foreground mb-8">
            Wir erstellen deinen persönlichen Selbstständigkeits-Report
          </p>
          
          <div className="space-y-4">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analysisProgress}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
              />
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {analysisProgress < 30 && 'Compliance-Check wird ausgewertet...'}
                {analysisProgress >= 30 && analysisProgress < 60 && 'Dokumente werden geprüft...'}
                {analysisProgress >= 60 && analysisProgress < 90 && 'Tipps werden zusammengestellt...'}
                {analysisProgress >= 90 && 'Fast fertig...'}
              </span>
              <span className="text-emerald-400 font-medium">{Math.round(analysisProgress)}%</span>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Render Ergebnis
  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Dein persönlicher Report</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Dein Selbstständigkeits-Status
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Wir haben deine Daten analysiert und personalisierte Tipps für dich zusammengestellt.
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-white/10"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 352" }}
                  animate={{ strokeDasharray: `${(overallScore / 100) * 352} 352` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {overallScore}%
                  </motion.span>
                  <p className="text-xs text-muted-foreground">Ready</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-2">
                {overallScore >= 80 && 'Du bist fast startklar! 🎉'}
                {overallScore >= 50 && overallScore < 80 && 'Guter Fortschritt! 💪'}
                {overallScore < 50 && 'Ein paar Schritte fehlen noch 📋'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {overallScore >= 80 && 'Nur noch wenige Kleinigkeiten und du kannst als Stuhlmieter durchstarten.'}
                {overallScore >= 50 && overallScore < 80 && 'Du hast schon vieles erledigt. Schau dir unsere Tipps an, um den Rest zu vervollständigen.'}
                {overallScore < 50 && 'Keine Sorge – wir helfen dir bei jedem Schritt. Schau dir unsere Tipps unten an.'}
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-white">{complianceStats.ready} Kriterien erfüllt</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-400" />
                  <span className="text-sm text-white">{complianceStats.pending} in Arbeit</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <span className="text-sm text-white">{documentStats.uploaded}/5 Dokumente</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Compliance Tipps */}
        {(complianceStats.pending > 0 || complianceStats.missing > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Unsere Tipps für dich</h2>
                <p className="text-sm text-muted-foreground">So erreichst du 100% Selbstständigkeit</p>
              </div>
            </div>

            <div className="space-y-4">
              {onboardingData?.compliance && Object.entries(onboardingData.compliance).map(([key, value]) => {
                if (value === 'yes') return null
                
                const tip = COMPLIANCE_TIPS[key as keyof typeof COMPLIANCE_TIPS]
                if (!tip) return null
                
                const Icon = tip.icon
                const colorClasses = {
                  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
                  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
                  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
                  amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20',
                  pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/20',
                }
                const iconColors = {
                  blue: 'text-blue-400',
                  purple: 'text-purple-400',
                  emerald: 'text-emerald-400',
                  amber: 'text-amber-400',
                  pink: 'text-pink-400',
                }

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-5 rounded-2xl bg-gradient-to-br ${colorClasses[tip.color as keyof typeof colorClasses]} border`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 ${iconColors[tip.color as keyof typeof iconColors]}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{tip.needsHelp.title}</h3>
                          {value === 'pending' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                              In Arbeit
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{tip.needsHelp.description}</p>
                        
                        <ul className="space-y-2 mb-4">
                          {tip.needsHelp.tips.map((tipText, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                              <ChevronRight className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                              {tipText}
                            </li>
                          ))}
                        </ul>
                        
                        {tip.needsHelp.cta && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/20 hover:bg-white/10"
                            asChild
                          >
                            {tip.needsHelp.cta.external ? (
                              <a href={tip.needsHelp.cta.href} target="_blank" rel="noopener noreferrer">
                                {tip.needsHelp.cta.label}
                                <ExternalLink className="h-3 w-3 ml-2" />
                              </a>
                            ) : (
                              <Link href={tip.needsHelp.cta.href}>
                                {tip.needsHelp.cta.label}
                                <ArrowRight className="h-3 w-3 ml-2" />
                              </Link>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Dokument Tipps */}
        {documentStats.pending > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Fehlende Dokumente</h2>
                <p className="text-sm text-muted-foreground">So kommst du an die nötigen Unterlagen</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {onboardingData?.documents && Object.entries(onboardingData.documents).map(([key, doc]) => {
                if (doc.uploaded) return null
                
                const tip = DOCUMENT_TIPS[key as keyof typeof DOCUMENT_TIPS]
                if (!tip) return null

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{tip.title}</h4>
                        {doc.notAvailable && (
                          <span className="text-xs text-amber-400">Wird nachgereicht</span>
                        )}
                      </div>
                    </div>
                    
                    <ul className="space-y-1.5">
                      {tip.tips.map((tipText, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          {tipText}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )
              })}
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white">
                    Mehr Hilfe findest du in unserem <Link href="/faq" className="text-blue-400 hover:underline">FAQ-Bereich</Link> mit 
                    detaillierten Anleitungen für jedes Dokument.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Erfolge */}
        {complianceStats.ready > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Das läuft schon gut!</h2>
                <p className="text-sm text-muted-foreground">Diese Punkte hast du bereits erfüllt</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {onboardingData?.compliance && Object.entries(onboardingData.compliance).map(([key, value]) => {
                if (value !== 'yes') return null
                
                const tip = COMPLIANCE_TIPS[key as keyof typeof COMPLIANCE_TIPS]
                if (!tip) return null
                
                const Icon = tip.icon

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <span className="text-sm font-medium text-white">{tip.title}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Hinweis wenn Dokumente fehlen */}
        {(onboardingData?.status === 'PENDING_DOCUMENTS' || documentStats.pending > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Dein Onboarding ist noch nicht vollständig
                </h3>
                <p className="text-muted-foreground mb-4">
                  Wir können dein Onboarding noch nicht komplett abschließen, da noch {documentStats.pending} {documentStats.pending === 1 ? 'Dokument fehlt' : 'Dokumente fehlen'}.
                  Sobald du alle Dokumente hochgeladen hast, werden wir deinen Antrag prüfen und uns bei dir melden.
                </p>
                <div className="flex items-center gap-2 text-sm text-amber-400">
                  <Clock className="h-4 w-4" />
                  <span>Status: Prüfung ausstehend – Dokumente werden nachgereicht</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hinweis wenn alles komplett ist */}
        {onboardingData?.status === 'PENDING_REVIEW' && documentStats.pending === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Dein Antrag wird geprüft
                </h3>
                <p className="text-muted-foreground mb-4">
                  Super! Du hast alle erforderlichen Dokumente hochgeladen. Wir prüfen jetzt deinen Antrag 
                  und melden uns in Kürze bei dir. Dies dauert in der Regel 1-2 Werktage.
                </p>
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Status: Vollständig – In Prüfung durch unser Team</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
        >
          {/* Wenn Dokumente fehlen: "Vorläufig abschließen" als primärer Button */}
          {(onboardingData?.status === 'PENDING_DOCUMENTS' || documentStats.pending > 0) ? (
            <>
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                asChild
              >
                <Link href="/stylist">
                  <ClipboardCheck className="h-5 w-5 mr-2" />
                  Onboarding vorläufig abschließen
                </Link>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                asChild
              >
                <Link href="/onboarding/stylist">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Dokumente jetzt nachreichen
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                asChild
              >
                <Link href="/stylist">
                  <Rocket className="h-5 w-5 mr-2" />
                  Zum Dashboard
                </Link>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 hover:bg-white/10"
                asChild
              >
                <Link href="/onboarding/stylist">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Daten bearbeiten
                </Link>
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

