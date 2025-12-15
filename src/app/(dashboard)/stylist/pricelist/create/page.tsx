'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { PricingModelWizard } from '@/components/pricelist'
import type { PricingModel } from '@prisma/client'

interface Background {
  id: string
  url: string
  filename: string
}

export default function CreatePricelistPage() {
  const router = useRouter()
  const [backgrounds, setBackgrounds] = useState<Background[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const res = await fetch('/api/pricelist/available-backgrounds')
        if (res.ok) {
          const data = await res.json()
          setBackgrounds(data.backgrounds)
        }
      } catch (error) {
        console.error('Error fetching backgrounds:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBackgrounds()
  }, [])

  const handleComplete = async (data: {
    name: string
    pricingModel: PricingModel
    theme: string
    backgroundId?: string
  }) => {
    setIsCreating(true)
    try {
      const res = await fetch('/api/pricelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error('Fehler beim Erstellen')
      }

      const { priceList } = await res.json()
      toast.success('Preisliste erstellt!')
      router.push(`/stylist/pricelist/${priceList.id}/edit`)
    } catch (error) {
      console.error('Error creating pricelist:', error)
      toast.error('Fehler beim Erstellen der Preisliste')
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    router.push('/stylist/pricelist')
  }

  if (isLoading || isCreating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {isCreating ? 'Preisliste wird erstellt...' : 'Lädt...'}
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <PricingModelWizard
        onComplete={handleComplete}
        onCancel={handleCancel}
        backgrounds={backgrounds}
      />
    </div>
  )
}


