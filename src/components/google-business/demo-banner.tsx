'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Crown, 
  ArrowRight, 
  Link2, 
  Star, 
  TrendingUp, 
  MessageSquare,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface DemoBannerProps {
  type: 'not_premium' | 'not_connected'
  basePath?: string // '/stylist' or '/salon'
}

export function DemoBanner({ type, basePath = '/stylist' }: DemoBannerProps) {
  if (type === 'not_premium') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
            
            <CardContent className="py-6 relative">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
                    <AlertTriangle className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">Demo-Modus aktiv</h3>
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                        Vorschau
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-sm max-w-lg">
                      Du siehst beispielhafte Demo-Daten. Upgrade auf Premium, um dein 
                      echtes Google Business Profil zu verbinden und zu verwalten.
                    </p>
                  </div>
                </div>
                
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg whitespace-nowrap"
                >
                  <Link href="/upgrade">
                    <Crown className="h-4 w-4 mr-2" />
                    Premium werden
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              
              {/* Feature highlights */}
              <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Star className="h-4 w-4 text-amber-400" />
                  <span className="text-sm">Bewertungen verwalten</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm">Performance-Insights</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">KI-gestützte Antworten</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    )
  }

  // Not connected (but premium)
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 relative">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
          </div>
          
          <CardContent className="py-6 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                  <Link2 className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">Google Business verbinden</h3>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                  <p className="text-blue-100/80 text-sm max-w-lg">
                    Du siehst Demo-Daten. Verbinde jetzt dein Google Business Profil, 
                    um echte Bewertungen, Insights und Posts zu verwalten.
                  </p>
                </div>
              </div>
              
              <Button 
                asChild 
                className="bg-white text-blue-900 hover:bg-blue-50 shadow-lg whitespace-nowrap"
              >
                <Link href={`${basePath}/settings/integrations`}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Jetzt verbinden
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  )
}

/**
 * Compact demo indicator badge for use within cards/sections
 */
export function DemoIndicator() {
  return (
    <Badge 
      variant="outline" 
      className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30"
    >
      <AlertTriangle className="h-3 w-3 mr-1" />
      Demo-Daten
    </Badge>
  )
}

