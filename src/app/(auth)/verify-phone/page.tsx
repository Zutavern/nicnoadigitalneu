'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PhoneVerificationOverlay } from '@/components/phone-verification-overlay'
import { Loader2 } from 'lucide-react'

export default function VerifyPhonePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)
  
  // Wenn User bereits verifiziert ist, zum Dashboard weiterleiten
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.phoneVerified) {
      redirectToDashboard()
    }
  }, [status, session?.user?.phoneVerified])
  
  const redirectToDashboard = () => {
    const role = session?.user?.role
    if (role === 'ADMIN') {
      router.push('/admin')
    } else if (role === 'SALON_OWNER') {
      router.push('/salon')
    } else if (role === 'STYLIST') {
      router.push('/stylist')
    } else {
      router.push('/dashboard')
    }
  }
  
  const handleVerified = async () => {
    setIsVerified(true)
    // Session aktualisieren
    await update({ phoneVerified: true })
    
    // Kurz warten und dann zum Dashboard weiterleiten
    setTimeout(() => {
      redirectToDashboard()
    }, 500)
  }
  
  const handleClose = () => {
    // User möchte ohne Verifizierung fortfahren - ausloggen
    signOut({ callbackUrl: '/login' })
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Nicht eingeloggt
  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  // Bereits verifiziert
  if (session?.user?.phoneVerified || isVerified) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-white">Weiterleitung...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <PhoneVerificationOverlay
        isOpen={true}
        onClose={handleClose}
        onVerified={handleVerified}
        userId={session?.user?.id || ''}
      />
    </div>
  )
}
