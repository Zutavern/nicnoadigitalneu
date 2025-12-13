'use client'

import { VideoCallProvider } from '@/components/providers/video-call-provider'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { SidebarProvider, useSidebar } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils'

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

function AdminLayoutContent({ children }: AdminLayoutWrapperProps) {
  const { isCollapsed, isMobile, isTablet } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div
        className={cn(
          "transition-all duration-300",
          // Mobile: no padding (sidebar is overlay)
          "pl-0",
          // Tablet (sm-lg): collapsed sidebar width
          "sm:pl-20",
          // Desktop (lg+): full or collapsed based on state
          isCollapsed ? "lg:pl-20" : "lg:pl-[280px]"
        )}
      >
        <AdminHeader />
        <main className={cn(
          "p-3 sm:p-4 md:p-6",
          "min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  return (
    <SidebarProvider>
      <VideoCallProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </VideoCallProvider>
    </SidebarProvider>
  )
}

