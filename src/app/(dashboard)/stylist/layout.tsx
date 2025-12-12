'use client'

import { StylistSidebar } from '@/components/dashboard/stylist-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { VideoCallProvider } from '@/components/providers/video-call-provider'

export default function StylistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <VideoCallProvider>
      <div className="min-h-screen bg-background">
        <StylistSidebar />
        <div className="pl-[280px] transition-all duration-300">
          <DashboardHeader baseUrl="/stylist" accentColor="pink-500" />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </VideoCallProvider>
  )
}
