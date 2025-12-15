'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Edit,
  Trash2,
  Eye,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Music2,
  Youtube,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

// Platform Icons
const platformIcons: Record<string, React.ReactNode> = {
  INSTAGRAM: <Instagram className="h-4 w-4 text-pink-500" />,
  FACEBOOK: <Facebook className="h-4 w-4 text-blue-600" />,
  LINKEDIN: <Linkedin className="h-4 w-4 text-blue-700" />,
  TWITTER: <Twitter className="h-4 w-4 text-sky-500" />,
  TIKTOK: <Music2 className="h-4 w-4 text-black dark:text-white" />,
  YOUTUBE: <Youtube className="h-4 w-4 text-red-600" />,
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const config = {
    DRAFT: { label: 'Entwurf', variant: 'secondary' as const, icon: Edit },
    SCHEDULED: { label: 'Geplant', variant: 'default' as const, icon: Clock },
    PUBLISHED: { label: 'Veröffentlicht', variant: 'default' as const, icon: CheckCircle2 },
    FAILED: { label: 'Fehlgeschlagen', variant: 'destructive' as const, icon: XCircle },
  }
  
  const { label, variant, icon: Icon } = config[status as keyof typeof config] || config.DRAFT
  
  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

interface Post {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduledAt: string | null
  publishedAt: string | null
  mediaUrls: string[]
  hashtags: string[]
  createdAt: string
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)

  // Posts laden
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/social/posts')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Fehler beim Laden der Posts:', error)
      toast.error('Posts konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // Post löschen
  const handleDelete = async () => {
    if (!postToDelete) return
    
    try {
      const res = await fetch(`/api/social/posts/${postToDelete}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== postToDelete))
        toast.success('Post gelöscht')
      } else {
        toast.error('Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Fehler beim Löschen')
    } finally {
      setDeleteDialogOpen(false)
      setPostToDelete(null)
    }
  }

  // Gefilterte Posts
  const filteredPosts = posts.filter(post => {
    // Suchfilter
    if (searchQuery && !post.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Status Filter
    if (statusFilter !== 'all' && post.status !== statusFilter) {
      return false
    }
    
    // Platform Filter
    if (platformFilter !== 'all' && !post.platforms.includes(platformFilter)) {
      return false
    }
    
    return true
  })

  // Statistiken
  const stats = {
    total: posts.length,
    draft: posts.filter(p => p.status === 'DRAFT').length,
    scheduled: posts.filter(p => p.status === 'SCHEDULED').length,
    published: posts.filter(p => p.status === 'PUBLISHED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/marketing/social-media">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Alle Posts</h1>
            <p className="text-muted-foreground">
              Verwalte deine Social Media Posts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchPosts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild>
            <Link href="/admin/marketing/social-media/posts/create">
              <Plus className="h-4 w-4 mr-2" />
              Neuer Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Gesamt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-muted-foreground">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">Entwürfe</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-500">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Geplant</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">{stats.published}</div>
            <p className="text-xs text-muted-foreground">Veröffentlicht</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Posts durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="DRAFT">Entwürfe</SelectItem>
                <SelectItem value="SCHEDULED">Geplant</SelectItem>
                <SelectItem value="PUBLISHED">Veröffentlicht</SelectItem>
                <SelectItem value="FAILED">Fehlgeschlagen</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Plattform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Plattformen</SelectItem>
                <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                <SelectItem value="FACEBOOK">Facebook</SelectItem>
                <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                <SelectItem value="TWITTER">X/Twitter</SelectItem>
                <SelectItem value="TIKTOK">TikTok</SelectItem>
                <SelectItem value="YOUTUBE">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Posts gefunden</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' || platformFilter !== 'all'
                ? 'Versuche andere Filter'
                : 'Erstelle deinen ersten Social Media Post'}
            </p>
            <Button asChild>
              <Link href="/admin/marketing/social-media/posts/create">
                <Plus className="h-4 w-4 mr-2" />
                Post erstellen
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                    <div 
                      className="flex gap-4 cursor-pointer"
                      onClick={() => window.location.href = `/admin/marketing/social-media/posts/${post.id}/edit`}
                    >
                      {/* Media Preview */}
                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={post.mediaUrls[0]}
                            alt="Post media"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2 mb-2">
                          {post.content || <span className="text-muted-foreground italic">Kein Text</span>}
                        </p>
                        
                        {/* Platforms */}
                        <div className="flex items-center gap-2 mb-2">
                          {post.platforms.map(platform => (
                            <span key={platform} title={platform}>
                              {platformIcons[platform]}
                            </span>
                          ))}
                        </div>
                        
                        {/* Meta */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <StatusBadge status={post.status} />
                          
                          {post.scheduledAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(post.scheduledAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                            </span>
                          )}
                          
                          {post.publishedAt && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              {format(new Date(post.publishedAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/marketing/social-media/posts/${post.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Anzeigen
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/marketing/social-media/posts/${post.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Bearbeiten
                            </Link>
                          </DropdownMenuItem>
                          {post.status === 'DRAFT' && (
                            <DropdownMenuItem>
                              <Send className="h-4 w-4 mr-2" />
                              Veröffentlichen
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPostToDelete(post.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Post löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Post wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

