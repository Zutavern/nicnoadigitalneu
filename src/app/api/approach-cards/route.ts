import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Öffentliche API für aktive Approach Cards
export async function GET() {
  try {
    const cards = await prisma.$queryRaw`
      SELECT 
        id, title, description, icon_name as "iconName",
        sort_order as "sortOrder"
      FROM approach_cards
      WHERE is_active = true
      ORDER BY sort_order ASC, created_at DESC
    ` as any[]

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching approach cards:', error)
    return NextResponse.json([]) // Leeres Array bei Fehler
  }
}

