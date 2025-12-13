'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { PresetAnimation } from './animations/preset-animations'

export interface CategoryAnimationData {
  id: string
  categoryKey: string
  title: string
  subtitle?: string | null
  description: string
  badgeText?: string | null
  features: string[]
  animationType: string
  presetAnimation?: string | null
  customAnimationCode?: string | null
  lottieUrl?: string | null
  animationPosition: string
  animationSize: string
  animationSpeed: number
  useDesignSystemColors: boolean
  customPrimaryColor?: string | null
  customSecondaryColor?: string | null
  customAccentColor?: string | null
}

interface CategoryHeroProps {
  data: CategoryAnimationData
  isActive: boolean
}

export function CategoryHero({ data, isActive }: CategoryHeroProps) {
  // Farben bestimmen
  const primaryColor = data.useDesignSystemColors 
    ? 'hsl(var(--primary))' 
    : data.customPrimaryColor || 'hsl(var(--primary))'
  const secondaryColor = data.useDesignSystemColors 
    ? 'hsl(var(--secondary))' 
    : data.customSecondaryColor || 'hsl(var(--secondary))'
  const accentColor = data.useDesignSystemColors 
    ? 'hsl(var(--accent))' 
    : data.customAccentColor || 'hsl(var(--accent))'

  // Layout basierend auf animationPosition
  const isAnimationLeft = data.animationPosition === 'left'
  const isAnimationCenter = data.animationPosition === 'center'
  const isAnimationBackground = data.animationPosition === 'background'

  // Größe für Animation
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    full: 'max-w-xl',
  }
  const animationSizeClass = sizeClasses[data.animationSize as keyof typeof sizeClasses] || sizeClasses.medium

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      {/* Background Animation Mode */}
      {isAnimationBackground && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <PresetAnimation
            preset={data.presetAnimation || 'calendar'}
            speed={data.animationSpeed}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentColor={accentColor}
          />
        </div>
      )}

      {/* Content Layout */}
      <div className={`
        container py-4 lg:py-6 min-h-[400px] lg:min-h-[450px] flex items-center
        ${isAnimationCenter ? 'text-center' : ''}
      `}>
        <div className={`w-full ${!isAnimationCenter && !isAnimationBackground ? 'grid lg:grid-cols-2 gap-6 items-center' : ''}`}>
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: isAnimationLeft ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`
            ${isAnimationLeft ? 'lg:order-2' : ''}
            ${isAnimationCenter ? 'max-w-3xl mx-auto' : ''}
          `}
        >
          {/* Badge */}
          {data.badgeText && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
                isAnimationCenter ? 'mx-auto' : ''
              }`}
              style={{
                backgroundColor: `${primaryColor}15`,
                border: `1px solid ${primaryColor}30`,
              }}
            >
              <Sparkles className="h-4 w-4" style={{ color: primaryColor }} />
              <span className="text-sm font-medium" style={{ color: primaryColor }}>
                {data.badgeText}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
          >
            {data.title}
          </motion.h2>

          {/* Subtitle */}
          {data.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl font-medium mb-4"
              style={{ color: primaryColor }}
            >
              {data.subtitle}
            </motion.p>
          )}

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-muted-foreground mb-8 max-w-2xl"
          >
            {data.description}
          </motion.p>

          {/* Features */}
          {data.features && data.features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className={`
                grid gap-3
                ${isAnimationCenter ? 'grid-cols-2 max-w-lg mx-auto' : 'grid-cols-1 sm:grid-cols-2'}
              `}
            >
              {data.features.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <Check className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Animation Content (nicht bei center/background) */}
        {!isAnimationCenter && !isAnimationBackground && (
          <motion.div
            initial={{ opacity: 0, x: isAnimationLeft ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`
              ${isAnimationLeft ? 'lg:order-1' : ''}
              ${animationSizeClass} mx-auto
            `}
          >
            {data.animationType === 'preset' && data.presetAnimation && (
              <PresetAnimation
                preset={data.presetAnimation}
                speed={data.animationSpeed}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                accentColor={accentColor}
              />
            )}
            
            {data.animationType === 'lottie' && data.lottieUrl && (
              <div className="w-full aspect-square">
                {/* Lottie Player würde hier integriert werden */}
                <div className="w-full h-full rounded-2xl bg-muted/50 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Lottie Animation</p>
                </div>
              </div>
            )}
            
            {data.animationType === 'custom' && data.customAnimationCode && (
              <div 
                className="w-full"
                dangerouslySetInnerHTML={{ __html: data.customAnimationCode }}
              />
            )}
          </motion.div>
        )}

        {/* Centered Animation */}
        {isAnimationCenter && !isAnimationBackground && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className={`mt-12 ${animationSizeClass} mx-auto`}
          >
            {data.animationType === 'preset' && data.presetAnimation && (
              <PresetAnimation
                preset={data.presetAnimation}
                speed={data.animationSpeed}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                accentColor={accentColor}
              />
            )}
          </motion.div>
        )}
        </div>
      </div>
    </motion.div>
  )
}




