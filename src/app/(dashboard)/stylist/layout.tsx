import { StylistSidebar } from '@/components/dashboard/stylist-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default function StylistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <StylistSidebar />
      <div className="pl-[280px] transition-all duration-300">
        <DashboardHeader baseUrl="/stylist" accentColor="pink-500" />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
