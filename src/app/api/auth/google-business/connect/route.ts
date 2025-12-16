import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { googleBusinessTokenService } from '@/lib/google-business/token-service'
import crypto from 'crypto'

// Check if Google Business API is configured
function isGoogleBusinessConfigured(): boolean {
  return !!(
    process.env.GOOGLE_BUSINESS_CLIENT_ID &&
    process.env.GOOGLE_BUSINESS_CLIENT_SECRET &&
    process.env.GOOGLE_BUSINESS_REDIRECT_URI
  )
}

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Check if Google Business is configured
    if (!isGoogleBusinessConfigured()) {
      return NextResponse.json(
        { 
          error: 'Google Business API nicht konfiguriert',
          message: 'Die Google Business Integration ist noch nicht eingerichtet. Bitte kontaktieren Sie den Administrator.'
        },
        { status: 503 }
      )
    }

    // Generate state token to prevent CSRF
    const state = crypto.randomBytes(32).toString('hex')
    
    // Store state in cookie for validation
    const authUrl = googleBusinessTokenService.getAuthorizationUrl(state)
    
    const response = NextResponse.redirect(authUrl)
    
    // Set state cookie (expires in 10 minutes)
    response.cookies.set('google_business_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })
    
    // Store user ID for callback
    response.cookies.set('google_business_user', session.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error initiating Google Business connect:', error)
    return NextResponse.json(
      { error: 'Fehler beim Starten der Google-Verbindung' },
      { status: 500 }
    )
  }
}

