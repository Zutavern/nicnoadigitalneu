'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Prüfe, ob der Banner bereits akzeptiert wurde
    const hasAcceptedCookies = localStorage.getItem('cookiesAccepted')
    if (!hasAcceptedCookies) {
      setIsVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t shadow-lg"
        >
          <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div className="text-sm text-muted-foreground">
              <p>
                Wir verwenden Cookies, um Ihnen das beste Nutzererlebnis auf unserer Website zu ermöglichen. 
                Durch die weitere Nutzung der Website stimmen Sie der Verwendung von Cookies zu.
              </p>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <a 
                  href="/datenschutz" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  Mehr erfahren
                </a>
              </Button>
              <Button 
                size="sm"
                onClick={acceptCookies}
              >
                Akzeptieren
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 