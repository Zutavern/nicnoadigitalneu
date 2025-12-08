'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState<Partial<Testimonial>>(emptyTestimonial)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    fetchTestimonials()
  }, [showInactive])

  const fetchTestimonials = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/testimonials?includeInactive=true')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to fetch`)
      }
      const data = await res.json()
      console.log('Fetched testimonials:', data)
      if (Array.isArray(data)) {
        setTestimonials(data)
      } else {
        console.error('Invalid response format:', data)
        setTestimonials([])
        toast.error('Ungültiges Datenformat erhalten')
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast.error(`Fehler beim Laden der Testimonials: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTestimonials([])
    } finally {
      setIsLoading(false)
    }
  }

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
      console.log('Saved Testimonial:', savedTestimonial)
      
      toast.success(isEditing ? 'Testimonial aktualisiert!' : 'Testimonial erstellt!')
      setEditDialogOpen(false)
      setCurrentTestimonial(emptyTestimonial)
      setIsEditing(false)
      
      // Sofort aktualisieren
      await fetchTestimonials()
      
      // Wenn wir im falschen Tab sind, wechsle zum richtigen Tab
      if (savedTestimonial?.role && savedTestimonial.role !== activeTab) {
        setActiveTab(savedTestimonial.role)
      }
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!confirm('Möchten Sie dieses Testimonial wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return

    try {
      const res = await fetch(`/api/admin/testimonials?id=${testimonialId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete testimonial')

      toast.success('Testimonial gelöscht')
      fetchTestimonials()
    } catch (error) {
      toast.error('Fehler beim Löschen')
    }
  }

  const openEditDialog = (testimonial?: Testimonial) => {
    if (testimonial) {
      setCurrentTestimonial({ ...testimonial })
      setIsEditing(true)
    } else {
      setCurrentTestimonial({ ...emptyTestimonial, role: activeTab })
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
      toast.success('Bild erfolgreich hochgeladen!')
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Fehler beim Upload')
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
      
      fetchTestimonials()
    } catch (error) {
      toast.error('Fehler beim Aktualisieren der Reihenfolge')
    }
  }

  const filteredTestimonials = testimonials.filter((testimonial) => {
    if (filterRole !== 'all' && testimonial.role !== filterRole) return false
    if (!showInactive && !testimonial.isActive) return false
    return true
  }).sort((a, b) => a.sortOrder - b.sortOrder)

  const stats = {
    total: testimonials.length,
    active: testimonials.filter(t => t.isActive).length,
    stylist: testimonials.filter(t => t.role === 'STYLIST').length,
    salonOwner: testimonials.filter(t => t.role === 'SALON_OWNER').length,
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTestimonials}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openEditDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Neues Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? 'Testimonial bearbeiten' : 'Neues Testimonial erstellen'}
                </DialogTitle>
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
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                        disabled={isUploadingImage}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WebP oder SVG (max. 5MB). Wenn kein Bild hochgeladen wird, wird keins angezeigt.
                      </p>
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
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={currentTestimonial.name || ''}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, name: e.target.value })}
                    placeholder="z.B. Maria Schmidt"
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Rolle *</Label>
                  <Select
                    value={currentTestimonial.role}
                    onValueChange={(value: 'STYLIST' | 'SALON_OWNER') => 
                      setCurrentTestimonial({ ...currentTestimonial, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STYLIST">
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4" />
                          Stuhlmietern
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

                {/* Company (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="company">Salon/Unternehmen (optional)</Label>
                  <Input
                    id="company"
                    value={currentTestimonial.company || ''}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, company: e.target.value || null })}
                    placeholder="z.B. Salon Schönheit"
                  />
                </div>

                {/* Text */}
                <div className="space-y-2">
                  <Label htmlFor="text">Testimonial-Text *</Label>
                  <Textarea
                    id="text"
                    value={currentTestimonial.text || ''}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, text: e.target.value })}
                    placeholder="Das Testimonial des Kunden..."
                    rows={5}
                  />
                </div>

                {/* Sortierung & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Sortierung</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={currentTestimonial.sortOrder || 0}
                      onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, sortOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <Switch
                      id="isActive"
                      checked={currentTestimonial.isActive !== false}
                      onCheckedChange={(checked) => setCurrentTestimonial({ ...currentTestimonial, isActive: checked })}
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Aktiv
                    </Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleSaveTestimonial} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Speichern
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aktiv</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              Stuhlmietern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stylist}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Salonbesitzer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.salonOwner}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Rolle:</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Rollen</SelectItem>
                  <SelectItem value="STYLIST">
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4" />
                      Stuhlmietern
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
            <div className="flex items-center gap-2">
              <Switch
                id="showInactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="showInactive" className="cursor-pointer">
                Inaktive anzeigen
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials List */}
      <div className="space-y-4">
        {filteredTestimonials.map((testimonial, index) => {
          const isStylist = testimonial.role === 'STYLIST'
          return (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`h-full flex flex-col ${!testimonial.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <div className="flex flex-col items-center gap-2 pt-1">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <span className="text-xs text-muted-foreground font-mono">
                        {testimonial.sortOrder}
                      </span>
                    </div>

                    {/* Image */}
                    {testimonial.imageUrl ? (
                      <Avatar className="h-16 w-16 border-2 border-primary/20 flex-shrink-0">
                        <AvatarImage src={testimonial.imageUrl} alt={testimonial.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                          {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">
                          {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{testimonial.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {isStylist ? (
                                <>
                                  <Scissors className="mr-1 h-3 w-3" />
                                  Stuhlmietern
                                </>
                              ) : (
                                <>
                                  <Building2 className="mr-1 h-3 w-3" />
                                  Salonbesitzer
                                </>
                              )}
                            </Badge>
                            {!testimonial.isActive && (
                              <Badge variant="secondary" className="text-xs">Inaktiv</Badge>
                            )}
                          </div>
                          {testimonial.company && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {testimonial.company}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 italic line-clamp-3">
                        "{testimonial.text}"
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(testimonial)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Bearbeiten
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSortOrder(testimonial.id, testimonial.sortOrder - 1)}
                          disabled={testimonial.sortOrder === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSortOrder(testimonial.id, testimonial.sortOrder + 1)}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredTestimonials.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Keine Testimonials gefunden.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

