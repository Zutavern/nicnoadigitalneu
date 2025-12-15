'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Euro,
  BarChart3,
  Settings,
  MessageSquare,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Scissors,
  HelpCircle,
  MapPin,
  User,
  HandshakeIcon,
  Gift,
  Palette,
  FileText,
  Share2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useSidebar } from '@/hooks/use-sidebar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const menuItems = [
  {
    title: 'Übersicht',
    items: [
      { label: 'Dashboard', href: '/stylist', icon: LayoutDashboard },
      { label: 'Kalender', href: '/stylist/calendar', icon: Calendar },
      { label: 'Analytics', href: '/stylist/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Termine',
    items: [
      { label: 'Buchungen', href: '/stylist/bookings', icon: Clock },
      { label: 'Verfügbarkeit', href: '/stylist/availability', icon: Calendar },
    ],
  },
  {
    title: 'Arbeitsplatz',
    items: [
      { label: 'Aktueller Salon', href: '/stylist/workspace', icon: MapPin },
    ],
  },
  {
    title: 'Finanzen',
    items: [
      { label: 'Einnahmen', href: '/stylist/earnings', icon: Euro },
      { label: 'Abrechnungen', href: '/stylist/invoices', icon: Euro },
    ],
  },
  {
    title: 'Profil',
    items: [
      { label: 'Mein Profil', href: '/stylist/profile', icon: User },
      { label: 'Bewertungen', href: '/stylist/reviews', icon: Star },
      { label: 'Nachrichten', href: '/stylist/messages', icon: MessageSquare },
      { label: 'Empfehlungen', href: '/stylist/referral', icon: Gift },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Mein Branding', href: '/stylist/marketing', icon: Palette },
      { label: 'Social Media', href: '/stylist/marketing/social-media', icon: Share2 },
      { label: 'Preislisten', href: '/stylist/pricelist', icon: FileText },
    ],
  },
  {
    title: 'Extras',
    items: [
      { label: 'Partner & Vorteile', href: '/dashboard/partners', icon: HandshakeIcon },
    ],
  },
]

// ==================== SIDEBAR CONTENT ====================

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname()

  const renderMenuItem = (item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }) => {
    const isActive = pathname === item.href
    
    if (collapsed) {
      return (
        <li key={item.href}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center rounded-lg p-3 text-sm transition-all",
                    isActive
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/40 dark:shadow-pink-500/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {item.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </li>
      )
    }

    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
            isActive
              ? "bg-pink-500 text-white shadow-lg shadow-pink-500/40 dark:shadow-pink-500/25"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      </li>
    )
  }

  return (
    <>
      {/* Stylist Badge */}
      {!collapsed && (
        <div className="mx-4 mt-4">
          <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-rose-500/20 dark:from-pink-500/10 dark:to-rose-500/10 border border-pink-500/30 dark:border-pink-500/20 px-3 py-2">
            <Scissors className="h-4 w-4 text-pink-600 dark:text-pink-500" />
            <span className="text-sm font-medium text-pink-600 dark:text-pink-500">Stylist Dashboard</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {!collapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => renderMenuItem(item))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        {collapsed ? (
          <>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/stylist/settings"
                    className="flex items-center justify-center rounded-lg p-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Einstellungen</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/stylist/help"
                    className="flex items-center justify-center rounded-lg p-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Hilfe</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
                      signOut({ callbackUrl: `${baseUrl}/` })
                    }}
                    className="flex w-full items-center justify-center rounded-lg p-3 text-sm text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Abmelden</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        ) : (
          <>
            <Link
              href="/stylist/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Settings className="h-5 w-5" />
              <span>Einstellungen</span>
            </Link>
            <Link
              href="/stylist/help"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Hilfe</span>
            </Link>
            <button
              onClick={() => {
                const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
                signOut({ callbackUrl: `${baseUrl}/` })
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span>Abmelden</span>
            </button>
          </>
        )}
      </div>
    </>
  )
}

// ==================== MAIN COMPONENT ====================

export function StylistSidebar() {
  const { isOpen, isCollapsed, isMobile, toggle, close } = useSidebar()

  return (
    <>
      {/* Mobile: Sheet/Drawer - Only rendered on client when isMobile */}
      <Sheet open={isMobile && isOpen} onOpenChange={(open) => !open && close()}>
        <SheetContent 
          side="left" 
          className="w-[280px] p-0 flex flex-col"
        >
          <VisuallyHidden>
            <SheetTitle>Stylist Navigation</SheetTitle>
          </VisuallyHidden>
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link href="/stylist" className="flex items-center gap-2" onClick={close}>
              <span className="text-lg font-bold">
                NICNOA<span className="text-primary">&CO</span><span className="text-primary">.online</span>
              </span>
            </Link>
          </div>
          
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Tablet/Desktop: Fixed Sidebar - Always rendered, CSS handles visibility */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-card/95 backdrop-blur-sm flex-col transition-all duration-300 ease-in-out hidden sm:flex",
          isCollapsed ? "w-20" : "w-[280px]"
        )}
      >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/stylist" className="flex items-center gap-2">
          {!isCollapsed && (
            <div className="flex items-center">
              <span className="text-lg font-bold">
                NICNOA<span className="text-primary">&CO</span><span className="text-primary">.online</span>
              </span>
            </div>
          )}
          {isCollapsed && (
            <span className="text-xl font-bold text-primary mx-auto">N</span>
          )}
        </Link>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <div className="flex justify-center py-2 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <SidebarContent collapsed={isCollapsed} />
    </aside>
    </>
  )
}
