'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import { useSupabase } from '@/components/providers/supabase-provider'

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
  },
]

export function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState(features[0].id)
  const supabase = useSupabase()

  // Bilder für die Features
  const images = {
    scheduling: supabase
      .storage
      .from('features')
      .getPublicUrl('scheduling.png')
      .data.publicUrl,
    analytics: supabase
      .storage
      .from('features')
      .getPublicUrl('analytics.png')
      .data.publicUrl,
    management: supabase
      .storage
      .from('features')
      .getPublicUrl('management.png')
      .data.publicUrl,
  }

  const currentFeature = features.find((f) => f.id === activeFeature)

  return (
    <section className="w-full py-16 mt-12 md:mt-0">
      <div className="container px-4 md:px-6 overflow-visible">
        <div className="mx-auto max-w-4xl overflow-visible">
          <Tabs
            value={activeFeature}
            onValueChange={setActiveFeature}
            className="space-y-8 overflow-visible"
          >
            {/* Tabs Navigation - Vertikal auf Mobile */}
            <TabsList className="flex min-h-fit w-full flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-4 bg-background/50 p-1">
              {features.map((feature) => (
                <TabsTrigger
                  key={feature.id}
                  value={feature.id}
                  className="w-full text-base sm:text-lg py-3 sm:py-2 data-[state=active]:bg-white data-[state=active]:text-primary whitespace-normal h-auto"
                >
                  {feature.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Content Container */}
            <div className="relative overflow-hidden rounded-xl border bg-card mt-6 sm:mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-6 p-6"
                >
                  {/* Feature Titel - Mobile */}
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-bold">{currentFeature?.title}</h3>
                  </div>

                  {/* Feature Bild - Responsive */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                    <Image
                      src={images[activeFeature as keyof typeof images]}
                      alt={currentFeature?.title || ''}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                  </div>

                  {/* Feature Beschreibung und Benefits - Vertikal auf Mobile */}
                  <div className="space-y-6">
                    <p className="text-base text-muted-foreground">
                      {currentFeature?.description}
                    </p>
                    
                    <div className="space-y-3">
                      {currentFeature?.benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-base">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  )
} 