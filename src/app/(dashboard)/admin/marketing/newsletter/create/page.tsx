'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NewsletterEditor } from '@/components/newsletter'

export default function CreateNewsletterPage() {
  const router = useRouter()
  const [newsletterId, setNewsletterId] = useState<string | null>(null)

  const handleSave = async () => {
    // Die NewsletterEditor Komponente erstellt automatisch einen neuen Newsletter
    // beim ersten Speichern
  }

  const handleBack = () => {
    router.push('/admin/marketing/newsletter')
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <NewsletterEditor
        newsletterId={newsletterId || undefined}
        initialData={{
          name: '',
          subject: '',
          segment: 'ALL'
        }}
        onSave={handleSave}
        onBack={handleBack}
      />
    </div>
  )
}

