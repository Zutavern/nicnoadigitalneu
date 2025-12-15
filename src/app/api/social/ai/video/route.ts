/**
 * Video-Generierung API Route
 * 
 * POST: Generiert ein Video mit Replicate
 * GET: Holt verfügbare Modelle und Status
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'
import {
  isReplicateEnabled,
  generateVideoFromText,
  generateVideoFromImage,
  getReplicateConfig,
} from '@/lib/replicate'
import { getAvailableVideoModels, getVideoModelsByType } from '@/lib/replicate/models'
import { getCreditBalance, deductCredits, hasEnoughCredits } from '@/lib/credits'

interface GenerateVideoRequest {
  prompt: string
  type?: 'text-to-video' | 'image-to-video'
  imageUrl?: string
  model?: string
  optimizePrompt?: boolean
}

/**
 * POST: Video generieren
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Prüfe ob Replicate aktiviert ist
    const enabled = await isReplicateEnabled()
    if (!enabled) {
      return NextResponse.json(
        { 
          error: 'Video-Generierung nicht verfügbar',
          hint: 'Replicate ist nicht aktiviert. Bitte unter Admin → Einstellungen → Integrationen aktivieren.'
        },
        { status: 503 }
      )
    }

    const body: GenerateVideoRequest = await request.json()
    const { prompt, type = 'text-to-video', imageUrl, model, optimizePrompt = true } = body

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: 'Prompt ist erforderlich' },
        { status: 400 }
      )
    }

    if (type === 'image-to-video' && !imageUrl) {
      return NextResponse.json(
        { error: 'Bild-URL ist für Bild-zu-Video erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe Credits (Video = 50 Credits)
    const requiredCredits = 50
    const hasCredits = await hasEnoughCredits(session.user.id, requiredCredits)
    
    if (!hasCredits) {
      const balance = await getCreditBalance(session.user.id)
      return NextResponse.json(
        { 
          error: 'Nicht genügend Credits',
          hint: `Du benötigst ${requiredCredits} Credits für ein Video. Aktuell: ${balance.toFixed(0)} Credits.`,
          balance,
          required: requiredCredits,
        },
        { status: 402 }
      )
    }

    console.log(`[Video Gen] Starting ${type} generation for user ${session.user.id}`)
    console.log(`[Video Gen] Model: ${model || 'default'}`)
    console.log(`[Video Gen] Prompt: ${prompt.slice(0, 100)}...`)
    console.log(`[Video Gen] This may take 2-5 minutes...`)

    let result: { videoUrl: string; prediction: { id: string } }

    // Generiere Video (kann bis zu 5 Minuten dauern!)
    if (type === 'image-to-video' && imageUrl) {
      console.log(`[Video Gen] Using image-to-video with image: ${imageUrl.slice(0, 50)}...`)
      result = await generateVideoFromImage(imageUrl, prompt, {
        modelKey: model,
        userId: session.user.id,
        userType: 'salon_owner', // TODO: Dynamisch aus Session
      })
    } else {
      console.log(`[Video Gen] Using text-to-video`)
      result = await generateVideoFromText(prompt, {
        modelKey: model,
        optimizePrompt,
        userId: session.user.id,
        userType: 'salon_owner',
      })
    }

    console.log(`[Video Gen] Video generated! URL: ${result.videoUrl}`)
    console.log(`[Video Gen] Prediction ID: ${result.prediction.id}`)

    // Lade Video herunter und speichere in Blob
    console.log(`[Video Gen] Downloading video from Replicate...`)
    const videoResponse = await fetch(result.videoUrl)
    if (!videoResponse.ok) {
      console.error(`[Video Gen] Download failed: ${videoResponse.status}`)
      throw new Error(`Video konnte nicht heruntergeladen werden (Status: ${videoResponse.status})`)
    }

    const videoBuffer = await videoResponse.arrayBuffer()
    const videoSizeKB = Math.round(videoBuffer.byteLength / 1024)
    console.log(`[Video Gen] Downloaded ${videoSizeKB}KB`)

    const timestamp = Date.now()
    const fileName = `video-${session.user.id}-${timestamp}.mp4`

    console.log(`[Video Gen] Uploading to Vercel Blob...`)
    const blob = await put(`social/videos/${fileName}`, videoBuffer, {
      access: 'public',
      contentType: 'video/mp4',
    })

    console.log(`[Video Gen] Uploaded to: ${blob.url}`)

    // Ziehe Credits ab
    const creditResult = await deductCredits(
      session.user.id,
      requiredCredits,
      'video_generation',
      `Video-Generierung: ${prompt.slice(0, 50)}...`
    )

    console.log(`[Video Gen] ✅ Success! Saved to: ${blob.url}`)
    console.log(`[Video Gen] Credits deducted: ${requiredCredits}, new balance: ${creditResult.newBalance}`)

    return NextResponse.json({
      success: true,
      videoUrl: blob.url,
      originalUrl: result.videoUrl,
      predictionId: result.prediction.id,
      prompt,
      model: model || 'default',
      credits: {
        used: requiredCredits,
        newBalance: creditResult.newBalance,
      },
    })

  } catch (error) {
    console.error('[Video Gen] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Video-Generierung fehlgeschlagen' },
      { status: 500 }
    )
  }
}

/**
 * GET: Verfügbare Modelle und Konfiguration
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const config = await getReplicateConfig()
    const enabled = await isReplicateEnabled()
    const allModels = getAvailableVideoModels()
    const textToVideoModels = getVideoModelsByType('text-to-video')
    const imageToVideoModels = getVideoModelsByType('image-to-video')
    const imageAnimationModels = getVideoModelsByType('image-animation')

    // Hole Credit-Balance
    const creditBalance = await getCreditBalance(session.user.id)

    return NextResponse.json({
      enabled,
      defaultModel: config.defaultVideoModel,
      creditBalance,
      requiredCredits: 50, // Pro Video
      models: {
        all: allModels,
        textToVideo: textToVideoModels,
        imageToVideo: [...imageToVideoModels, ...imageAnimationModels],
      },
      limits: {
        maxPromptLength: 1000,
        maxVideoDuration: 10, // Sekunden
      },
    })

  } catch (error) {
    console.error('[Video Gen] GET Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Konfiguration' },
      { status: 500 }
    )
  }
}

