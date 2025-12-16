import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { shouldShowDemoMode } from '@/lib/premium'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({
        showDemo: true,
        reason: 'not_premium',
        isPremium: false,
        isConnected: false
      })
    }

    const status = await shouldShowDemoMode(session.user.id)

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error getting demo status:', error)
    return NextResponse.json({
      showDemo: true,
      reason: 'not_premium',
      isPremium: false,
      isConnected: false
    })
  }
}

