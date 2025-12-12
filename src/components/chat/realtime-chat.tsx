'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import {
  Send,
  Search,
  Plus,
  User,
  Scissors,
  Building2,
  Shield,
  Check,
  CheckCheck,
  MoreVertical,
  Smile,
  Paperclip,
  Phone,
  Video,
  Info,
  Circle,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Instagram,
  Globe,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  getPusherClient,
  subscribeToPresenceChannel,
  subscribeToChannel,
  unsubscribeFromChannel,
  getConversationChannel,
  getUserChannel,
  PUSHER_EVENTS,
  type PusherConfig,
  type PresenceMember,
} from '@/lib/pusher-client'
import type { PresenceChannel, Channel } from 'pusher-js'
import { VideoCall, IncomingCallModal } from './video-call'

// ==================== TYPES ====================
interface UserBasic {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
}

interface Message {
  id: string
  content: string
  senderId: string
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
  participants: Array<{
    id: string
    name: string | null
    email?: string
    image: string | null
    role: string
  }>
  lastMessage: {
    content: string
    createdAt: string
    isRead?: boolean
  } | null
  unreadCount: number
  updatedAt: string
}

interface TypingUser {
  userId: string
  userName: string
  userImage: string | null
}

interface ContactDetails {
  id: string
  name: string | null
  email: string
  role: string
  image: string | null
  createdAt: string
  profile: {
    phone?: string | null
    city?: string | null
    bio?: string | null
    salonName?: string | null
    yearsExperience?: number | null
    specialties?: string[]
    instagramUrl?: string | null
    tiktokUrl?: string | null
    websiteUrl?: string | null
  }
}

interface IncomingCallData {
  callId: string
  roomUrl: string
  token: string
  caller: {
    id: string
    name: string | null
    email?: string
    image: string | null
  }
  conversationId?: string
}

interface ActiveCallData {
  callId: string
  roomUrl: string
  token: string
  otherParticipant: {
    id: string
    name: string | null
    image: string | null
  }
}

// ==================== CONSTANTS ====================
const roleIcons: Record<string, React.ReactNode> = {
  ADMIN: <Shield className="h-3 w-3" />,
  SALON_OWNER: <Building2 className="h-3 w-3" />,
  STYLIST: <Scissors className="h-3 w-3" />,
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SALON_OWNER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  STYLIST: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  SALON_OWNER: 'Salonbetreiber',
  STYLIST: 'Stylist',
}

// ==================== MAIN COMPONENT ====================
interface RealtimeChatProps {
  conversationId?: string | null
  onSelectConversation?: (id: string) => void
  className?: string
}

export function RealtimeChat({
  conversationId,
  onSelectConversation,
  className,
}: RealtimeChatProps) {
  const { data: session } = useSession()
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pusher State
  const [pusherConfig, setPusherConfig] = useState<PusherConfig | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<Map<string, PresenceMember['info']>>(new Map())
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  
  // Contact Info State
  const [contactSheetOpen, setContactSheetOpen] = useState(false)
  const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null)
  const [isLoadingContact, setIsLoadingContact] = useState(false)
  
  // Video Call State
  const [videoCallEnabled, setVideoCallEnabled] = useState(false)
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null)
  const [activeCall, setActiveCall] = useState<ActiveCallData | null>(null)
  const [isInitiatingCall, setIsInitiatingCall] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTypingRef = useRef<number>(0)
  const channelRef = useRef<Channel | PresenceChannel | null>(null)

  // ==================== PUSHER SETUP ====================
  
  // Fetch Pusher config and Video Call config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Fetch Pusher config
        const pusherRes = await fetch('/api/pusher/config')
        const pusherData = await pusherRes.json()
        if (pusherData.enabled) {
          setPusherConfig({
            key: pusherData.key,
            cluster: pusherData.cluster,
            enabled: true,
          })
        }
        
        // Fetch Video Call config
        const videoRes = await fetch('/api/video-call/config')
        const videoData = await videoRes.json()
        setVideoCallEnabled(videoData.enabled ?? false)
      } catch (error) {
        console.error('Failed to fetch config:', error)
      }
    }
    fetchConfig()
  }, [])

  // Subscribe to conversation channel
  useEffect(() => {
    if (!pusherConfig || !conversationId || !session?.user?.id) {
      return
    }

    const pusher = getPusherClient(pusherConfig)
    if (!pusher) return

    const channelName = getConversationChannel(conversationId)
    const channel = subscribeToPresenceChannel(pusher, channelName)
    channelRef.current = channel

    // Presence events
    channel.bind('pusher:subscription_succeeded', (members: { members: Record<string, PresenceMember['info']> }) => {
      const onlineMap = new Map<string, PresenceMember['info']>()
      Object.entries(members.members).forEach(([id, info]) => {
        onlineMap.set(id, info)
      })
      setOnlineUsers(onlineMap)
    })

    channel.bind('pusher:member_added', (member: PresenceMember) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev)
        newMap.set(member.id, member.info)
        return newMap
      })
    })

    channel.bind('pusher:member_removed', (member: PresenceMember) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev)
        newMap.delete(member.id)
        return newMap
      })
    })

    // Message events
    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (data: { message: Message }) => {
      // Only add if not from current user (we already added optimistically)
      if (data.message.senderId !== session.user.id) {
        setMessages(prev => [...prev, data.message])
        // Mark as read
        fetch(`/api/messages/conversations/${conversationId}/read`, {
          method: 'POST',
        })
      }
    })

    // Typing events
    channel.bind(PUSHER_EVENTS.USER_TYPING, (data: TypingUser) => {
      if (data.userId !== session.user.id) {
        setTypingUsers(prev => {
          if (prev.find(u => u.userId === data.userId)) return prev
          return [...prev, data]
        })
      }
    })

    channel.bind(PUSHER_EVENTS.USER_STOPPED_TYPING, (data: { userId: string }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
    })

    return () => {
      unsubscribeFromChannel(pusher, channelName)
      channelRef.current = null
    }
  }, [pusherConfig, conversationId, session?.user?.id])

  // Subscribe to user's private channel for video calls
  useEffect(() => {
    if (!pusherConfig || !session?.user?.id) return

    const pusher = getPusherClient(pusherConfig)
    if (!pusher) return

    const userChannelName = getUserChannel(session.user.id)
    const userChannel = subscribeToChannel(pusher, userChannelName)

    // Incoming call
    userChannel.bind(PUSHER_EVENTS.INCOMING_CALL, (data: IncomingCallData) => {
      setIncomingCall(data)
    })

    // Call accepted by the other person (when we initiated)
    userChannel.bind(PUSHER_EVENTS.CALL_ACCEPTED, () => {
      // Call is now active, UI is already showing
    })

    // Call rejected
    userChannel.bind(PUSHER_EVENTS.CALL_REJECTED, () => {
      setActiveCall(null)
      setIsInitiatingCall(false)
    })

    // Call ended
    userChannel.bind(PUSHER_EVENTS.CALL_ENDED, () => {
      setActiveCall(null)
      setIncomingCall(null)
    })

    return () => {
      unsubscribeFromChannel(pusher, userChannelName)
    }
  }, [pusherConfig, session?.user?.id])

  // ==================== DATA FETCHING ====================

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/conversations')
      const data = await res.json()
      setConversations(Array.isArray(data) ? data : (data.conversations || []))
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch messages
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/messages/conversations/${convId}`)
      const data = await res.json()
      setMessages(data.messages || [])
      setSelectedConversation(data.conversation)
      
      // Mark as read
      await fetch(`/api/messages/conversations/${convId}/read`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (session?.user) {
      fetchConversations()
    }
  }, [session, fetchConversations])

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
    }
  }, [conversationId, fetchMessages])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Presence heartbeat
  useEffect(() => {
    if (!session?.user?.id) return

    const heartbeat = () => {
      fetch('/api/pusher/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'heartbeat' }),
      })
    }

    heartbeat()
    const interval = setInterval(heartbeat, 30000) // Every 30 seconds

    // Set offline on unmount
    return () => {
      clearInterval(interval)
      fetch('/api/pusher/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'offline' }),
      })
    }
  }, [session?.user?.id])

  // ==================== HANDLERS ====================

  const handleSelectConversation = (conv: Conversation) => {
    setTypingUsers([])
    if (onSelectConversation) {
      onSelectConversation(conv.id)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId || isSending) return

    const content = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      senderId: session?.user?.id || '',
      createdAt: new Date().toISOString(),
      sender: {
        id: session?.user?.id || '',
        name: session?.user?.name || null,
        image: session?.user?.image || null,
      },
    }
    setMessages(prev => [...prev, optimisticMessage])

    // Stop typing indicator
    sendTypingIndicator(false)

    try {
      const res = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        const realMessage = await res.json()
        // Replace optimistic message with real one
        setMessages(prev => 
          prev.map(m => m.id === optimisticMessage.id ? realMessage : m)
        )
        fetchConversations() // Update conversation list
        inputRef.current?.focus()
      } else {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
    } finally {
      setIsSending(false)
    }
  }

  const sendTypingIndicator = useCallback(async (isTyping: boolean) => {
    if (!conversationId) return

    try {
      await fetch('/api/pusher/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, isTyping }),
      })
    } catch (error) {
      console.error('Error sending typing indicator:', error)
    }
  }, [conversationId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    // Debounced typing indicator
    const now = Date.now()
    if (now - lastTypingRef.current > 2000) {
      sendTypingIndicator(true)
      lastTypingRef.current = now
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false)
    }, 3000)
  }

  // ==================== HELPERS ====================

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find(p => p.id !== session?.user?.id)
  }

  const getConversationName = (conv: Conversation) => {
    if (conv.subject) return conv.subject
    const other = getOtherParticipant(conv)
    return other?.name || other?.email || 'Unbekannt'
  }

  const getInitials = (name: string | null, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email?.[0]?.toUpperCase() || 'U'
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return format(date, 'HH:mm')
    if (isYesterday(date)) return 'Gestern ' + format(date, 'HH:mm')
    return format(date, 'dd.MM.yyyy HH:mm')
  }

  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId)
  }

  // Load contact details
  const loadContactDetails = useCallback(async (userId: string) => {
    setIsLoadingContact(true)
    try {
      const res = await fetch(`/api/messages/users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setContactDetails(data)
        setContactSheetOpen(true)
      }
    } catch (error) {
      console.error('Error loading contact details:', error)
    } finally {
      setIsLoadingContact(false)
    }
  }, [])

  // Get phone number from contact
  const getPhoneNumber = (conv: Conversation): string | null => {
    const other = getOtherParticipant(conv)
    if (!other) return null
    // Check if we already have contact details loaded for this user
    if (contactDetails?.id === other.id && contactDetails.profile.phone) {
      return contactDetails.profile.phone
    }
    return null
  }

  // ==================== VIDEO CALL HANDLERS ====================
  
  // Initiate a video call
  const initiateVideoCall = useCallback(async (calleeId: string) => {
    if (!selectedConversation) return
    
    setIsInitiatingCall(true)
    try {
      const res = await fetch('/api/video-call/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calleeId,
          conversationId: selectedConversation.id,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Starten des Anrufs')
      }

      const data = await res.json()
      setActiveCall({
        callId: data.callId,
        roomUrl: data.roomUrl,
        token: data.token,
        otherParticipant: data.callee,
      })
    } catch (error) {
      console.error('Error initiating video call:', error)
      alert(error instanceof Error ? error.message : 'Fehler beim Starten des Anrufs')
    } finally {
      setIsInitiatingCall(false)
    }
  }, [selectedConversation])

  // Accept incoming call
  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return

    try {
      await fetch('/api/video-call/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: incomingCall.callId,
          callerId: incomingCall.caller.id,
        }),
      })

      setActiveCall({
        callId: incomingCall.callId,
        roomUrl: incomingCall.roomUrl,
        token: incomingCall.token,
        otherParticipant: {
          id: incomingCall.caller.id,
          name: incomingCall.caller.name,
          image: incomingCall.caller.image,
        },
      })
      setIncomingCall(null)
    } catch (error) {
      console.error('Error accepting call:', error)
    }
  }, [incomingCall])

  // Reject incoming call
  const rejectIncomingCall = useCallback(async () => {
    if (!incomingCall) return

    try {
      await fetch('/api/video-call/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: incomingCall.callId,
          callerId: incomingCall.caller.id,
          reason: 'declined',
        }),
      })
    } catch (error) {
      console.error('Error rejecting call:', error)
    } finally {
      setIncomingCall(null)
    }
  }, [incomingCall])

  // End active call
  const endVideoCall = useCallback(async () => {
    if (!activeCall) return

    try {
      await fetch('/api/video-call/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: activeCall.callId,
          otherParticipantId: activeCall.otherParticipant.id,
        }),
      })
    } catch (error) {
      console.error('Error ending call:', error)
    } finally {
      setActiveCall(null)
    }
  }, [activeCall])

  const filteredConversations = conversations.filter(conv => {
    const name = getConversationName(conv).toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  // ==================== RENDER ====================

  if (isLoading) {
    return (
      <div className={cn('flex h-full', className)}>
        <div className="w-80 border-r p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="animate-pulse">Lade Nachrichten...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex h-full bg-background', className)}>
      {/* ==================== CONVERSATION LIST ==================== */}
      <div className="w-80 border-r flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              className="pl-9 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation Items */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Keine Konversationen</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv)
                const isSelected = conv.id === conversationId
                const isOnline = other ? isUserOnline(other.id) : false

                return (
                  <button
                    key={conv.id}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-xl transition-all mb-1',
                      isSelected
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-background">
                        <AvatarImage src={other?.image || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
                          {getInitials(other?.name || null, other?.email)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online Indicator */}
                      <span className={cn(
                        'absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background',
                        isOnline ? 'bg-green-500' : 'bg-gray-400'
                      )} />
                      {/* Unread Badge */}
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          'font-medium truncate',
                          conv.unreadCount > 0 && 'text-foreground'
                        )}>
                          {getConversationName(conv)}
                        </p>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                              addSuffix: false,
                              locale: de,
                            })}
                          </span>
                        )}
                      </div>
                      {other && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] px-1.5 py-0 mt-0.5 border',
                            roleColors[other.role]
                          )}
                        >
                          {roleIcons[other.role]}
                          <span className="ml-1">{roleLabels[other.role]}</span>
                        </Badge>
                      )}
                      {conv.lastMessage && (
                        <p className={cn(
                          'text-sm truncate mt-1',
                          conv.unreadCount > 0 
                            ? 'text-foreground font-medium' 
                            : 'text-muted-foreground'
                        )}>
                          {conv.lastMessage.content}
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

      {/* ==================== CHAT AREA ==================== */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/30">
              {(() => {
                const other = getOtherParticipant(selectedConversation)
                const isOnline = other ? isUserOnline(other.id) : false
                const phoneNumber = contactDetails?.id === other?.id ? contactDetails.profile.phone : null
                return (
                  <>
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={other?.image || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
                          {getInitials(other?.name || null, other?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                        isOnline ? 'bg-green-500' : 'bg-gray-400'
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{getConversationName(selectedConversation)}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {isOnline ? (
                          <>
                            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                            Online
                          </>
                        ) : (
                          'Offline'
                        )}
                      </p>
                    </div>
                    <TooltipProvider>
                      <div className="flex items-center gap-1">
                        {/* Phone Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {phoneNumber ? (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-full"
                                asChild
                              >
                                <a href={`tel:${phoneNumber.replace(/\s/g, '')}`}>
                                  <Phone className="h-4 w-4" />
                                </a>
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-full"
                                onClick={() => other && loadContactDetails(other.id)}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {phoneNumber ? `Anrufen: ${phoneNumber}` : 'Kontaktinfo laden für Telefonnummer'}
                          </TooltipContent>
                        </Tooltip>

                        {/* Video Button - Only show if enabled */}
                        {videoCallEnabled && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={cn(
                                  'rounded-full',
                                  !isOnline && 'opacity-50'
                                )}
                                disabled={!isOnline || isInitiatingCall}
                                onClick={() => other && initiateVideoCall(other.id)}
                              >
                                <Video className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {!isOnline 
                                ? 'Nutzer ist offline'
                                : isInitiatingCall 
                                  ? 'Verbinde...'
                                  : 'Videoanruf starten'
                              }
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {/* More Menu with Contact Info */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => other && loadContactDetails(other.id)}
                              disabled={isLoadingContact}
                            >
                              <Info className="mr-2 h-4 w-4" />
                              {isLoadingContact ? 'Lade...' : 'Kontaktinfo'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TooltipProvider>
                  </>
                )
              })()}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3 max-w-3xl mx-auto">
                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === session?.user?.id
                    const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId)
                    const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.senderId !== message.senderId

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={cn('flex gap-2', isOwn && 'justify-end')}
                      >
                        {!isOwn && showAvatar && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.sender.image || ''} />
                            <AvatarFallback className="text-xs">
                              {getInitials(message.sender.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isOwn && !showAvatar && <div className="w-8" />}
                        <div
                          className={cn(
                            'max-w-[70%] px-4 py-2 shadow-sm',
                            isOwn
                              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                              : 'bg-muted rounded-2xl rounded-bl-md'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <div className={cn(
                            'flex items-center gap-1 mt-1',
                            isOwn ? 'justify-end' : 'justify-start'
                          )}>
                            <span className={cn(
                              'text-[10px]',
                              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            )}>
                              {formatMessageTime(message.createdAt)}
                            </span>
                            {isOwn && isLastInGroup && (
                              <CheckCheck className={cn(
                                'h-3 w-3',
                                'text-primary-foreground/70'
                              )} />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {typingUsers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={typingUsers[0].userImage || ''} />
                        <AvatarFallback className="text-xs">
                          {getInitials(typingUsers[0].userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                            className="w-2 h-2 rounded-full bg-muted-foreground/60"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                            className="w-2 h-2 rounded-full bg-muted-foreground/60"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                            className="w-2 h-2 rounded-full bg-muted-foreground/60"
                          />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {typingUsers.map(u => u.userName).join(', ')} schreibt...
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-3xl mx-auto">
                <Button type="button" variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    placeholder="Nachricht schreiben..."
                    value={newMessage}
                    onChange={handleInputChange}
                    disabled={isSending}
                    className="pr-10 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                  >
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || isSending}
                  className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Send className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wähle eine Konversation</h3>
              <p className="text-muted-foreground mb-6">
                Oder starte eine neue Unterhaltung
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Neue Nachricht
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== CONTACT INFO SHEET ==================== */}
      <Sheet open={contactSheetOpen} onOpenChange={setContactSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Kontaktinformationen</SheetTitle>
          </SheetHeader>
          {contactDetails && (
            <div className="mt-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={contactDetails.image || ''} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    {getInitials(contactDetails.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{contactDetails.name || 'Unbekannt'}</h3>
                  <Badge
                    variant="outline"
                    className={cn('mt-1', roleColors[contactDetails.role])}
                  >
                    {roleIcons[contactDetails.role]}
                    <span className="ml-1">{roleLabels[contactDetails.role]}</span>
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Contact Details */}
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">E-Mail</p>
                    <a 
                      href={`mailto:${contactDetails.email}`}
                      className="text-sm hover:underline"
                    >
                      {contactDetails.email}
                    </a>
                  </div>
                </div>

                {/* Phone */}
                {contactDetails.profile.phone && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Telefon</p>
                      <a 
                        href={`tel:${contactDetails.profile.phone.replace(/\s/g, '')}`}
                        className="text-sm hover:underline"
                      >
                        {contactDetails.profile.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* City */}
                {contactDetails.profile.city && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Stadt</p>
                      <p className="text-sm">{contactDetails.profile.city}</p>
                    </div>
                  </div>
                )}

                {/* Registration Date */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Registriert seit</p>
                    <p className="text-sm">
                      {format(new Date(contactDetails.createdAt), 'dd. MMMM yyyy', { locale: de })}
                    </p>
                  </div>
                </div>

                {/* Salon Name (for Salon Owners) */}
                {contactDetails.profile.salonName && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Salon</p>
                      <p className="text-sm">{contactDetails.profile.salonName}</p>
                    </div>
                  </div>
                )}

                {/* Years Experience (for Stylists) */}
                {contactDetails.profile.yearsExperience && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Berufserfahrung</p>
                      <p className="text-sm">{contactDetails.profile.yearsExperience} Jahre</p>
                    </div>
                  </div>
                )}

                {/* Specialties */}
                {contactDetails.profile.specialties && contactDetails.profile.specialties.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Scissors className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Spezialisierungen</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {contactDetails.profile.specialties.map((specialty, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(contactDetails.profile.instagramUrl || contactDetails.profile.websiteUrl) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground font-medium">Social Media</p>
                      <div className="flex gap-2">
                        {contactDetails.profile.instagramUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a 
                              href={contactDetails.profile.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Instagram className="h-4 w-4 mr-2" />
                              Instagram
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        )}
                        {contactDetails.profile.websiteUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a 
                              href={contactDetails.profile.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              Website
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Bio */}
                {contactDetails.profile.bio && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Über</p>
                      <p className="text-sm text-muted-foreground">
                        {contactDetails.profile.bio}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ==================== INCOMING CALL MODAL ==================== */}
      <IncomingCallModal
        caller={incomingCall?.caller || { id: '', name: null, image: null }}
        onAccept={acceptIncomingCall}
        onReject={rejectIncomingCall}
        isVisible={!!incomingCall}
      />

      {/* ==================== ACTIVE VIDEO CALL ==================== */}
      <AnimatePresence>
        {activeCall && (
          <VideoCall
            roomUrl={activeCall.roomUrl}
            token={activeCall.token}
            onCallEnd={endVideoCall}
            otherParticipant={activeCall.otherParticipant}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
