'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  X,
  Loader2,
  Maximize2,
  Minimize2,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getPusherClient,
  subscribeToChannel,
  unsubscribeFromChannel,
  getUserChannel,
  PUSHER_EVENTS,
  type PusherConfig,
} from '@/lib/pusher-client'
import type { Channel } from 'pusher-js'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import { toast } from 'sonner'

// ==================== TYPES ====================

interface Caller {
  id: string
  name: string | null
  email?: string
  image: string | null
}

interface IncomingCallData {
  callId: string
  caller: Caller
  roomUrl: string
  token: string
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
  isInitiator: boolean
}

interface VideoCallContextType {
  initiateCall: (userId: string, userName: string | null, userImage: string | null) => Promise<boolean>
  isInCall: boolean
  incomingCall: IncomingCallData | null
}

// ==================== CONTEXT ====================

const VideoCallContext = createContext<VideoCallContextType | null>(null)

export function useVideoCall() {
  const context = useContext(VideoCallContext)
  if (!context) {
    throw new Error('useVideoCall must be used within VideoCallProvider')
  }
  return context
}

// ==================== PROVIDER ====================

interface VideoCallProviderProps {
  children: ReactNode
}

export function VideoCallProvider({ children }: VideoCallProviderProps) {
  const { data: session } = useSession()
  
  // Pusher State
  const [pusherConfig, setPusherConfig] = useState<PusherConfig | null>(null)
  const [videoCallEnabled, setVideoCallEnabled] = useState(false)
  
  // Call State
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null)
  const [activeCall, setActiveCall] = useState<ActiveCallData | null>(null)
  const [isInitiatingCall, setIsInitiatingCall] = useState(false)
  const [waitingForAccept, setWaitingForAccept] = useState<{
    userId: string
    userName: string | null
    userImage: string | null
    callId: string
    roomUrl: string
    token: string
  } | null>(null)
  
  // Refs
  const userChannelRef = useRef<Channel | null>(null)
  const incomingCallRef = useRef<IncomingCallData | null>(null)
  const activeCallRef = useRef<ActiveCallData | null>(null)
  
  // Keep refs in sync with state
  useEffect(() => {
    incomingCallRef.current = incomingCall
  }, [incomingCall])
  
  useEffect(() => {
    activeCallRef.current = activeCall
  }, [activeCall])

  // ==================== PUSHER SETUP ====================

  // Fetch Pusher config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [pusherRes, videoRes] = await Promise.all([
          fetch('/api/pusher/config'),
          fetch('/api/video-call/config'),
        ])
        
        const pusherData = await pusherRes.json()
        const videoData = await videoRes.json()
        
        if (pusherData.enabled) {
          setPusherConfig({
            key: pusherData.key,
            cluster: pusherData.cluster,
            enabled: true,
          })
        }
        
        setVideoCallEnabled(videoData.enabled || false)
      } catch (error) {
        console.error('Failed to fetch configs:', error)
      }
    }
    
    fetchConfig()
  }, [])

  // Subscribe to user channel for video call events
  useEffect(() => {
    if (!pusherConfig || !session?.user?.id) {
      return
    }

    const pusher = getPusherClient(pusherConfig)
    if (!pusher) return

    const userChannelName = getUserChannel(session.user.id)
    const userChannel = subscribeToChannel(pusher, userChannelName)
    userChannelRef.current = userChannel

    // Incoming call
    userChannel.bind(PUSHER_EVENTS.INCOMING_CALL, (data: IncomingCallData) => {
      console.log('📞 Incoming call:', data)
      setIncomingCall(data)
    })

    // Call accepted by the other person
    userChannel.bind(PUSHER_EVENTS.CALL_ACCEPTED, (data: { 
      callId: string
      acceptedBy: { id: string; name: string | null }
      acceptedAt: string
    }) => {
      console.log('✅ Call accepted:', data)
      if (waitingForAccept && waitingForAccept.callId === data.callId) {
        // Use the stored roomUrl and token from when we initiated the call
        setActiveCall({
          callId: waitingForAccept.callId,
          roomUrl: waitingForAccept.roomUrl,
          token: waitingForAccept.token,
          otherParticipant: {
            id: waitingForAccept.userId,
            name: waitingForAccept.userName,
            image: waitingForAccept.userImage,
          },
          isInitiator: true,
        })
        setWaitingForAccept(null)
        setIsInitiatingCall(false)
      }
    })

    // Call rejected
    userChannel.bind(PUSHER_EVENTS.CALL_REJECTED, (data: { reason?: string }) => {
      console.log('❌ Call rejected:', data)
      setWaitingForAccept(null)
      setIsInitiatingCall(false)
      toast.error('Anruf abgelehnt', {
        description: data.reason === 'busy' ? 'Der Nutzer ist beschäftigt' : 'Der Anruf wurde abgelehnt',
      })
    })

    // Call ended (also handles cancelled calls)
    userChannel.bind(PUSHER_EVENTS.CALL_ENDED, (data: { reason?: string }) => {
      console.log('📴 Call ended by other party:', data)
      // Clear incoming call if caller cancelled (use ref to avoid stale closure)
      if (incomingCallRef.current) {
        setIncomingCall(null)
        if (data.reason === 'cancelled') {
          toast.info('Anruf abgebrochen', {
            description: 'Der Anrufer hat aufgelegt',
          })
        }
      }
      // Clear active call (use ref to avoid stale closure)
      if (activeCallRef.current) {
        setActiveCall(null)
        toast.info('Anruf beendet')
      }
    })

    // Call missed (timeout)
    userChannel.bind(PUSHER_EVENTS.CALL_MISSED, () => {
      console.log('⏰ Call missed')
      setWaitingForAccept(null)
      setIsInitiatingCall(false)
      toast.warning('Keine Antwort', {
        description: 'Der Nutzer hat nicht geantwortet',
      })
    })

    return () => {
      unsubscribeFromChannel(pusher, userChannelName)
      userChannelRef.current = null
    }
  }, [pusherConfig, session?.user?.id, waitingForAccept])

  // ==================== CALL ACTIONS ====================

  // Initiate a call
  const initiateCall = useCallback(async (
    userId: string,
    userName: string | null,
    userImage: string | null
  ): Promise<boolean> => {
    if (!videoCallEnabled) {
      toast.error('Video-Anrufe sind deaktiviert')
      return false
    }
    
    if (activeCall || isInitiatingCall) {
      toast.error('Sie sind bereits in einem Anruf')
      return false
    }

    setIsInitiatingCall(true)

    try {
      const response = await fetch('/api/video-call/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calleeId: userId }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Anruf konnte nicht gestartet werden')
      }

      // Store call data including roomUrl and token for when the call is accepted
      setWaitingForAccept({ 
        userId, 
        userName, 
        userImage,
        callId: data.callId,
        roomUrl: data.roomUrl,
        token: data.token,
      })

      // Wait for CALL_ACCEPTED event via Pusher
      // The activeCall will be set in the event handler
      return true
    } catch (error) {
      console.error('Error initiating call:', error)
      setIsInitiatingCall(false)
      setWaitingForAccept(null)
      toast.error('Anruf fehlgeschlagen', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
      })
      return false
    }
  }, [videoCallEnabled, activeCall, isInitiatingCall])

  // Accept incoming call
  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return

    try {
      const response = await fetch('/api/video-call/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: incomingCall.callId,
          callerId: incomingCall.caller.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Anruf konnte nicht angenommen werden')
      }

      setActiveCall({
        callId: incomingCall.callId,
        roomUrl: incomingCall.roomUrl,
        token: incomingCall.token,
        otherParticipant: {
          id: incomingCall.caller.id,
          name: incomingCall.caller.name,
          image: incomingCall.caller.image,
        },
        isInitiator: false,
      })
      setIncomingCall(null)
    } catch (error) {
      console.error('Error accepting call:', error)
      toast.error('Fehler beim Annehmen des Anrufs')
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
          recipientId: activeCall.otherParticipant.id,
        }),
      })
    } catch (error) {
      console.error('Error ending call:', error)
    } finally {
      setActiveCall(null)
    }
  }, [activeCall])

  // Cancel outgoing call
  const cancelOutgoingCall = useCallback(async () => {
    if (waitingForAccept) {
      try {
        await fetch('/api/video-call/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callId: waitingForAccept.callId,
            calleeId: waitingForAccept.userId,
          }),
        })
      } catch (error) {
        console.error('Error cancelling call:', error)
      }
    }
    setIsInitiatingCall(false)
    setWaitingForAccept(null)
  }, [waitingForAccept])

  // ==================== CONTEXT VALUE ====================

  const contextValue: VideoCallContextType = {
    initiateCall,
    isInCall: !!activeCall,
    incomingCall,
  }

  return (
    <VideoCallContext.Provider value={contextValue}>
      {children}
      
      {/* ==================== OUTGOING CALL MODAL ==================== */}
      <OutgoingCallModal
        recipient={waitingForAccept}
        isVisible={isInitiatingCall && !!waitingForAccept}
        onCancel={cancelOutgoingCall}
      />
      
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
          <VideoCallWindow
            roomUrl={activeCall.roomUrl}
            token={activeCall.token}
            onCallEnd={endVideoCall}
            otherParticipant={activeCall.otherParticipant}
          />
        )}
      </AnimatePresence>
    </VideoCallContext.Provider>
  )
}

// ==================== OUTGOING CALL MODAL ====================

interface OutgoingCallModalProps {
  recipient: {
    userId: string
    userName: string | null
    userImage: string | null
    callId: string
    roomUrl: string
    token: string
  } | null
  isVisible: boolean
  onCancel: () => void
}

function OutgoingCallModal({ recipient, isVisible, onCancel }: OutgoingCallModalProps) {
  const getInitials = (name: string | null): string => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <AnimatePresence>
      {isVisible && recipient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <Card className="w-80 p-6 text-center">
              {/* Pulsing Avatar */}
              <div className="relative mx-auto mb-4 w-24 h-24">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 rounded-full bg-primary/30"
                />
                <Avatar className="h-24 w-24 border-4 border-primary">
                  <AvatarImage src={recipient.userImage || ''} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    {getInitials(recipient.userName)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Recipient Info */}
              <h3 className="text-lg font-semibold mb-1">
                {recipient.userName || 'Unbekannt'}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                <Phone className="inline h-4 w-4 mr-1 animate-pulse" />
                Anruf wird aufgebaut...
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Warte auf Antwort
              </p>

              {/* Cancel Button */}
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full h-14 w-14 mx-auto"
                onClick={onCancel}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ==================== INCOMING CALL MODAL ====================

interface IncomingCallModalProps {
  caller: Caller
  onAccept: () => void
  onReject: () => void
  isVisible: boolean
}

function IncomingCallModal({ caller, onAccept, onReject, isVisible }: IncomingCallModalProps) {
  // Play ringtone sound
  useEffect(() => {
    if (!isVisible) return

    let audioContext: AudioContext | null = null
    let oscillator: OscillatorNode | null = null
    let gainNode: GainNode | null = null
    let intervalId: NodeJS.Timeout | null = null

    const playRing = () => {
      try {
        audioContext = new AudioContext()
        oscillator = audioContext.createOscillator()
        gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 440
        oscillator.type = 'sine'
        gainNode.gain.value = 0.1

        oscillator.start()

        let isRinging = true
        intervalId = setInterval(() => {
          if (gainNode) {
            gainNode.gain.value = isRinging ? 0 : 0.1
            isRinging = !isRinging
          }
        }, 500)
      } catch (e) {
        console.log('Audio not available:', e)
      }
    }

    playRing()

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (oscillator) oscillator.stop()
      if (audioContext) audioContext.close()
    }
  }, [isVisible])

  const getInitials = (name: string | null): string => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <Card className="w-80 p-6 text-center">
              {/* Pulsing Avatar */}
              <div className="relative mx-auto mb-4 w-24 h-24">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.2, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 rounded-full bg-green-500/30"
                />
                <Avatar className="h-24 w-24 border-4 border-green-500">
                  <AvatarImage src={caller.image || ''} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    {getInitials(caller.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Caller Info */}
              <h3 className="text-lg font-semibold mb-1">
                {caller.name || caller.email || 'Unbekannt'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                <Video className="inline h-4 w-4 mr-1" />
                Eingehender Videoanruf...
              </p>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="destructive"
                  size="lg"
                  className="rounded-full h-14 w-14"
                  onClick={onReject}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
                <Button
                  size="lg"
                  className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600"
                  onClick={onAccept}
                >
                  <Phone className="h-6 w-6" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ==================== VIDEO CALL WINDOW ====================

interface VideoCallWindowProps {
  roomUrl: string
  token: string
  onCallEnd: () => void
  otherParticipant: {
    id: string
    name: string | null
    image: string | null
  }
}

function VideoCallWindow({
  roomUrl,
  token,
  onCallEnd,
  otherParticipant,
}: VideoCallWindowProps) {
  const [isJoining, setIsJoining] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const callObjectRef = useRef<DailyCall | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const callStartTimeRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize Daily call
  useEffect(() => {
    if (!roomUrl || !token) return

    const initCall = async () => {
      try {
        setIsJoining(true)
        setError(null)

        const call = DailyIframe.createCallObject({
          showLeaveButton: false,
          showFullscreenButton: true,
          showLocalVideo: true,
          showParticipantsBar: false,
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '8px',
          },
        })

        call.on('joined-meeting', () => {
          setIsJoining(false)
          callStartTimeRef.current = Date.now()
          timerRef.current = setInterval(() => {
            if (callStartTimeRef.current) {
              setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000))
            }
          }, 1000)
        })

        call.on('participant-left', (event) => {
          if (event?.participant && !event.participant.local) {
            handleLeave()
          }
        })

        call.on('error', (e) => {
          console.error('Daily error:', e)
          setError('Verbindungsfehler')
        })

        call.on('left-meeting', () => {
          onCallEnd()
        })

        callObjectRef.current = call

        await call.join({
          url: roomUrl,
          token: token,
        })
      } catch (e) {
        console.error('Error joining call:', e)
        setError('Konnte dem Anruf nicht beitreten')
        setIsJoining(false)
      }
    }

    initCall()

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [roomUrl, token, onCallEnd])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.leave()
        callObjectRef.current.destroy()
      }
    }
  }, [])

  const handleLeave = useCallback(() => {
    if (callObjectRef.current) {
      callObjectRef.current.leave()
    }
    onCallEnd()
  }, [onCallEnd])

  const toggleMute = useCallback(() => {
    if (callObjectRef.current) {
      callObjectRef.current.setLocalAudio(isMuted)
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const toggleVideo = useCallback(() => {
    if (callObjectRef.current) {
      callObjectRef.current.setLocalVideo(isVideoOff)
      setIsVideoOff(!isVideoOff)
    }
  }, [isVideoOff])

  const toggleScreenShare = useCallback(async () => {
    if (!callObjectRef.current) return

    try {
      if (isScreenSharing) {
        await callObjectRef.current.stopScreenShare()
      } else {
        await callObjectRef.current.startScreenShare()
      }
      setIsScreenSharing(!isScreenSharing)
    } catch (e) {
      console.error('Screen share error:', e)
      toast.error('Bildschirmfreigabe fehlgeschlagen')
    }
  }, [isScreenSharing])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getInitials = (name: string | null): string => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'fixed z-50 flex flex-col bg-gray-900 rounded-lg overflow-hidden shadow-2xl',
        isFullscreen
          ? 'inset-0 rounded-none'
          : 'bottom-4 right-4 w-[480px] h-[360px] md:w-[640px] md:h-[480px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherParticipant.image || ''} />
            <AvatarFallback className="text-xs">
              {getInitials(otherParticipant.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white text-sm font-medium">
              {otherParticipant.name || 'Anruf'}
            </p>
            <p className="text-gray-400 text-xs">
              {isJoining ? 'Verbinde...' : formatDuration(callDuration)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white h-8 w-8"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white h-8 w-8"
            onClick={handleLeave}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900">
        {isJoining ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-white text-sm">Verbinde zum Anruf...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <VideoOff className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-white text-sm mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={handleLeave}>
              Schließen
            </Button>
          </div>
        ) : (
          <iframe
            title="Video Call"
            src={`${roomUrl}?t=${token}`}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-full border-0"
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-800/80 backdrop-blur-sm">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isMuted ? 'destructive' : 'secondary'}
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={toggleMute}
                disabled={isJoining}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isMuted ? 'Mikrofon einschalten' : 'Mikrofon ausschalten'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isVideoOff ? 'destructive' : 'secondary'}
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={toggleVideo}
                disabled={isJoining}
              >
                {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isVideoOff ? 'Kamera einschalten' : 'Kamera ausschalten'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isScreenSharing ? 'default' : 'secondary'}
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={toggleScreenShare}
                disabled={isJoining}
              >
                {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isScreenSharing ? 'Freigabe beenden' : 'Bildschirm teilen'}
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-gray-600 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={handleLeave}
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Anruf beenden</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  )
}

export default VideoCallProvider
