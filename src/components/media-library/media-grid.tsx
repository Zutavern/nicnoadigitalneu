'use client'

import { MediaCard } from './media-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { MediaFileWithUsage, MediaPagination } from '@/lib/media'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface MediaGridProps {
  files: MediaFileWithUsage[]
  pagination?: MediaPagination
  isLoading?: boolean
  selectedId?: string
  selectable?: boolean
  showOwner?: boolean // Show file owner (for admin view)
  onSelect?: (file: MediaFileWithUsage) => void
  onView?: (file: MediaFileWithUsage) => void
  onEdit?: (file: MediaFileWithUsage) => void
  onDelete?: (file: MediaFileWithUsage) => void
  onPageChange?: (page: number) => void
  emptyMessage?: string
}

export function MediaGrid({
  files,
  pagination,
  isLoading = false,
  selectedId,
  selectable = false,
  showOwner = false,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onPageChange,
  emptyMessage = 'Keine Medien gefunden',
}: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Loader2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.map((file) => (
          <MediaCard
            key={file.id}
            file={file}
            selected={selectedId === file.id}
            selectable={selectable}
            showOwner={showOwner}
            onSelect={onSelect}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Seite {pagination.page} von {pagination.totalPages} ({pagination.total} Dateien)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Weiter
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

