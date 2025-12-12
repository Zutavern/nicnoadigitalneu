'use client'

import { SalonSidebar } from '@/components/dashboard/salon-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { VideoCallProvider } from '@/components/providers/video-call-provider'

export default function SalonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <VideoCallProvider>
      <div className="min-h-screen bg-background">
        <SalonSidebar />
        <div className="pl-[280px] transition-all duration-300">
          <DashboardHeader baseUrl="/salon" accentColor="blue-500" />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </VideoCallProvider>
  )
}
