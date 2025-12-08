'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

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
    ],
  },
]

export function StylistSidebar() {
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
        <Link href="/stylist" className="flex items-center gap-2">
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

      {/* Stylist Badge */}
      {!collapsed && (
        <div className="mx-4 mt-4">
          <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 px-3 py-2">
            <Scissors className="h-4 w-4 text-pink-500" />
            <span className="text-sm font-medium text-pink-500">Stylist Dashboard</span>
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
                          ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25"
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
          href="/stylist/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
            collapsed && "justify-center"
          )}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>Einstellungen</span>}
        </Link>
        <Link
          href="/stylist/help"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
            collapsed && "justify-center"
          )}
        >
          <HelpCircle className="h-5 w-5" />
          {!collapsed && <span>Hilfe</span>}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
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

