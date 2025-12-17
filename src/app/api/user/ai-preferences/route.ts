/**
 * API Route: User AI Preferences
 * 
 * GET  - Holt die AI-Präferenzen des Nutzers
 * PATCH - Speichert die AI-Präferenzen des Nutzers
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Standard-Modell wenn nichts gespeichert ist
const DEFAULT_MODEL = 'flux-schnell'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      // Für nicht eingeloggte Nutzer: Default zurückgeben
      return NextResponse.json({ 
        preferredAiImageModel: DEFAULT_MODEL 
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredAiImageModel: true }
    })

    return NextResponse.json({ 
      preferredAiImageModel: user?.preferredAiImageModel || DEFAULT_MODEL 
    })

  } catch (error) {
    console.error('Error fetching AI preferences:', error)
    return NextResponse.json(
      { preferredAiImageModel: DEFAULT_MODEL },
      { status: 200 } // Kein Fehler zurückgeben, einfach Default
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht angemeldet' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { preferredAiImageModel } = body

    // Validierung: Nur erlaubte Modell-IDs
    const allowedModels = [
      'flux-schnell',
      'flux-pro-11',
      'imagen-4',
      'imagen-4-fast',
      'ideogram-v3-turbo',
      'seedream-4',
      'qwen-image',
      'nano-banana-pro',
      'flux-kontext-max'
    ]

    if (!allowedModels.includes(preferredAiImageModel)) {
      return NextResponse.json(
        { error: 'Ungültiges Modell' },
        { status: 400 }
      )
    }

    // User updaten
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { preferredAiImageModel },
      select: { preferredAiImageModel: true }
    })

    return NextResponse.json({ 
      success: true,
      preferredAiImageModel: updatedUser.preferredAiImageModel 
    })

  } catch (error) {
    console.error('Error saving AI preferences:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern' },
      { status: 500 }
    )
  }
}

