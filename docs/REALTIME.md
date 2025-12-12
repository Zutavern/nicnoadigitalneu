# NICNOA Real-time System

## 📡 Echtzeit-Kommunikation Dokumentation

**Version:** 1.0  
**Datum:** 12. Dezember 2025  
**Status:** Produktiv

---

## 1. Übersicht

NICNOA nutzt ein Multi-Provider Real-time System für verschiedene Kommunikationsbedürfnisse:

| Provider | Verwendung | Features |
|----------|------------|----------|
| **Pusher** | Chat & Presence | WebSockets, Presence Channels |
| **Daily.co** | Video Calls | WebRTC, Screen Sharing |
| **PostHog** | Analytics | Event Tracking, Heatmaps |

---

## 2. Pusher Integration

### 2.1 Architektur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PUSHER FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────────────────┐
                    │           Pusher Server              │
                    │                                      │
                    │  - Channels Management               │
                    │  - Message Broadcasting              │
                    │  - Presence Tracking                 │
                    └──────────────────┬───────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
     ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
     │    Client A   │        │ NICNOA Server │        │    Client B   │
     │               │        │               │        │               │
     │  - Subscribe  │        │  - Auth       │        │  - Subscribe  │
     │  - Receive    │        │  - Trigger    │        │  - Receive    │
     │  - Bind       │        │  - Validate   │        │  - Bind       │
     └───────────────┘        └───────────────┘        └───────────────┘
```

### 2.2 Kanal-Typen

| Typ | Prefix | Verwendung | Auth |
|-----|--------|------------|------|
| **Presence** | `presence-` | Chat-Räume mit Online-Status | ✅ |
| **Private** | `private-` | Benutzer-spezifische Events | ✅ |
| **Public** | - | Öffentliche Broadcasts | ❌ |

### 2.3 Events

#### Chat Events
```typescript
// Neue Nachricht
PUSHER_EVENTS.NEW_MESSAGE = 'new-message'
{
  message: {
    id: string
    content: string
    senderId: string
    createdAt: string
    sender: { id, name, image }
  }
}

// Benutzer tippt
PUSHER_EVENTS.USER_TYPING = 'user-typing'
{
  userId: string
  userName: string
  userImage: string | null
}

// Tippen beendet
PUSHER_EVENTS.USER_STOPPED_TYPING = 'user-stopped-typing'
{
  userId: string
}
```

#### Video Call Events
```typescript
// Eingehender Anruf
PUSHER_EVENTS.INCOMING_CALL = 'incoming-call'
{
  callerId: string
  callerName: string
  callerImage: string | null
  roomUrl: string
  token: string
  roomName: string
}

// Anruf angenommen
PUSHER_EVENTS.CALL_ACCEPTED = 'call-accepted'
{
  calleeId: string
  calleeName: string
}

// Anruf abgelehnt
PUSHER_EVENTS.CALL_REJECTED = 'call-rejected'
{
  calleeId: string
  reason?: string
}

// Anruf beendet
PUSHER_EVENTS.CALL_ENDED = 'call-ended'
{
  endedBy: string
}
```

### 2.4 Server-Implementierung

```typescript
// src/lib/pusher-server.ts

import Pusher from 'pusher'
import { prisma } from './prisma'

// Cache für Pusher-Instanz
let pusherInstance: Pusher | null = null
let pusherConfig: PusherConfig | null = null

export async function getPusherConfig() {
  if (!pusherConfig) {
    const settings = await prisma.platformSettings.findFirst()
    if (settings?.pusherEnabled && settings.pusherAppId) {
      pusherConfig = {
        appId: settings.pusherAppId,
        key: settings.pusherKey!,
        secret: settings.pusherSecret!,
        cluster: settings.pusherCluster || 'eu',
      }
    }
  }
  return pusherConfig
}

export async function getPusherServer(): Promise<Pusher | null> {
  const config = await getPusherConfig()
  if (!config) return null

  if (!pusherInstance) {
    pusherInstance = new Pusher({
      ...config,
      useTLS: true,
    })
  }
  return pusherInstance
}

export async function triggerEvent(
  channel: string,
  event: string,
  data: unknown
): Promise<void> {
  const pusher = await getPusherServer()
  if (pusher) {
    await pusher.trigger(channel, event, data)
  }
}

export function invalidatePusherCache(): void {
  pusherInstance = null
  pusherConfig = null
}
```

### 2.5 Client-Implementierung

```typescript
// src/lib/pusher-client.ts

import PusherClient from 'pusher-js'

let pusherInstance: PusherClient | null = null

export interface PusherConfig {
  key: string
  cluster: string
  enabled: boolean
}

export function getPusherClient(config: PusherConfig): PusherClient | null {
  if (!config.enabled) return null

  if (!pusherInstance) {
    pusherInstance = new PusherClient(config.key, {
      cluster: config.cluster,
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    })
  }
  return pusherInstance
}

export function subscribeToPresenceChannel(
  pusher: PusherClient,
  channelName: string
) {
  return pusher.subscribe(channelName) as PresenceChannel
}

export function getConversationChannel(conversationId: string): string {
  return `presence-conversation-${conversationId}`
}

export function getUserChannel(userId: string): string {
  return `private-user-${userId}`
}
```

---

## 3. Daily.co Video Calls

### 3.1 Architektur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DAILY.CO VIDEO FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

    Anrufer                    NICNOA Server                  Empfänger
        │                           │                            │
        │  1. Initiate Call         │                            │
        │──────────────────────────>│                            │
        │                           │                            │
        │                           │  2. Daily.co API           │
        │                           │  - Create Room             │
        │                           │  - Generate Tokens         │
        │                           │                            │
        │                           │  3. Pusher Event           │
        │                           │────────────────────────────>│
        │                           │                            │
        │  4. Room URL + Token      │                            │
        │<──────────────────────────│                            │
        │                           │                            │
        │                           │  5. Accept/Reject          │
        │                           │<───────────────────────────│
        │                           │                            │
        │  6. Status Update         │                            │
        │<──────────────────────────│                            │
        │                           │                            │
        │═══════════════════════════════════════════════════════>│
        │           7. WebRTC Video Stream (P2P via Daily)       │
        │<═══════════════════════════════════════════════════════│
        │                           │                            │
```

### 3.2 Server-Implementierung

```typescript
// src/lib/daily-server.ts

const DAILY_API_URL = 'https://api.daily.co/v1'

// Cache für Daily-Konfiguration
let dailyConfig: DailyConfig | null = null

export async function getDailyConfig(): Promise<DailyConfig | null> {
  if (!dailyConfig) {
    const settings = await prisma.platformSettings.findFirst()
    if (settings?.dailyEnabled && settings.dailyApiKey) {
      dailyConfig = {
        apiKey: settings.dailyApiKey,
        domain: settings.dailyDomain || 'nicnoa',
      }
    }
  }
  return dailyConfig
}

export async function createRoom(
  roomName: string,
  expiresInMinutes: number = 60
): Promise<DailyRoom> {
  const config = await getDailyConfig()
  if (!config) throw new Error('Daily.co nicht konfiguriert')

  const response = await fetch(`${DAILY_API_URL}/rooms`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: roomName,
      privacy: 'private',
      properties: {
        exp: Math.floor(Date.now() / 1000) + expiresInMinutes * 60,
        enable_chat: true,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  })

  return response.json()
}

export async function createMeetingToken(
  roomName: string,
  userId: string,
  userName: string,
  isOwner: boolean = false
): Promise<string> {
  const config = await getDailyConfig()
  if (!config) throw new Error('Daily.co nicht konfiguriert')

  const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_id: userId,
        user_name: userName,
        is_owner: isOwner,
        exp: Math.floor(Date.now() / 1000) + 3600,
        enable_screenshare: true,
      },
    }),
  })

  const data = await response.json()
  return data.token
}

export async function deleteRoom(roomName: string): Promise<void> {
  const config = await getDailyConfig()
  if (!config) return

  await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  })
}
```

### 3.3 Video Call Komponente

```typescript
// src/components/chat/video-call.tsx

'use client'

import DailyIframe from '@daily-co/daily-js'
import { useEffect, useRef, useState } from 'react'

interface VideoCallProps {
  roomUrl: string
  token: string
  onLeave: () => void
}

export function VideoCall({ roomUrl, token, onLeave }: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [callFrame, setCallFrame] = useState<DailyIframe | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const frame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
        borderRadius: '8px',
      },
      showLeaveButton: false,
      showFullscreenButton: true,
    })

    frame.join({ url: roomUrl, token })
    setCallFrame(frame)

    frame.on('left-meeting', onLeave)

    return () => {
      frame.destroy()
    }
  }, [roomUrl, token, onLeave])

  const toggleMute = () => {
    callFrame?.setLocalAudio(!isMuted)
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    callFrame?.setLocalVideo(!isVideoOff)
    setIsVideoOff(!isVideoOff)
  }

  const leaveCall = () => {
    callFrame?.leave()
    onLeave()
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      
      {/* Call Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <Button onClick={toggleMute}>
          {isMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button onClick={toggleVideo}>
          {isVideoOff ? <VideoOff /> : <Video />}
        </Button>
        <Button variant="destructive" onClick={leaveCall}>
          <PhoneOff />
        </Button>
      </div>
    </div>
  )
}
```

### 3.4 Incoming Call Modal

```typescript
// src/components/chat/video-call.tsx

interface IncomingCallModalProps {
  caller: { id: string; name: string; image?: string }
  onAccept: () => void
  onReject: () => void
}

export function IncomingCallModal({
  caller,
  onAccept,
  onReject,
}: IncomingCallModalProps) {
  // Klingelton abspielen
  useEffect(() => {
    const audio = new Audio('/sounds/ringtone.mp3')
    audio.loop = true
    audio.play()
    return () => audio.pause()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl bg-card p-8 text-center"
      >
        <Avatar className="mx-auto h-24 w-24">
          <AvatarImage src={caller.image} />
          <AvatarFallback>{caller.name[0]}</AvatarFallback>
        </Avatar>
        
        <h2 className="mt-4 text-2xl font-bold">{caller.name}</h2>
        <p className="text-muted-foreground">Eingehender Videoanruf...</p>
        
        <div className="mt-8 flex justify-center gap-8">
          <Button
            size="lg"
            variant="destructive"
            className="rounded-full"
            onClick={onReject}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button
            size="lg"
            className="rounded-full bg-green-500 hover:bg-green-600"
            onClick={onAccept}
          >
            <Phone className="h-6 w-6" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
```

---

## 4. Admin-Konfiguration

### 4.1 Pusher-Einstellungen

| Feld | Beschreibung | Erforderlich |
|------|--------------|--------------|
| `pusherAppId` | Pusher App ID | ✅ |
| `pusherKey` | Pusher Key (öffentlich) | ✅ |
| `pusherSecret` | Pusher Secret | ✅ |
| `pusherCluster` | Server-Region (z.B. eu) | ✅ |
| `pusherEnabled` | Aktivieren/Deaktivieren | ✅ |

### 4.2 Daily.co-Einstellungen

| Feld | Beschreibung | Erforderlich |
|------|--------------|--------------|
| `dailyApiKey` | Daily.co API Key | ✅ |
| `dailyDomain` | Subdomain (z.B. nicnoa) | ✅ |
| `dailyEnabled` | Aktivieren/Deaktivieren | ✅ |

### 4.3 Verbindungstest

Beide Systeme können über die Admin-Oberfläche getestet werden:
- **Pusher**: Sendet Test-Event an Test-Channel
- **Daily.co**: Erstellt temporären Raum und löscht ihn

---

## 5. Demo-Modus

Im Demo-Modus werden Real-time Features simuliert:

### Pusher (simuliert)
- Online-Status wird mock-generiert
- Typing-Indicators werden zeitgesteuert angezeigt
- Nachrichten werden lokal hinzugefügt

### Daily.co (deaktiviert)
- Video-Calls sind im Demo-Modus nicht verfügbar
- Video-Button wird nicht angezeigt

```typescript
// Demo-Modus Erkennung
export async function isDemoModeActive(): Promise<boolean> {
  const settings = await prisma.platformSettings.findFirst()
  return settings?.useDemoMode ?? true
}
```

---

## 6. Sicherheit

### 6.1 Kanal-Authentifizierung

```typescript
// /api/pusher/auth
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { socket_id, channel_name } = await request.json()

  // Berechtigung prüfen
  if (channel_name.startsWith('presence-conversation-')) {
    const conversationId = channel_name.replace('presence-conversation-', '')
    const isParticipant = await checkConversationAccess(
      session.user.id,
      conversationId
    )
    if (!isParticipant) {
      return new Response('Forbidden', { status: 403 })
    }
  }

  // Auth-Response generieren
  const pusher = await getPusherServer()
  const authResponse = pusher.authorizeChannel(socket_id, channel_name, {
    user_id: session.user.id,
    user_info: {
      name: session.user.name,
      role: session.user.role,
      image: session.user.image,
    },
  })

  return NextResponse.json(authResponse)
}
```

### 6.2 Rate Limiting

Real-time APIs haben Rate Limits:
- Typing-Events: Max 1 pro Sekunde
- Presence-Updates: Max 1 pro 5 Sekunden

---

## 7. Troubleshooting

### Häufige Probleme

| Problem | Ursache | Lösung |
|---------|---------|--------|
| "Pusher nicht verbunden" | Config fehlt | Admin → Settings → Pusher |
| "Video deaktiviert" | Daily.co aus | Admin → Settings → Video |
| "Anruf fehlgeschlagen" | Empfänger offline | Nur online-User anrufbar |
| "Auth-Fehler" | Session abgelaufen | Seite neu laden |

### Debug-Logs

```typescript
// Pusher Debug aktivieren
PusherClient.logToConsole = true

// Daily.co Debug
DailyIframe.setLogLevel('debug')
```

---

**Dokumentation gepflegt von:** NICNOA Development Team  
**Letzte Aktualisierung:** 12. Dezember 2025
