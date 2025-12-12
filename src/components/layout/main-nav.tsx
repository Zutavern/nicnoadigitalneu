'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LanguageSelector } from '@/components/language-selector'

interface NavConfig {
  navProductLabel: string
  navCompanyLabel: string
  navFaqLabel: string
  navPricingLabel: string
  navLoginLabel: string
  navRegisterLabel: string
}

const defaultConfig: NavConfig = {
  navProductLabel: 'Produkt',
  navCompanyLabel: 'Unternehmen',
  navFaqLabel: 'FAQ',
  navPricingLabel: 'Preise',
  navLoginLabel: 'Login',
  navRegisterLabel: 'Registrieren',
}

export function MainNav() {
  const [config, setConfig] = useState<NavConfig>(defaultConfig)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/global-ui-config')
        if (res.ok) {
          const data = await res.json()
          setConfig({ ...defaultConfig, ...data })
        }
      } catch (error) {
        console.error('Failed to load nav config:', error)
      }
    }
    loadConfig()
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <nav className="container flex h-20 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-foreground">
              NICNOA<span className="text-primary">&CO</span><span className="text-primary">.online</span>
            </span>
          </Link>
          <div className="hidden md:flex md:gap-8 md:ml-24">
            <Link href="/produkt" className="text-base font-medium text-muted-foreground hover:text-foreground">
              {config.navProductLabel}
            </Link>
            <Link href="/unternehmen" className="text-base font-medium text-muted-foreground hover:text-foreground">
              {config.navCompanyLabel}
            </Link>
            <Link href="/faq" className="text-base font-medium text-muted-foreground hover:text-foreground">
              {config.navFaqLabel}
            </Link>
            <Link href="/preise" className="text-base font-medium text-muted-foreground hover:text-foreground">
              {config.navPricingLabel}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Link href="/login">
            <Button variant="ghost" className="text-base font-medium">
              {config.navLoginLabel}
            </Button>
          </Link>
          <Link href="/registrieren">
            <Button className="text-base font-medium">
              {config.navRegisterLabel}
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}
