/**
 * AI Image Generation Route
 * 
 * POST /api/social/ai/image
 * Generiert Bilder für Social Media Posts via OpenRouter
 * 
 * Verwendet den chat/completions Endpoint mit modalities: ["image", "text"]
 * gemäß OpenRouter Dokumentation
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

// Unterstützte Bildmodelle über OpenRouter (mit image output_modalities)
const IMAGE_MODELS = {
  'gemini-flash': 'google/gemini-2.0-flash-exp:free',
  'gemini-image': 'google/gemini-2.5-flash-preview-05-20',
  'flux-pro': 'black-forest-labs/flux-1.1-pro',
  'flux-schnell': 'black-forest-labs/flux-schnell:free',
} as const

interface GenerateImageRequest {
  prompt?: string
  postContent?: string // Generiert automatisch Prompt aus Post-Inhalt
  platform: string
  format?: string // z.B. 'feed_square', 'story'
  model?: keyof typeof IMAGE_MODELS
  style?: 'vivid' | 'natural' | 'artistic'
  industry?: string
}

/**
 * Generiert einen optimierten Bildprompt aus dem Post-Inhalt
 */
function generateImagePromptFromContent(
  postContent: string, 
  platform: string,
  style: string,
  industry: string,
  imageFormat: ImageFormat
): string {
  // Extrahiere Hauptthema aus dem Post-Inhalt
  const cleanContent = postContent
    .replace(/#\w+/g, '') // Hashtags entfernen
    .replace(/https?:\/\/\S+/g, '') // URLs entfernen
    .replace(/\n+/g, ' ') // Zeilenumbrüche
    .trim()
    .slice(0, 300) // Auf 300 Zeichen begrenzen
  
  // Style-spezifische Anweisungen
  const styleInstructions = {
    vivid: 'Vibrant, eye-catching colors with high contrast and saturation.',
    natural: 'Natural, realistic photography style with soft lighting.',
    artistic: 'Artistic, creative interpretation with unique visual elements.',
  }
  
  // Plattform-spezifische Anweisungen
  const platformInstructions = {
    INSTAGRAM: 'Optimized for Instagram feed - visually striking, lifestyle-focused.',
    FACEBOOK: 'Suitable for Facebook - engaging, shareable content.',
    LINKEDIN: 'Professional and business-appropriate for LinkedIn.',
    TWITTER: 'Bold and attention-grabbing for Twitter/X feed.',
    TIKTOK: 'Trendy, dynamic visual style for TikTok.',
    YOUTUBE: 'High-quality thumbnail style for YouTube.',
  }
  
  const platformSuffix = getAIPromptSuffix(platform, imageFormat)
  const platformHint = platformInstructions[platform as keyof typeof platformInstructions] || ''
  const styleHint = styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.vivid
  
  return `Create a professional ${industry} related image. 
Context: "${cleanContent}"
Style: ${styleHint}
Platform: ${platformHint}
${platformSuffix}
High quality, professional photography or illustration. No text overlays. Clean composition.`
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API Key nicht konfiguriert. Bitte OPENROUTER_API_KEY in .env setzen.' },
        { status: 500 }
      )
    }
    
    const body: GenerateImageRequest = await request.json()
    const { 
      prompt, 
      postContent, 
      platform, 
      format, 
      model = 'flux-schnell', // Kostenloses Modell als Default
      style = 'vivid', 
      industry = 'Beauty/Salon' 
    } = body
    
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
    
    // Prompt generieren - entweder direkt oder aus Post-Inhalt
    let finalPrompt: string
    
    if (prompt?.trim()) {
      // Direkter Prompt wurde angegeben
      const platformSuffix = getAIPromptSuffix(platform.toUpperCase(), imageFormat)
      finalPrompt = `${prompt}. ${platformSuffix} High quality, professional.`
    } else if (postContent?.trim()) {
      // Prompt aus Post-Inhalt generieren
      finalPrompt = generateImagePromptFromContent(
        postContent,
        platform.toUpperCase(),
        style,
        industry,
        imageFormat
      )
    } else {
      return NextResponse.json(
        { error: 'Entweder prompt oder postContent ist erforderlich' },
        { status: 400 }
      )
    }
    
    console.log('[AI Image] Using model:', IMAGE_MODELS[model])
    console.log('[AI Image] Final prompt:', finalPrompt.slice(0, 200) + '...')
    
    // OpenRouter API Call - korrekt mit chat/completions und modalities
    const modelId = IMAGE_MODELS[model]
    
    // Aspect Ratio für Gemini/Flux
    const aspectRatio = imageFormat.width > imageFormat.height 
      ? '16:9' 
      : imageFormat.width < imageFormat.height 
        ? '9:16' 
        : '1:1'
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'NICNOA Social Media',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'user',
            content: finalPrompt,
          },
        ],
        modalities: ['image', 'text'],
        // Image config für Gemini-Modelle
        ...(model.startsWith('gemini') && {
          image_config: {
            aspect_ratio: aspectRatio,
          },
        }),
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[AI Image] OpenRouter Error:', response.status, errorText)
      
      // Detaillierte Fehlermeldung
      let errorMessage = 'Bildgenerierung fehlgeschlagen'
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage
      } catch {
        errorMessage = errorText.slice(0, 200)
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('[AI Image] Response structure:', JSON.stringify(data).slice(0, 500))
    
    // Bild-URL aus der Antwort extrahieren
    // OpenRouter gibt Bilder in message.images[] zurück
    let imageDataUrl: string | null = null
    
    const message = data.choices?.[0]?.message
    if (message?.images && message.images.length > 0) {
      // Neues Format: images Array
      imageDataUrl = message.images[0]?.image_url?.url
    } else if (message?.content && message.content.startsWith('data:image')) {
      // Falls das Bild direkt im content ist
      imageDataUrl = message.content
    }
    
    if (!imageDataUrl) {
      console.error('[AI Image] No image in response:', JSON.stringify(data))
      return NextResponse.json(
        { 
          error: 'Keine Bilddaten in der Antwort',
          hint: 'Das gewählte Modell unterstützt möglicherweise keine Bildgenerierung. Versuche ein anderes Modell.',
          availableModels: Object.keys(IMAGE_MODELS)
        },
        { status: 500 }
      )
    }
    
    // Base64 Bild in Vercel Blob speichern
    let blobUrl: string
    
    if (imageDataUrl.startsWith('data:image')) {
      // Base64 Data URL - in Buffer konvertieren
      const base64Data = imageDataUrl.split(',')[1]
      const imageBuffer = Buffer.from(base64Data, 'base64')
      
      // Content-Type aus Data URL extrahieren
      const contentType = imageDataUrl.match(/data:([^;]+);/)?.[1] || 'image/png'
      const extension = contentType.split('/')[1] || 'png'
      
      const timestamp = Date.now()
      const fileName = `ai-image-${session.user.id}-${timestamp}.${extension}`
      
      const blob = await put(`social/ai-images/${fileName}`, imageBuffer, {
        access: 'public',
        contentType,
      })
      
      blobUrl = blob.url
    } else {
      // Falls es eine URL ist, herunterladen und speichern
      const imageResponse = await fetch(imageDataUrl)
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
      
      blobUrl = blob.url
    }
    
    return NextResponse.json({
      success: true,
      imageUrl: blobUrl,
      prompt: finalPrompt,
      format: imageFormat,
      platform: platform.toUpperCase(),
      model: model,
      dimensions: {
        width: imageFormat.width,
        height: imageFormat.height,
        ratio: imageFormat.ratio,
      },
    })
  } catch (error) {
    console.error('[AI Image] Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Bildgenerierung fehlgeschlagen',
        hint: 'Prüfe die Konsole für Details'
      },
      { status: 500 }
    )
  }
}

/**
 * GET: Verfügbare Modelle und Formate abrufen
 */
export async function GET() {
  return NextResponse.json({
    models: Object.entries(IMAGE_MODELS).map(([key, value]) => ({
      id: key,
      modelId: value,
      name: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      free: value.includes(':free'),
    })),
    platforms: Object.keys(PLATFORM_IMAGE_FORMATS),
    formats: PLATFORM_IMAGE_FORMATS,
    styles: [
      { id: 'vivid', name: 'Lebendig', description: 'Kräftige, auffällige Farben' },
      { id: 'natural', name: 'Natürlich', description: 'Realistischer Look' },
      { id: 'artistic', name: 'Künstlerisch', description: 'Kreative Interpretation' },
    ],
  })
}
