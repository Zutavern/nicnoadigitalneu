'use client'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatFileSize, isImageFile, MEDIA_CATEGORY_LABELS } from '@/lib/media'
import type { MediaFileWithUsage } from '@/lib/media'
import {
  MoreVertical,
  Copy,
  Trash2,
  Eye,
  Edit2,
  File,
  FileText,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

interface MediaCardProps {
  file: MediaFileWithUsage
  selected?: boolean
  selectable?: boolean
  showOwner?: boolean // Show file owner (for admin view)
  onSelect?: (file: MediaFileWithUsage) => void
  onView?: (file: MediaFileWithUsage) => void
  onEdit?: (file: MediaFileWithUsage) => void
  onDelete?: (file: MediaFileWithUsage) => void
  className?: string
}

export function MediaCard({
  file,
  selected = false,
  selectable = false,
  showOwner = false,
  onSelect,
  onView,
  onEdit,
  onDelete,
  className,
}: MediaCardProps) {
  const isImage = isImageFile(file.mimeType)
  const categoryLabel = MEDIA_CATEGORY_LABELS[file.category] || file.category

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(file.url)
    toast.success('URL kopiert!')
  }

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(file)
    } else if (onView) {
      onView(file)
    }
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all cursor-pointer',
        'hover:shadow-lg hover:ring-2 hover:ring-primary/20',
        selected && 'ring-2 ring-primary',
        className
      )}
      onClick={handleClick}
    >
      {/* Selection Indicator */}
      {selectable && (
        <div
          className={cn(
            'absolute top-2 left-2 z-10 h-5 w-5 rounded-full border-2 transition-all',
            selected
              ? 'bg-primary border-primary'
              : 'bg-background/80 border-border hover:border-primary'
          )}
        >
          {selected && <Check className="h-full w-full p-0.5 text-primary-foreground" />}
        </div>
      )}

      {/* Preview */}
      <CardContent className="p-0">
        <div className="relative aspect-square bg-muted/30">
          {isImage ? (
            <Image
              src={file.url}
              alt={file.alt || file.originalName}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {file.mimeType === 'application/pdf' ? (
                <FileText className="h-12 w-12 text-muted-foreground" />
              ) : (
                <File className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          )}

          {/* Overlay */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent',
              'opacity-0 transition-opacity group-hover:opacity-100'
            )}
          />

          {/* Quick Actions - Bottom */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 p-2',
              'opacity-0 transition-opacity group-hover:opacity-100'
            )}
          >
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(file)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Vorschau
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(file)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Bearbeiten
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleCopyUrl}>
                    <Copy className="mr-2 h-4 w-4" />
                    URL kopieren
                  </DropdownMenuItem>
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(file)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Löschen
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
          <p className="text-sm font-medium truncate" title={file.originalName}>
            {file.originalName}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatFileSize(file.size)}</span>
            <Badge variant="secondary" className="text-xs">
              {categoryLabel}
            </Badge>
          </div>
          {showOwner && file.user && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate" title={file.user.email}>
                {file.user.name || file.user.email.split('@')[0]}
              </span>
            </div>
          )}
          {file.usageCount !== undefined && file.usageCount > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {file.usageCount}x verwendet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

