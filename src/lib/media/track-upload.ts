import { prisma } from '@/lib/prisma'
import type { MediaCategory } from '@prisma/client'

interface TrackUploadParams {
  userId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  category?: MediaCategory
  uploadContext?: string
  alt?: string
  width?: number
  height?: number
}

/**
 * Tracks an uploaded file in the MediaFile table
 * Call this after successfully uploading to Vercel Blob
 */
export async function trackUpload(params: TrackUploadParams) {
  try {
    // Check if already tracked (by URL)
    const existing = await prisma.mediaFile.findUnique({
      where: { url: params.url },
    })

    if (existing) {
      return existing
    }

    // Create new tracking entry
    const mediaFile = await prisma.mediaFile.create({
      data: {
        userId: params.userId,
        filename: params.filename,
        originalName: params.originalName,
        mimeType: params.mimeType,
        size: params.size,
        url: params.url,
        category: params.category || 'GENERAL',
        uploadContext: params.uploadContext,
        alt: params.alt,
        width: params.width,
        height: params.height,
      },
    })

    return mediaFile
  } catch (error) {
    // Log but don't fail the upload
    console.error('Failed to track upload:', error)
    return null
  }
}

/**
 * Determines the category based on upload context
 */
export function getCategoryFromContext(context: string): MediaCategory {
  const contextMap: Record<string, MediaCategory> = {
    'blog': 'BLOG',
    'blog-post': 'BLOG',
    'blog-author': 'AVATARS',
    'print-materials': 'PRINT_MATERIALS',
    'branding': 'BRANDING',
    'branding-logo': 'BRANDING',
    'social-media': 'SOCIAL_MEDIA',
    'social-post': 'SOCIAL_MEDIA',
    'avatar': 'AVATARS',
    'profile': 'AVATARS',
    'document': 'DOCUMENTS',
    'onboarding': 'DOCUMENTS',
    'background': 'BACKGROUNDS',
    'pricelist': 'BACKGROUNDS',
    'product': 'PRODUCTS',
    'homepage': 'GENERAL',
    'newsletter': 'GENERAL',
  }

  return contextMap[context] || 'GENERAL'
}

