import { ForceDarkMode } from '@/components/providers/force-dark-mode'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <ForceDarkMode />
      {children}
    </div>
  )
}
