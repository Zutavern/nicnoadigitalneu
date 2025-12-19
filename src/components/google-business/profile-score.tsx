'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ProfileScore } from '@/lib/google-business/types'

interface ProfileScoreProps {
  score: ProfileScore
  className?: string
}

export function ProfileScoreCard({ score, className }: ProfileScoreProps) {
  const percentage = score.total
  const circumference = 2 * Math.PI * 45 // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Farbe basierend auf Score
  const getScoreColor = () => {
    if (percentage >= 80) return { from: '#22c55e', to: '#16a34a' } // green
    if (percentage >= 50) return { from: '#3b82f6', to: '#2563eb' } // blue
    return { from: '#f97316', to: '#ea580c' } // orange
  }

  const colors = getScoreColor()

  // Motivierender Text
  const getMotivationText = () => {
    if (percentage >= 90) return { title: 'Exzellent!', subtitle: 'Dein Profil ist top optimiert.' }
    if (percentage >= 80) return { title: 'Großartig!', subtitle: 'Nur noch kleine Verbesserungen.' }
    if (percentage >= 60) return { title: 'Guter Start!', subtitle: 'Ein paar Dinge fehlen noch.' }
    if (percentage >= 40) return { title: 'Auf dem Weg!', subtitle: 'Es gibt noch einiges zu tun.' }
    return { title: 'Los geht\'s!', subtitle: 'Zeit dein Profil aufzubauen.' }
  }

  const motivation = getMotivationText()

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/30"
              />
              {/* Progress circle */}
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={colors.from} />
                  <stop offset="100%" stopColor={colors.to} />
                </linearGradient>
              </defs>
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-3xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {percentage}%
              </motion.span>
            </div>
          </div>

          {/* Motivation Text */}
          <div className="flex-1">
            <motion.h3
              className="text-xl font-bold"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {motivation.title}
            </motion.h3>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {motivation.subtitle}
            </motion.p>

            {/* Mini Breakdown */}
            <motion.div
              className="mt-4 grid grid-cols-3 gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-center">
                <div className="text-sm font-semibold">{score.breakdown.basics}%</div>
                <div className="text-xs text-muted-foreground">Basis</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">{score.breakdown.photos}%</div>
                <div className="text-xs text-muted-foreground">Fotos</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">{score.breakdown.reviews}%</div>
                <div className="text-xs text-muted-foreground">Reviews</div>
              </div>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}




