'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

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
      { label: 'Stylisten', href: '/salon/stylists', icon: Scissors },
      { label: 'Kunden', href: '/salon/customers', icon: Users },
    ],
  },
  {
    title: 'Finanzen',
    items: [
      { label: 'Einnahmen', href: '/salon/revenue', icon: Euro },
      { label: 'Rechnungen', href: '/salon/invoices', icon: Euro },
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
    title: 'Extras',
    items: [
      { label: 'Partner & Vorteile', href: '/dashboard/partners', icon: HandshakeIcon },
    ],
  },
]

export function SalonSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card/95 backdrop-blur-sm flex flex-col",
        "w-[280px]"
      )} />
    )
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card/95 backdrop-blur-sm flex flex-col"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/salon" className="flex items-center gap-2">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              <span className="text-lg font-bold">
                NICNOA <span className="text-primary">&</span> CO.
              </span>
            </motion.div>
          )}
          {collapsed && (
            <span className="text-xl font-bold text-primary">N</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Salon Badge */}
      {!collapsed && (
        <div className="mx-4 mt-4">
          <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 px-3 py-2">
            <Building2 className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-500">Salon Dashboard</span>
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
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                        isActive
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", collapsed && "mx-auto")} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <Link
          href="/salon/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
            collapsed && "justify-center"
          )}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>Einstellungen</span>}
        </Link>
        <Link
          href="/salon/help"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
            collapsed && "justify-center"
          )}
        >
          <HelpCircle className="h-5 w-5" />
          {!collapsed && <span>Hilfe</span>}
        </Link>
        <button
          onClick={() => {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
            signOut({ callbackUrl: `${baseUrl}/` })
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-all",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Abmelden</span>}
        </button>
      </div>
    </motion.aside>
  )
}

