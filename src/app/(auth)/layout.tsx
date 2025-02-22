'use client'

import { MainNav } from '@/components/layout/main-nav'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  const heroImage = pathname === '/login' 
    ? "https://yqzunbubsqmsfsayneeh.supabase.co/storage/v1/object/public/hereo//ine_stilvolle_frau_sitzt_entspannt_in_einem_modernen_luxurisen_friseursalon_whrend_ein_charismatisc_eudsoeq9vmqfvjmmykxh_0.png"
    : "https://yqzunbubsqmsfsayneeh.supabase.co/storage/v1/object/public/hereo//ine_stilvolle_frau_sitzt_entspannt_in_einem_modernen_luxurisen_friseursalon_whrend_ein_charismatisch_0f3cdd9e-3c75-47f6-a902-8f2b7aa78dda.png"

  const heroTitle = pathname === '/login'
    ? "Willkommen zurück in Ihrem Salon-Space"
    : "Starten Sie Ihre Salon-Management Revolution"

  const heroText = pathname === '/login'
    ? "Melden Sie sich an und verwalten Sie Ihren Salon-Space noch effizienter."
    : "Registrieren Sie sich jetzt und entdecken Sie die Zukunft des Salon-Managements."

  return (
    <>
      <MainNav />
      <div className="min-h-screen grid lg:grid-cols-2 pt-20">
        {/* Linke Seite - Auth Form */}
        <div className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-background via-background/95 to-background/90">
          <div className="absolute top-8 left-8 z-10">
            <Button variant="ghost" size="sm" asChild className="hover:bg-background/20">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
                Zurück zur Startseite
              </Link>
            </Button>
          </div>
          
          {/* Auth Card */}
          <div className="w-full max-w-sm">
            <div className="rounded-xl border bg-card/30 backdrop-blur-sm text-card-foreground shadow-lg ring-1 ring-border/5">
              <div className="flex flex-col space-y-1.5 p-8">
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Rechte Seite - Hero Image */}
        <div className="hidden lg:block relative bg-muted overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt="Stilvolle Frau im Friseursalon"
              fill
              className="object-cover object-center"
              priority
              quality={90}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="max-w-lg text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {heroTitle}
              </h2>
              <p className="text-muted-foreground text-lg">
                {heroText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 