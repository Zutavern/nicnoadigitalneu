'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Search, User, Settings, LogOut, ChevronDown, Menu, X, Moon, Sun, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { LanguageSelector } from '@/components/language-selector'
import { useSidebar } from '@/hooks/use-sidebar'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  baseUrl: string
  accentColor?: string
}

export function DashboardHeader({ baseUrl, accentColor = 'primary' }: DashboardHeaderProps) {
  const { data: session } = useSession()
  const { isMobile, isTablet, toggle } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [credits, setCredits] = useState<{ balance: number; isUnlimited: boolean } | null>(null)

  // Lade Credits
  const fetchCredits = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      const res = await fetch('/api/user/credits')
      if (res.ok) {
        const data = await res.json()
        setCredits({
          balance: data.credits?.balance ?? 0,
          isUnlimited: data.credits?.isUnlimited ?? false,
        })
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }, [session?.user?.id])

  // Avoid hydration mismatch for theme-dependent content
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load credits when session is available
  useEffect(() => {
    if (session?.user?.id) {
      fetchCredits()
    }
  }, [session?.user?.id, fetchCredits])

  const showHamburger = isMobile || isTablet

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b bg-background/95 backdrop-blur-sm",
      "px-3 sm:px-4 md:px-6",
      "safe-area-padding"
    )}>
      {/* Left side: Hamburger + Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        {/* Hamburger Menu (Mobile/Tablet) */}
        {showHamburger && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-10 w-10 shrink-0 touch-target"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menü öffnen</span>
          </Button>
        )}

        {/* Search - Responsive */}
        <div className={cn(
          "transition-all duration-200",
          isMobile && !searchExpanded ? "w-10" : "flex-1 max-w-md"
        )}>
          {isMobile && !searchExpanded ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchExpanded(true)}
              className="h-10 w-10 touch-target"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>
          ) : (
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                className={cn(
                  "pl-10 bg-muted/50 border-0",
                  "h-10 sm:h-9"
                )}
                onBlur={() => isMobile && setSearchExpanded(false)}
                autoFocus={isMobile && searchExpanded}
              />
              {isMobile && searchExpanded && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchExpanded(false)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className={cn(
        "flex items-center",
        "gap-1 sm:gap-2 md:gap-4",
        isMobile && searchExpanded && "hidden"
      )}>
        {/* Theme Toggle - Visible on tablet+ */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-10 w-10 rounded-full touch-target hidden sm:flex"
          title={mounted ? (theme === 'dark' ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren') : 'Theme wechseln'}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Theme wechseln</span>
        </Button>

        {/* Language Selector - Hidden on mobile */}
        <div className="hidden md:block">
          <LanguageSelector />
        </div>

        {/* AI Credits Badge */}
        {credits && (
          <Link
            href={`${baseUrl}/credits`}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105",
              credits.isUnlimited
                ? "bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-sm shadow-purple-500/10"
                : credits.balance > 10
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : credits.balance > 0
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
            )}
            title={credits.isUnlimited ? 'Unlimited AI Credits' : `${credits.balance.toFixed(0)} AI Credits`}
          >
            <Sparkles className={cn(
              "h-4 w-4",
              credits.isUnlimited && "animate-pulse"
            )} />
            <span className="hidden sm:inline font-semibold">
              {credits.isUnlimited ? '∞' : credits.balance.toFixed(0)}
            </span>
          </Link>
        )}

        {/* Notifications */}
        <NotificationBell />

        {/* User Menu - Render placeholder during SSR to prevent hydration mismatch */}
        {!mounted ? (
          <Button variant="ghost" className="flex items-center gap-2 px-2 h-10 touch-target">
            <Avatar className="h-8 w-8">
              <AvatarFallback className={`bg-${accentColor}/10 text-${accentColor}`}>
                {getInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-10 touch-target">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback className={`bg-${accentColor}/10 text-${accentColor}`}>
                    {getInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium">{session?.user?.name || 'Benutzer'}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              
              {/* Theme toggle for mobile */}
              <DropdownMenuItem 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="md:hidden cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Helles Design</span>
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dunkles Design</span>
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href={`${baseUrl}/profile`} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profil bearbeiten
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${baseUrl}/settings`} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Einstellungen
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => {
                  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
                  signOut({ callbackUrl: `${baseUrl}/` })
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
