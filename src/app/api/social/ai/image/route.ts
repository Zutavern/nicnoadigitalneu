/**
 * AI Image Generation Route
 * 
 * POST /api/social/ai/image
 * Generiert Bilder für Social Media Posts via OpenRouter
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'
import { 
  PLATFORM_IMAGE_FORMATS, 
  getDefaultFormat, 
  getAIPromptSuffix,
  type ImageFormat 
} from '@/lib/social/image-formats'

// OpenRouter Config
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

// Unterstützte Bildmodelle über OpenRouter
const IMAGE_MODELS = {
  'dall-e-3': 'openai/dall-e-3',
  'sdxl': 'stabilityai/stable-diffusion-xl-base-1.0',
  'flux': 'black-forest-labs/flux-schnell',
} as const

interface GenerateImageRequest {
  prompt: string
  platform: string
  format?: string // z.B. 'feed_square', 'story'
  model?: keyof typeof IMAGE_MODELS
  style?: 'vivid' | 'natural' | 'artistic'
  industry?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API Key nicht konfiguriert' },
        { status: 500 }
      )
    }
    
    const body: GenerateImageRequest = await request.json()
    const { prompt, platform, format, model = 'dall-e-3', style = 'vivid', industry } = body
    
    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: 'Prompt ist erforderlich' },
        { status: 400 }
      )
    }
    
    // Format bestimmen
    const platformFormats = PLATFORM_IMAGE_FORMATS[platform.toUpperCase()]
    let imageFormat: ImageFormat | null = null
    
    if (platformFormats && format) {
      imageFormat = platformFormats.formats[format] || null
    }
    
    if (!imageFormat) {
      imageFormat = getDefaultFormat(platform.toUpperCase())
    }
    
    // Fallback Format
    if (!imageFormat) {
      imageFormat = {
        width: 1080,
        height: 1080,
        ratio: '1:1',
        name: 'Default',
        description: 'Quadratisches Bild',
      }
    }
    
    // Enhanced Prompt erstellen
    const platformSuffix = getAIPromptSuffix(platform.toUpperCase(), imageFormat)
    const industryContext = industry ? `Context: ${industry} business. ` : ''
    const styleHint = style === 'vivid' 
      ? 'Vibrant, eye-catching colors. ' 
      : style === 'natural' 
        ? 'Natural, realistic style. ' 
        : 'Artistic, creative interpretation. '
    
    const enhancedPrompt = `${industryContext}${styleHint}${prompt}. ${platformSuffix} High quality, professional photography or illustration.`
    
    // OpenRouter API Call für Bildgenerierung
    const modelId = IMAGE_MODELS[model]
    
    let imageUrl: string
    let generationMethod: string
    
    // DALL-E 3 über OpenRouter
    if (model === 'dall-e-3') {
      const response = await fetch(`${OPENROUTER_BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'NICNOA Social Media',
        },
        body: JSON.stringify({
          model: modelId,
          prompt: enhancedPrompt,
          n: 1,
          size: getDalleSize(imageFormat),
          quality: 'standard',
          style: style === 'artistic' ? 'vivid' : style,
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[AI Image] OpenRouter Error:', errorText)
        throw new Error(`Bildgenerierung fehlgeschlagen: ${errorText}`)
      }
      
      const data = await response.json()
      imageUrl = data.data?.[0]?.url
      generationMethod = 'dall-e-3'
    } else {
      // Andere Modelle: Chat Completion mit Bildbeschreibung
      // Da nicht alle Modelle direkt Bilder generieren, 
      // nutzen wir einen Fallback-Ansatz
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'NICNOA Social Media',
        },
        body: JSON.stringify({
          model: 'openai/dall-e-3', // Fallback zu DALL-E 3
          messages: [
            {
              role: 'user',
              content: enhancedPrompt,
            },
          ],
        }),
      })
      
      if (!response.ok) {
        throw new Error('Bildgenerierung fehlgeschlagen')
      }
      
      const data = await response.json()
      imageUrl = data.data?.[0]?.url || data.choices?.[0]?.message?.content
      generationMethod = 'fallback-dall-e-3'
    }
    
    if (!imageUrl) {
      throw new Error('Keine Bild-URL in der Antwort')
    }
    
    // Bild in Vercel Blob speichern
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Bild konnte nicht heruntergeladen werden')
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const timestamp = Date.now()
    const fileName = `ai-image-${session.user.id}-${timestamp}.png`
    
    const blob = await put(`social/ai-images/${fileName}`, imageBuffer, {
      access: 'public',
      contentType: 'image/png',
    })
    
    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
      originalUrl: imageUrl,
      prompt: enhancedPrompt,
      format: imageFormat,
      platform: platform.toUpperCase(),
      model: generationMethod,
      dimensions: {
        width: imageFormat.width,
        height: imageFormat.height,
        ratio: imageFormat.ratio,
      },
    })
  } catch (error) {
    console.error('[AI Image] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Bildgenerierung fehlgeschlagen' },
      { status: 500 }
    )
  }
}

/**
 * Konvertiert unser Format zu DALL-E Größen
 */
function getDalleSize(format: ImageFormat): '1024x1024' | '1792x1024' | '1024x1792' {
  const ratio = format.width / format.height
  
  if (ratio > 1.3) {
    return '1792x1024' // Landscape
  } else if (ratio < 0.77) {
    return '1024x1792' // Portrait
  }
  return '1024x1024' // Square
}

/**
 * GET: Verfügbare Modelle und Formate abrufen
 */
export async function GET() {
  return NextResponse.json({
    models: Object.keys(IMAGE_MODELS),
    platforms: Object.keys(PLATFORM_IMAGE_FORMATS),
    formats: PLATFORM_IMAGE_FORMATS,
    styles: ['vivid', 'natural', 'artistic'],
  })
}

