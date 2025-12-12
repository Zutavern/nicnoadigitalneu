import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// POST /api/admin/settings/test-deepl - DeepL API Key testen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { apiKey } = await request.json()
    
    if (!apiKey || apiKey === '••••••••••••••••') {
      return NextResponse.json({ 
        valid: false, 
        error: 'Bitte gib einen API Key ein' 
      })
    }

    // DeepL API URL (Free vs Pro)
    const apiUrl = apiKey.endsWith(':fx')
      ? 'https://api-free.deepl.com/v2/usage'
      : 'https://api.deepl.com/v2/usage'

    // Test-Request an DeepL senden
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
      },
    })

    if (!response.ok) {
      const status = response.status
      let errorMessage = 'Ungültiger API Key'
      
      if (status === 403) {
        errorMessage = 'API Key ungültig oder abgelaufen'
      } else if (status === 456) {
        errorMessage = 'Kontingent aufgebraucht'
      } else if (status === 429) {
        errorMessage = 'Zu viele Anfragen - bitte später erneut versuchen'
      }
      
      return NextResponse.json({ 
        valid: false, 
        error: errorMessage,
        statusCode: status
      })
    }

    const data = await response.json()
    
    // Berechne verbleibende Zeichen
    const used = data.character_count || 0
    const limit = data.character_limit || 0
    const remaining = limit - used
    const percentUsed = limit > 0 ? Math.round((used / limit) * 100) : 0

    return NextResponse.json({
      valid: true,
      message: `API Key gültig! ${remaining.toLocaleString()} Zeichen verfügbar (${percentUsed}% verwendet)`,
      usage: {
        characterCount: used,
        characterLimit: limit,
        remaining,
        percentUsed,
      }
    })
  } catch (error) {
    console.error('Error testing DeepL API key:', error)
    return NextResponse.json(
      { 
        valid: false, 
        error: 'Verbindungsfehler - bitte später erneut versuchen' 
      },
      { status: 500 }
    )
  }
}
