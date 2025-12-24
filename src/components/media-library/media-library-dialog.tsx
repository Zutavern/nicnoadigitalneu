'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MediaGrid } from './media-grid'
import { MediaUploader } from './media-uploader'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { 
  formatFileSize, 
  MEDIA_CATEGORY_LABELS,
  type MediaFileWithUsage, 
  type MediaPagination,
  type MediaStats,
  type MediaUsage,
} from '@/lib/media'
import type { MediaCategory } from '@prisma/client'
import {
  Search,
  X,
  SlidersHorizontal,
  FolderOpen,
  HardDrive,
  Image as ImageIcon,
  Check,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface MediaLibraryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (file: MediaFileWithUsage) => void
  selectable?: boolean
  selectedUrl?: string
  category?: MediaCategory // Filter by category
  title?: string
}

export function MediaLibraryDialog({
  open,
  onOpenChange,
  onSelect,
  selectable = false,
  selectedUrl,
  category: filterCategory,
  title = 'Medienbibliothek',
}: MediaLibraryDialogProps) {
  // State
  const [files, setFiles] = useState<MediaFileWithUsage[]>([])
  const [pagination, setPagination] = useState<MediaPagination | null>(null)
  const [stats, setStats] = useState<MediaStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')

  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<MediaCategory | 'ALL'>(filterCategory || 'ALL')
  const [sortBy, setSortBy] = useState<'createdAt' | 'size' | 'originalName'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)

  // Delete dialog
  const [fileToDelete, setFileToDelete] = useState<MediaFileWithUsage | null>(null)
  const [deleteUsages, setDeleteUsages] = useState<MediaUsage[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Selected file (for picker mode)
  const [selectedFile, setSelectedFile] = useState<MediaFileWithUsage | null>(null)

  // Find selected file by URL
  useEffect(() => {
    if (selectedUrl && files.length > 0) {
      const found = files.find(f => f.url === selectedUrl)
      if (found) {
        setSelectedFile(found)
      }
    }
  }, [selectedUrl, files])

  // Fetch files
  const fetchFiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '24',
        sortBy,
        sortOrder,
        stats: 'true',
      })
      if (search) params.set('search', search)
      if (category && category !== 'ALL') params.set('category', category)

      const res = await fetch(`/api/media?${params}`)
      const data = await res.json()

      if (res.ok) {
        setFiles(data.files)
        setPagination(data.pagination)
        if (data.stats) setStats(data.stats)
      } else {
        toast.error(data.error || 'Fehler beim Laden')
      }
    } catch (error) {
      toast.error('Verbindungsfehler')
    } finally {
      setIsLoading(false)
    }
  }, [page, search, category, sortBy, sortOrder])

  useEffect(() => {
    if (open) {
      fetchFiles()
    }
  }, [open, fetchFiles])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Handle delete
  const handleDeleteClick = async (file: MediaFileWithUsage) => {
    // Fetch usages first
    try {
      const res = await fetch(`/api/media/${file.id}`)
      const data = await res.json()
      
      if (res.ok && data.file.usages) {
        setDeleteUsages(data.file.usages)
      } else {
        setDeleteUsages([])
      }
    } catch {
      setDeleteUsages([])
    }
    
    setFileToDelete(file)
  }

  const handleDeleteConfirm = async (force: boolean) => {
    if (!fileToDelete) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/media/${fileToDelete.id}?force=${force}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (res.ok) {
        toast.success('Datei gelöscht')
        setFileToDelete(null)
        fetchFiles()
      } else if (res.status === 409) {
        // File is in use, show usages
        setDeleteUsages(data.usages || [])
      } else {
        toast.error(data.error || 'Fehler beim Löschen')
      }
    } catch (error) {
      toast.error('Verbindungsfehler')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle select
  const handleSelect = (file: MediaFileWithUsage) => {
    if (selectable) {
      setSelectedFile(file)
    }
  }

  const handleConfirmSelect = () => {
    if (selectedFile && onSelect) {
      onSelect(selectedFile)
      onOpenChange(false)
    }
  }

  // Handle upload complete
  const handleUploadComplete = (uploadedFiles: MediaFileWithUsage[]) => {
    fetchFiles()
    setActiveTab('library')
    
    // If selectable, auto-select first uploaded file
    if (selectable && uploadedFiles.length === 1) {
      setSelectedFile(uploadedFiles[0])
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  {title}
                </DialogTitle>
                {stats && (
                  <DialogDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      {stats.totalFiles} Dateien
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-4 w-4" />
                      {formatFileSize(stats.totalSize)}
                    </span>
                  </DialogDescription>
                )}
              </div>
              {selectable && selectedFile && (
                <Button onClick={handleConfirmSelect}>
                  <Check className="h-4 w-4 mr-2" />
                  Auswählen
                </Button>
              )}
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
            <div className="px-6 py-3 border-b">
              <TabsList>
                <TabsTrigger value="library">Bibliothek</TabsTrigger>
                <TabsTrigger value="upload">Hochladen</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="library" className="flex-1 flex flex-col m-0 data-[state=active]:flex">
              {/* Filters */}
              <div className="px-6 py-3 border-b">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Suchen..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                    {search && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setSearch('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Category Filter */}
                  {!filterCategory && (
                    <Select
                      value={category}
                      onValueChange={(v) => {
                        setCategory(v as MediaCategory | 'ALL')
                        setPage(1)
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Kategorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Alle Kategorien</SelectItem>
                        {Object.entries(MEDIA_CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Sort */}
                  <Select
                    value={`${sortBy}-${sortOrder}`}
                    onValueChange={(v) => {
                      const [by, order] = v.split('-') as [typeof sortBy, typeof sortOrder]
                      setSortBy(by)
                      setSortOrder(order)
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sortierung" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt-desc">Neueste zuerst</SelectItem>
                      <SelectItem value="createdAt-asc">Älteste zuerst</SelectItem>
                      <SelectItem value="originalName-asc">Name A-Z</SelectItem>
                      <SelectItem value="originalName-desc">Name Z-A</SelectItem>
                      <SelectItem value="size-desc">Größte zuerst</SelectItem>
                      <SelectItem value="size-asc">Kleinste zuerst</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Active Filters */}
                  {(search || (category && category !== 'ALL')) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearch('')
                        setCategory('ALL')
                        setPage(1)
                      }}
                    >
                      Filter zurücksetzen
                    </Button>
                  )}
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-auto p-6">
                <MediaGrid
                  files={files}
                  pagination={pagination || undefined}
                  isLoading={isLoading}
                  selectedId={selectedFile?.id}
                  selectable={selectable}
                  onSelect={handleSelect}
                  onDelete={handleDeleteClick}
                  onPageChange={setPage}
                  emptyMessage={
                    search
                      ? `Keine Ergebnisse für "${search}"`
                      : 'Noch keine Medien hochgeladen'
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="upload" className="flex-1 m-0 p-6 data-[state=active]:flex flex-col">
              <MediaUploader
                category={filterCategory}
                onUploadComplete={handleUploadComplete}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        file={fileToDelete}
        open={!!fileToDelete}
        onOpenChange={(open) => !open && setFileToDelete(null)}
        onConfirm={handleDeleteConfirm}
        usages={deleteUsages}
        isDeleting={isDeleting}
      />
    </>
  )
}

