import { MainNav } from '@/components/layout/main-nav'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MainNav />
      <div className="min-h-screen grid lg:grid-cols-2 pt-20">
        {/* Linke Seite - Auth Form */}
        <div className="relative flex flex-col items-center justify-center p-8">
          {/* Zurück-Button */}
          <div className="absolute top-8 left-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Zurück
              </Link>
            </Button>
          </div>
          
          {/* Auth Card */}
          <div className="w-full max-w-sm space-y-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow">
              <div className="flex flex-col space-y-1.5 p-6">
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Rechte Seite - Hero Image */}
        <div className="hidden lg:block relative bg-muted">
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/50 to-background/80" />
          <div className="absolute inset-0 bg-background/50" />
          {/* Hier kommt später ein Hintergrundbild hin */}
        </div>
      </div>
    </>
  )
} 