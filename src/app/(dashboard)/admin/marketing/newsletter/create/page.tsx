'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NewsletterEditor } from '@/components/newsletter-builder'
import { toast } from 'sonner'
import type { NewsletterBlock } from '@/lib/newsletter-builder/types'

export default function CreateNewsletterPage() {
  const router = useRouter()
  const [newsletterId, setNewsletterId] = useState<string | undefined>()

  const handleSave = async (data: {
    name: string
    subject: string
    contentBlocks: NewsletterBlock[]
  }) => {
    try {
      if (newsletterId) {
        // Update existing newsletter
        const response = await fetch(`/api/admin/newsletter/${newsletterId}`, {
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
      } else {
        // Create new newsletter
        const response = await fetch('/api/admin/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            subject: data.subject,
            contentBlocks: data.contentBlocks,
            segment: 'ALL',
          }),
        })

        if (!response.ok) {
          throw new Error('Erstellen fehlgeschlagen')
        }

        const result = await response.json()
        if (result.newsletter?.id) {
          setNewsletterId(result.newsletter.id)
          // Redirect to edit page after creation
          router.replace(`/admin/marketing/newsletter/${result.newsletter.id}/edit`)
        }
      }
    } catch (error) {
      console.error('Save error:', error)
      throw error
    }
  }

  const handleBack = () => {
    router.push('/admin/marketing/newsletter')
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <NewsletterEditor
        newsletterId={newsletterId}
        initialData={{
          name: '',
          subject: '',
          contentBlocks: [],
        }}
        onSave={handleSave}
        onBack={handleBack}
      />
    </div>
  )
}
