/**
 * OAuth Start Route
 * 
 * GET /api/social/oauth/[platform]
 * Startet den OAuth-Flow für eine Plattform
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateOAuthState, encryptToken } from '@/lib/social/crypto'
import { instagramProvider } from '@/lib/social/providers/instagram'
import { facebookProvider } from '@/lib/social/providers/facebook'
import type { SocialProvider } from '@/lib/social/types'
import { cookies } from 'next/headers'

const PROVIDERS: Record<string, SocialProvider> = {
  instagram: instagramProvider,
  facebook: facebookProvider,
}

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
    const provider = PROVIDERS[platform.toLowerCase()]
    
    if (!provider) {
      return NextResponse.json(
        { error: `Plattform "${platform}" wird nicht unterstützt` },
        { status: 400 }
      )
    }
    
    // State generieren (enthält User-ID und Platform für Callback)
    const stateData = {
      userId: session.user.id,
      platform: platform.toLowerCase(),
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

