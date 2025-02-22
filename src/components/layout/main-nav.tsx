'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function MainNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <nav className="container flex h-20 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-foreground">
              NICNOA <span className="text-primary">&</span> CO.
            </span>
            <span className="text-sm font-medium text-muted-foreground">DIGITAL</span>
          </Link>
          <div className="hidden md:flex md:gap-8 md:ml-24">
            <Link href="/produkt" className="text-base font-medium text-muted-foreground hover:text-foreground">
              Produkt
            </Link>
            <Link href="/unternehmen" className="text-base font-medium text-muted-foreground hover:text-foreground">
              Unternehmen
            </Link>
            <Link href="/faq" className="text-base font-medium text-muted-foreground hover:text-foreground">
              FAQ
            </Link>
            <Link href="/preise" className="text-base font-medium text-muted-foreground hover:text-foreground">
              Preise
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-base font-medium">
              Login
            </Button>
          </Link>
          <Link href="/registrieren">
            <Button className="text-base font-medium">
              Registrieren
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
} 