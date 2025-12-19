'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

interface NewsletterDetailPageProps {
  params: Promise<{ id: string }>
}

// Redirect to edit page
export default function NewsletterDetailPage({ params }: NewsletterDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()

  useEffect(() => {
    router.replace(`/admin/marketing/newsletter/${id}/edit`)
  }, [id, router])

  return null
}




