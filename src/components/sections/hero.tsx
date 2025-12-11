'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle2, ChevronDown, Play } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

interface HeroConfig {
  heroType: 'animated' | 'image' | 'video'
  heroLayout: string
  heroImageUrl: string | null
  heroImageAlt: string | null
  heroImageOverlay: number
  heroImagePosition: string
  heroVideoUrl: string | null
  heroVideoPoster: string | null
  heroBadgeText: string
  heroBadgeIcon: string
  heroTitleLine1: string
  heroTitleLine2: string
  heroTitleHighlight: string
  heroDescription: string
  ctaPrimaryText: string
  ctaPrimaryLink: string
  ctaPrimaryIcon: string
  ctaSecondaryText: string
  ctaSecondaryLink: string
  showSecondaryCta: boolean
  showTrustIndicators: boolean
  trustIndicator1: string
  trustIndicator2: string
  trustIndicator3: string
  showDashboardPreview: boolean
  dashboardTitle: string
  dashboardSubtitle: string
  animationEnabled: boolean
  particlesEnabled: boolean
  showScrollIndicator: boolean
  scrollTargetId: string
}

const defaultConfig: HeroConfig = {
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
  heroDescription: 'Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces. Maximieren Sie Ihre Auslastung, minimieren Sie den Verwaltungsaufwand und schaffen Sie ein professionelles Arbeitsumfeld für selbstständige Stylisten.',
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
  showScrollIndicator: true,
  scrollTargetId: 'testimonials',
}

export function Hero() {
  const [config, setConfig] = useState<HeroConfig>(defaultConfig)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/homepage-config')
        if (res.ok) {
          const data = await res.json()
          setConfig({ ...defaultConfig, ...data })
        }
      } catch (error) {
        console.error('Failed to load hero config:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadConfig()
  }, [])

  // Skeleton während des Ladens
  if (isLoading) {
    return (
      <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center overflow-hidden bg-slate-900">
        <div className="container relative z-10 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-800 rounded w-48" />
            <div className="h-16 bg-slate-800 rounded w-3/4" />
            <div className="h-6 bg-slate-800 rounded w-1/2" />
          </div>
        </div>
      </section>
    )
  }

  // Je nach heroType verschiedene Hero-Varianten rendern
  if (config.heroType === 'image' && config.heroImageUrl) {
    return <ImageHero config={config} />
  }

  if (config.heroType === 'video' && config.heroVideoUrl) {
    return <VideoHero config={config} />
  }

  // Default: Animated Hero
  return <AnimatedHero config={config} />
}

// ============================================
// ANIMATED HERO (Original)
// ============================================
function AnimatedHero({ config }: { config: HeroConfig }) {
  const trustIndicators = [
    config.trustIndicator1,
    config.trustIndicator2,
    config.trustIndicator3,
  ].filter(Boolean)

  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, 
            hsl(224 71% 4%), 
            hsl(224 50% 8%), 
            hsl(var(--gradient-from) / 0.3)
          )`
        }}
      >
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--brand-primary) / 0.15) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--brand-primary) / 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Gradient Orbs */}
        {config.particlesEnabled && (
          <>
            <div 
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
              style={{ backgroundColor: 'hsl(var(--glow-primary) / 0.3)' }}
            />
            <div 
              className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
              style={{ backgroundColor: 'hsl(var(--glow-secondary) / 0.2)', animationDelay: '1s' }}
            />
            <div 
              className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse"
              style={{ backgroundColor: 'hsl(var(--gradient-via) / 0.2)', animationDelay: '2s' }}
            />
          </>
        )}
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={config.animationEnabled ? { opacity: 0, y: 30 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={config.animationEnabled ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
              style={{
                backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                borderWidth: '1px',
                borderColor: 'hsl(var(--brand-primary) / 0.2)',
                color: 'hsl(var(--brand-primary))',
              }}
            >
              <Sparkles className="h-4 w-4" />
              <span>{config.heroBadgeText}</span>
            </motion.div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              {config.heroTitleLine1} <br />
              {config.heroTitleLine2}{' '}
              <span className="relative">
                <span 
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, 
                      hsl(var(--gradient-from)), 
                      hsl(var(--gradient-via)), 
                      hsl(var(--gradient-to))
                    )`
                  }}
                >
                  {config.heroTitleHighlight}
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 rounded-full"
                  style={{
                    backgroundImage: `linear-gradient(to right, 
                      hsl(var(--gradient-from)), 
                      hsl(var(--gradient-to))
                    )`
                  }}
                  initial={config.animationEnabled ? { scaleX: 0 } : false}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
            </h1>
            
            <p className="text-lg text-slate-300 sm:text-xl mb-8 max-w-xl">
              {config.heroDescription}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href={config.ctaPrimaryLink}>
                <Button 
                  size="lg" 
                  className="text-lg w-full sm:w-auto group border-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                >
                  {config.ctaPrimaryText}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              {config.showSecondaryCta && (
                <Link href={config.ctaSecondaryLink}>
                  <Button size="lg" variant="outline" className="text-lg w-full sm:w-auto border-slate-700 text-white hover:bg-slate-800">
                    {config.ctaSecondaryText}
                  </Button>
                </Link>
              )}
            </div>

            {/* Trust Indicators */}
            {config.showTrustIndicators && trustIndicators.length > 0 && (
              <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                {trustIndicators.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={config.animationEnabled ? { opacity: 0, y: 10 } : false}
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

          {/* Dashboard Preview */}
          {config.showDashboardPreview && (
            <motion.div
              initial={config.animationEnabled ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <DashboardPreview config={config} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      {config.showScrollIndicator && (
        <ScrollIndicator targetId={config.scrollTargetId} animationEnabled={config.animationEnabled} />
      )}
    </section>
  )
}

// ============================================
// IMAGE HERO (mit Carousel-Unterstützung)
// ============================================
function ImageHero({ config }: { config: HeroConfig }) {
  const [activeIndex, setActiveIndex] = useState(0)
  
  // Parse heroImageUrl (kann einzelne URL oder JSON-Array sein)
  const images = (() => {
    if (!config.heroImageUrl) return []
    try {
      const parsed = JSON.parse(config.heroImageUrl)
      if (Array.isArray(parsed)) return parsed as string[]
      return [config.heroImageUrl]
    } catch {
      return [config.heroImageUrl]
    }
  })()

  const trustIndicators = [
    config.trustIndicator1,
    config.trustIndicator2,
    config.trustIndicator3,
  ].filter(Boolean)

  // Auto-Carousel für mehrere Bilder
  useEffect(() => {
    if (images.length <= 1) return
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length)
    }, 5000) // 5 Sekunden pro Bild

    return () => clearInterval(interval)
  }, [images.length])

  if (images.length === 0) return null

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden">
      {/* Background Images Carousel */}
      <div className="absolute inset-0">
        {images.map((imageUrl, index) => (
          <motion.div
            key={imageUrl}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === activeIndex ? 1 : 0,
              scale: index === activeIndex ? 1 : 1.05,
            }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={imageUrl}
              alt={config.heroImageAlt || `Hero Image ${index + 1}`}
              fill
              className="object-cover"
              style={{ objectPosition: config.heroImagePosition }}
              priority={index === 0}
              sizes="100vw"
            />
          </motion.div>
        ))}
        
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: config.heroImageOverlay / 100 }}
        />
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      {/* Dot Navigation für Carousel - knapp über dem Scroll Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === activeIndex
                  ? 'w-8 h-2'
                  : 'w-2 h-2 hover:opacity-100'
              }`}
              style={{
                backgroundColor: index === activeIndex 
                  ? 'hsl(var(--brand-primary))' 
                  : 'rgba(255,255,255,0.4)',
                opacity: index === activeIndex ? 1 : 0.6,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={config.animationEnabled ? { opacity: 0, scale: 0.9 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 backdrop-blur-sm"
            style={{
              backgroundColor: 'hsl(var(--brand-primary) / 0.15)',
              borderWidth: '1px',
              borderColor: 'hsl(var(--brand-primary) / 0.3)',
            }}
          >
            <Sparkles className="h-4 w-4" style={{ color: 'hsl(var(--brand-primary))' }} />
            <span className="text-white">{config.heroBadgeText}</span>
          </motion.div>

          <motion.h1 
            initial={config.animationEnabled ? { opacity: 0, y: 30 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl mb-6"
          >
            {config.heroTitleLine1} <br />
            {config.heroTitleLine2}{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, 
                  hsl(var(--gradient-from)), 
                  hsl(var(--gradient-via)), 
                  hsl(var(--gradient-to))
                )`
              }}
            >
              {config.heroTitleHighlight}
            </span>
          </motion.h1>
          
          <motion.p 
            initial={config.animationEnabled ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg text-slate-200 sm:text-xl mb-8"
          >
            {config.heroDescription}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={config.animationEnabled ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-10"
          >
            <Link href={config.ctaPrimaryLink}>
              <Button 
                size="lg" 
                className="text-lg w-full sm:w-auto group"
              >
                {config.ctaPrimaryText}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            {config.showSecondaryCta && (
              <Link href={config.ctaSecondaryLink}>
                <Button size="lg" variant="outline" className="text-lg w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                  {config.ctaSecondaryText}
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Trust Indicators */}
          {config.showTrustIndicators && trustIndicators.length > 0 && (
            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
              {trustIndicators.map((item, index) => (
                <motion.div
                  key={item}
                  initial={config.animationEnabled ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      {config.showScrollIndicator && (
        <ScrollIndicator targetId={config.scrollTargetId} animationEnabled={config.animationEnabled} />
      )}
    </section>
  )
}

// ============================================
// VIDEO HERO
// ============================================
function VideoHero({ config }: { config: HeroConfig }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)

  const trustIndicators = [
    config.trustIndicator1,
    config.trustIndicator2,
    config.trustIndicator3,
  ].filter(Boolean)

  // Video-Typ aus URL erkennen
  const getVideoType = (url: string): string => {
    if (url.includes('.webm')) return 'video/webm'
    if (url.includes('.mov')) return 'video/quicktime'
    return 'video/mp4'
  }

  // Autoplay forcieren (für Browser-Autoplay-Policies)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Versuche das Video abzuspielen
    const playVideo = async () => {
      try {
        await video.play()
      } catch (err) {
        // Autoplay wurde möglicherweise blockiert - das ist OK für Hintergrundvideos
        console.log('Autoplay blocked, user interaction required')
      }
    }

    // Wenn Video geladen ist, abspielen
    if (video.readyState >= 3) {
      playVideo()
    } else {
      video.addEventListener('canplay', playVideo)
      return () => video.removeEventListener('canplay', playVideo)
    }
  }, [config.heroVideoUrl])

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={config.heroVideoPoster || undefined}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isVideoReady ? 'opacity-100' : 'opacity-0'
          }`}
          onCanPlay={() => setIsVideoReady(true)}
          onLoadedData={() => setIsVideoReady(true)}
        >
          <source src={config.heroVideoUrl!} type={getVideoType(config.heroVideoUrl!)} />
          {/* Fallback für andere Browser */}
          Your browser does not support the video tag.
        </video>

        {/* Loading Placeholder (wenn Video noch lädt) */}
        {!isVideoReady && config.heroVideoPoster && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${config.heroVideoPoster})` }}
          />
        )}

        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: config.heroImageOverlay / 100 }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={config.animationEnabled ? { opacity: 0, scale: 0.9 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 backdrop-blur-sm"
            style={{
              backgroundColor: 'hsl(var(--brand-primary) / 0.15)',
              borderWidth: '1px',
              borderColor: 'hsl(var(--brand-primary) / 0.3)',
            }}
          >
            <Play className="h-4 w-4" style={{ color: 'hsl(var(--brand-primary))' }} />
            <span className="text-white">{config.heroBadgeText}</span>
          </motion.div>

          <motion.h1 
            initial={config.animationEnabled ? { opacity: 0, y: 30 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl mb-6"
          >
            {config.heroTitleLine1} <br />
            {config.heroTitleLine2}{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, 
                  hsl(var(--gradient-from)), 
                  hsl(var(--gradient-via)), 
                  hsl(var(--gradient-to))
                )`
              }}
            >
              {config.heroTitleHighlight}
            </span>
          </motion.h1>
          
          <motion.p 
            initial={config.animationEnabled ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg text-slate-200 sm:text-xl mb-8"
          >
            {config.heroDescription}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={config.animationEnabled ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-10"
          >
            <Link href={config.ctaPrimaryLink}>
              <Button 
                size="lg" 
                className="text-lg w-full sm:w-auto group"
              >
                {config.ctaPrimaryText}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            {config.showSecondaryCta && (
              <Link href={config.ctaSecondaryLink}>
                <Button size="lg" variant="outline" className="text-lg w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                  {config.ctaSecondaryText}
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Trust Indicators */}
          {config.showTrustIndicators && trustIndicators.length > 0 && (
            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
              {trustIndicators.map((item, index) => (
                <motion.div
                  key={item}
                  initial={config.animationEnabled ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      {config.showScrollIndicator && (
        <ScrollIndicator targetId={config.scrollTargetId} animationEnabled={config.animationEnabled} />
      )}
    </section>
  )
}

// ============================================
// SHARED COMPONENTS
// ============================================

function DashboardPreview({ config }: { config: HeroConfig }) {
  return (
    <div className="relative">
      {/* Main Card */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(to bottom right, 
                  hsl(var(--gradient-from)), 
                  hsl(var(--gradient-to))
                )`
              }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{config.dashboardTitle}</h3>
              <p className="text-slate-400 text-sm">{config.dashboardSubtitle}</p>
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
              initial={config.animationEnabled ? { opacity: 0, y: 20 } : false}
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
                initial={config.animationEnabled ? { height: 0 } : false}
                animate={{ height: `${height}%` }}
                transition={{ delay: 1 + i * 0.05, duration: 0.5 }}
                className="flex-1 rounded-t-sm"
                style={{
                  backgroundImage: `linear-gradient(to top, 
                    hsl(var(--gradient-from)), 
                    hsl(var(--gradient-to))
                  )`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Cards */}
      <motion.div
        initial={config.animationEnabled ? { opacity: 0, x: -50 } : false}
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
        initial={config.animationEnabled ? { opacity: 0, x: 50 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4 }}
        className="absolute -right-4 bottom-1/4 bg-slate-800/90 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div 
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'hsl(var(--brand-primary) / 0.2)' }}
          >
            <Sparkles className="h-4 w-4" style={{ color: 'hsl(var(--brand-primary))' }} />
          </div>
          <div>
            <p className="text-white text-sm font-medium">+3 Stylisten</p>
            <p className="text-slate-400 text-xs">Diese Woche</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function ScrollIndicator({ targetId, animationEnabled }: { targetId: string; animationEnabled: boolean }) {
  return (
    <motion.div
      initial={animationEnabled ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8, duration: 0.8 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
    >
      <motion.a
        href={`#${targetId}`}
        className="flex flex-col items-center gap-3 group cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Mouse Icon */}
        <div className="relative">
          <div className="w-7 h-11 rounded-full border-2 border-slate-500/50 flex justify-center pt-2 group-hover:border-primary/70 transition-colors duration-300">
            <motion.div
              className="w-1.5 h-2.5 rounded-full"
              style={{
                backgroundImage: `linear-gradient(to bottom, 
                  hsl(var(--gradient-from)), 
                  hsl(var(--gradient-to))
                )`
              }}
              animate={{
                y: [0, 8, 0],
                opacity: [1, 0.3, 1],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          
          <motion.div
            className="absolute -inset-1 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ backgroundColor: 'hsl(var(--glow-primary) / 0.3)' }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Chevrons */}
        <div className="flex flex-col items-center -space-y-1">
          <motion.div
            animate={{
              y: [0, 4, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
          </motion.div>
          <motion.div
            animate={{
              y: [0, 4, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.15,
            }}
          >
            <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-primary/70 transition-colors" />
          </motion.div>
        </div>

        <motion.span
          className="text-xs text-slate-500 font-medium tracking-wider uppercase group-hover:text-primary/80 transition-colors"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Scroll
        </motion.span>
      </motion.a>
    </motion.div>
  )
}
