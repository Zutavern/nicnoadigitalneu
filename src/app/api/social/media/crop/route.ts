/**
 * Image Crop Route
 * 
 * POST /api/social/media/crop
 * Schneidet Bilder für verschiedene Plattformen zu
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'
import { 
  PLATFORM_IMAGE_FORMATS, 
  getDefaultFormat,
  type ImageFormat 
} from '@/lib/social/image-formats'

// Sharp wird dynamisch importiert für Edge-Kompatibilität
let sharp: typeof import('sharp') | null = null

async function getSharp() {
  if (!sharp) {
    sharp = (await import('sharp')).default
  }
  return sharp
}

interface CropRequest {
  imageUrl: string
  platform: string
  format?: string
  cropArea?: {
    x: number
    y: number
    width: number
    height: number
  }
  quality?: number
}

interface CropResult {
  platform: string
  format: string
  url: string
  width: number
  height: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const body: CropRequest = await request.json()
    const { imageUrl, platform, format, cropArea, quality = 90 } = body
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl ist erforderlich' },
        { status: 400 }
      )
    }
    
    // Bild herunterladen
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Bild konnte nicht geladen werden' },
        { status: 400 }
      )
    }
    
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    
    // Sharp laden
    const sharpInstance = await getSharp()
    
    // Bild-Metadaten abrufen
    const metadata = await sharpInstance(imageBuffer).metadata()
    const originalWidth = metadata.width || 1080
    const originalHeight = metadata.height || 1080
    
    // Format bestimmen
    let targetFormat: ImageFormat | null = null
    const platformKey = platform.toUpperCase()
    
    if (format && PLATFORM_IMAGE_FORMATS[platformKey]) {
      targetFormat = PLATFORM_IMAGE_FORMATS[platformKey].formats[format]
    }
    
    if (!targetFormat) {
      targetFormat = getDefaultFormat(platformKey)
    }
    
    if (!targetFormat) {
      targetFormat = {
        width: 1080,
        height: 1080,
        ratio: '1:1',
        name: 'Default',
        description: 'Standard Format',
      }
    }
    
    // Verarbeitung starten
    let processedImage = sharpInstance(imageBuffer)
    
    // Wenn ein Crop-Bereich angegeben ist, diesen zuerst anwenden
    if (cropArea) {
      processedImage = processedImage.extract({
        left: Math.round(cropArea.x),
        top: Math.round(cropArea.y),
        width: Math.round(cropArea.width),
        height: Math.round(cropArea.height),
      })
    }
    
    // Auf Zielgröße resizen
    processedImage = processedImage
      .resize(targetFormat.width, targetFormat.height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality })
    
    const outputBuffer = await processedImage.toBuffer()
    
    // In Vercel Blob speichern
    const timestamp = Date.now()
    const fileName = `${session.user.id}-${platformKey.toLowerCase()}-${format || 'default'}-${timestamp}.jpg`
    const blobPath = `social/cropped/${fileName}`
    
    const blob = await put(blobPath, outputBuffer, {
      access: 'public',
      contentType: 'image/jpeg',
    })
    
    return NextResponse.json({
      success: true,
      result: {
        platform: platformKey,
        format: format || 'default',
        url: blob.url,
        width: targetFormat.width,
        height: targetFormat.height,
      } as CropResult,
      original: {
        width: originalWidth,
        height: originalHeight,
        url: imageUrl,
      },
    })
  } catch (error) {
    console.error('[Image Crop] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Crop fehlgeschlagen' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/social/media/crop/batch
 * Erstellt alle Formate für eine Plattform
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const body = await request.json()
    const { imageUrl, platforms, quality = 90 } = body as {
      imageUrl: string
      platforms: string[]
      quality?: number
    }
    
    if (!imageUrl || !platforms?.length) {
      return NextResponse.json(
        { error: 'imageUrl und platforms sind erforderlich' },
        { status: 400 }
      )
    }
    
    // Bild herunterladen
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Bild konnte nicht geladen werden' },
        { status: 400 }
      )
    }
    
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    const sharpInstance = await getSharp()
    
    const results: Record<string, Record<string, CropResult>> = {}
    
    // Für jede Plattform alle Formate generieren
    for (const platform of platforms) {
      const platformKey = platform.toUpperCase()
      const platformFormats = PLATFORM_IMAGE_FORMATS[platformKey]
      
      if (!platformFormats) continue
      
      results[platformKey] = {}
      
      for (const [formatKey, targetFormat] of Object.entries(platformFormats.formats)) {
        try {
          const outputBuffer = await sharpInstance(imageBuffer)
            .resize(targetFormat.width, targetFormat.height, {
              fit: 'cover',
              position: 'center',
            })
            .jpeg({ quality })
            .toBuffer()
          
          const timestamp = Date.now()
          const fileName = `${session.user.id}-${platformKey.toLowerCase()}-${formatKey}-${timestamp}.jpg`
          const blobPath = `social/cropped/${fileName}`
          
          const blob = await put(blobPath, outputBuffer, {
            access: 'public',
            contentType: 'image/jpeg',
          })
          
          results[platformKey][formatKey] = {
            platform: platformKey,
            format: formatKey,
            url: blob.url,
            width: targetFormat.width,
            height: targetFormat.height,
          }
        } catch (formatError) {
          console.error(`[Batch Crop] Error for ${platformKey}/${formatKey}:`, formatError)
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      results,
      originalUrl: imageUrl,
    })
  } catch (error) {
    console.error('[Batch Crop] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Batch Crop fehlgeschlagen' },
      { status: 500 }
    )
  }
}

