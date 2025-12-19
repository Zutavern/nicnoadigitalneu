'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { NewsletterEditor } from '@/components/newsletter-builder'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { NewsletterBlock } from '@/lib/newsletter-builder/types'

interface EditNewsletterPageProps {
  params: Promise<{ id: string }>
}

export default function EditNewsletterPage({ params }: EditNewsletterPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [newsletter, setNewsletter] = useState<{
    name: string
    subject: string
    contentBlocks: NewsletterBlock[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNewsletter = async () => {
      try {
        const response = await fetch(`/api/admin/newsletter/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Newsletter nicht gefunden')
          }
          throw new Error('Laden fehlgeschlagen')
        }
        
        const data = await response.json()
        
        // Migration: Falls alte designJson vorhanden, verwende leere Blocks
        // (alte Unlayer-Designs sind nicht kompatibel)
        const contentBlocks = data.newsletter.contentBlocks || []
        
        setNewsletter({
          name: data.newsletter.name,
          subject: data.newsletter.subject,
          contentBlocks: contentBlocks,
        })
      } catch (error) {
        console.error('Fetch error:', error)
        setError(error instanceof Error ? error.message : 'Fehler beim Laden')
        toast.error('Fehler beim Laden des Newsletters')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNewsletter()
  }, [id])

  const handleSave = async (data: {
    name: string
    subject: string
    contentBlocks: NewsletterBlock[]
  }) => {
    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          subject: data.subject,
          contentBlocks: data.contentBlocks,
        }),
      })

      if (!response.ok) {
        throw new Error('Update fehlgeschlagen')
      }
    } catch (error) {
      console.error('Save error:', error)
      throw error
    }
  }

  const handleBack = () => {
    router.push('/admin/marketing/newsletter')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Newsletter wird geladen...</p>
        </div>
      </div>
    )
  }

  if (error || !newsletter) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Newsletter nicht gefunden'}</p>
          <button 
            onClick={handleBack}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <NewsletterEditor
        newsletterId={id}
        initialData={newsletter}
        onSave={handleSave}
        onBack={handleBack}
      />
    </div>
  )
}
