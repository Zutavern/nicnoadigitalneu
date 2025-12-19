'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

/**
 * ForceDarkMode - Setzt das Theme auf "dark" für Public Pages
 * 
 * Dieses Component wird auf allen öffentlichen Seiten verwendet,
 * um sicherzustellen, dass diese immer im Dark Mode angezeigt werden,
 * unabhängig von der Theme-Einstellung des Benutzers im Dashboard.
 */
export function ForceDarkMode() {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme('dark')
  }, [setTheme])

  return null
}

