'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Crown,
  ArrowRight,
  Star,
  TrendingUp,
  MessageSquare,
  Camera,
} from 'lucide-react'

interface PremiumModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature?: string
}

const premiumFeatures = [
  {
    icon: Star,
    title: 'Google Business',
    description: 'Verbinde dein Profil',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Analytics',
    description: 'Performance-Insights',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: MessageSquare,
    title: 'KI-Antworten',
    description: 'Smart Suggestions',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Camera,
    title: 'Medien',
    description: 'Fotos & Posts',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
]

export function PremiumModal({ open, onOpenChange, feature }: PremiumModalProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    onOpenChange(false)
    router.push('/upgrade')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl">Premium-Feature</DialogTitle>
          <DialogDescription>
            {feature ? (
              <span className="font-medium text-foreground">{feature}</span>
            ) : (
              'Dieses Feature'
            )}{' '}
            ist Teil unseres Premium-Pakets. Upgrade jetzt und erhalte vollen Zugang.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 my-6">
          {premiumFeatures.map((item, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${item.bg} border border-transparent`}
            >
              <item.icon className={`h-5 w-5 ${item.color} mb-2`} />
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Crown className="h-4 w-4 mr-2" />
            Premium werden
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Später
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-2">
          Ab €29/Monat • 14 Tage Geld-zurück-Garantie
        </p>
      </DialogContent>
    </Dialog>
  )
}

// Context-based hook for app-wide usage
interface PremiumModalContextType {
  isOpen: boolean
  feature: string | undefined
  openModal: (feature?: string) => void
  closeModal: () => void
}

const PremiumModalContext = createContext<PremiumModalContextType | undefined>(undefined)

export function usePremiumModal() {
  const context = useContext(PremiumModalContext)
  if (!context) {
    throw new Error('usePremiumModal must be used within a PremiumModalProvider')
  }
  return context
}

interface PremiumModalProviderProps {
  children: ReactNode
}

export function PremiumModalProvider({ children }: PremiumModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feature, setFeature] = useState<string | undefined>(undefined)

  const openModal = (featureName?: string) => {
    setFeature(featureName)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setFeature(undefined)
  }

  return (
    <PremiumModalContext.Provider value={{ isOpen, feature, openModal, closeModal }}>
      {children}
      <PremiumModal 
        open={isOpen} 
        onOpenChange={(open) => !open && closeModal()} 
        feature={feature} 
      />
    </PremiumModalContext.Provider>
  )
}
