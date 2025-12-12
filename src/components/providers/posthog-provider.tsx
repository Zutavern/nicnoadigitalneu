'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface PostHogConfig {
  enabled: boolean
  apiKey: string
  host: string
}

// PostHog Pageview Tracker Component
function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams?.toString()) {
        url = url + '?' + searchParams.toString()
      }
      posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Fetch PostHog config from API
    const initPostHog = async () => {
      try {
        const res = await fetch('/api/platform/posthog-config')
        if (!res.ok) {
          console.log('PostHog config not available')
          return
        }
        
        const config: PostHogConfig = await res.json()
        
        if (!config.enabled || !config.apiKey) {
          console.log('PostHog is disabled or not configured')
          return
        }

        // Initialize PostHog
        posthog.init(config.apiKey, {
          api_host: config.host || 'https://eu.i.posthog.com',
          person_profiles: 'identified_only',
          capture_pageview: false, // We capture manually for better control
          capture_pageleave: true,
          autocapture: true, // Automatically capture clicks, form submissions, etc.
          persistence: 'localStorage+cookie',
          bootstrap: {
            distinctID: undefined, // Will be set when user logs in
          },
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
              // Log events in development
              posthog.debug()
            }
          },
        })

        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize PostHog:', error)
      }
    }

    initPostHog()

    return () => {
      // Cleanup on unmount
      if (isInitialized) {
        posthog.reset()
      }
    }
  }, [])

  if (!isInitialized) {
    // Return children without PostHog provider if not initialized
    return <>{children}</>
  }

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  )
}

// Export posthog instance for direct usage
export { posthog }
