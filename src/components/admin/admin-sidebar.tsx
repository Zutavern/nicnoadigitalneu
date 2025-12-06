'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Building2,
  Scissors,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Sparkles,
  MessageSquare,
  Mail,
  Gift,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

const menuItems = [
  {
    title: 'Übersicht',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Verwaltung',
    items: [
      { label: 'Benutzer', href: '/admin/users', icon: Users },
      { label: 'Salons', href: '/admin/salons', icon: Building2 },
      { label: 'Stylisten', href: '/admin/stylists', icon: Scissors },
      { label: 'Dienstleistungen', href: '/admin/services', icon: Sparkles },
      { label: 'Onboarding-Prüfung', href: '/admin/onboarding-review', icon: FileCheck },
    ],
  },
  {
    title: 'Finanzen',
    items: [
      { label: 'Abonnements', href: '/admin/subscriptions', icon: CreditCard },
      { label: 'Umsätze', href: '/admin/revenue', icon: BarChart3 },
    ],
  },
  {
    title: 'Kommunikation',
    items: [
      { label: 'Nachrichten', href: '/admin/messaging', icon: MessageSquare },
      { label: 'E-Mail Templates', href: '/admin/email-templates', icon: Mail },
      { label: 'Benachrichtigungen', href: '/admin/notifications', icon: Bell },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Referral-Programm', href: '/admin/referrals', icon: Gift },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Einstellungen', href: '/admin/settings', icon: Settings },
      { label: 'Sicherheit', href: '/admin/security', icon: Shield },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-[280px] border-r bg-card/95 backdrop-blur-sm flex flex-col">
        {/* Placeholder during SSR */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center">
            <span className="text-lg font-bold">
              NICNOA <span className="text-primary">&</span> CO.
            </span>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card/95 backdrop-blur-sm flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-[280px]"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/admin" className="flex items-center gap-2">
          {!collapsed && (
            <div className="flex items-center">
              <span className="text-lg font-bold">
                NICNOA <span className="text-primary">&</span> CO.
              </span>
            </div>
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

      {/* Admin Badge */}
      {!collapsed && (
        <div className="mx-4 mt-4">
          <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 px-3 py-2">
            <Shield className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-500">Admin Panel</span>
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
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
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
          href="/admin/help"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
            collapsed && "justify-center"
          )}
        >
          <HelpCircle className="h-5 w-5" />
          {!collapsed && <span>Hilfe & Support</span>}
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
    </aside>
  )
}
