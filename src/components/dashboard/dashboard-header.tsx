'use client'

import { useSession, signOut } from 'next-auth/react'
import { Search, User, Settings, LogOut, ChevronDown } from 'lucide-react'
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

interface DashboardHeaderProps {
  baseUrl: string
  accentColor?: string
}

export function DashboardHeader({ baseUrl, accentColor = 'primary' }: DashboardHeaderProps) {
  const { data: session } = useSession()

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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-6">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            className="pl-10 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback className={`bg-${accentColor}/10 text-${accentColor}`}>
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{session?.user?.name || 'Benutzer'}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
            <DropdownMenuSeparator />
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
      </div>
    </header>
  )
}

