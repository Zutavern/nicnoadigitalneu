'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Euro,
  BarChart3,
  Settings,
  MessageSquare,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  HelpCircle,
  Armchair,
  Gift,
  HandshakeIcon,
  User,
  Palette,
  FileText,
  Share2,
  Coins,
  Store,
  Globe,
  ShoppingBag,
  Printer,
  FolderOpen,
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
      { label: 'Dashboard', href: '/salon', icon: LayoutDashboard },
      { label: 'Kalender', href: '/salon/calendar', icon: Calendar },
      { label: 'Analytics', href: '/salon/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Verwaltung',
    items: [
      { label: 'Buchungen', href: '/salon/bookings', icon: Clock },
      { label: 'Stühle', href: '/salon/chairs', icon: Armchair },
      { label: 'Stuhlmieter', href: '/salon/stylists', icon: Scissors },
      { label: 'Kunden', href: '/salon/customers', icon: Users },
    ],
  },
  {
    title: 'Finanzen',
    items: [
      { label: 'Einnahmen', href: '/salon/revenue', icon: Euro },
      { label: 'Rechnungen', href: '/salon/invoices', icon: Euro },
      { label: 'Shop', href: '/salon/shop', icon: ShoppingBag },
    ],
  },
  {
    title: 'Kommunikation',
    items: [
      { label: 'Nachrichten', href: '/salon/messages', icon: MessageSquare },
      { label: 'Bewertungen', href: '/salon/reviews', icon: Star },
      { label: 'Empfehlungen', href: '/salon/referral', icon: Gift },
    ],
  },
  {
    title: 'Profil',
    items: [
      { label: 'Mein Profil', href: '/salon/profile', icon: User },
      { label: 'Salonprofil', href: '/salon/salon-profile', icon: Building2 },
      { label: 'AI Credits', href: '/salon/credits', icon: Coins },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Salon Branding', href: '/salon/marketing', icon: Palette },
      { label: 'Social Media', href: '/salon/marketing/social-media', icon: Share2 },
      { label: 'Google Business', href: '/salon/marketing/google-business', icon: Store },
      { label: 'Preislisten', href: '/salon/marketing/pricelist', icon: FileText },
      { label: 'Drucksachen', href: '/salon/marketing/print-materials', icon: Printer },
      { label: 'Salon Homepage', href: '/salon/marketing/homepage', icon: Globe },
      { label: 'Medienbibliothek', href: '/salon/media', icon: FolderOpen },
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

// Alle hrefs flach sammeln für bessere isActive-Logik
const allHrefs = menuItems.flatMap(section => section.items.map(item => item.href))

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname()

  const renderMenuItem = (item: { label: string; href: string; icon: React.ComponentType<{ className?: string }>; badge?: string }) => {
    // Verbesserte isActive-Logik: Prüft ob ein spezifischerer Pfad existiert
    const isActive = (() => {
      // Exakte Übereinstimmung
      if (pathname === item.href) return true
      
      // Prüfe ob der Pfad mit diesem href beginnt
      if (pathname.startsWith(item.href + '/')) {
        // Prüfe ob es einen spezifischeren href gibt, der auch matcht
        const hasMoreSpecificMatch = allHrefs.some(otherHref => 
          otherHref !== item.href && 
          otherHref.startsWith(item.href + '/') &&
          (pathname === otherHref || pathname.startsWith(otherHref + '/'))
        )
        // Nur aktiv wenn kein spezifischerer Match existiert
        return !hasMoreSpecificMatch
      }
      
      return false
    })()
    const hasBadge = item.badge === 'dev'
    
    if (collapsed) {
      return (
        <li key={item.href}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center rounded-lg p-3 text-sm transition-all relative",
                    isActive
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40 dark:shadow-blue-500/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {hasBadge && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {item.label} {hasBadge && '(In Entwicklung)'}
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
              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40 dark:shadow-blue-500/25"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span className="flex-1">{item.label}</span>
          {hasBadge && (
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
          )}
        </Link>
      </li>
    )
  }

  return (
    <>
      {/* Salon Badge */}
      {!collapsed && (
        <div className="mx-4 mt-4">
          <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 dark:from-blue-500/10 dark:to-cyan-500/10 border border-blue-500/30 dark:border-blue-500/20 px-3 py-2">
            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-500" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-500">Salon Dashboard</span>
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
                    href="/salon/settings"
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
                    href="/salon/help"
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
              href="/salon/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Settings className="h-5 w-5" />
              <span>Einstellungen</span>
            </Link>
            <Link
              href="/salon/help"
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

export function SalonSidebar() {
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
            <SheetTitle>Salon Navigation</SheetTitle>
          </VisuallyHidden>
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link href="/salon" className="flex items-center gap-2" onClick={close}>
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
        <Link href="/salon" className="flex items-center gap-2">
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
