'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  Send,
  Search,
  Plus,
  Loader2,
  Check,
  CheckCheck,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Conversation {
  id: string
  name: string
  isGroup: boolean
  participants: {
    id: string
    userId: string
    user: {
      id: string
      name: string
      image: string | null
    }
  }[]
  lastMessage?: {
    content: string
    createdAt: string
    sender: {
      name: string
    }
  }
  unreadCount: number
}

interface Message {
  id: string
  content: string
  createdAt: string
  senderId: string
  sender: {
    id: string
    name: string
    image: string | null
  }
  readBy: { id: string }[]
}

export default function SalonMessagesPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
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
    }

    if (session?.user) {
      fetchConversations()
    }
  }, [session])

  // Fetch messages when conversation is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return

      try {
        const response = await fetch(`/api/messages/conversations/${selectedConversation}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
          
          // Mark as read
          await fetch(`/api/messages/conversations/${selectedConversation}/read`, {
            method: 'POST'
          })
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()
    
    // Poll for new messages
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/messages/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [...prev, message])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const formatMessageDate = (dateString: string) => {
    const date = parseISO(dateString)
    if (isToday(date)) return format(date, 'HH:mm')
    if (isYesterday(date)) return `Gestern ${format(date, 'HH:mm')}`
    return format(date, 'dd.MM.yyyy HH:mm', { locale: de })
  }

  const getConversationName = (conv: Conversation) => {
    if (conv.isGroup) return conv.name
    const other = conv.participants.find(p => p.userId !== session?.user?.id)
    return other?.user.name || 'Unbekannt'
  }

  const filteredConversations = conversations.filter(conv =>
    getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConv = conversations.find(c => c.id === selectedConversation)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Nachrichten</h1>
          <p className="text-muted-foreground">
            Kommuniziere mit deinem Team und Stylisten
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
          <Plus className="mr-2 h-4 w-4" />
          Neue Nachricht
        </Button>
      </motion.div>

      {/* Messages Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="h-[calc(100vh-220px)] min-h-[500px]">
          <CardContent className="p-0 h-full">
            <div className="flex h-full">
              {/* Conversation List */}
              <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {filteredConversations.length > 0 ? (
                      filteredConversations.map(conv => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv.id)}
                          className={cn(
                            'w-full p-3 rounded-lg text-left transition-colors mb-1',
                            selectedConversation === conv.id
                              ? 'bg-blue-500/10 border border-blue-500/30'
                              : 'hover:bg-muted'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                                {getConversationName(conv).split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate">
                                  {getConversationName(conv)}
                                </span>
                                {conv.lastMessage && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatMessageDate(conv.lastMessage.createdAt)}
                                  </span>
                                )}
                              </div>
                              {conv.lastMessage && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {conv.lastMessage.content}
                                </p>
                              )}
                            </div>
                            {conv.unreadCount > 0 && (
                              <Badge className="bg-blue-500">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Keine Konversationen</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Message Area */}
              <div className="flex-1 flex flex-col">
                {selectedConv ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                            {getConversationName(selectedConv).split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{getConversationName(selectedConv)}</div>
                          <div className="text-xs text-muted-foreground">
                            {selectedConv.isGroup 
                              ? `${selectedConv.participants.length} Teilnehmer`
                              : 'Online'}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((message, index) => {
                          const isOwnMessage = message.senderId === session?.user?.id
                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className={cn(
                                'flex',
                                isOwnMessage ? 'justify-end' : 'justify-start'
                              )}
                            >
                              <div className={cn(
                                'max-w-[70%] rounded-2xl px-4 py-2',
                                isOwnMessage
                                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                  : 'bg-muted'
                              )}>
                                {!isOwnMessage && selectedConv.isGroup && (
                                  <div className="text-xs font-medium mb-1 opacity-70">
                                    {message.sender.name}
                                  </div>
                                )}
                                <p>{message.content}</p>
                                <div className={cn(
                                  'flex items-center gap-1 mt-1 text-xs',
                                  isOwnMessage ? 'text-white/70 justify-end' : 'text-muted-foreground'
                                )}>
                                  <span>{format(parseISO(message.createdAt), 'HH:mm')}</span>
                                  {isOwnMessage && (
                                    message.readBy.length > 1 
                                      ? <CheckCheck className="h-3 w-3" />
                                      : <Check className="h-3 w-3" />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          sendMessage()
                        }}
                        className="flex gap-2"
                      >
                        <Input
                          placeholder="Nachricht schreiben..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          type="submit"
                          disabled={!newMessage.trim() || isSending}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500"
                        >
                          {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium">Wähle eine Konversation</h3>
                      <p className="text-sm">oder starte eine neue Unterhaltung</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
