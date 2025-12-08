'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  User,
  Scissors,
  Building2,
  Shield,
  Loader2,
  Check,
  CheckCheck,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { de } from 'date-fns/locale'

interface UserBasic {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
}

interface Participant {
  id: string
  userId: string
  role: string
  lastReadAt: string | null
  user: UserBasic
}

interface Message {
  id: string
  content: string
  senderId: string
  isSystemMessage: boolean
  createdAt: string
  sender: {
    id: string
    name: string | null
    image: string | null
  }
}

interface Conversation {
  id: string
  type: string
  subject: string | null
  createdAt: string
  updatedAt: string
  participants: Participant[]
  lastMessage: Message | null
  unreadCount: number
}

const roleIcons: Record<string, React.ReactNode> = {
  ADMIN: <Shield className="h-3 w-3" />,
  SALON_OWNER: <Building2 className="h-3 w-3" />,
  STYLIST: <Scissors className="h-3 w-3" />,
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  SALON_OWNER: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  STYLIST: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  SALON_OWNER: 'Salonbetreiber',
  STYLIST: 'Stylist',
}

function MessagingContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedConversationId = searchParams.get('conversation')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<UserBasic[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/conversations')
      if (response.ok) {
        const data = await response.json()
        // Unterstützt sowohl { conversations: [...] } als auch direkt [...]
        setConversations(Array.isArray(data) ? data : (data.conversations || []))
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        setSelectedConversation(data.conversation)

        // Mark as read
        await fetch(`/api/messages/conversations/${conversationId}/read`, {
          method: 'POST',
        })
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }, [])

  // Fetch available users for new conversation
  const fetchAvailableUsers = useCallback(async (query: string) => {
    try {
      const response = await fetch(`/api/messages/users?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 10000) // Polling alle 10 Sekunden
    return () => clearInterval(interval)
  }, [fetchConversations])

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId)
      setIsMobileConversationOpen(true)
    }
  }, [selectedConversationId, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (showNewDialog) {
      fetchAvailableUsers(userSearchQuery)
    }
  }, [showNewDialog, userSearchQuery, fetchAvailableUsers])

  const handleSelectConversation = (conversation: Conversation) => {
    router.push(`/admin/messaging?conversation=${conversation.id}`)
    setIsMobileConversationOpen(true)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversationId || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(
        `/api/messages/conversations/${selectedConversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newMessage.trim() }),
        }
      )

      if (response.ok) {
        const message = await response.json()
        setMessages((prev) => [...prev, message])
        setNewMessage('')
        fetchConversations() // Refresh conversation list
        inputRef.current?.focus()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleStartNewConversation = async (user: UserBasic) => {
    try {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIds: [user.id],
          type: 'DIRECT',
        }),
      })

      if (response.ok) {
        const conversation = await response.json()
        setShowNewDialog(false)
        router.push(`/admin/messaging?conversation=${conversation.id}`)
        fetchConversations()
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.userId !== session?.user?.id)?.user
  }

  const getConversationName = (conversation: Conversation) => {
    if (conversation.subject) return conversation.subject
    const other = getOtherParticipant(conversation)
    return other?.name || other?.email || 'Unbekannt'
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return format(date, 'HH:mm')
    if (isYesterday(date)) return 'Gestern ' + format(date, 'HH:mm')
    return format(date, 'dd.MM.yyyy HH:mm')
  }

  const filteredConversations = conversations.filter((conv) => {
    const name = getConversationName(conv).toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  const getInitials = (name: string | null, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email?.[0]?.toUpperCase() || 'U'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Nachrichten
          </h1>
          <p className="text-sm text-muted-foreground">
            Kommuniziere mit Stylisten und Salonbetreibern
          </p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neue Nachricht
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Neue Konversation</DialogTitle>
              <DialogDescription>
                Wähle einen Benutzer aus, um eine Konversation zu starten.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name oder E-Mail suchen..."
                  className="pl-9"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      onClick={() => handleStartNewConversation(user)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || ''} />
                        <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name || user.email}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn('flex items-center gap-1', roleColors[user.role])}
                      >
                        {roleIcons[user.role]}
                        {roleLabels[user.role]}
                      </Badge>
                    </button>
                  ))}
                  {availableUsers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>Keine Benutzer gefunden</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div
          className={cn(
            'w-full md:w-80 lg:w-96 border-r flex flex-col',
            isMobileConversationOpen && 'hidden md:flex'
          )}
        >
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Konversationen durchsuchen..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Keine Konversationen</p>
                  <p className="text-sm">Starte eine neue Konversation</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const otherUser = getOtherParticipant(conversation)
                  const isSelected = conversation.id === selectedConversationId

                  return (
                    <button
                      key={conversation.id}
                      className={cn(
                        'w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left mb-1',
                        isSelected
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted'
                      )}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={otherUser?.image || ''} />
                          <AvatarFallback>
                            {getInitials(otherUser?.name || null, otherUser?.email)}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">
                            {getConversationName(conversation)}
                          </p>
                          {conversation.lastMessage && (
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                                addSuffix: false,
                                locale: de,
                              })}
                            </span>
                          )}
                        </div>
                        {otherUser && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] px-1.5 py-0 mt-1',
                              roleColors[otherUser.role]
                            )}
                          >
                            {roleLabels[otherUser.role]}
                          </Badge>
                        )}
                        {conversation.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conversation.lastMessage.senderId === session?.user?.id && (
                              <span className="text-primary">Du: </span>
                            )}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            'flex-1 flex flex-col',
            !isMobileConversationOpen && 'hidden md:flex'
          )}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => {
                    setIsMobileConversationOpen(false)
                    router.push('/admin/messaging')
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getOtherParticipant(selectedConversation)?.image || ''} />
                  <AvatarFallback>
                    {getInitials(
                      getOtherParticipant(selectedConversation)?.name || null,
                      getOtherParticipant(selectedConversation)?.email
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{getConversationName(selectedConversation)}</p>
                  <p className="text-xs text-muted-foreground">
                    {getOtherParticipant(selectedConversation)?.email}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto">
                  <AnimatePresence>
                    {messages.map((message, index) => {
                      const isOwn = message.senderId === session?.user?.id
                      const showAvatar =
                        !isOwn &&
                        (index === 0 || messages[index - 1]?.senderId !== message.senderId)

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={cn('flex gap-2', isOwn && 'justify-end')}
                        >
                          {!isOwn && showAvatar && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.sender.image || ''} />
                              <AvatarFallback>
                                {getInitials(message.sender.name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {!isOwn && !showAvatar && <div className="w-8" />}
                          <div
                            className={cn(
                              'max-w-[70%] rounded-2xl px-4 py-2',
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted rounded-bl-md'
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <div
                              className={cn(
                                'flex items-center gap-1 mt-1',
                                isOwn ? 'justify-end' : 'justify-start'
                              )}
                            >
                              <span
                                className={cn(
                                  'text-[10px]',
                                  isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                )}
                              >
                                {formatMessageTime(message.createdAt)}
                              </span>
                              {isOwn && (
                                <CheckCheck
                                  className={cn(
                                    'h-3 w-3',
                                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                  )}
                                />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
                <div className="flex gap-2 max-w-3xl mx-auto">
                  <Input
                    ref={inputRef}
                    placeholder="Nachricht schreiben..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim() || isSending}>
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Wähle eine Konversation</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Oder starte eine neue Unterhaltung
                </p>
                <Button onClick={() => setShowNewDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Nachricht
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MessagingLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

