'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CategoryHero, type CategoryAnimationData } from './category-hero'
import { DotNavigation } from './dot-navigation'
import { Button } from '@/components/ui/button'

interface CategoryShowcaseProps {
  animations: CategoryAnimationData[]
  title?: string
  subtitle?: string
  autoPlayInterval?: number
  showDots?: boolean
  showArrows?: boolean
  onCategoryChange?: (index: number, isManual: boolean) => void
}

export function CategoryShowcase({
  animations,
  title,
  subtitle,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  onCategoryChange,
}: CategoryShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const isManualNavigation = useRef(false)

  // Navigation Funktionen
  const goToNext = useCallback((manual = false) => {
    isManualNavigation.current = manual
    setActiveIndex(prev => {
      const newIndex = (prev + 1) % animations.length
      if (onCategoryChange) onCategoryChange(newIndex, manual)
      return newIndex
    })
    setProgress(0)
  }, [animations.length, onCategoryChange])

  const goToPrevious = useCallback((manual = false) => {
    isManualNavigation.current = manual
    setActiveIndex(prev => {
      const newIndex = (prev - 1 + animations.length) % animations.length
      if (onCategoryChange) onCategoryChange(newIndex, manual)
      return newIndex
    })
    setProgress(0)
  }, [animations.length, onCategoryChange])

  const goToSlide = useCallback((index: number, manual = true) => {
    isManualNavigation.current = manual
    setActiveIndex(index)
    setProgress(0)
    if (onCategoryChange) onCategoryChange(index, manual)
  }, [onCategoryChange])

  // Auto-Play Logic - immer aktiv
  useEffect(() => {
    if (isPaused || animations.length <= 1) {
      return
    }

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (autoPlayInterval / 100))
        if (newProgress >= 100) {
          return 0
        }
        return newProgress
      })
    }, 100)

    const slideInterval = setInterval(() => {
      goToNext(false) // Auto-Play: nicht manuell
    }, autoPlayInterval)

    return () => {
      clearInterval(progressInterval)
      clearInterval(slideInterval)
    }
  }, [isPaused, autoPlayInterval, goToNext, animations.length])

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious(true) // Manuell
      } else if (e.key === 'ArrowRight') {
        goToNext(true) // Manuell
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious])

  // Pause on hover
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  if (animations.length === 0) {
    return null
  }

  const currentAnimation = animations[activeIndex]
  const labels = animations.map(a => a.title)

  return (
    <section 
      className="relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Section Header */}
      {(title || subtitle) && (
        <div className="container pt-16 pb-8 text-center">
          {title && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative min-h-[600px] lg:min-h-[700px]">
        {/* Slides */}
        <AnimatePresence mode="wait">
          <CategoryHero
            key={currentAnimation.id}
            data={currentAnimation}
            isActive={true}
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        {showArrows && animations.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 bg-card/80 backdrop-blur-sm shadow-lg hover:bg-card"
              onClick={() => goToPrevious(true)}
              aria-label="Vorherige Kategorie"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 bg-card/80 backdrop-blur-sm shadow-lg hover:bg-card"
              onClick={() => goToNext(true)}
              aria-label="Nächste Kategorie"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Bottom Controls - nur Dots */}
      {showDots && animations.length > 1 && (
        <div className="container pb-12">
          <div className="flex justify-center">
            <DotNavigation
              totalSlides={animations.length}
              activeIndex={activeIndex}
              onDotClick={(index) => goToSlide(index, true)}
              autoPlayProgress={progress}
              labels={labels}
            />
          </div>
        </div>
      )}
    </section>
  )
}


