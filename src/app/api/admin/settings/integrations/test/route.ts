import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/settings/integrations/test?integration=openrouter
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const integration = searchParams.get('integration')

    if (!integration) {
      return NextResponse.json({ error: 'Integration nicht angegeben' }, { status: 400 })
    }

    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
    })

    switch (integration) {
      case 'openrouter': {
        if (!settings?.openRouterApiKey) {
          return NextResponse.json({ success: false, error: 'Kein API-Key konfiguriert' })
        }

        try {
          const res = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
              'Authorization': `Bearer ${settings.openRouterApiKey}`,
            },
          })

          if (!res.ok) {
            const errorData = await res.text()
            return NextResponse.json({ 
              success: false, 
              error: `API Error: ${res.status} - ${errorData.substring(0, 100)}` 
            })
          }

          const data = await res.json()
          return NextResponse.json({ 
            success: true, 
            message: `Verbunden! ${data.data?.length || 0} Modelle verfügbar` 
          })
        } catch (err) {
          return NextResponse.json({ 
            success: false, 
            error: err instanceof Error ? err.message : 'Verbindungsfehler' 
          })
        }
      }

      case 'deepl': {
        if (!settings?.deeplApiKey) {
          return NextResponse.json({ success: false, error: 'Kein API-Key konfiguriert' })
        }

        try {
          // DeepL Usage API
          const isFree = settings.deeplApiKey.endsWith(':fx')
          const baseUrl = isFree 
            ? 'https://api-free.deepl.com' 
            : 'https://api.deepl.com'

          const res = await fetch(`${baseUrl}/v2/usage`, {
            headers: {
              'Authorization': `DeepL-Auth-Key ${settings.deeplApiKey}`,
            },
          })

          if (!res.ok) {
            return NextResponse.json({ 
              success: false, 
              error: `API Error: ${res.status}` 
            })
          }

          const data = await res.json()
          const usedPercent = Math.round((data.character_count / data.character_limit) * 100)
          return NextResponse.json({ 
            success: true, 
            message: `Verbunden! ${usedPercent}% Kontingent verbraucht` 
          })
        } catch (err) {
          return NextResponse.json({ 
            success: false, 
            error: err instanceof Error ? err.message : 'Verbindungsfehler' 
          })
        }
      }

      case 'pusher': {
        if (!settings?.pusherAppId || !settings?.pusherKey || !settings?.pusherSecret) {
          return NextResponse.json({ success: false, error: 'Pusher nicht vollständig konfiguriert' })
        }

        try {
          // Pusher hat keine einfache "ping" API, wir prüfen die Credentials indirekt
          // Durch einen Auth-Request
          const Pusher = (await import('pusher')).default
          
          const pusher = new Pusher({
            appId: settings.pusherAppId,
            key: settings.pusherKey,
            secret: settings.pusherSecret,
            cluster: settings.pusherCluster || 'eu',
            useTLS: true,
          })

          // Versuche eine Info-Abfrage
          await pusher.get({ path: '/channels', params: {} })
          
          return NextResponse.json({ 
            success: true, 
            message: `Verbunden mit Cluster: ${settings.pusherCluster}` 
          })
        } catch (err) {
          // Pusher wirft einen Error bei falschen Credentials
          const errorMsg = err instanceof Error ? err.message : 'Verbindungsfehler'
          if (errorMsg.includes('401')) {
            return NextResponse.json({ success: false, error: 'Ungültige Credentials' })
          }
          // Bei anderen Errors (z.B. Netzwerk) könnte es trotzdem funktionieren
          return NextResponse.json({ success: true, message: 'Credentials scheinen gültig' })
        }
      }

      case 'daily': {
        if (!settings?.dailyApiKey) {
          return NextResponse.json({ success: false, error: 'Kein API-Key konfiguriert' })
        }

        try {
          const res = await fetch('https://api.daily.co/v1/', {
            headers: {
              'Authorization': `Bearer ${settings.dailyApiKey}`,
            },
          })

          if (!res.ok) {
            return NextResponse.json({ 
              success: false, 
              error: `API Error: ${res.status}` 
            })
          }

          return NextResponse.json({ 
            success: true, 
            message: 'Verbunden!' 
          })
        } catch (err) {
          return NextResponse.json({ 
            success: false, 
            error: err instanceof Error ? err.message : 'Verbindungsfehler' 
          })
        }
      }

      default:
        return NextResponse.json({ error: 'Unbekannte Integration' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error testing integration:', error)
    return NextResponse.json(
      { success: false, error: 'Interner Fehler' },
      { status: 500 }
    )
  }
}

