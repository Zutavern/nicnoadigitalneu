/**
 * OAuth Start Route
 * 
 * GET /api/social/oauth/[platform]
 * Startet den OAuth-Flow für eine Plattform
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { encryptToken } from '@/lib/social/crypto'
import { SOCIAL_PROVIDERS } from '@/lib/social'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const { platform } = await params
    const platformKey = platform.toUpperCase()
    const provider = SOCIAL_PROVIDERS[platformKey]
    
    if (!provider) {
      return NextResponse.json(
        { error: `Plattform "${platform}" wird nicht unterstützt. Verfügbar: ${Object.keys(SOCIAL_PROVIDERS).join(', ')}` },
        { status: 400 }
      )
    }
    
    // State generieren (enthält User-ID und Platform für Callback)
    const stateData = {
      userId: session.user.id,
      platform: platformKey,
      timestamp: Date.now(),
    }
    
    const state = encryptToken(JSON.stringify(stateData))
    
    // State in Cookie speichern für Validierung
    const cookieStore = await cookies()
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 Minuten
      path: '/',
    })
    
    // Redirect URI erstellen
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/social/oauth/callback`
    
    // Auth URL generieren
    const authUrl = provider.generateAuthUrl({
      redirectUri,
      state,
    })
    
    // Redirect zur OAuth-Seite
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('[OAuth Start] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Starten des OAuth-Flows' },
      { status: 500 }
    )
  }
}
