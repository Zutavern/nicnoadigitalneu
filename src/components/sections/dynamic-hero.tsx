'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react'
import Image from 'next/image'

interface HomePageConfig {
  heroType: 'animated' | 'image' | 'video'
  heroLayout: 'split' | 'centered' | 'fullscreen'
  heroImageUrl: string | null
  heroImageAlt: string | null
  heroImageOverlay: number
  heroImagePosition: string
  heroVideoUrl: string | null
  heroVideoPoster: string | null
  heroBadgeText: string | null
  heroBadgeIcon: string
  heroTitleLine1: string
  heroTitleLine2: string
  heroTitleHighlight: string
  heroDescription: string | null
  ctaPrimaryText: string
  ctaPrimaryLink: string
  ctaPrimaryIcon: string | null
  ctaSecondaryText: string | null
  ctaSecondaryLink: string | null
  showSecondaryCta: boolean
  showTrustIndicators: boolean
  trustIndicator1: string | null
  trustIndicator2: string | null
  trustIndicator3: string | null
  showDashboardPreview: boolean
  dashboardTitle: string | null
  dashboardSubtitle: string | null
  animationEnabled: boolean
  particlesEnabled: boolean
  gradientColors: string
  showScrollIndicator: boolean
  scrollTargetId: string | null
}

const defaultConfig: HomePageConfig = {
  heroType: 'animated',
  heroLayout: 'split',
  heroImageUrl: null,
  heroImageAlt: null,
  heroImageOverlay: 40,
  heroImagePosition: 'center',
  heroVideoUrl: null,
  heroVideoPoster: null,
  heroBadgeText: 'Jetzt im Beta-Programm verfügbar',
  heroBadgeIcon: 'sparkles',
  heroTitleLine1: 'Revolutionieren',
  heroTitleLine2: 'Sie Ihren',
  heroTitleHighlight: 'Salon-Space',
  heroDescription: 'Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces.',
  ctaPrimaryText: 'Jetzt kostenlos starten',
  ctaPrimaryLink: '/registrieren',
  ctaPrimaryIcon: 'arrow-right',
  ctaSecondaryText: 'Produkt entdecken',
  ctaSecondaryLink: '/produkt',
  showSecondaryCta: true,
  showTrustIndicators: true,
  trustIndicator1: '14 Tage kostenlos testen',
  trustIndicator2: 'Keine Kreditkarte erforderlich',
  trustIndicator3: 'DSGVO-konform',
  showDashboardPreview: true,
  dashboardTitle: 'NICNOA Dashboard',
  dashboardSubtitle: 'Salon Overview',
  animationEnabled: true,
  particlesEnabled: true,
  gradientColors: 'purple,pink,blue',
  showScrollIndicator: true,
  scrollTargetId: 'testimonials',
}

export function DynamicHero() {
  const [config, setConfig] = useState<HomePageConfig>(defaultConfig)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/homepage-config')
      .then(res => res.json())
      .then(data => {
        setConfig(data)
        setIsLoaded(true)
      })
      .catch(() => setIsLoaded(true))
  }, [])

  const trustIndicators = [
    config.trustIndicator1,
    config.trustIndicator2,
    config.trustIndicator3,
  ].filter(Boolean)

  // Gradient-Farben basierend auf Config
  const getGradientClass = () => {
    switch (config.gradientColors) {
      case 'blue,cyan,teal':
        return 'from-blue-500/30 via-cyan-500/20 to-teal-500/20'
      case 'orange,red,pink':
        return 'from-orange-500/30 via-red-500/20 to-pink-500/20'
      case 'green,teal,blue':
        return 'from-green-500/30 via-teal-500/20 to-blue-500/20'
      case 'slate,gray,zinc':
        return 'from-slate-500/30 via-gray-500/20 to-zinc-500/20'
      default:
        return 'from-purple-500/30 via-pink-500/20 to-blue-500/20'
    }
  }

  const getHighlightGradient = () => {
    switch (config.gradientColors) {
      case 'blue,cyan,teal':
        return 'from-blue-400 via-cyan-400 to-teal-400'
      case 'orange,red,pink':
        return 'from-orange-400 via-red-400 to-pink-400'
      case 'green,teal,blue':
        return 'from-green-400 via-teal-400 to-blue-400'
      case 'slate,gray,zinc':
        return 'from-slate-400 via-gray-400 to-white'
      default:
        return 'from-purple-400 via-pink-400 to-purple-400'
    }
  }

  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center overflow-hidden">
      {/* Background */}
      {config.heroType === 'image' && config.heroImageUrl ? (
        // Image Background
        <div className="absolute inset-0">
          <Image
            src={config.heroImageUrl}
            alt={config.heroImageAlt || 'Hero Background'}
            fill
            className="object-cover"
            style={{ objectPosition: config.heroImagePosition }}
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-slate-950"
            style={{ opacity: config.heroImageOverlay / 100 }}
          />
        </div>
      ) : config.heroType === 'video' && config.heroVideoUrl ? (
        // Video Background
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster={config.heroVideoPoster || undefined}
          >
            <source src={config.heroVideoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-slate-950/50" />
        </div>
      ) : (
        // Animated Background (Default)
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Gradient Orbs */}
          {config.particlesEnabled && (
            <>
              <motion.div
                className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${getGradientClass()}`}
                animate={config.animationEnabled ? { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] } : {}}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
                animate={config.animationEnabled ? { scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] } : {}}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              />
              <motion.div
                className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
                animate={config.animationEnabled ? { scale: [1, 1.15, 1], opacity: [0.2, 0.3, 0.2] } : {}}
                transition={{ duration: 6, repeat: Infinity, delay: 2 }}
              />
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className={`grid gap-12 items-center ${
          config.heroLayout === 'split' ? 'lg:grid-cols-2' : ''
        } ${config.heroLayout === 'centered' ? 'text-center max-w-4xl mx-auto' : ''}`}>
          {/* Text Content */}
          <motion.div
            initial={config.animationEnabled ? { opacity: 0, y: 30 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={config.heroLayout === 'centered' ? 'text-center' : ''}
          >
            {/* Badge */}
            {config.heroBadgeText && (
              <motion.div
                initial={config.animationEnabled ? { opacity: 0, scale: 0.9 } : {}}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-6 ${
                  config.heroLayout === 'centered' ? 'mx-auto' : ''
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>{config.heroBadgeText}</span>
              </motion.div>
            )}

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              {config.heroTitleLine1} <br />
              {config.heroTitleLine2}{' '}
              <span className="relative">
                <span className={`bg-gradient-to-r ${getHighlightGradient()} bg-clip-text text-transparent`}>
                  {config.heroTitleHighlight}
                </span>
                {config.animationEnabled && (
                  <motion.span
                    className={`absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r ${getHighlightGradient()} rounded-full`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                )}
              </span>
            </h1>

            {config.heroDescription && (
              <p className="text-lg text-slate-300 sm:text-xl mb-8 max-w-xl">
                {config.heroDescription}
              </p>
            )}

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 mb-10 ${
              config.heroLayout === 'centered' ? 'justify-center' : ''
            }`}>
              <Link href={config.ctaPrimaryLink}>
                <Button
                  size="lg"
                  className="text-lg w-full sm:w-auto group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0"
                >
                  {config.ctaPrimaryText}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              {config.showSecondaryCta && config.ctaSecondaryText && config.ctaSecondaryLink && (
                <Link href={config.ctaSecondaryLink}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg w-full sm:w-auto border-slate-700 text-white hover:bg-slate-800"
                  >
                    {config.ctaSecondaryText}
                  </Button>
                </Link>
              )}
            </div>

            {/* Trust Indicators */}
            {config.showTrustIndicators && trustIndicators.length > 0 && (
              <div className={`flex flex-wrap gap-6 text-sm text-slate-400 ${
                config.heroLayout === 'centered' ? 'justify-center' : ''
              }`}>
                {trustIndicators.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={config.animationEnabled ? { opacity: 0, y: 10 } : {}}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Visual Element (Dashboard Preview) */}
          {config.heroLayout === 'split' && config.showDashboardPreview && config.heroType === 'animated' && (
            <motion.div
              initial={config.animationEnabled ? { opacity: 0, scale: 0.9 } : {}}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative hidden lg:block"
            >
              {/* Dashboard Preview */}
              <div className="relative">
                {/* Main Card */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{config.dashboardTitle || 'NICNOA Dashboard'}</h3>
                        <p className="text-slate-400 text-sm">{config.dashboardSubtitle || 'Salon Overview'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'Buchungen', value: '247', change: '+12%' },
                      { label: 'Auslastung', value: '87%', change: '+5%' },
                      { label: 'Umsatz', value: '€8.4k', change: '+18%' },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={config.animationEnabled ? { opacity: 0, y: 20 } : {}}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
                      >
                        <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
                        <p className="text-white text-xl font-bold">{stat.value}</p>
                        <span className="text-green-400 text-xs">{stat.change}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                    <div className="flex items-end gap-2 h-24">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={config.animationEnabled ? { height: 0 } : { height: `${height}%` }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 1 + i * 0.05, duration: 0.5 }}
                          className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-sm"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <motion.div
                  initial={config.animationEnabled ? { opacity: 0, x: -50 } : {}}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="absolute -left-8 top-1/4 bg-slate-800/90 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Neue Buchung</p>
                      <p className="text-slate-400 text-xs">Maria S. • 14:30</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={config.animationEnabled ? { opacity: 0, x: 50 } : {}}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                  className="absolute -right-4 bottom-1/4 bg-slate-800/90 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">+3 Stylisten</p>
                      <p className="text-slate-400 text-xs">Diese Woche</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      {config.showScrollIndicator && (
        <motion.div
          initial={config.animationEnabled ? { opacity: 0, y: 20 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.a
            href={`#${config.scrollTargetId || 'testimonials'}`}
            className="flex flex-col items-center gap-3 group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <div className="w-7 h-11 rounded-full border-2 border-slate-500/50 flex justify-center pt-2 group-hover:border-purple-400/70 transition-colors duration-300">
                <motion.div
                  className="w-1.5 h-2.5 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"
                  animate={config.animationEnabled ? { y: [0, 8, 0], opacity: [1, 0.3, 1] } : {}}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>

            <div className="flex flex-col items-center -space-y-1">
              <motion.div
                animate={config.animationEnabled ? { y: [0, 4, 0], opacity: [0.4, 1, 0.4] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
              </motion.div>
              <motion.div
                animate={config.animationEnabled ? { y: [0, 4, 0], opacity: [0.2, 0.6, 0.2] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
              >
                <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-purple-400/70 transition-colors" />
              </motion.div>
            </div>

            <motion.span
              className="text-xs text-slate-500 font-medium tracking-wider uppercase group-hover:text-purple-400/80 transition-colors"
              animate={config.animationEnabled ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              Scroll
            </motion.span>
          </motion.a>
        </motion.div>
      )}
    </section>
  )
}





