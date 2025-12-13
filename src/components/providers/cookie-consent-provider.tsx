'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

// Cookie-Kategorien Typen
export interface Cookie {
  name: string
  description: string
  duration: string
  provider: string
}

export interface CookieCategory {
  id: string
  name: string
  description: string
  isRequired: boolean
  cookies: Cookie[]
}

export interface CookieConsent {
  essential: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
  timestamp: number
}

interface CookieConsentContextType {
  consent: CookieConsent | null
  categories: CookieCategory[]
  hasConsented: boolean
  showBanner: boolean
  setShowBanner: (show: boolean) => void
  acceptAll: () => void
  rejectAll: () => void
  savePreferences: (preferences: Partial<CookieConsent>) => void
  openSettings: () => void
  isConsentGiven: (category: keyof Omit<CookieConsent, 'timestamp'>) => boolean
}

const defaultConsent: CookieConsent = {
  essential: true, // Immer true
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: 0,
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined)

const CONSENT_COOKIE_NAME = 'nicnoa_cookie_consent'
const CONSENT_VERSION = 1 // Erhöhen wenn sich die Cookie-Struktur ändert

interface CookieConsentProviderProps {
  children: ReactNode
  categories: CookieCategory[]
}

export function CookieConsentProvider({ children, categories }: CookieConsentProviderProps) {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Lade gespeicherte Einwilligung
  useEffect(() => {
    const loadConsent = () => {
      try {
        const stored = localStorage.getItem(CONSENT_COOKIE_NAME)
        if (stored) {
          const parsed = JSON.parse(stored)
          // Prüfe ob die Version aktuell ist
          if (parsed.version === CONSENT_VERSION) {
            setConsent(parsed.consent)
            setShowBanner(false)
          } else {
            // Veraltete Version - Banner erneut zeigen
            setShowBanner(true)
          }
        } else {
          // Keine Einwilligung vorhanden
          setShowBanner(true)
        }
      } catch {
        setShowBanner(true)
      }
      setIsInitialized(true)
    }

    // Warte bis Password-Protection abgeschlossen ist
    const checkPasswordEntered = () => {
      const passwordEntered = sessionStorage.getItem('passwordEntered')
      if (passwordEntered) {
        // Kurze Verzögerung nach Password-Animation
        setTimeout(loadConsent, 1500)
      } else {
        // Noch nicht eingeloggt - warte
        setTimeout(checkPasswordEntered, 500)
      }
    }

    checkPasswordEntered()
  }, [])

  // Speichere Einwilligung
  const saveConsent = useCallback((newConsent: CookieConsent) => {
    const consentData = {
      version: CONSENT_VERSION,
      consent: newConsent,
    }
    localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(consentData))
    setConsent(newConsent)
    setShowBanner(false)

    // Dispatch Event für andere Komponenten
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: newConsent }))
  }, [])

  const acceptAll = useCallback(() => {
    const newConsent: CookieConsent = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    }
    saveConsent(newConsent)
  }, [saveConsent])

  const rejectAll = useCallback(() => {
    const newConsent: CookieConsent = {
      essential: true, // Immer erforderlich
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    }
    saveConsent(newConsent)
  }, [saveConsent])

  const savePreferences = useCallback((preferences: Partial<CookieConsent>) => {
    const newConsent: CookieConsent = {
      essential: true, // Immer erforderlich
      functional: preferences.functional ?? consent?.functional ?? false,
      analytics: preferences.analytics ?? consent?.analytics ?? false,
      marketing: preferences.marketing ?? consent?.marketing ?? false,
      timestamp: Date.now(),
    }
    saveConsent(newConsent)
  }, [consent, saveConsent])

  const openSettings = useCallback(() => {
    setShowBanner(true)
  }, [])

  const isConsentGiven = useCallback((category: keyof Omit<CookieConsent, 'timestamp'>) => {
    if (!consent) return category === 'essential'
    return consent[category]
  }, [consent])

  const hasConsented = consent !== null && consent.timestamp > 0

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        categories,
        hasConsented,
        showBanner: isInitialized && showBanner,
        setShowBanner,
        acceptAll,
        rejectAll,
        savePreferences,
        openSettings,
        isConsentGiven,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider')
  }
  return context
}


