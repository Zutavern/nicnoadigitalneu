'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

const productLinks = [
  { href: '/features', label: 'Features' },
  { href: '/preise', label: 'Preise' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/updates', label: 'Updates' },
  { href: '/beta-programm', label: 'Beta-Programm' },
]

const companyLinks = [
  { href: '/uber-uns', label: 'Über uns' },
  { href: '/partner', label: 'Partner' },
  { href: '/karriere', label: 'Karriere' },
  { href: '/blog', label: 'Blog' },
  { href: '/presse', label: 'Presse' },
]

export function MainNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <nav className="container flex h-20 items-center justify-between">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild className="md:hidden mr-6">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                <Link href="/produkt" className="text-lg font-medium text-muted-foreground hover:text-foreground">
                  Produkt
                </Link>
                <Link href="/unternehmen" className="text-lg font-medium text-muted-foreground hover:text-foreground">
                  Unternehmen
                </Link>
                <Link href="/faq" className="text-lg font-medium text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
                <Link href="/preise" className="text-lg font-medium text-muted-foreground hover:text-foreground">
                  Preise
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex md:items-center md:space-x-2 flex-col md:flex-row items-start">
            <span className="text-xl font-bold tracking-tight text-foreground">
              NICNOA <span className="text-primary">&</span> CO.
            </span>
            <span className="text-sm font-medium text-muted-foreground -mt-1 md:mt-0">DIGITAL</span>
          </Link>
          <div className="hidden md:flex md:ml-24">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-base font-medium text-muted-foreground">
                    Produkt
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-2 p-4 w-[200px]">
                      {productLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-base font-medium text-muted-foreground">
                    Unternehmen
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-2 p-4 w-[200px]">
                      {companyLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/faq" legacyBehavior passHref>
                    <NavigationMenuLink className="text-base font-medium text-muted-foreground hover:text-foreground px-4 py-2">
                      FAQ
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/preise" legacyBehavior passHref>
                    <NavigationMenuLink className="text-base font-medium text-muted-foreground hover:text-foreground px-4 py-2">
                      Preise
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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