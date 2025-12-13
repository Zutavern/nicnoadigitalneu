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
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Sparkles,
  MessageSquare,
  Mail,
  Gift,
  AlertTriangle,
  HandshakeIcon,
  Quote,
  Globe,
  FileText,
  ChevronDown,
  Newspaper,
  PenSquare,
  FolderOpen,
  UserCircle,
  Tags,
  Home,
  Briefcase,
  UserPlus,
  Package,
  MapIcon,
  Rocket,
  RefreshCw,
  Scale,
  Languages,
  Search,
  LogIn,
  DollarSign,
  ClipboardCheck,
  Wallet,
  X,
  Database,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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

// Type definitions for menu items
interface MenuItem {
  label: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: MenuItem[]
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const menuItems: MenuSection[] = [
  {
    title: 'Übersicht',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Finanzen',
    items: [
      {
        label: 'Finanzen',
        icon: Wallet,
        children: [
          { label: 'Abonnements', href: '/admin/subscriptions', icon: CreditCard },
          { label: 'Umsätze', href: '/admin/revenue', icon: DollarSign },
        ],
      },
    ],
  },
  {
    title: 'Nutzerverwaltung',
    items: [
      {
        label: 'Nutzerverwaltung',
        icon: Users,
        children: [
          { label: 'Benutzer', href: '/admin/users', icon: Users },
          { label: 'Salons', href: '/admin/salons', icon: Building2 },
          { label: 'Stylisten', href: '/admin/stylists', icon: Scissors },
        ],
      },
    ],
  },
  {
    title: 'Onboarding',
    items: [
      {
        label: 'Onboarding',
        icon: ClipboardCheck,
        children: [
          { label: 'Dienstleistungen', href: '/admin/services', icon: Sparkles },
          { label: 'Onboarding-Prüfung', href: '/admin/onboarding-review', icon: FileCheck },
          { label: 'Texte & Info-Bubbles', href: '/admin/onboarding-cms', icon: PenSquare },
        ],
      },
    ],
  },
  {
    title: 'Kommunikation',
    items: [
      { label: 'Nachrichten', href: '/admin/messaging', icon: MessageSquare },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Referral-Programm', href: '/admin/referrals', icon: Gift },
    ],
  },
  {
    title: 'Public Pages',
    items: [
      {
        label: 'CMS',
        icon: FileText,
        children: [
          {
            label: 'Seiten',
            icon: Globe,
            children: [
              { label: 'Homepage', href: '/admin/homepage', icon: Home },
              { label: 'Login & Registrierung', href: '/admin/login', icon: LogIn },
              { label: 'Produkt', href: '/admin/product', icon: Package },
              { label: 'FAQ', href: '/admin/faqs', icon: HelpCircle },
              { label: 'Testimonials', href: '/admin/testimonials', icon: Quote },
              { label: 'Partner & Vorteile', href: '/admin/partners', icon: HandshakeIcon },
              { label: 'Über uns', href: '/admin/about-us', icon: Users },
              { label: 'Karriere', href: '/admin/career', icon: Briefcase },
              { label: 'Presse', href: '/admin/press', icon: Newspaper },
              { label: 'Roadmap', href: '/admin/roadmap', icon: MapIcon },
              { label: 'Beta-Programm', href: '/admin/beta', icon: Rocket },
              { label: 'Updates', href: '/admin/updates', icon: RefreshCw },
            ],
          },
          {
            label: 'Blog',
            icon: Newspaper,
            children: [
              { label: 'Alle Beiträge', href: '/admin/blog/posts', icon: PenSquare },
              { label: 'Kategorien', href: '/admin/blog/categories', icon: FolderOpen },
              { label: 'Autoren', href: '/admin/blog/authors', icon: UserCircle },
              { label: 'Tags', href: '/admin/blog/tags', icon: Tags },
            ],
          },
          {
            label: 'Rechtliches',
            icon: Scale,
            children: [
              { label: 'Übersicht', href: '/admin/legal', icon: Scale },
              { label: 'Impressum', href: '/admin/legal/impressum', icon: FileText },
              { label: 'Datenschutz', href: '/admin/legal/datenschutz', icon: Shield },
              { label: 'AGB', href: '/admin/legal/agb', icon: Scale },
            ],
          },
          {
            label: 'Internationalisierung',
            icon: Languages,
            children: [
              { label: 'Sprachen', href: '/admin/languages', icon: Languages },
              { label: 'Übersetzungen', href: '/admin/translations', icon: Globe },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'HR',
    items: [
      { label: 'Bewerber', href: '/admin/hr', icon: UserPlus },
    ],
  },
  {
    title: 'Einstellungen',
    items: [
      {
        label: 'Einstellungen',
        icon: Settings,
        children: [
          { label: 'Systemeinstellungen', href: '/admin/settings', icon: Settings },
          { label: 'Backups', href: '/admin/backup', icon: Database },
          { label: 'Sicherheit', href: '/admin/security', icon: Shield },
          { label: 'SEO', href: '/admin/seo', icon: Search },
          { label: 'Fehlermeldungen', href: '/admin/error-messages', icon: AlertTriangle },
          { label: 'E-Mail Templates', href: '/admin/email-templates', icon: Mail },
        ],
      },
    ],
  },
]

// ==================== SIDEBAR CONTENT ====================

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  // Auto-open sections based on current path
  useEffect(() => {
    if (!pathname) return
    
    const newOpenSections: Record<string, boolean> = {}
    
    menuItems.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const shouldOpen = item.children.some((child) => {
            if (child.href && pathname.startsWith(child.href)) return true
            if (child.children) {
              return child.children.some((grandchild) => 
                grandchild.href && pathname.startsWith(grandchild.href)
              )
            }
            return false
          })
          if (shouldOpen) {
            newOpenSections[item.label.toLowerCase()] = true
          }
          
          item.children.forEach((child) => {
            if (child.children) {
              const shouldOpenChild = child.children.some((grandchild) =>
                grandchild.href && pathname.startsWith(grandchild.href)
              )
              if (shouldOpenChild) {
                newOpenSections[child.label.toLowerCase()] = true
              }
            }
          })
        }
      })
    })
    
    setOpenSections((prev) => ({ ...prev, ...newOpenSections }))
  }, [pathname])

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [label.toLowerCase()]: !prev[label.toLowerCase()],
    }))
  }

  const renderMenuChildren = (
    children: MenuItem[],
    sectionIndex: number,
    depth: number
  ): React.ReactNode => {
    return (
      <ul className="space-y-1">
        {children.map((child, childIndex) =>
          renderMenuItem(child, sectionIndex, childIndex, depth)
        )}
      </ul>
    )
  }

  const renderMenuItem = (
    item: MenuItem,
    sectionIndex: number,
    itemIndex: number,
    depth: number = 0
  ): React.ReactNode => {
    const key = `${sectionIndex}-${itemIndex}-${depth}-${item.label}`
    
    // Item with children (collapsible) - only show if not collapsed
    if (item.children && !collapsed) {
      const isOpen = openSections[item.label.toLowerCase()] || false
      
      return (
        <li key={key}>
          <Collapsible open={isOpen} onOpenChange={() => toggleSection(item.label)}>
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all text-muted-foreground hover:bg-muted hover:text-foreground",
                depth > 0 && "py-2"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", depth > 0 && "h-4 w-4")} />
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 pl-4">
              {renderMenuChildren(item.children, sectionIndex, depth + 1)}
            </CollapsibleContent>
          </Collapsible>
        </li>
      )
    }

    // Collapsed mode with tooltip
    if (collapsed && item.href) {
      const isActive = pathname === item.href
      
      return (
        <li key={key}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center rounded-lg p-3 text-sm transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
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

    // Regular item (link)
    const isActive = item.href && pathname === item.href
    
    return (
      <li key={key}>
        <Link
          href={item.href || '#'}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 text-sm transition-all",
            depth === 0 ? "py-2.5" : "py-2",
            isActive
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className={cn("flex-shrink-0", depth === 0 ? "h-5 w-5" : "h-4 w-4")} />
          {!collapsed && <span>{item.label}</span>}
        </Link>
      </li>
    )
  }

  return (
    <>
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
              {section.items.map((item, itemIndex) =>
                renderMenuItem(item, sectionIndex, itemIndex)
              )}
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
                    href="/admin/help"
                    className="flex items-center justify-center rounded-lg p-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Hilfe & Support</TooltipContent>
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
              href="/admin/help"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Hilfe & Support</span>
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

export function AdminSidebar() {
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
            <SheetTitle>Admin Navigation</SheetTitle>
          </VisuallyHidden>
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link href="/admin" className="flex items-center gap-2" onClick={close}>
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
        <Link href="/admin" className="flex items-center gap-2">
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
