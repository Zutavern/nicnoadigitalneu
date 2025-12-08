import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { SessionProvider } from '@/components/providers/session-provider'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="pl-[280px]">
          <AdminHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}

