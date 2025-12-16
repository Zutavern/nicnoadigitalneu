'use client'

import { useState, useEffect } from 'react'
import { UsageDashboard } from '@/components/usage/usage-dashboard'
import { OnboardingModal } from '@/components/usage/onboarding-modal'

export default function StylistCreditsPage() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true)

  useEffect(() => {
    // Check if user has seen the onboarding
    const seen = localStorage.getItem('metered-billing-onboarding')
    if (!seen) {
      setHasSeenOnboarding(false)
      // Auto-show on first visit
      const timer = setTimeout(() => setShowOnboarding(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <UsageDashboard 
        showOnboarding={!hasSeenOnboarding}
        onOpenOnboarding={() => setShowOnboarding(true)}
      />
      
      <OnboardingModal
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={() => setHasSeenOnboarding(true)}
      />
    </div>
  )
}
