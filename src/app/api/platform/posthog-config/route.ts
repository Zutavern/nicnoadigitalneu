import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Public endpoint to get PostHog config (no auth required)
// Only returns non-sensitive data (no API keys)
export async function GET() {
  try {
    const settings = await prisma.platformSettings.findFirst()

    if (!settings) {
      return NextResponse.json({
        enabled: false,
        apiKey: '',
        host: 'https://eu.i.posthog.com',
      })
    }

    // Only return public config - NEVER expose the personal API key
    return NextResponse.json({
      enabled: settings.posthogEnabled,
      apiKey: settings.posthogApiKey || '',
      host: settings.posthogHost || 'https://eu.i.posthog.com',
    })
  } catch (error) {
    console.error('Error fetching PostHog config:', error)
    return NextResponse.json({
      enabled: false,
      apiKey: '',
      host: 'https://eu.i.posthog.com',
    })
  }
}


