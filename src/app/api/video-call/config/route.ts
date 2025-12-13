import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDailyClientConfig } from '@/lib/daily-server'
import { isDemoModeActive } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

/**
 * GET /api/video-call/config
 * Returns client-side Daily.co configuration (without API key)
 */
export async function GET() {
  try {
    // Demo-Modus: Video-Calls deaktiviert
    if (await isDemoModeActive()) {
      return NextResponse.json({
        enabled: false,
        domain: null,
      })
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const config = await getDailyClientConfig()
    
    return NextResponse.json({
      enabled: config?.enabled ?? false,
      domain: config?.domain ?? null,
    })
  } catch (error) {
    console.error('Error fetching video call config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Video-Call Konfiguration' },
      { status: 500 }
    )
  }
}


