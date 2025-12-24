'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatFileSize, isImageFile, groupUsagesByType } from '@/lib/media'
import type { MediaFileWithUsage, MediaUsage } from '@/lib/media'
import {
  AlertTriangle,
  Trash2,
  Loader2,
  File,
  FileText,
  User,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react'

interface DeleteConfirmDialogProps {
  file: MediaFileWithUsage | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (options: { force: boolean; permanent: boolean }) => Promise<void>
  onRestore?: () => Promise<void>
  usages?: MediaUsage[]
  isDeleting?: boolean
  isOwnFile?: boolean // Ob die Datei dem aktuellen User gehört
  currentUserId?: string // ID des aktuellen Users
}

export function DeleteConfirmDialog({
  file,
  open,
  onOpenChange,
  onConfirm,
  onRestore,
  usages = [],
  isDeleting = false,
  isOwnFile = true,
  currentUserId,
}: DeleteConfirmDialogProps) {
  const [step, setStep] = useState<'initial' | 'confirm-foreign'>('initial')

  if (!file) return null

  const isImage = isImageFile(file.mimeType)
  const hasUsages = usages.length > 0
  const groupedUsages = groupUsagesByType(usages)
  const isAlreadyDeleted = !!file.deletedAt
  const ownerName = file.user?.name || file.user?.email?.split('@')[0] || 'Unbekannt'

  const handleConfirm = async () => {
    // Wenn fremdes Bild und nicht schon bestätigt, erst Bestätigung anfordern
    if (!isOwnFile && step === 'initial' && !isAlreadyDeleted) {
      setStep('confirm-foreign')
      return
    }

    await onConfirm({ 
      force: hasUsages, 
      permanent: isAlreadyDeleted 
    })
    setStep('initial')
  }

  const handleRestore = async () => {
    if (onRestore) {
      await onRestore()
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep('initial')
    }
    onOpenChange(newOpen)
  }

  // Bestätigungsschritt für fremde Dateien
  if (step === 'confirm-foreign') {
    return (
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="max-w-xl w-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
              Kundendatei löschen?
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  Besitzer: {ownerName}
                </span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Diese Datei gehört einem deiner Kunden. Bist du dir wirklich sicher, dass du sie löschen möchtest?
              </p>
            </div>

            <AlertDialogDescription>
              Die Datei wird zunächst nur als gelöscht markiert und kann wiederhergestellt werden. Ein zweites Löschen entfernt sie permanent.
            </AlertDialogDescription>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStep('initial')}>
              Zurück
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gelöscht...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Ja, löschen
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-3xl w-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isAlreadyDeleted ? (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Permanent löschen?
              </>
            ) : hasUsages ? (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Bild löschen?
              </>
            ) : (
              <>
                <Trash2 className="h-5 w-5 text-destructive" />
                Bild löschen?
              </>
            )}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* File Preview */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                {isImage ? (
                  <Image
                    src={file.url}
                    alt={file.originalName}
                    fill
                    className="object-cover"
                  />
                ) : file.mimeType === 'application/pdf' ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <File className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium break-all">
                  {file.originalName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Hochgeladen am{' '}
                  {new Date(file.createdAt).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </p>
                {!isOwnFile && file.user && (
                  <div className="flex items-center gap-1 mt-1">
                    <User className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-amber-600 dark:text-amber-400 truncate">
                      Besitzer: {ownerName}
                    </span>
                  </div>
                )}
                {isAlreadyDeleted && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    Bereits gelöscht
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Already deleted warning */}
          {isAlreadyDeleted && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                <strong>Achtung:</strong> Diese Datei wurde bereits gelöscht. Ein erneutes Löschen entfernt sie <strong>permanent</strong> und kann nicht rückgängig gemacht werden!
              </p>
            </div>
          )}

          {/* Usage Warning */}
          {hasUsages && !isAlreadyDeleted && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Dieses Bild wird an {usages.length} Stelle{usages.length > 1 ? 'n' : ''} verwendet:
                </span>
              </div>

              <ScrollArea className="max-h-48">
                <div className="space-y-3">
                  {Object.entries(groupedUsages).map(([type, items]) => (
                    <div key={type} className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2">
                        {type}
                        <Badge variant="secondary" className="text-xs">
                          {items.length}
                        </Badge>
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-0.5 ml-4">
                        {items.slice(0, 3).map((usage, i) => (
                          <li key={i} className="truncate">
                            • {usage.entityName}
                          </li>
                        ))}
                        {items.length > 3 && (
                          <li className="text-xs">
                            ... und {items.length - 3} weitere
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <AlertDialogDescription className="text-amber-600 dark:text-amber-400">
                <strong>Achtung:</strong> Wenn du fortfährst, werden alle Referenzen automatisch entfernt. 
                Das Bild wird an diesen Stellen dann nicht mehr angezeigt (kein "broken image").
              </AlertDialogDescription>
            </div>
          )}

          {!hasUsages && !isAlreadyDeleted && (
            <AlertDialogDescription>
              {isOwnFile 
                ? 'Die Datei wird als gelöscht markiert und kann später wiederhergestellt oder permanent gelöscht werden.'
                : 'Diese Datei gehört einem anderen Benutzer.'
              }
            </AlertDialogDescription>
          )}
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
          
          {isAlreadyDeleted && onRestore && (
            <Button
              variant="outline"
              onClick={handleRestore}
              disabled={isDeleting}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Wiederherstellen
            </Button>
          )}
          
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gelöscht...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {isAlreadyDeleted 
                  ? 'Permanent löschen' 
                  : hasUsages 
                    ? 'Trotzdem löschen' 
                    : 'Löschen'
                }
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

