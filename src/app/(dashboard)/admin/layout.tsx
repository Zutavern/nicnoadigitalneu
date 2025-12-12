import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminLayoutWrapper } from '@/components/admin/admin-layout-wrapper'

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

  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
}

