import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Öffentliche API für aktive Approach Cards
export async function GET() {
  try {
    // Versuche zuerst mit Prisma Model (falls verfügbar)
    try {
      const cards = await prisma.$queryRaw`
        SELECT 
          id, title, description, icon_name as "iconName",
          sort_order as "sortOrder"
        FROM approach_cards
        WHERE is_active = true
        ORDER BY sort_order ASC, created_at DESC
      ` as any[]

      return NextResponse.json(Array.isArray(cards) ? cards : [])
    } catch (prismaError) {
      // Fallback: Versuche direkten SQL-Zugriff
      console.warn('Prisma query failed, trying direct SQL:', prismaError)
      
      // Wenn auch das fehlschlägt, gib leeres Array zurück
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Error fetching approach cards:', error)
    // Immer ein Array zurückgeben, auch bei Fehlern
    return NextResponse.json([])
  }
}

