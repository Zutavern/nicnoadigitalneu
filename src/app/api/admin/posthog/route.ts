import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Fetch PostHog config (admin only)
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const settings = await prisma.platformSettings.findFirst()

    return NextResponse.json({
      hasApiKey: !!settings?.posthogApiKey,
      hasPersonalApiKey: !!settings?.posthogPersonalApiKey,
      posthogHost: settings?.posthogHost || 'https://eu.i.posthog.com',
      posthogProjectId: settings?.posthogProjectId || '',
      posthogEnabled: settings?.posthogEnabled || false,
    })
  } catch (error) {
    console.error('Error fetching PostHog config:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// PUT: Update PostHog config (admin only)
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const data = await request.json()

    // Build update object, only including fields that were provided
    const updateData: Record<string, unknown> = {}

    if (data.posthogApiKey !== undefined) {
      updateData.posthogApiKey = data.posthogApiKey
    }
    if (data.posthogPersonalApiKey !== undefined) {
      updateData.posthogPersonalApiKey = data.posthogPersonalApiKey
    }
    if (data.posthogHost !== undefined) {
      updateData.posthogHost = data.posthogHost
    }
    if (data.posthogProjectId !== undefined) {
      updateData.posthogProjectId = data.posthogProjectId
    }
    if (data.posthogEnabled !== undefined) {
      updateData.posthogEnabled = data.posthogEnabled
    }

    const settings = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData,
      },
    })

    return NextResponse.json({
      success: true,
      hasApiKey: !!settings.posthogApiKey,
      hasPersonalApiKey: !!settings.posthogPersonalApiKey,
      posthogEnabled: settings.posthogEnabled,
    })
  } catch (error) {
    console.error('Error updating PostHog config:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


