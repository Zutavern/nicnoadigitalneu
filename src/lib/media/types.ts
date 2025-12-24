import type { MediaFile, MediaCategory } from '@prisma/client'

// User info for admin view
export interface MediaFileUser {
  id: string
  name: string | null
  email: string
  role: string
}

// Media File with additional computed fields
export interface MediaFileWithUsage extends MediaFile {
  usages?: MediaUsage[]
  usageCount?: number
  user?: MediaFileUser // Only populated in admin view
  // Note: deletedAt and deletedBy are already part of MediaFile from Prisma
}

// Usage tracking
export interface MediaUsage {
  type: MediaUsageType
  entityType: string
  entityId: string
  entityName: string
  field: string
}

export type MediaUsageType = 
  | 'BLOG_POST'
  | 'BLOG_AUTHOR'
  | 'PRINT_MATERIAL'
  | 'PRINT_BLOCK'
  | 'USER_AVATAR'
  | 'SALON_BRANDING'
  | 'STYLIST_BRANDING'
  | 'HOMEPAGE'
  | 'SOCIAL_POST'
  | 'NEWSLETTER'
  | 'OTHER'

// Filter options for media library
export interface MediaFilterOptions {
  category?: MediaCategory
  search?: string
  userId?: string
  dateFrom?: Date
  dateTo?: Date
  sortBy?: 'createdAt' | 'size' | 'originalName'
  sortOrder?: 'asc' | 'desc'
  includeDeleted?: boolean // Für Admin: auch soft-deleted Dateien anzeigen
}

// Pagination
export interface MediaPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Media list response
export interface MediaListResponse {
  files: MediaFileWithUsage[]
  pagination: MediaPagination
}

// Media stats
export interface MediaStats {
  totalFiles: number
  totalSize: number
  byCategory: {
    category: MediaCategory
    count: number
    size: number
  }[]
}

// Upload context mapping
export const UPLOAD_CONTEXT_TO_CATEGORY: Record<string, MediaCategory> = {
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

// Category labels for UI
export const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = {
  GENERAL: 'Allgemein',
  BLOG: 'Blog',
  BRANDING: 'Branding',
  PRINT_MATERIALS: 'Drucksachen',
  SOCIAL_MEDIA: 'Social Media',
  DOCUMENTS: 'Dokumente',
  AVATARS: 'Profilbilder',
  BACKGROUNDS: 'Hintergründe',
  PRODUCTS: 'Produkte',
}

// Category icons (Lucide icon names)
export const MEDIA_CATEGORY_ICONS: Record<MediaCategory, string> = {
  GENERAL: 'Folder',
  BLOG: 'FileText',
  BRANDING: 'Palette',
  PRINT_MATERIALS: 'Printer',
  SOCIAL_MEDIA: 'Share2',
  DOCUMENTS: 'File',
  AVATARS: 'User',
  BACKGROUNDS: 'Image',
  PRODUCTS: 'Package',
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Check if file is an image
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

// Get file extension from mime type
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  }
  return mimeToExt[mimeType] || 'file'
}

/**
 * Gruppiert Verwendungen nach Typ für die UI
 */
export function groupUsagesByType(usages: MediaUsage[]): Record<string, MediaUsage[]> {
  return usages.reduce((acc, usage) => {
    const key = usage.entityType
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(usage)
    return acc
  }, {} as Record<string, MediaUsage[]>)
}

