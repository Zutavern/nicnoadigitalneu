'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  X,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import DailyIframe, { DailyCall, DailyParticipant } from '@daily-co/daily-js'

// ==================== TYPES ====================

interface VideoCallProps {
  /** Room URL from Daily */
  roomUrl: string
  /** Meeting token for authentication */
  token: string
  /** Callback when call ends */
  onCallEnd: () => void
  /** The other participant's info */
  otherParticipant?: {
    id: string
    name: string | null
    image: string | null
  }
  /** CSS class for the container */
  className?: string
}

interface IncomingCallModalProps {
  caller: {
    id: string
    name: string | null
    email?: string
    image: string | null
  }
  onAccept: () => void
  onReject: () => void
  isVisible: boolean
}

// ==================== INCOMING CALL MODAL ====================

export function IncomingCallModal({
  caller,
  onAccept,
  onReject,
  isVisible,
}: IncomingCallModalProps) {
  // Play ringtone sound
  useEffect(() => {
    if (!isVisible) return

    // Create audio context for ringtone
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

        oscillator.frequency.value = 440 // A4 note
        oscillator.type = 'sine'
        gainNode.gain.value = 0.1

        oscillator.start()

        // Ring pattern: on 0.5s, off 1s
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
              <div className="relative mx-auto mb-4">
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
                  style={{ width: 96, height: 96 }}
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

// ==================== VIDEO CALL COMPONENT ====================

export function VideoCall({
  roomUrl,
  token,
  onCallEnd,
  otherParticipant,
  className,
}: VideoCallProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null)
  const [isJoining, setIsJoining] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [participantCount, setParticipantCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const videoContainerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const callStartTimeRef = useRef<number | null>(null)

  // Initialize Daily call
  useEffect(() => {
    if (!roomUrl || !token) return

    const initCall = async () => {
      try {
        setIsJoining(true)
        setError(null)

        // Create call object
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

        // Event handlers
        call.on('joined-meeting', () => {
          setIsJoining(false)
          callStartTimeRef.current = Date.now()
          // Start duration timer
          timerRef.current = setInterval(() => {
            if (callStartTimeRef.current) {
              setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000))
            }
          }, 1000)
        })

        call.on('participant-joined', () => {
          setParticipantCount((prev) => prev + 1)
        })

        call.on('participant-left', (event?: { participant?: DailyParticipant }) => {
          setParticipantCount((prev) => Math.max(0, prev - 1))
          // If the other participant left, end the call
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

        setCallObject(call)

        // Join the call
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
      if (callObject) {
        callObject.leave()
        callObject.destroy()
      }
    }
  }, [callObject])

  const handleLeave = useCallback(() => {
    if (callObject) {
      callObject.leave()
    }
    onCallEnd()
  }, [callObject, onCallEnd])

  const toggleMute = useCallback(() => {
    if (callObject) {
      callObject.setLocalAudio(!isMuted)
      setIsMuted(!isMuted)
    }
  }, [callObject, isMuted])

  const toggleVideo = useCallback(() => {
    if (callObject) {
      callObject.setLocalVideo(!isVideoOff)
      setIsVideoOff(!isVideoOff)
    }
  }, [callObject, isVideoOff])

  const toggleScreenShare = useCallback(async () => {
    if (!callObject) return

    try {
      if (isScreenSharing) {
        await callObject.stopScreenShare()
      } else {
        await callObject.startScreenShare()
      }
      setIsScreenSharing(!isScreenSharing)
    } catch (e) {
      console.error('Screen share error:', e)
    }
  }, [callObject, isScreenSharing])

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-gray-900',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {otherParticipant && (
            <>
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
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
          onClick={handleLeave}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Video Area */}
      <div
        ref={videoContainerRef}
        className="flex-1 relative bg-gray-900"
      >
        {isJoining ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-white">Verbinde zum Anruf...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <VideoOff className="h-16 w-16 text-red-400 mb-4" />
            <p className="text-white text-lg mb-2">{error}</p>
            <Button variant="outline" onClick={handleLeave}>
              Schließen
            </Button>
          </div>
        ) : (
          // Daily iframe will be injected here
          <iframe
            title="Video Call"
            src={`${roomUrl}?t=${token}`}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-full border-0"
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-4 px-6 bg-gray-800/50 backdrop-blur-sm">
        <Button
          variant={isMuted ? 'destructive' : 'secondary'}
          size="lg"
          className="rounded-full h-12 w-12"
          onClick={toggleMute}
          disabled={isJoining}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        <Button
          variant={isVideoOff ? 'destructive' : 'secondary'}
          size="lg"
          className="rounded-full h-12 w-12"
          onClick={toggleVideo}
          disabled={isJoining}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>

        <Button
          variant={isScreenSharing ? 'default' : 'secondary'}
          size="lg"
          className="rounded-full h-12 w-12"
          onClick={toggleScreenShare}
          disabled={isJoining}
        >
          <Monitor className="h-5 w-5" />
        </Button>

        <Button
          variant="destructive"
          size="lg"
          className="rounded-full h-14 w-14"
          onClick={handleLeave}
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </motion.div>
  )
}

export default VideoCall
