'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  BarChart3, 
  Building2, 
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Zap,
  PieChart,
  Settings,
  CreditCard,
  MessageSquare
} from 'lucide-react'

const features = [
  {
    id: 'scheduling',
    title: 'Smart Scheduling',
    description:
      'Unser intelligentes Buchungssystem optimiert automatisch Ihre Auslastung und minimiert Leerlaufzeiten.',
    benefits: [
      'Automatische Terminerinnerungen',
      'Intelligente Ressourcenplanung',
      'Nahtlose Kalendersynchronisation',
      'Vermeidung von Doppelbuchungen',
    ],
    icon: Calendar,
    color: 'from-blue-500 to-cyan-500',
    stats: [
      { label: 'Buchungen', value: '1,247', icon: Clock },
      { label: 'Auslastung', value: '94%', icon: TrendingUp },
      { label: 'Zeitersparnis', value: '12h/Woche', icon: Zap },
    ],
  },
  {
    id: 'analytics',
    title: 'Business Analytics',
    description:
      'Treffen Sie datenbasierte Entscheidungen mit unseren umfassenden Analyse-Tools und Reports.',
    benefits: [
      'Echtzeitauswertungen',
      'Personalisierte Dashboards',
      'Umsatzprognosen',
      'Auslastungsanalysen',
    ],
    icon: BarChart3,
    color: 'from-purple-500 to-pink-500',
    stats: [
      { label: 'MRR', value: '€24.5k', icon: TrendingUp },
      { label: 'Wachstum', value: '+18%', icon: PieChart },
      { label: 'Kunden', value: '156', icon: Users },
    ],
  },
  {
    id: 'management',
    title: 'Space Management',
    description:
      'Verwalten Sie Ihren Salon-Space effizient und professionell mit unseren spezialisierten Tools.',
    benefits: [
      'Digitale Arbeitsplatzverwaltung',
      'Ressourcenoptimierung',
      'Automatische Abrechnungen',
      'Integrierte Kommunikation',
    ],
    icon: Building2,
    color: 'from-orange-500 to-red-500',
    stats: [
      { label: 'Stühle', value: '24', icon: Settings },
      { label: 'Stylisten', value: '18', icon: Users },
      { label: 'Umsatz', value: '€8.4k', icon: CreditCard },
    ],
  },
]

export function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState(features[0].id)

  const currentFeature = features.find((f) => f.id === activeFeature)

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-5xl">
        <Tabs
          value={activeFeature}
          onValueChange={setActiveFeature}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <TabsTrigger
                  key={feature.id}
                  value={feature.id}
                  className="text-sm sm:text-base py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
                >
                  <Icon className="h-4 w-4 hidden sm:block" />
                  {feature.title}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className="relative min-h-[450px] overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-900 to-slate-950 p-8">
            <AnimatePresence mode="wait">
              {currentFeature && (
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-8 lg:grid-cols-2"
                >
                  {/* Text Content */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${currentFeature.color} flex items-center justify-center`}>
                        <currentFeature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">{currentFeature.title}</h3>
                    </div>
                    
                    <p className="text-slate-300 text-lg">
                      {currentFeature.description}
                    </p>
                    
                    <ul className="space-y-3">
                      {currentFeature.benefits.map((benefit, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-slate-200">{benefit}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual Content - Mock Dashboard */}
                  <div className="relative">
                    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 shadow-2xl">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                          <div className="h-3 w-3 rounded-full bg-yellow-500" />
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                        </div>
                        <div className="h-2 w-24 bg-slate-700 rounded" />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {currentFeature.stats.map((stat, i) => (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50"
                          >
                            <stat.icon className="h-4 w-4 text-slate-400 mb-2" />
                            <p className="text-white font-bold text-lg">{stat.value}</p>
                            <p className="text-slate-400 text-xs">{stat.label}</p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Chart Visualization */}
                      <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30">
                        <div className="flex items-end gap-1 h-32">
                          {Array.from({ length: 12 }).map((_, i) => {
                            const height = 30 + Math.random() * 70
                            return (
                              <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                                className={`flex-1 bg-gradient-to-t ${currentFeature.color} rounded-t-sm opacity-80`}
                              />
                            )
                          })}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                          <span>Jan</span>
                          <span>Jun</span>
                          <span>Dez</span>
                        </div>
                      </div>

                      {/* Activity Feed */}
                      <div className="mt-4 space-y-2">
                        {[
                          { text: 'Neue Buchung eingegangen', time: 'vor 2 Min.' },
                          { text: 'Stylist Marie ist online', time: 'vor 5 Min.' },
                        ].map((activity, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + i * 0.1 }}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-slate-300">{activity.text}</span>
                            <span className="text-slate-500 text-xs">{activity.time}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Floating Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      className="absolute -bottom-4 -left-4 bg-green-500/10 backdrop-blur border border-green-500/20 rounded-lg px-4 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-400 text-sm font-medium">Live-Daten</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
