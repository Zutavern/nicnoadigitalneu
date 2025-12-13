import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/languages/active - Öffentliche Route für aktive Sprachen
export async function GET() {
  try {
    const dbLanguages = await prisma.language.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,  // id ist der Sprach-Code (z.B. "de", "en")
        name: true,
        nativeName: true,
        flag: true,
        isDefault: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { nativeName: 'asc' },
      ],
    })

    // Transformiere zu erwarteter Struktur mit 'code' Feld
    const languages = dbLanguages.map(lang => ({
      ...lang,
      code: lang.id,  // code = id für Kompatibilität mit Frontend
    }))

    return NextResponse.json({ languages })
  } catch (error) {
    console.error('Error fetching active languages:', error)
    return NextResponse.json({ languages: [] })
  }
}


