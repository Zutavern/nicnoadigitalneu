'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Settings, ArrowRight, Star, TrendingUp, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export function NotConnectedBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-dashed border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/5 via-red-500/5 to-yellow-500/5 overflow-hidden">
        <CardContent className="py-12">
          <div className="text-center">
            {/* Google Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 p-[3px] mb-6">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="h-10 w-10"
                  fill="none"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-3">
              Verbinde dein Google Business Profil
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Verwalte Bewertungen, optimiere dein Profil und erreiche mehr Kunden – alles direkt aus NICNOA.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-yellow-500/10 dark:border-yellow-500/20">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Star className="h-5 w-5 text-amber-600 dark:text-yellow-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Bewertungen</p>
                  <p className="text-xs text-muted-foreground">
                    Alle Reviews an einem Ort
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-green-500/10 dark:border-green-500/20">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-green-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Insights</p>
                  <p className="text-xs text-muted-foreground">
                    Performance-Daten live
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-violet-50 border border-violet-200 dark:bg-purple-500/10 dark:border-purple-500/20">
                <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-violet-600 dark:text-purple-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">AI-Antworten</p>
                  <p className="text-xs text-muted-foreground">
                    Schneller antworten
                  </p>
                </div>
              </div>
            </div>

            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Link href="/stylist/settings/integrations">
                <Settings className="h-5 w-5 mr-2" />
                Zu den Einstellungen
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

