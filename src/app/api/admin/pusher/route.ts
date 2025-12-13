import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { invalidatePusherCache } from '@/lib/pusher-server'

export const dynamic = 'force-dynamic'

// GET: Get Pusher admin config
export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const settings = await prisma.platformSettings.findFirst()

    return NextResponse.json({
      pusherAppId: settings?.pusherAppId || '',
      pusherKey: settings?.pusherKey || '',
      pusherCluster: settings?.pusherCluster || 'eu',
      pusherEnabled: settings?.pusherEnabled || false,
      // Mask secret for security
      hasSecret: !!settings?.pusherSecret,
    })
  } catch (error) {
    console.error('Error fetching Pusher config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Pusher-Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT: Update Pusher admin config
export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { pusherAppId, pusherKey, pusherSecret, pusherCluster, pusherEnabled } = body

    // Get existing settings or create new
    let settings = await prisma.platformSettings.findFirst()

    const updateData: Record<string, unknown> = {
      pusherEnabled: pusherEnabled ?? false,
    }

    // Only update fields that are provided
    if (pusherAppId !== undefined) updateData.pusherAppId = pusherAppId
    if (pusherKey !== undefined) updateData.pusherKey = pusherKey
    if (pusherCluster !== undefined) updateData.pusherCluster = pusherCluster
    
    // Only update secret if a new one is provided (not masked placeholder)
    if (pusherSecret && !pusherSecret.includes('••••')) {
      updateData.pusherSecret = pusherSecret
    }

    if (settings) {
      settings = await prisma.platformSettings.update({
        where: { id: settings.id },
        data: updateData,
      })
    } else {
      settings = await prisma.platformSettings.create({
        data: updateData as Parameters<typeof prisma.platformSettings.create>[0]['data'],
      })
    }

    // Invalidate cached Pusher instance
    invalidatePusherCache()

    return NextResponse.json({
      success: true,
      pusherAppId: settings.pusherAppId || '',
      pusherKey: settings.pusherKey || '',
      pusherCluster: settings.pusherCluster || 'eu',
      pusherEnabled: settings.pusherEnabled,
      hasSecret: !!settings.pusherSecret,
    })
  } catch (error) {
    console.error('Error updating Pusher config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Pusher-Konfiguration' },
      { status: 500 }
    )
  }
}

// POST: Test Pusher connection
export async function POST() {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const settings = await prisma.platformSettings.findFirst()

    if (!settings?.pusherAppId || !settings?.pusherKey || !settings?.pusherSecret) {
      return NextResponse.json({
        success: false,
        error: 'Pusher-Konfiguration unvollständig',
      })
    }

    // Import Pusher dynamically to test connection
    const Pusher = (await import('pusher')).default
    const pusher = new Pusher({
      appId: settings.pusherAppId,
      key: settings.pusherKey,
      secret: settings.pusherSecret,
      cluster: settings.pusherCluster || 'eu',
      useTLS: true,
    })

    // Try to trigger a test event
    await pusher.trigger('test-channel', 'test-event', {
      message: 'Connection test successful',
    })

    return NextResponse.json({
      success: true,
      message: 'Verbindung erfolgreich!',
    })
  } catch (error) {
    console.error('Pusher connection test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Verbindungstest fehlgeschlagen',
    })
  }
}



