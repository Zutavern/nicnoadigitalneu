'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scissors,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Palette,
  Droplets,
  Sparkles,
  Heart,
  Crown,
  Gem,
  Wand2,
  Zap,
  Star,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  FolderPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Icon options for categories
const ICON_OPTIONS = [
  { value: 'scissors', label: 'Schere', icon: Scissors },
  { value: 'palette', label: 'Palette', icon: Palette },
  { value: 'droplets', label: 'Tropfen', icon: Droplets },
  { value: 'sparkles', label: 'Funken', icon: Sparkles },
  { value: 'heart', label: 'Herz', icon: Heart },
  { value: 'crown', label: 'Krone', icon: Crown },
  { value: 'gem', label: 'Diamant', icon: Gem },
  { value: 'wand2', label: 'Zauberstab', icon: Wand2 },
  { value: 'zap', label: 'Blitz', icon: Zap },
  { value: 'star', label: 'Stern', icon: Star },
]

// Color options for categories
const COLOR_OPTIONS = [
  { value: 'emerald', label: 'Smaragd', class: 'bg-emerald-500' },
  { value: 'violet', label: 'Violett', class: 'bg-violet-500' },
  { value: 'amber', label: 'Bernstein', class: 'bg-amber-500' },
  { value: 'rose', label: 'Rosa', class: 'bg-rose-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
]

interface Service {
  id: string
  categoryId: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  isActive: boolean
}

interface ServiceCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  sortOrder: number
  isActive: boolean
  services: Service[]
}

function getIconComponent(iconName: string | null) {
  const option = ICON_OPTIONS.find((opt) => opt.value === iconName)
  return option?.icon || Scissors
}

function getColorClass(colorName: string | null) {
  const option = COLOR_OPTIONS.find((opt) => opt.value === colorName)
  return option?.class || 'bg-emerald-500'
}

export default function AdminServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Dialog states
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'service'; id: string; name: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'scissors',
    color: 'emerald',
  })
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
  })

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/service-categories')
      if (!response.ok) throw new Error('Fehler beim Laden')
      const data = await response.json()
      // Ensure data is always an array
      const categoriesArray = Array.isArray(data) ? data : data.categories || []
      setCategories(categoriesArray)
    } catch {
      setError('Kategorien konnten nicht geladen werden')
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Open category dialog
  const openCategoryDialog = (category?: ServiceCategory) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        icon: category.icon || 'scissors',
        color: category.color || 'emerald',
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({
        name: '',
        description: '',
        icon: 'scissors',
        color: 'emerald',
      })
    }
    setShowCategoryDialog(true)
  }

  // Open service dialog
  const openServiceDialog = (categoryId: string, service?: Service) => {
    setSelectedCategoryId(categoryId)
    if (service) {
      setEditingService(service)
      setServiceForm({
        name: service.name,
        description: service.description || '',
      })
    } else {
      setEditingService(null)
      setServiceForm({
        name: '',
        description: '',
      })
    }
    setShowServiceDialog(true)
  }

  // Save category
  const saveCategory = async () => {
    if (!categoryForm.name.trim()) return

    setIsSaving(true)
    try {
      const url = editingCategory
        ? `/api/admin/service-categories/${editingCategory.id}`
        : '/api/admin/service-categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      })

      if (!response.ok) throw new Error('Speichern fehlgeschlagen')

      await fetchCategories()
      setShowCategoryDialog(false)
    } catch {
      setError('Kategorie konnte nicht gespeichert werden')
    } finally {
      setIsSaving(false)
    }
  }

  // Save service
  const saveService = async () => {
    if (!serviceForm.name.trim() || !selectedCategoryId) return

    setIsSaving(true)
    try {
      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : '/api/admin/services'
      const method = editingService ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...serviceForm,
          categoryId: selectedCategoryId,
        }),
      })

      if (!response.ok) throw new Error('Speichern fehlgeschlagen')

      await fetchCategories()
      setShowServiceDialog(false)
    } catch {
      setError('Service konnte nicht gespeichert werden')
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle active status
  const toggleActive = async (type: 'category' | 'service', id: string, isActive: boolean) => {
    try {
      const url = type === 'category'
        ? `/api/admin/service-categories/${id}`
        : `/api/admin/services/${id}`

      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      await fetchCategories()
    } catch {
      setError('Status konnte nicht geändert werden')
    }
  }

  // Delete item
  const confirmDelete = async () => {
    if (!deleteTarget) return

    setIsSaving(true)
    try {
      const url = deleteTarget.type === 'category'
        ? `/api/admin/service-categories/${deleteTarget.id}`
        : `/api/admin/services/${deleteTarget.id}`

      await fetch(url, { method: 'DELETE' })
      await fetchCategories()
      setShowDeleteDialog(false)
      setDeleteTarget(null)
    } catch {
      setError('Löschen fehlgeschlagen')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Scissors className="h-8 w-8 text-primary" />
            Dienstleistungen
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalte Kategorien und Services für das Stylist-Onboarding
          </p>
        </div>
        <Button onClick={() => openCategoryDialog()} className="gap-2">
          <FolderPlus className="h-4 w-4" />
          Neue Kategorie
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg"
        >
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError('')} className="ml-auto">
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Scissors className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg">Keine Kategorien vorhanden</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Erstelle deine erste Dienstleistungs-Kategorie
              </p>
              <Button onClick={() => openCategoryDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Kategorie erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => {
            const IconComponent = getIconComponent(category.icon)
            const isExpanded = expandedCategories.has(category.id)

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <Card className={`overflow-hidden transition-all ${!category.isActive ? 'opacity-60' : ''}`}>
                  <CardHeader
                    className={`cursor-pointer ${getColorClass(category.color)} bg-opacity-10 border-b`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getColorClass(category.color)}`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {category.name}
                            <Badge variant={category.isActive ? 'default' : 'secondary'}>
                              {category.services.length} Services
                            </Badge>
                            {!category.isActive && (
                              <Badge variant="outline">Inaktiv</Badge>
                            )}
                          </CardTitle>
                          {category.description && (
                            <CardDescription className="mt-1">
                              {category.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleActive('category', category.id, category.isActive)
                          }}
                          title={category.isActive ? 'Deaktivieren' : 'Aktivieren'}
                        >
                          {category.isActive ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            openCategoryDialog(category)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget({ type: 'category', id: category.id, name: category.name })
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            {category.services.map((service) => (
                              <div
                                key={service.id}
                                className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                                  !service.isActive ? 'opacity-60' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                  <div>
                                    <p className="font-medium">{service.name}</p>
                                    {service.description && (
                                      <p className="text-sm text-muted-foreground">
                                        {service.description}
                                      </p>
                                    )}
                                  </div>
                                  {!service.isActive && (
                                    <Badge variant="outline" className="text-xs">
                                      Inaktiv
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleActive('service', service.id, service.isActive)}
                                    title={service.isActive ? 'Deaktivieren' : 'Aktivieren'}
                                  >
                                    {service.isActive ? (
                                      <Eye className="h-4 w-4" />
                                    ) : (
                                      <EyeOff className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openServiceDialog(category.id, service)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setDeleteTarget({ type: 'service', id: service.id, name: service.name })
                                      setShowDeleteDialog(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <Button
                              variant="dashed"
                              className="w-full mt-2"
                              onClick={() => openServiceDialog(category.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Service hinzufügen
                            </Button>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Bearbeite die Kategorie-Details'
                : 'Erstelle eine neue Dienstleistungs-Kategorie'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name *</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="z.B. Schneiden & Styling"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Beschreibung</Label>
              <Textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Kurze Beschreibung der Kategorie"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select
                  value={categoryForm.icon}
                  onValueChange={(value) => setCategoryForm({ ...categoryForm, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Farbe</Label>
                <Select
                  value={categoryForm.color}
                  onValueChange={(value) => setCategoryForm({ ...categoryForm, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded ${option.class}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={saveCategory} disabled={isSaving || !categoryForm.name.trim()}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingCategory ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Service bearbeiten' : 'Neuer Service'}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? 'Bearbeite den Service'
                : 'Füge einen neuen Service zur Kategorie hinzu'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Name *</Label>
              <Input
                id="service-name"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                placeholder="z.B. Damenhaarschnitt"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-description">Beschreibung</Label>
              <Textarea
                id="service-description"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                placeholder="Kurze Beschreibung des Service"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServiceDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={saveService} disabled={isSaving || !serviceForm.name.trim()}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingService ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Löschen bestätigen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du {deleteTarget?.type === 'category' ? 'die Kategorie' : 'den Service'}{' '}
              <strong>&quot;{deleteTarget?.name}&quot;</strong> löschen möchtest?
              {deleteTarget?.type === 'category' && (
                <span className="block mt-2 text-destructive">
                  ⚠️ Alle Services in dieser Kategorie werden ebenfalls gelöscht!
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

