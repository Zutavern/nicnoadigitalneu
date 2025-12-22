'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageUploader } from '@/components/ui/image-uploader'
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Linkedin, Instagram, Globe, X } from 'lucide-react'
import { toast } from 'sonner'

interface Author {
  id: string
  name: string
  slug: string
  bio: string | null
  avatar: string | null
  role: string | null
  linkedinUrl: string | null
  instagramUrl: string | null
  websiteUrl: string | null
  isActive: boolean
  _count: {
    posts: number
  }
}

export default function AdminBlogAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [authorToDelete, setAuthorToDelete] = useState<Author | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [role, setRole] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')

  useEffect(() => {
    fetchAuthors()
  }, [])

  const fetchAuthors = async () => {
    try {
      const res = await fetch('/api/admin/blog/authors')
      const data = await res.json()
      setAuthors(data.authors || [])
    } catch (error) {
      console.error('Error fetching authors:', error)
      toast.error('Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (author?: Author) => {
    if (author) {
      setEditingAuthor(author)
      setName(author.name)
      setBio(author.bio || '')
      setAvatar(author.avatar || '')
      setRole(author.role || '')
      setLinkedinUrl(author.linkedinUrl || '')
      setInstagramUrl(author.instagramUrl || '')
      setWebsiteUrl(author.websiteUrl || '')
    } else {
      setEditingAuthor(null)
      setName('')
      setBio('')
      setAvatar('')
      setRole('')
      setLinkedinUrl('')
      setInstagramUrl('')
      setWebsiteUrl('')
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Bitte gib einen Namen ein')
      return
    }

    setIsSaving(true)
    try {
      const url = '/api/admin/blog/authors'
      const method = editingAuthor ? 'PUT' : 'POST'
      const body = editingAuthor
        ? {
            id: editingAuthor.id,
            name,
            bio: bio || null,
            avatar: avatar || null,
            role: role || null,
            linkedinUrl: linkedinUrl || null,
            instagramUrl: instagramUrl || null,
            websiteUrl: websiteUrl || null,
          }
        : {
            name,
            bio: bio || null,
            avatar: avatar || null,
            role: role || null,
            linkedinUrl: linkedinUrl || null,
            instagramUrl: instagramUrl || null,
            websiteUrl: websiteUrl || null,
          }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      toast.success(editingAuthor ? 'Autor aktualisiert' : 'Autor erstellt')
      setDialogOpen(false)
      fetchAuthors()
    } catch (error) {
      console.error('Error saving author:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!authorToDelete) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/blog/authors?id=${authorToDelete.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Löschen')
      }

      toast.success('Autor gelöscht')
      setDeleteDialogOpen(false)
      setAuthorToDelete(null)
      fetchAuthors()
    } catch (error) {
      console.error('Error deleting author:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Autoren</h1>
            <p className="text-muted-foreground mt-1">Blog-Autoren verwalten</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Autor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAuthor ? 'Autor bearbeiten' : 'Neuer Autor'}</DialogTitle>
              <DialogDescription>
                {editingAuthor ? 'Bearbeite die Autor-Details' : 'Erstelle einen neuen Blog-Autor'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="z.B. Daniel Zutavern"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rolle / Position</Label>
                  <Input
                    id="role"
                    placeholder="z.B. Gründer & CEO"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  {/* Aktuelles Bild anzeigen */}
                  {avatar && (
                    <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={avatar} alt={name} />
                        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{avatar}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setAvatar('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Upload/URL Tabs */}
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="upload" className="flex-1">
                        {avatar ? 'Neues Bild' : 'Upload'}
                      </TabsTrigger>
                      <TabsTrigger value="url" className="flex-1">
                        {avatar ? 'Neue URL' : 'URL'}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="mt-2">
                      <ImageUploader
                        onUpload={(url) => {
                          setAvatar(url)
                          toast.success('Avatar hochgeladen!')
                        }}
                        onRemove={() => {}}
                        uploadEndpoint="/api/admin/blog/authors/upload-image"
                        aspectRatio={1}
                        placeholder={avatar ? "Neuen Avatar hochladen" : "Avatar hochladen"}
                        description="JPEG, PNG, WebP • Empfohlen: 400x400px"
                        previewHeight="aspect-square"
                      />
                    </TabsContent>
                    <TabsContent value="url" className="mt-2">
                      <Input
                        placeholder="https://example.com/avatar.jpg"
                        onChange={(e) => {
                          if (e.target.value) {
                            setAvatar(e.target.value)
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Gib eine Bild-URL ein
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Kurze Beschreibung..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="https://instagram.com/..."
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://..."
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAuthor ? 'Speichern' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Authors Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : authors.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Noch keine Autoren vorhanden</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Ersten Autor erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          authors.map((author) => (
            <Card key={author.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={author.avatar || ''} alt={author.name} />
                      <AvatarFallback>{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{author.name}</CardTitle>
                      {author.role && (
                        <CardDescription>{author.role}</CardDescription>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">{author._count.posts} Posts</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {author.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{author.bio}</p>
                )}
                <div className="flex items-center gap-2">
                  {author.linkedinUrl && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {author.instagramUrl && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={author.instagramUrl} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {author.websiteUrl && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={author.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <div className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(author)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => {
                      setAuthorToDelete(author)
                      setDeleteDialogOpen(true)
                    }}
                    disabled={author._count.posts > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Autor löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du den Autor &quot;{authorToDelete?.name}&quot; wirklich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


