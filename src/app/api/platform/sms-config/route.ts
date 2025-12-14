import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/platform/sms-config
 * 
 * Öffentlicher Endpoint, der zurückgibt ob SMS-Verifizierung aktiviert ist.
 * Wird von der Registrierungsseite verwendet, um zu entscheiden ob
 * SMS-Verifizierung durchgeführt werden soll.
 */
export async function GET() {
  try {
    const settings = await prisma.platformSettings.findFirst()

    // Type-safe access
    const sevenIoEnabled = (settings as Record<string, unknown> | null)?.sevenIoEnabled === true
    const sevenIoSenderId = ((settings as Record<string, unknown> | null)?.sevenIoSenderId as string) || 'NICNOA'

    return NextResponse.json({
      enabled: sevenIoEnabled,
      senderId: sevenIoSenderId,
    })
  } catch (error) {
    console.error('Error fetching SMS config:', error)
    return NextResponse.json({
      enabled: false,
      senderId: 'NICNOA',
    })
  }
}

