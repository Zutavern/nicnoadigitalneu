'use client'

import { VideoCallProvider } from '@/components/providers/video-call-provider'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  return (
    <VideoCallProvider>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="pl-[280px]">
          <AdminHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </VideoCallProvider>
  )
}
