'use client'

import { useState, useEffect } from 'react'

interface DemoStatus {
  showDemo: boolean
  reason: 'not_premium' | 'not_connected' | 'connected'
  isPremium: boolean
  isConnected: boolean
}

export function useGoogleBusinessStatus() {
  const [status, setStatus] = useState<DemoStatus>({
    showDemo: true,
    reason: 'not_premium',
    isPremium: false,
    isConnected: false
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/google-business/demo-status')
        if (response.ok) {
          const data = await response.json()
          setStatus(data)
        }
      } catch (error) {
        console.error('Error fetching Google Business status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()
  }, [])

  return { ...status, isLoading }
}

