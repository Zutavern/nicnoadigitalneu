'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'

// ==================== TYPES ====================

interface SidebarContextType {
  // State
  isOpen: boolean
  isCollapsed: boolean
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  
  // Actions
  toggle: () => void
  open: () => void
  close: () => void
  setCollapsed: (collapsed: boolean) => void
}

interface SidebarProviderProps {
  children: ReactNode
  defaultCollapsed?: boolean
}

// ==================== CONSTANTS ====================

const MOBILE_BREAKPOINT = 640   // sm
const TABLET_BREAKPOINT = 1024  // lg
const STORAGE_KEY = 'sidebar-collapsed'

// ==================== CONTEXT ====================

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

// ==================== PROVIDER ====================

export function SidebarProvider({ 
  children, 
  defaultCollapsed = false 
}: SidebarProviderProps) {
  const pathname = usePathname()
  
  // Viewport states
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  
  // Sidebar states
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [mounted, setMounted] = useState(false)

  // Initialize and handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const mobile = width < MOBILE_BREAKPOINT
      const tablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT
      const desktop = width >= TABLET_BREAKPOINT
      
      setIsMobile(mobile)
      setIsTablet(tablet)
      setIsDesktop(desktop)
      
      // Auto-close sidebar when switching to mobile
      if (mobile && isOpen) {
        setIsOpen(false)
      }
      
      // Auto-collapse on tablet
      if (tablet && !isCollapsed) {
        setIsCollapsed(true)
      }
      
      // Restore collapsed state on desktop
      if (desktop && mounted) {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved !== null) {
          setIsCollapsed(saved === 'true')
        }
      }
    }

    // Initial check
    handleResize()
    setMounted(true)

    // Load saved collapsed state for desktop
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null && window.innerWidth >= TABLET_BREAKPOINT) {
      setIsCollapsed(saved === 'true')
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-close mobile sidebar on navigation
  useEffect(() => {
    if (isMobile && isOpen) {
      setIsOpen(false)
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Actions
  const toggle = useCallback(() => {
    if (isMobile) {
      setIsOpen(prev => !prev)
    } else {
      setIsCollapsed(prev => {
        const newValue = !prev
        localStorage.setItem(STORAGE_KEY, String(newValue))
        return newValue
      })
    }
  }, [isMobile])

  const open = useCallback(() => {
    if (isMobile) {
      setIsOpen(true)
    } else {
      setIsCollapsed(false)
      localStorage.setItem(STORAGE_KEY, 'false')
    }
  }, [isMobile])

  const close = useCallback(() => {
    if (isMobile) {
      setIsOpen(false)
    } else {
      setIsCollapsed(true)
      localStorage.setItem(STORAGE_KEY, 'true')
    }
  }, [isMobile])

  const handleSetCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed)
    if (isDesktop) {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    }
  }, [isDesktop])

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        isMobile,
        isTablet,
        isDesktop,
        toggle,
        open,
        close,
        setCollapsed: handleSetCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

// ==================== HOOK ====================

export function useSidebar() {
  const context = useContext(SidebarContext)
  
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  
  return context
}

// ==================== UTILITIES ====================

/**
 * Returns the appropriate sidebar width class based on current state
 */
export function getSidebarWidth(isCollapsed: boolean, isMobile: boolean): string {
  if (isMobile) return 'w-[280px]'
  return isCollapsed ? 'w-20' : 'w-[280px]'
}

/**
 * Returns the appropriate content padding class based on sidebar state
 */
export function getContentPadding(isCollapsed: boolean, isMobile: boolean): string {
  if (isMobile) return 'pl-0'
  return isCollapsed ? 'pl-20' : 'pl-[280px]'
}

