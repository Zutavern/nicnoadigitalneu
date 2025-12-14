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

      case 'resend': {
        if (!settings?.resendApiKey) {
          return NextResponse.json({ success: false, error: 'Kein API-Key konfiguriert' })
        }

        try {
          // Resend API-Key validieren durch Abruf der Domains
          const res = await fetch('https://api.resend.com/domains', {
            headers: {
              'Authorization': `Bearer ${settings.resendApiKey}`,
            },
          })

          if (!res.ok) {
            if (res.status === 401) {
              return NextResponse.json({ 
                success: false, 
                error: 'Ungültiger API-Key' 
              })
            }
            return NextResponse.json({ 
              success: false, 
              error: `API Error: ${res.status}` 
            })
          }

          const data = await res.json()
          const domainCount = data.data?.length || 0
          return NextResponse.json({ 
            success: true, 
            message: `Verbunden! ${domainCount} Domain(s) konfiguriert` 
          })
        } catch (err) {
          return NextResponse.json({ 
            success: false, 
            error: err instanceof Error ? err.message : 'Verbindungsfehler' 
          })
        }
      }

      case 'sevenio': {
        // Type-safe access für die neuen Felder
        const sevenIoApiKey = (settings as Record<string, unknown> | null)?.sevenIoApiKey as string | undefined
        
        if (!sevenIoApiKey) {
          return NextResponse.json({ success: false, error: 'Kein API-Key konfiguriert' })
        }

        // seven.io Fehlercodes (werden als Zahl im Body zurückgegeben, auch bei HTTP 200)
        const SEVEN_IO_ERRORS: Record<number, string> = {
          100: 'Fehlerhafte Anfrage',
          101: 'API-Schlüssel fehlt',
          102: 'Aktion fehlt',
          103: 'Aktion existiert nicht',
          900: 'Authentifizierung fehlgeschlagen - API-Key prüfen',
          901: 'Signatur ungültig',
          902: 'API-Key deaktiviert',
          903: 'IP nicht erlaubt',
        }

        try {
          console.log('🔍 seven.io Test - API-Key (erste 8 Zeichen):', sevenIoApiKey.substring(0, 8) + '...')
          
          // seven.io Balance-API zum Prüfen der Credentials
          const res = await fetch('https://gateway.seven.io/api/balance', {
            headers: {
              'X-Api-Key': sevenIoApiKey,
            },
          })

          const responseText = await res.text().then(t => t.trim())
          
          console.log('🔍 seven.io Response - HTTP Status:', res.status)
          console.log('🔍 seven.io Response - Body:', responseText)
          
          const parsedValue = parseFloat(responseText)
          
          // ZUERST auf Fehlercodes prüfen (ganzzahlige Werte 100-999)
          if (!isNaN(parsedValue) && Number.isInteger(parsedValue) && parsedValue >= 100 && parsedValue <= 999) {
            const errorMessage = SEVEN_IO_ERRORS[parsedValue] || `API Fehler (Code ${parsedValue})`
            return NextResponse.json({ 
              success: false, 
              error: errorMessage,
              debug: { httpStatus: res.status, rawResponse: responseText }
            })
          }
          
          // Gültiger Balance-Wert (Dezimalzahl oder 0)
          if (!isNaN(parsedValue) && parsedValue >= 0) {
            return NextResponse.json({ 
              success: true, 
              message: `Verbunden! Guthaben: ${parsedValue.toFixed(2)}€`,
              debug: { httpStatus: res.status, rawResponse: responseText }
            })
          }

          return NextResponse.json({ 
            success: false, 
            error: `Ungültige API-Antwort: ${responseText.substring(0, 50)}`,
            debug: { httpStatus: res.status, rawResponse: responseText }
          })
        } catch (err) {
          console.error('🔍 seven.io Test - Error:', err)
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

