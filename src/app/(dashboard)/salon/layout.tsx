'use client'

import { SalonSidebar } from '@/components/dashboard/salon-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { VideoCallProvider } from '@/components/providers/video-call-provider'
import { SidebarProvider, useSidebar } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils'

function SalonLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobile } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      <SalonSidebar />
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
        <DashboardHeader baseUrl="/salon" accentColor="blue-500" />
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

export default function SalonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <VideoCallProvider>
        <SalonLayoutContent>{children}</SalonLayoutContent>
      </VideoCallProvider>
    </SidebarProvider>
  )
}
