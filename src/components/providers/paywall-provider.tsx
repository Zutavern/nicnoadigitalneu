'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { PaywallModal } from '@/components/paywall/paywall-modal'

interface PaywallContextType {
  openPaywall: (options?: { trigger?: string }) => void
  closePaywall: () => void
  isOpen: boolean
}

const PaywallContext = createContext<PaywallContextType | null>(null)

interface PaywallProviderProps {
  children: ReactNode
  userType: 'STYLIST' | 'SALON_OWNER'
}

export function PaywallProvider({ children, userType }: PaywallProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [trigger, setTrigger] = useState<string | undefined>()

  const openPaywall = (options?: { trigger?: string }) => {
    setTrigger(options?.trigger)
    setIsOpen(true)
  }

  const closePaywall = () => {
    setIsOpen(false)
    setTrigger(undefined)
  }

  return (
    <PaywallContext.Provider value={{ openPaywall, closePaywall, isOpen }}>
      {children}
      <PaywallModal 
        isOpen={isOpen} 
        onClose={closePaywall}
        userType={userType}
        trigger={trigger}
      />
    </PaywallContext.Provider>
  )
}

export function usePaywall() {
  const context = useContext(PaywallContext)
  if (!context) {
    throw new Error('usePaywall must be used within a PaywallProvider')
  }
  return context
}

