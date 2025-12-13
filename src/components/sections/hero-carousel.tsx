'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronDown, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CategoryHero, type CategoryAnimationData } from '@/components/sections/category-showcase'
import Link from 'next/link'

interface HeroSlide {
  type: 'main' | 'category'
  data?: CategoryAnimationData
}

interface HeroCarouselProps {
  // Main Hero Config
  heroType?: string
  heroBadgeText?: string | null
  heroTitle: string
  heroTitleHighlight?: string | null
  heroDescription?: string | null
  ctaPrimaryText: string
  ctaPrimaryLink: string
  ctaSecondaryText?: string | null
  ctaSecondaryLink?: string | null
  showSecondaryCta?: boolean
  showTrustIndicators?: boolean
  trustIndicator1?: string | null
  trustIndicator2?: string | null
  trustIndicator3?: string | null
  animationEnabled?: boolean
  particlesEnabled?: boolean
  showDashboardPreview?: boolean
  dashboardTitle?: string | null
  dashboardSubtitle?: string | null
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  // Category Animations
  categoryAnimations: CategoryAnimationData[]
  // Carousel Settings
  autoPlayInterval?: number
  showDots?: boolean
  showArrows?: boolean
  onCategoryChange?: (categoryKey: string | null, isManual: boolean) => void
}

export function HeroCarousel({
  heroBadgeText,
  heroTitle,
  heroTitleHighlight,
  heroDescription,
  ctaPrimaryText,
  ctaPrimaryLink,
  ctaSecondaryText,
  ctaSecondaryLink,
  showSecondaryCta = true,
  showTrustIndicators = true,
  trustIndicator1,
  trustIndicator2,
  trustIndicator3,
  animationEnabled = true,
  particlesEnabled = true,
  showDashboardPreview = true,
  dashboardTitle,
  primaryColor = 'hsl(var(--primary))',
  secondaryColor = 'hsl(var(--secondary))',
  accentColor = 'hsl(var(--accent))',
  categoryAnimations,
  autoPlayInterval = 10000, // 10 Sekunden pro Slide
  showDots = true,
  showArrows = true,
  onCategoryChange,
}: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const startTimeRef = useRef<number>(Date.now())
  const animationFrameRef = useRef<number | null>(null)
  const isManualNavigationRef = useRef(false)
  const prevActiveIndexRef = useRef(0)

  // Erstelle Slides-Array: Main Hero + Category Animations
  const slides: HeroSlide[] = [
    { type: 'main' },
    ...categoryAnimations.map(anim => ({ type: 'category' as const, data: anim })),
  ]

  const totalSlides = slides.length

  // Callback außerhalb des Render-Zyklus mit useEffect
  useEffect(() => {
    // Nur aufrufen wenn sich der Index tatsächlich geändert hat
    if (prevActiveIndexRef.current !== activeIndex) {
      prevActiveIndexRef.current = activeIndex
      
      if (onCategoryChange) {
        const slide = slides[activeIndex]
        onCategoryChange(
          slide.type === 'category' && slide.data ? slide.data.categoryKey : null,
          isManualNavigationRef.current
        )
      }
      isManualNavigationRef.current = false
    }
  }, [activeIndex, slides, onCategoryChange])

  // Navigation Funktionen
  const goToNext = useCallback((manual = false) => {
    isManualNavigationRef.current = manual
    setActiveIndex(prev => (prev + 1) % totalSlides)
    setProgress(0)
    startTimeRef.current = Date.now()
  }, [totalSlides])

  const goToPrevious = useCallback((manual = false) => {
    isManualNavigationRef.current = manual
    setActiveIndex(prev => (prev - 1 + totalSlides) % totalSlides)
    setProgress(0)
    startTimeRef.current = Date.now()
  }, [totalSlides])

  const goToSlide = useCallback((index: number, manual = true) => {
    isManualNavigationRef.current = manual
    setActiveIndex(index)
    setProgress(0)
    startTimeRef.current = Date.now()
  }, [])

  // Auto-Play mit requestAnimationFrame für flüssige Animation
  useEffect(() => {
    if (isPaused || totalSlides <= 1) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const newProgress = Math.min((elapsed / autoPlayInterval) * 100, 100)
      
      setProgress(newProgress)
      
      if (newProgress >= 100) {
        // Zum nächsten Slide
        setActiveIndex(prev => (prev + 1) % totalSlides)
        setProgress(0)
        startTimeRef.current = Date.now()
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    startTimeRef.current = Date.now()
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPaused, autoPlayInterval, totalSlides, activeIndex])

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious(true)
      } else if (e.key === 'ArrowRight') {
        goToNext(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious])

  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  const currentSlide = slides[activeIndex]

  // Highlight text in title
  const renderTitle = () => {
    if (!heroTitleHighlight) return heroTitle
    const parts = heroTitle.split(heroTitleHighlight)
    return (
      <>
        {parts[0]}
        <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          {heroTitleHighlight}
        </span>
        {parts[1]}
      </>
    )
  }

  return (
    <section 
      className="relative pt-20 min-h-[70vh] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background - nur für Main Hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(${primaryColor}15 1px, transparent 1px),
              linear-gradient(90deg, ${primaryColor}15 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Animated Particles */}
        {particlesEnabled && animationEnabled && (
          <>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  left: `${(i * 5) % 100}%`,
                  top: `${(i * 7) % 100}%`,
                  backgroundColor: primaryColor,
                  opacity: 0.3,
                }}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.3, 1],
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3 + (i % 3),
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </>
        )}
        
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: primaryColor, opacity: 0.12 }}
          animate={animationEnabled ? { scale: [1, 1.2, 1], opacity: [0.12, 0.2, 0.12] } : {}}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: secondaryColor, opacity: 0.1 }}
          animate={animationEnabled ? { scale: [1, 1.3, 1], opacity: [0.1, 0.18, 0.1] } : {}}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: accentColor, opacity: 0.08 }}
          animate={animationEnabled ? { scale: [1, 1.4, 1], opacity: [0.08, 0.15, 0.08] } : {}}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Slides Container - feste Höhe für alle Slides */}
      <div className="relative z-10 min-h-[450px] lg:min-h-[500px] flex items-center">
        <AnimatePresence mode="wait">
          {currentSlide.type === 'main' ? (
            // Main Hero Slide
            <motion.div
              key="main-hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="container py-4 lg:py-6 w-full min-h-[400px] lg:min-h-[450px] flex items-center"
            >
              <div className="flex items-center gap-12 w-full">
                {/* Text Content */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className={showDashboardPreview ? 'lg:w-1/2' : 'max-w-3xl mx-auto text-center'}
                >
                  {/* Badge */}
                  {heroBadgeText && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Badge 
                        variant="outline" 
                        className="mb-6 px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5"
                      >
                        <span className="mr-2">✨</span>
                        {heroBadgeText}
                      </Badge>
                    </motion.div>
                  )}

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                  >
                    {renderTitle()}
                  </motion.h1>

                  {/* Description */}
                  {heroDescription && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed"
                    >
                      {heroDescription}
                    </motion.p>
                  )}

                  {/* CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 mt-8"
                  >
                    <Link href={ctaPrimaryLink}>
                      <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg">
                        {ctaPrimaryText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    {showSecondaryCta && ctaSecondaryText && (
                      <Link href={ctaSecondaryLink || '/preise'}>
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                          {ctaSecondaryText}
                        </Button>
                      </Link>
                    )}
                  </motion.div>

                  {/* Trust Indicators */}
                  {showTrustIndicators && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex flex-wrap gap-6 mt-8"
                    >
                      {[trustIndicator1, trustIndicator2, trustIndicator3]
                        .filter(Boolean)
                        .map((indicator, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>{indicator}</span>
                          </div>
                        ))}
                    </motion.div>
                  )}
                </motion.div>

                {/* Dashboard Preview */}
                {showDashboardPreview && (
                  <motion.div
                    initial={{ opacity: 0, x: 50, rotateY: 15 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="hidden lg:block lg:w-1/2"
                  >
                    <div className="relative">
                      {/* Glow */}
                      <div
                        className="absolute -inset-4 rounded-3xl blur-2xl opacity-30"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}30, ${secondaryColor}30)` }}
                      />
                      
                      {/* Dashboard Mock */}
                      <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            {dashboardTitle || 'NICNOA Dashboard'}
                          </div>
                          <div className="w-16" />
                        </div>
                        
                        <div className="p-6 space-y-4">
                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { label: 'Buchungen heute', value: '24', trend: '+12%' },
                              { label: 'Umsatz', value: '€2.847', trend: '+8%' },
                              { label: 'Auslastung', value: '87%', trend: '+5%' },
                            ].map((stat, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                className="bg-muted/50 rounded-xl p-4"
                              >
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                <p className="text-xl font-bold mt-1">{stat.value}</p>
                                <p className="text-xs text-green-500 mt-1">{stat.trend}</p>
                              </motion.div>
                            ))}
                          </div>
                          
                          {/* Chart */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="bg-muted/30 rounded-xl p-4 h-32"
                          >
                            <div className="flex items-end justify-between h-full gap-2">
                              {[40, 65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                                <motion.div
                                  key={i}
                                  className="flex-1 rounded-t"
                                  style={{ background: `linear-gradient(to top, ${primaryColor}, ${secondaryColor})` }}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${height}%` }}
                                  transition={{ delay: 1 + i * 0.05, duration: 0.5 }}
                                />
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : currentSlide.data ? (
            // Category Animation Slide
            <CategoryHero
              key={currentSlide.data.id}
              data={currentSlide.data}
              isActive={true}
            />
          ) : null}
        </AnimatePresence>
      </div>

      {/* Navigation Controls - Arrows + Dots inline */}
      {totalSlides > 1 && (
        <div className="relative z-20 mt-2">
          <div className="container">
            <div className="flex justify-center items-center gap-3">
              {/* Left Arrow */}
              <button
                onClick={() => goToPrevious(true)}
                className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                aria-label="Vorherige"
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>

              {/* Dots */}
              {showDots && (
                <div className="flex items-center gap-2">
                  {slides.map((slide, i) => (
                    <button
                      key={i}
                      onClick={() => goToSlide(i, true)}
                      className="group relative flex items-center justify-center w-6 h-6"
                      aria-label={slide.type === 'main' ? 'Übersicht' : slide.data?.title || `Slide ${i + 1}`}
                    >
                      {/* Progress Ring für aktiven Dot */}
                      {i === activeIndex && (
                        <svg className="absolute w-6 h-6 -rotate-90">
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="2"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray={62.83}
                            strokeDashoffset={62.83 * (1 - progress / 100)}
                            style={{ transition: 'none' }}
                          />
                        </svg>
                      )}
                      
                      {/* Dot */}
                      <div
                        className={`
                          w-2 h-2 rounded-full transition-all duration-300
                          ${i === activeIndex 
                            ? 'bg-primary' 
                            : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                          }
                        `}
                      />
                      
                      {/* Tooltip */}
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-card border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                        {slide.type === 'main' ? 'Übersicht' : slide.data?.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Right Arrow */}
              <button
                onClick={() => goToNext(true)}
                className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                aria-label="Nächste"
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex justify-center mt-8 pb-4"
      >
        <a
          href="#features"
          className="flex flex-col items-center gap-1.5 group cursor-pointer"
        >
          {/* Maus-Icon */}
          <div className="relative">
            <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/40 flex justify-center pt-1.5 group-hover:border-primary/60 transition-colors">
              <motion.div
                className="w-1 h-1.5 rounded-full bg-primary"
                animate={{ y: [0, 4, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Chevrons */}
          <div className="flex flex-col items-center -space-y-1">
            <motion.div
              animate={{ y: [0, 3, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 3, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            >
              <ChevronDown className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
            </motion.div>
          </div>
        </a>
      </motion.div>
    </section>
  )
}





