'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

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
  const supabase = createClient()

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
    <div className="container py-16">
      <div className="mx-auto max-w-4xl">
        <Tabs
          value={activeFeature}
          onValueChange={setActiveFeature}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-3">
            {features.map((feature) => (
              <TabsTrigger
                key={feature.id}
                value={feature.id}
                className="text-lg"
              >
                {feature.title}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="relative min-h-[400px] overflow-hidden rounded-xl border bg-card p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-8 md:grid-cols-2"
              >
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">{currentFeature?.title}</h3>
                  <p className="text-muted-foreground">
                    {currentFeature?.description}
                  </p>
                  <ul className="space-y-2">
                    {currentFeature?.benefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={images[activeFeature as keyof typeof images]}
                    alt={currentFeature?.title || ''}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </div>
  )
} 