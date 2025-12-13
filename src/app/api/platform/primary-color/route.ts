import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Public API Route - Gibt die primaryColor aus PlatformSettings zurück
 */
export async function GET() {
  try {
    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
      select: { primaryColor: true },
    })

    return NextResponse.json({
      primaryColor: settings?.primaryColor || '#3B82F6', // Default: Blau
    })
  } catch (error) {
    console.error('Fehler beim Abrufen der Primary-Color:', error)
    return NextResponse.json(
      { primaryColor: '#3B82F6' }, // Fallback
      { status: 500 }
    )
  }
}







