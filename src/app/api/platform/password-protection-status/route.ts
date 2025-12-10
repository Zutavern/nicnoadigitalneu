import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/platform/password-protection-status - Prüfe ob Passwort-Schutz aktiviert ist
export async function GET() {
  try {
    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
      select: { passwordProtectionEnabled: true }
    })

    // Wenn keine Einstellungen existieren, Standard: aktiviert
    const enabled = settings?.passwordProtectionEnabled ?? true

    return NextResponse.json({ enabled })
  } catch (error) {
    console.error('Error fetching password protection status:', error)
    // Bei Fehler: Standardmäßig aktiviert
    return NextResponse.json({ enabled: true })
  }
}





