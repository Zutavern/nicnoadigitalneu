'use client'

import { motion } from 'framer-motion'

interface DotNavigationProps {
  totalSlides: number
  activeIndex: number
  onDotClick: (index: number) => void
  autoPlayProgress?: number // 0-100
  primaryColor?: string
  labels?: string[]
}

export function DotNavigation({
  totalSlides,
  activeIndex,
  onDotClick,
  autoPlayProgress = 0,
  primaryColor = 'hsl(var(--primary))',
  labels = [],
}: DotNavigationProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: totalSlides }).map((_, index) => {
        const isActive = index === activeIndex
        const label = labels[index]
        
        return (
          <button
            key={index}
            onClick={() => onDotClick(index)}
            className="relative group focus:outline-none"
            aria-label={label ? `Zu ${label} wechseln` : `Slide ${index + 1}`}
          >
            {/* Tooltip */}
            {label && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-card border border-border rounded-md px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                  {label}
                </div>
              </div>
            )}
            
            {/* Dot Container */}
            <div className="relative">
              {/* Progress Ring (für aktiven Dot) */}
              {isActive && autoPlayProgress > 0 && (
                <svg
                  className="absolute -inset-1 w-6 h-6 -rotate-90"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke={`${primaryColor}30`}
                    strokeWidth="2"
                  />
                  <motion.circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={62.83}
                    strokeDashoffset={62.83 * (1 - autoPlayProgress / 100)}
                  />
                </svg>
              )}
              
              {/* Dot */}
              <motion.div
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: isActive ? primaryColor : `${primaryColor}30`,
                  scale: isActive ? 1.2 : 1,
                }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}


