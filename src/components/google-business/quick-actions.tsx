'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Star, Camera, Megaphone, Pencil, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  href: string
  badge?: number
  variant: 'default' | 'warning' | 'success'
}

interface QuickActionsProps {
  unansweredReviews?: number
  className?: string
}

export function QuickActions({ unansweredReviews = 0, className }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'reviews',
      label: 'Bewertung beantworten',
      description: unansweredReviews > 0 ? `${unansweredReviews} warten auf Antwort` : 'Alle beantwortet',
      icon: <Star className="h-5 w-5" />,
      href: '/stylist/marketing/google-business/reviews',
      badge: unansweredReviews > 0 ? unansweredReviews : undefined,
      variant: unansweredReviews > 0 ? 'warning' : 'success',
    },
    {
      id: 'photos',
      label: 'Foto hochladen',
      description: 'Zeige deine Arbeit',
      icon: <Camera className="h-5 w-5" />,
      href: '/stylist/marketing/google-business/photos',
      variant: 'default',
    },
    {
      id: 'post',
      label: 'Post erstellen',
      description: 'Teile Neuigkeiten',
      icon: <Megaphone className="h-5 w-5" />,
      href: '/stylist/marketing/google-business/posts',
      variant: 'default',
    },
    {
      id: 'profile',
      label: 'Profil bearbeiten',
      description: 'Daten aktualisieren',
      icon: <Pencil className="h-5 w-5" />,
      href: '/stylist/marketing/google-business/profile',
      variant: 'default',
    },
  ]

  const getVariantStyles = (variant: QuickAction['variant']) => {
    switch (variant) {
      case 'warning':
        return {
          bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20 dark:border-yellow-500/20',
          icon: 'text-amber-600 dark:text-yellow-500',
          badge: 'bg-amber-500 dark:bg-yellow-500 text-white',
        }
      case 'success':
        return {
          bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-green-500/10 dark:hover:bg-green-500/20 dark:border-green-500/20',
          icon: 'text-emerald-600 dark:text-green-500',
          badge: 'bg-emerald-500 dark:bg-green-500 text-white',
        }
      default:
        return {
          bg: 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-muted/50 dark:hover:bg-muted dark:border-border',
          icon: 'text-blue-600 dark:text-blue-500',
          badge: 'bg-blue-600 dark:bg-blue-500 text-white',
        }
    }
  }

  return (
    <Card className={cn('overflow-hidden border-slate-200 dark:border-border', className)}>
      <CardHeader className="pb-3 bg-slate-50 dark:bg-transparent border-b border-slate-100 dark:border-transparent">
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-foreground">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <span>Schnellaktionen</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const styles = getVariantStyles(action.variant)
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={action.href} className="block">
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-auto py-4 px-4 justify-start gap-3 transition-all',
                      styles.bg
                    )}
                  >
                    <div className={cn('flex-shrink-0', styles.icon)}>{action.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-foreground">{action.label}</span>
                        {action.badge && (
                          <Badge className={cn('h-5 min-w-[20px] px-1.5', styles.badge)}>
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-muted-foreground mt-0.5">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

