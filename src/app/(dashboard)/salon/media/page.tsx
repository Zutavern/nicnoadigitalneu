'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MediaGrid, MediaUploader, DeleteConfirmDialog } from '@/components/media-library'
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
  Upload,
  Folder,
  FileImage,
  Printer,
  Share2,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

const CATEGORY_ICONS: Record<MediaCategory, React.ReactNode> = {
  GENERAL: <Folder className="h-4 w-4" />,
  BLOG: <FileImage className="h-4 w-4" />,
  BRANDING: <ImageIcon className="h-4 w-4" />,
  PRINT_MATERIALS: <Printer className="h-4 w-4" />,
  SOCIAL_MEDIA: <Share2 className="h-4 w-4" />,
  DOCUMENTS: <Folder className="h-4 w-4" />,
  AVATARS: <User className="h-4 w-4" />,
  BACKGROUNDS: <ImageIcon className="h-4 w-4" />,
  PRODUCTS: <Folder className="h-4 w-4" />,
}

export default function SalonMediaPage() {
  // State
  const [files, setFiles] = useState<MediaFileWithUsage[]>([])
  const [pagination, setPagination] = useState<MediaPagination | null>(null)
  const [stats, setStats] = useState<MediaStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')

  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<MediaCategory | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<'createdAt' | 'size' | 'originalName'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)

  // Delete dialog
  const [fileToDelete, setFileToDelete] = useState<MediaFileWithUsage | null>(null)
  const [deleteUsages, setDeleteUsages] = useState<MediaUsage[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

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
    fetchFiles()
  }, [fetchFiles])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Handle delete
  const handleDeleteClick = async (file: MediaFileWithUsage) => {
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

  const handleDeleteConfirm = async (options: { force: boolean; permanent: boolean }) => {
    if (!fileToDelete) return

    setIsDeleting(true)
    try {
      const params = new URLSearchParams()
      if (options.force) params.set('force', 'true')
      if (options.permanent) params.set('permanent', 'true')
      
      const res = await fetch(`/api/media/${fileToDelete.id}?${params}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (res.ok) {
        if (data.softDeleted) {
          toast.success('Datei als gelöscht markiert')
        } else if (data.permanentlyDeleted) {
          toast.success('Datei permanent gelöscht')
        } else {
          toast.success('Datei gelöscht')
        }
        setFileToDelete(null)
        fetchFiles()
      } else if (res.status === 409) {
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

  const handleUploadComplete = () => {
    fetchFiles()
    setActiveTab('library')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            Medienbibliothek
          </h1>
          <p className="text-muted-foreground">
            Verwalte alle deine hochgeladenen Bilder und Dateien
          </p>
        </div>
        <Button onClick={() => setActiveTab('upload')}>
          <Upload className="h-4 w-4 mr-2" />
          Hochladen
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalFiles}</p>
                  <p className="text-xs text-muted-foreground">Dateien gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <HardDrive className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                  <p className="text-xs text-muted-foreground">Speicherplatz</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {stats.byCategory.slice(0, 2).map((cat) => (
            <Card key={cat.category}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    {CATEGORY_ICONS[cat.category]}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{cat.count}</p>
                    <p className="text-xs text-muted-foreground">
                      {MEDIA_CATEGORY_LABELS[cat.category]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="library">
            <FolderOpen className="h-4 w-4 mr-2" />
            Bibliothek
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Hochladen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4 mt-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
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
                {(search || category !== 'ALL') && (
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
            </CardContent>
          </Card>

          {/* Grid */}
          <MediaGrid
            files={files}
            pagination={pagination || undefined}
            isLoading={isLoading}
            onDelete={handleDeleteClick}
            onPageChange={setPage}
            emptyMessage={
              search
                ? `Keine Ergebnisse für "${search}"`
                : 'Noch keine Medien hochgeladen. Klicke auf "Hochladen" um loszulegen!'
            }
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Dateien hochladen</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUploader onUploadComplete={handleUploadComplete} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        file={fileToDelete}
        open={!!fileToDelete}
        onOpenChange={(open) => !open && setFileToDelete(null)}
        onConfirm={handleDeleteConfirm}
        usages={deleteUsages}
        isDeleting={isDeleting}
      />
    </div>
  )
}

