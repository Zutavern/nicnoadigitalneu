'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Moon, Sun, User, Settings, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { LanguageSelector } from '@/components/language-selector'
import { useSidebar } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils'

export function AdminHeader() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const { isMobile, isTablet, toggle } = useSidebar()
  const [searchExpanded, setSearchExpanded] = useState(false)

  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'AD'

  const showHamburger = isMobile || isTablet

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
                  "pl-10 bg-muted/50 border-0 focus-visible:ring-1",
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

      {/* Right side: Actions */}
      <div className={cn(
        "flex items-center",
        "gap-1 sm:gap-2",
        isMobile && searchExpanded && "hidden"
      )}>
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-10 w-10 rounded-full touch-target hidden sm:flex"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Theme wechseln</span>
        </Button>

        {/* Language Selector - Hidden on mobile */}
        <div className="hidden md:block">
          <LanguageSelector />
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full touch-target">
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-primary/20">
                <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Theme toggle for mobile */}
            <DropdownMenuItem 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="sm:hidden cursor-pointer"
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
              <Link href="/admin/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Einstellungen</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
                signOut({ callbackUrl: `${baseUrl}/` })
              }}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Abmelden</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
