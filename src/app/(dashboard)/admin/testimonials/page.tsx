'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Quote,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Save,
  RefreshCw,
  Upload,
  X,
  Image as ImageIcon,
  Scissors,
  Building2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Star,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SortableList } from '@/components/ui/sortable-list'

interface Testimonial {
  id: string
  name: string
  role: 'STYLIST' | 'SALON_OWNER'
  text: string
  imageUrl: string | null
  company: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const emptyTestimonial: Partial<Testimonial> = {
  name: '',
  role: 'STYLIST',
  text: '',
  imageUrl: null,
  company: null,
  isActive: true,
  sortOrder: 0,
}

export default function TestimonialsPage() {
  // Data States
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true)
  
  // UI States
  const [roleTab, setRoleTab] = useState<'STYLIST' | 'SALON_OWNER'>('STYLIST')
  const [showPreview, setShowPreview] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [showInactive, setShowInactive] = useState(false)
  
  // Edit Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState<Partial<Testimonial>>(emptyTestimonial)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Fetch Data
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/testimonials?includeInactive=true')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setTestimonials(data)
        }
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast.error('Fehler beim Laden der Testimonials')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // CRUD Operations
  const handleSaveTestimonial = async () => {
    if (!currentTestimonial.name || !currentTestimonial.role || !currentTestimonial.text) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    setIsSaving(true)
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/testimonials', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentTestimonial),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      const savedTestimonial = await res.json()
      toast.success(isEditing ? 'Testimonial aktualisiert!' : 'Testimonial erstellt!')
      setEditDialogOpen(false)
      setCurrentTestimonial(emptyTestimonial)
      setIsEditing(false)
      await fetchData()
      
      if (savedTestimonial?.role && savedTestimonial.role !== roleTab) {
        setRoleTab(savedTestimonial.role)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!confirm('Möchten Sie dieses Testimonial wirklich löschen?')) return

    try {
      const res = await fetch(`/api/admin/testimonials?id=${testimonialId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete testimonial')
      toast.success('Testimonial gelöscht')
      fetchData()
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  const openEditDialog = (testimonial?: Testimonial) => {
    if (testimonial) {
      setCurrentTestimonial({ ...testimonial })
      setIsEditing(true)
    } else {
      setCurrentTestimonial({ ...emptyTestimonial, role: roleTab })
      setIsEditing(false)
    }
    setEditDialogOpen(true)
  }

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (currentTestimonial.id) {
        formData.append('testimonialId', currentTestimonial.id)
      }

      const res = await fetch('/api/admin/testimonials/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Upload')
      }

      const data = await res.json()
      setCurrentTestimonial({ ...currentTestimonial, imageUrl: data.url })
      toast.success('Bild hochgeladen!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Upload')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const updateSortOrder = async (id: string, newSortOrder: number) => {
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, sortOrder: newSortOrder }),
      })
      if (!res.ok) throw new Error('Failed to update sort order')
      fetchData()
    } catch {
      toast.error('Fehler beim Aktualisieren der Reihenfolge')
    }
  }

  // Reorder Testimonials via Drag & Drop
  const handleReorderTestimonials = async (reorderedItems: Testimonial[]) => {
    // Optimistisches Update nur für gefilterte Liste
    const otherTestimonials = testimonials.filter(t => t.role !== roleTab || (!showInactive && !t.isActive))
    const updatedTestimonials = [
      ...otherTestimonials,
      ...reorderedItems.map((item, index) => ({ ...item, sortOrder: index }))
    ]
    setTestimonials(updatedTestimonials)
    
    try {
      // Alle sortOrder-Änderungen parallel senden
      await Promise.all(
        reorderedItems.map((item, index) =>
          fetch('/api/admin/testimonials', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id, sortOrder: index }),
          })
        )
      )
      toast.success('Reihenfolge aktualisiert')
    } catch {
      // Bei Fehler: Daten neu laden
      fetchData()
      toast.error('Fehler beim Speichern der Reihenfolge')
    }
  }

  // Filtered Testimonials
  const filteredTestimonials = testimonials.filter((t) => {
    if (t.role !== roleTab) return false
    if (!showInactive && !t.isActive) return false
    return true
  }).sort((a, b) => a.sortOrder - b.sortOrder)

  const previewTestimonials = testimonials.filter(t => t.isActive).sort((a, b) => a.sortOrder - b.sortOrder)

  // Stats
  const stats = {
    total: testimonials.filter(t => t.role === roleTab).length,
    active: testimonials.filter(t => t.role === roleTab && t.isActive).length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Quote className="h-8 w-8 text-primary" />
            Testimonials
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Kundenbewertungen und Erfolgsgeschichten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
          </Button>
          <Button onClick={() => openEditDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Neues Testimonial
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor */}
        <div className="space-y-6">
          {/* Role Tabs */}
          <Tabs value={roleTab} onValueChange={(v) => setRoleTab(v as 'STYLIST' | 'SALON_OWNER')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="STYLIST" className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Stuhlmieter
                <Badge variant="secondary" className="ml-1">{testimonials.filter(t => t.role === 'STYLIST').length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="SALON_OWNER" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Salonbesitzer
                <Badge variant="secondary" className="ml-1">{testimonials.filter(t => t.role === 'SALON_OWNER').length}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Gesamt</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <p className="text-xs text-muted-foreground">Aktiv</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Switch id="showInactive" checked={showInactive} onCheckedChange={setShowInactive} />
                <Label htmlFor="showInactive" className="text-sm cursor-pointer">Inaktive anzeigen</Label>
              </div>
            </CardContent>
          </Card>

          {/* Testimonials List */}
          {filteredTestimonials.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Quote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Keine Testimonials gefunden.</p>
                <Button variant="outline" className="mt-4" onClick={() => openEditDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Erstes Testimonial erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <SortableList
              items={filteredTestimonials}
              onReorder={handleReorderTestimonials}
              renderItem={(testimonial) => (
                <Card className={`${!testimonial.isActive ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      {testimonial.imageUrl ? (
                        <Avatar className="h-12 w-12 border-2 border-primary/20 shrink-0">
                          <AvatarImage src={testimonial.imageUrl} alt={testimonial.name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                            {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-primary font-semibold text-sm">
                            {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-sm">{testimonial.name}</h3>
                          {testimonial.company && (
                            <span className="text-xs text-muted-foreground">• {testimonial.company}</span>
                          )}
                          {!testimonial.isActive && (
                            <Badge variant="secondary" className="text-xs">Inaktiv</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 italic">"{testimonial.text}"</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(testimonial)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTestimonial(testimonial.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            />
          )}
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 h-fit space-y-4">
            {/* Preview Controls */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live-Vorschau
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPreviewDevice('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPreviewDevice('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className={`mx-auto transition-all duration-300 ${previewDevice === 'mobile' ? 'max-w-[375px] px-4 pb-4' : 'w-full'}`}>
                  {/* Testimonials Preview */}
                  <div className={`border rounded-xl overflow-hidden bg-background ${previewDevice === 'mobile' ? 'aspect-[9/16]' : 'aspect-[4/3]'}`}>
                    <div className="h-full overflow-y-auto p-4">
                      {/* Section Header */}
                      <div className="text-center mb-6">
                        <Badge variant="secondary" className="mb-2">
                          <Star className="h-3 w-3 mr-1" />
                          Kundenstimmen
                        </Badge>
                        <h2 className={`font-bold ${previewDevice === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                          Was unsere Kunden sagen
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Echte Erfahrungen von Stylisten und Salonbesitzern
                        </p>
                      </div>

                      {/* Testimonial Cards */}
                      <div className={`grid gap-4 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {previewTestimonials.slice(0, 4).map((t) => (
                          <div key={t.id} className="p-4 rounded-lg border bg-card">
                            <div className="flex items-center gap-3 mb-3">
                              {t.imageUrl ? (
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={t.imageUrl} alt={t.name} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary text-xs font-semibold">
                                    {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-sm">{t.name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  {t.role === 'STYLIST' ? <Scissors className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                                  {t.role === 'STYLIST' ? 'Stuhlmieter' : 'Salonbesitzer'}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground italic line-clamp-3">"{t.text}"</p>
                          </div>
                        ))}
                      </div>

                      {previewTestimonials.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          Keine aktiven Testimonials vorhanden
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground py-3">
                  Echtzeit-Vorschau der Testimonial-Sektion
                </p>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-500">Tipp</p>
                    <p className="text-muted-foreground mt-1">
                      Bilder mit quadratischem Format (1:1) werden am besten dargestellt
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Testimonial Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Testimonial bearbeiten' : 'Neues Testimonial erstellen'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Bearbeiten Sie die Testimonial-Informationen' : 'Erstellen Sie ein neues Testimonial'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Bild (optional)</Label>
              <div className="flex items-center gap-4">
                {currentTestimonial.imageUrl ? (
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-2 border-primary/20">
                      <AvatarImage src={currentTestimonial.imageUrl} alt="Preview" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                        {currentTestimonial.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => setCurrentTestimonial({ ...currentTestimonial, imageUrl: null })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-20 w-20 border-2 border-dashed rounded-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                    disabled={isUploadingImage}
                  />
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP (max. 5MB)</p>
                </div>
              </div>
              {isUploadingImage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Bild wird hochgeladen...
                </div>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={currentTestimonial.name || ''}
                onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, name: e.target.value })}
                placeholder="z.B. Maria Schmidt"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>Rolle *</Label>
              <Select
                value={currentTestimonial.role}
                onValueChange={(value: 'STYLIST' | 'SALON_OWNER') => setCurrentTestimonial({ ...currentTestimonial, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STYLIST">
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4" />
                      Stuhlmieter
                    </div>
                  </SelectItem>
                  <SelectItem value="SALON_OWNER">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Salonbesitzer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label>Salon/Unternehmen (optional)</Label>
              <Input
                value={currentTestimonial.company || ''}
                onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, company: e.target.value || null })}
                placeholder="z.B. Salon Schönheit"
              />
            </div>

            {/* Text */}
            <div className="space-y-2">
              <Label>Testimonial-Text *</Label>
              <Textarea
                value={currentTestimonial.text || ''}
                onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, text: e.target.value })}
                placeholder="Das Testimonial des Kunden..."
                rows={5}
              />
            </div>

            {/* Sort & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sortierung</Label>
                <Input
                  type="number"
                  value={currentTestimonial.sortOrder || 0}
                  onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch
                  checked={currentTestimonial.isActive !== false}
                  onCheckedChange={(checked) => setCurrentTestimonial({ ...currentTestimonial, isActive: checked })}
                />
                <Label className="cursor-pointer">Aktiv</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveTestimonial} disabled={isSaving}>
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Speichern</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
