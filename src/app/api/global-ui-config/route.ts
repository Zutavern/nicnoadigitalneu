import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let config = await prisma.globalUIConfig.findUnique({
      where: { id: 'default' },
    })

    // Create default if not exists
    if (!config) {
      config = await prisma.globalUIConfig.create({
        data: { id: 'default' },
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching GlobalUIConfig:', error)
    return NextResponse.json(
      { error: 'Failed to fetch UI config' },
      { status: 500 }
    )
  }
}


