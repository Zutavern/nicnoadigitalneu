'use client'

import { useSession } from 'next-auth/react'
import { StylistSidebar } from '@/components/dashboard/stylist-sidebar'
import { SalonSidebar } from '@/components/dashboard/salon-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { UserRole } from '@prisma/client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const role = session?.user?.role

  // Determine which sidebar to show based on role
  const getSidebar = () => {
    if (role === UserRole.SALON_OWNER) {
      return <SalonSidebar />
    } else if (role === UserRole.STYLIST) {
      return <StylistSidebar />
    }
    // Default to stylist sidebar if role is not determined
    return <StylistSidebar />
  }

  const getBaseUrl = () => {
    if (role === UserRole.SALON_OWNER) {
      return '/salon'
    } else if (role === UserRole.STYLIST) {
      return '/stylist'
    }
    return '/dashboard'
  }

  const getAccentColor = () => {
    if (role === UserRole.SALON_OWNER) {
      return 'blue-500'
    } else if (role === UserRole.STYLIST) {
      return 'pink-500'
    }
    return 'primary'
  }

  // Show sidebar even while loading
  return (
    <div className="min-h-screen bg-background">
      {getSidebar()}
      <div className="pl-[280px] transition-all duration-300">
        <DashboardHeader baseUrl={getBaseUrl()} accentColor={getAccentColor()} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

