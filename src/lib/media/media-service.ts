import { prisma } from '@/lib/prisma'
import { del, list } from '@vercel/blob'
import type { MediaCategory } from '@prisma/client'
import type { 
  MediaFilterOptions, 
  MediaListResponse, 
  MediaStats,
  MediaFileWithUsage,
} from './types'
import { findMediaUsages, removeMediaReferences } from './usage-checker'

/**
 * Erstellt einen neuen MediaFile Eintrag
 */
export async function createMediaFile(data: {
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
}): Promise<MediaFileWithUsage> {
  const mediaFile = await prisma.mediaFile.create({
    data: {
      userId: data.userId,
      filename: data.filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      url: data.url,
      category: data.category || 'GENERAL',
      uploadContext: data.uploadContext,
      alt: data.alt,
      width: data.width,
      height: data.height,
    },
  })
  return mediaFile
}

/**
 * Holt alle Medien-Dateien mit Filterung und Paginierung
 * @param userId - User ID oder null für alle Medien (Admin)
 * @param options.includeDeleted - Auch soft-deleted Dateien anzeigen (nur Admin)
 */
export async function getMediaFiles(
  userId: string | null,
  options: MediaFilterOptions = {},
  page: number = 1,
  limit: number = 24
): Promise<MediaListResponse> {
  const { category, search, dateFrom, dateTo, sortBy = 'createdAt', sortOrder = 'desc', includeDeleted = false } = options

  // Build where clause - nur userId Filter wenn nicht null (Admin sieht alles)
  const where: any = {}
  
  if (userId !== null) {
    where.userId = userId
  }

  // Soft-deleted Dateien nur anzeigen wenn explizit angefordert (und Admin)
  if (!includeDeleted) {
    where.deletedAt = null
  }

  if (category) {
    where.category = category
  }

  if (search) {
    where.OR = [
      { originalName: { contains: search, mode: 'insensitive' } },
      { alt: { contains: search, mode: 'insensitive' } },
      { filename: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = dateFrom
    if (dateTo) where.createdAt.lte = dateTo
  }

  // Get total count
  const total = await prisma.mediaFile.count({ where })

  // Get files with user info for admin view
  const files = await prisma.mediaFile.findMany({
    where,
    include: userId === null ? {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        }
      }
    } : undefined,
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit,
  })

  return {
    files,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * Holt eine einzelne Medien-Datei mit Verwendungsinfo
 * @param userId - User ID oder null für Admin-Zugriff auf alle Dateien
 */
export async function getMediaFileById(
  id: string,
  userId: string | null
): Promise<MediaFileWithUsage | null> {
  const whereClause = userId !== null ? { id, userId } : { id }
  
  const file = await prisma.mediaFile.findFirst({
    where: whereClause,
    include: userId === null ? {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        }
      }
    } : undefined,
  })

  if (!file) return null

  // Get usages
  const usages = await findMediaUsages(file.url)

  return {
    ...file,
    usages,
    usageCount: usages.length,
  }
}

/**
 * Aktualisiert eine Medien-Datei (z.B. Alt-Text)
 * @param userId - User ID oder null für Admin-Zugriff auf alle Dateien
 */
export async function updateMediaFile(
  id: string,
  userId: string | null,
  data: {
    alt?: string
    category?: MediaCategory
  }
): Promise<MediaFileWithUsage | null> {
  const whereClause = userId !== null ? { id, userId } : { id }
  
  const file = await prisma.mediaFile.findFirst({
    where: whereClause,
  })

  if (!file) return null

  const updated = await prisma.mediaFile.update({
    where: { id },
    data,
  })

  return updated
}

/**
 * Löscht eine Medien-Datei (Soft-Delete oder permanent)
 * @param id - Die ID der Datei
 * @param userId - User ID oder null für Admin-Zugriff auf alle Dateien
 * @param deletedByUserId - ID des Users der löscht (für Audit)
 * @param options.force - Bei Verwendung trotzdem löschen (entfernt alle Referenzen!)
 * @param options.permanent - Permanent löschen (nur wenn schon soft-deleted)
 */
export async function deleteMediaFile(
  id: string,
  userId: string | null,
  deletedByUserId: string,
  options: { force?: boolean; permanent?: boolean } = {}
): Promise<{ 
  success: boolean
  error?: string
  usages?: any[]
  softDeleted?: boolean
  permanentlyDeleted?: boolean
  referencesRemoved?: number
}> {
  const { force = false, permanent = false } = options
  const whereClause = userId !== null ? { id, userId } : { id }
  
  const file = await prisma.mediaFile.findFirst({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  })

  if (!file) {
    return { success: false, error: 'Datei nicht gefunden' }
  }

  // Wenn Datei bereits soft-deleted ist und permanent = true, dann wirklich löschen
  if (file.deletedAt && permanent) {
    try {
      // Zuerst alle verbleibenden Referenzen entfernen (falls noch vorhanden)
      const { removed } = await removeMediaReferences(file.url)
      
      // Delete from Vercel Blob
      await del(file.url)

      // Delete from database
      await prisma.mediaFile.delete({
        where: { id },
      })

      return { success: true, permanentlyDeleted: true, referencesRemoved: removed }
    } catch (error) {
      console.error('Error permanently deleting media file:', error)
      return { 
        success: false, 
        error: 'Fehler beim permanenten Löschen der Datei',
      }
    }
  }

  // Check usages
  const usages = await findMediaUsages(file.url)

  if (usages.length > 0 && !force) {
    return { 
      success: false, 
      error: 'Datei wird noch verwendet',
      usages,
    }
  }

  // Wenn force=true und es gibt Usages, entferne zuerst alle Referenzen
  let referencesRemoved = 0
  if (usages.length > 0 && force) {
    const { removed, errors } = await removeMediaReferences(file.url)
    referencesRemoved = removed
    if (errors.length > 0) {
      console.warn('Errors removing media references:', errors)
    }
  }

  try {
    // Soft-Delete: Setze deletedAt
    await prisma.mediaFile.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: deletedByUserId,
      },
    })

    return { success: true, softDeleted: true, referencesRemoved }
  } catch (error) {
    console.error('Error soft-deleting media file:', error)
    return { 
      success: false, 
      error: 'Fehler beim Löschen der Datei',
    }
  }
}

/**
 * Stellt eine soft-deleted Datei wieder her
 */
export async function restoreMediaFile(
  id: string,
  userId: string | null
): Promise<{ success: boolean; error?: string }> {
  const whereClause = userId !== null ? { id, userId } : { id }
  
  const file = await prisma.mediaFile.findFirst({
    where: { ...whereClause, deletedAt: { not: null } },
  })

  if (!file) {
    return { success: false, error: 'Datei nicht gefunden oder nicht gelöscht' }
  }

  try {
    await prisma.mediaFile.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error restoring media file:', error)
    return { success: false, error: 'Fehler beim Wiederherstellen' }
  }
}

/**
 * Holt Statistiken für die Medienbibliothek
 * @param userId - User ID oder null für alle Medien (Admin)
 * @param includeDeleted - Auch soft-deleted Dateien einbeziehen
 */
export async function getMediaStats(userId: string | null, includeDeleted: boolean = false): Promise<MediaStats> {
  const whereClause: any = userId !== null ? { userId } : {}
  
  // Soft-deleted ausschließen wenn nicht explizit angefordert
  if (!includeDeleted) {
    whereClause.deletedAt = null
  }
  
  const [totalResult, categoryStats] = await Promise.all([
    prisma.mediaFile.aggregate({
      where: whereClause,
      _count: true,
      _sum: { size: true },
    }),
    prisma.mediaFile.groupBy({
      by: ['category'],
      where: whereClause,
      _count: true,
      _sum: { size: true },
    }),
  ])

  return {
    totalFiles: totalResult._count,
    totalSize: totalResult._sum.size || 0,
    byCategory: categoryStats.map(stat => ({
      category: stat.category,
      count: stat._count,
      size: stat._sum.size || 0,
    })),
  }
}

/**
 * Findet eine MediaFile anhand der URL
 */
export async function findMediaFileByUrl(url: string): Promise<MediaFileWithUsage | null> {
  const file = await prisma.mediaFile.findUnique({
    where: { url },
  })

  if (!file) return null

  const usages = await findMediaUsages(file.url)

  return {
    ...file,
    usages,
    usageCount: usages.length,
  }
}

/**
 * Synchronisiert bestehende Blob-Dateien mit der Datenbank
 * Nützlich für Migration/Import
 */
export async function syncBlobFilesWithDatabase(userId: string): Promise<{
  added: number
  skipped: number
  errors: string[]
}> {
  const result = { added: 0, skipped: 0, errors: [] as string[] }

  try {
    // List all blobs
    const { blobs } = await list()

    for (const blob of blobs) {
      // Check if already in database
      const existing = await prisma.mediaFile.findUnique({
        where: { url: blob.url },
      })

      if (existing) {
        result.skipped++
        continue
      }

      // Determine category from path
      let category: MediaCategory = 'GENERAL'
      const path = blob.pathname.toLowerCase()
      
      if (path.includes('blog')) category = 'BLOG'
      else if (path.includes('print')) category = 'PRINT_MATERIALS'
      else if (path.includes('branding') || path.includes('logo')) category = 'BRANDING'
      else if (path.includes('social')) category = 'SOCIAL_MEDIA'
      else if (path.includes('avatar') || path.includes('profile')) category = 'AVATARS'
      else if (path.includes('background') || path.includes('pricelist')) category = 'BACKGROUNDS'
      else if (path.includes('document') || path.includes('onboarding')) category = 'DOCUMENTS'

      // Determine mime type from extension
      const ext = blob.pathname.split('.').pop()?.toLowerCase() || ''
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        pdf: 'application/pdf',
      }
      const mimeType = mimeTypes[ext] || 'application/octet-stream'

      try {
        await prisma.mediaFile.create({
          data: {
            userId,
            filename: blob.pathname,
            originalName: blob.pathname.split('/').pop() || blob.pathname,
            mimeType,
            size: blob.size,
            url: blob.url,
            category,
            createdAt: blob.uploadedAt,
          },
        })
        result.added++
      } catch (err) {
        result.errors.push(`Error adding ${blob.pathname}: ${err}`)
      }
    }
  } catch (error) {
    result.errors.push(`Error listing blobs: ${error}`)
  }

  return result
}

