'use client'

import { useState, useEffect } from 'react'
import { Globe, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Language {
  id: string
  code: string
  name: string
  nativeName: string
  flag: string | null
  isDefault: boolean
}

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'
const DEFAULT_FALLBACK = 'en' // Englisch als Fallback wenn Browser-Sprache nicht verfügbar

export function LanguageSelector({ className }: { className?: string }) {
  const [languages, setLanguages] = useState<Language[]>([])
  const [currentLocale, setCurrentLocale] = useState<string>('de')
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchLanguages()
  }, [])

  const fetchLanguages = async () => {
    try {
      const res = await fetch('/api/languages/active')
      const data = await res.json()
      setLanguages(data.languages || [])
      
      // Aktuelle Sprache ermitteln
      const savedLocale = getCookie(LOCALE_COOKIE_NAME)
      
      if (savedLocale && data.languages?.some((l: Language) => l.code === savedLocale)) {
        // Gespeicherte Sprache verwenden
        setCurrentLocale(savedLocale)
      } else {
        // Browser-Sprache erkennen
        const browserLang = detectBrowserLanguage(data.languages || [])
        setCurrentLocale(browserLang)
        // Cookie setzen
        setCookie(LOCALE_COOKIE_NAME, browserLang, 365)
      }
    } catch (error) {
      console.error('Error fetching languages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const detectBrowserLanguage = (availableLanguages: Language[]): string => {
    if (typeof navigator === 'undefined') return DEFAULT_FALLBACK

    // Browser-Sprachen holen (priorisiert)
    const browserLanguages = navigator.languages || [navigator.language]
    
    for (const lang of browserLanguages) {
      // Sprach-Code extrahieren (z.B. "de-DE" → "de")
      const code = lang.split('-')[0].toLowerCase()
      
      // Prüfen ob diese Sprache verfügbar ist
      if (availableLanguages.some(l => l.code === code)) {
        return code
      }
    }

    // Fallback: Englisch (wenn verfügbar), sonst erste verfügbare Sprache
    if (availableLanguages.some(l => l.code === DEFAULT_FALLBACK)) {
      return DEFAULT_FALLBACK
    }

    // Letzte Option: Erste verfügbare Sprache oder 'de'
    return availableLanguages[0]?.code || 'de'
  }

  const handleLanguageChange = (langCode: string) => {
    setCurrentLocale(langCode)
    setCookie(LOCALE_COOKIE_NAME, langCode, 365)
    setIsOpen(false)
    
    // Seite neu laden um Übersetzungen anzuwenden
    window.location.reload()
  }

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
    return match ? match[2] : null
  }

  const setCookie = (name: string, value: string, days: number) => {
    if (typeof document === 'undefined') return
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
  }

  const currentLanguage = languages.find(l => l.code === currentLocale)

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className={cn('rounded-full', className)} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  // Wenn nur eine Sprache verfügbar ist, nichts anzeigen
  if (languages.length <= 1) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('rounded-full', className)}
        >
          {currentLanguage?.flag ? (
            <span className="text-lg">{currentLanguage.flag}</span>
          ) : (
            <Globe className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              'flex items-center gap-3 cursor-pointer',
              lang.code === currentLocale && 'bg-primary/5'
            )}
          >
            <span className="text-lg w-6">{lang.flag || '🌐'}</span>
            <span className="flex-1">{lang.nativeName}</span>
            {lang.code === currentLocale && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

