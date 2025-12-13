import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { invalidateDailyCache, testConnection } from '@/lib/daily-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/video-call
 * Get Daily.co configuration (Admin only)
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }

    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
      select: {
        dailyApiKey: true,
        dailyDomain: true,
        dailyEnabled: true,
      },
    })

    return NextResponse.json({
      apiKey: settings?.dailyApiKey ? '***' + settings.dailyApiKey.slice(-8) : null,
      domain: settings?.dailyDomain || null,
      enabled: settings?.dailyEnabled ?? false,
    })
  } catch (error) {
    console.error('Error fetching Daily config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Daily Konfiguration' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/video-call
 * Update Daily.co configuration (Admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }

    const body = await request.json()
    const { apiKey, domain, enabled } = body

    // Build update object (only include fields that are provided)
    const updateData: Record<string, unknown> = {}
    
    if (apiKey !== undefined && apiKey !== null && !apiKey.startsWith('***')) {
      updateData.dailyApiKey = apiKey
    }
    if (domain !== undefined) {
      updateData.dailyDomain = domain
    }
    if (enabled !== undefined) {
      updateData.dailyEnabled = enabled
    }

    await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        dailyApiKey: apiKey && !apiKey.startsWith('***') ? apiKey : null,
        dailyDomain: domain || null,
        dailyEnabled: enabled ?? false,
      },
    })

    // Invalidate cache
    invalidateDailyCache()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating Daily config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Daily Konfiguration' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/video-call
 * Test Daily.co connection (Admin only)
 */
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }

    // Test the connection
    const result = await testConnection()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error testing Daily connection:', error)
    return NextResponse.json(
      { success: false, message: 'Verbindungstest fehlgeschlagen' },
      { status: 500 }
    )
  }
}


