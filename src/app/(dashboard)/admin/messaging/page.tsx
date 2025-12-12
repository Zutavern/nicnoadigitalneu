'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { RealtimeChat } from '@/components/chat/realtime-chat'
import { Loader2 } from 'lucide-react'

function MessagingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('conversation')

  const handleSelectConversation = (id: string) => {
    router.push(`/admin/messaging?conversation=${id}`)
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <RealtimeChat
        conversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        className="h-full"
      />
    </div>
  )
}

function MessagingLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Lade Nachrichten...</p>
      </div>
    </div>
  )
}

export default function MessagingPage() {
  return (
    <Suspense fallback={<MessagingLoading />}>
      <MessagingContent />
    </Suspense>
  )
}
