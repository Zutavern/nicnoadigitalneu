import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Get Pusher client config (public key only)
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const settings = await prisma.platformSettings.findFirst()

    if (!settings?.pusherEnabled || !settings.pusherKey) {
      return NextResponse.json({
        enabled: false,
        key: null,
        cluster: null,
      })
    }

    // Only return public config (key + cluster), never the secret!
    return NextResponse.json({
      enabled: true,
      key: settings.pusherKey,
      cluster: settings.pusherCluster || 'eu',
    })
  } catch (error) {
    console.error('Error fetching Pusher config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Pusher-Konfiguration' },
      { status: 500 }
    )
  }
}


