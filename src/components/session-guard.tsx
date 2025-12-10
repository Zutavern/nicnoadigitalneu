'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * SessionGuard prüft ob die Session vom Admin beendet wurde
 * und loggt den User automatisch aus.
 */
export function SessionGuard() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  useEffect(() => {
    // Nur prüfen wenn eingeloggt und Session-Daten vorhanden
    if (status === 'authenticated' && session?.user) {
      // Prüfe ob sessionTerminated Flag gesetzt ist
      if ((session.user as { sessionTerminated?: boolean }).sessionTerminated) {
        // Session wurde vom Admin beendet - User ausloggen
        signOut({ 
          callbackUrl: '/login?reason=session_terminated',
          redirect: true 
        })
      }
    }
  }, [session, status, pathname])

  // Render nichts - ist nur ein Guard
  return null
}




