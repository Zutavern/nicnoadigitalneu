'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  MoreVertical,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Share2,
  Calendar,
  Hash,
  Link2,
  Sparkles,
  Image as ImageIcon,
  Film,
  Eye,
  Heart,
  MessageCircle,
  BarChart3,
  ExternalLink,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Post {
  id: string
  content: string
  mediaUrls: string[]
  mediaTypes: string[]
  hashtags: string[]
  mentions: string[]
  linkUrl: string | null
  platforms: string[]
  status: string
  scheduledFor: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  aiGenerated: boolean
  aiPrompt: string | null
  platformSettings: Record<string, unknown>
  postAccounts: Array<{
    id: string
    status: string
    publishedAt: string | null
    account: {
      id: string
      platform: string
      accountName: string
      accountHandle: string | null
      profileImageUrl: string | null
    }
  }>
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
}

const platformIcons: Record<string, React.ReactNode> = {
  INSTAGRAM: <Instagram className="h-5 w-5" />,
  FACEBOOK: <Facebook className="h-5 w-5" />,
  LINKEDIN: <Linkedin className="h-5 w-5" />,
  TWITTER: <Twitter className="h-5 w-5" />,
  YOUTUBE: <Youtube className="h-5 w-5" />,
  TIKTOK: <Share2 className="h-5 w-5" />,
  PINTEREST: <Share2 className="h-5 w-5" />,
  THREADS: <Share2 className="h-5 w-5" />,
}

const platformColors: Record<string, string> = {
  INSTAGRAM: 'bg-gradient-to-r from-purple-500 to-pink-500',
  FACEBOOK: 'bg-blue-600',
  LINKEDIN: 'bg-blue-700',
  TWITTER: 'bg-black',
  YOUTUBE: 'bg-red-600',
  TIKTOK: 'bg-black',
  PINTEREST: 'bg-red-500',
  THREADS: 'bg-black',
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT: { label: 'Entwurf', color: 'bg-gray-500', icon: Edit },
  SCHEDULED: { label: 'Geplant', color: 'bg-blue-500', icon: Clock },
  PUBLISHING: { label: 'Wird veröffentlicht', color: 'bg-yellow-500', icon: Loader2 },
  PUBLISHED: { label: 'Veröffentlicht', color: 'bg-green-500', icon: CheckCircle2 },
  FAILED: { label: 'Fehlgeschlagen', color: 'bg-red-500', icon: XCircle },
  CANCELLED: { label: 'Storniert', color: 'bg-gray-400', icon: AlertCircle },
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  useEffect(() => {
    loadPost()
  }, [resolvedParams.id])

  const loadPost = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/social/posts/${resolvedParams.id}`)
      
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Post nicht gefunden')
          router.push('/admin/marketing/social-media/posts')
          return
        }
        throw new Error('Fehler beim Laden')
      }
      
      const data = await res.json()
      setPost(data)
    } catch (error) {
      console.error('Error loading post:', error)
      toast.error('Post konnte nicht geladen werden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const res = await fetch(`/api/social/posts/${resolvedParams.id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Fehler beim Löschen')
      
      toast.success('Post gelöscht')
      router.push('/admin/marketing/social-media/posts')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Post konnte nicht gelöscht werden')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleDuplicate = async () => {
    try {
      setIsDuplicating(true)
      const res = await fetch(`/api/social/posts/${resolvedParams.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate' }),
      })
      
      if (!res.ok) throw new Error('Fehler beim Duplizieren')
      
      const duplicate = await res.json()
      toast.success('Post dupliziert')
      router.push(`/admin/marketing/social-media/posts/${duplicate.id}/edit`)
    } catch (error) {
      console.error('Duplicate error:', error)
      toast.error('Post konnte nicht dupliziert werden')
    } finally {
      setIsDuplicating(false)
    }
  }

  const handlePublishNow = async () => {
    try {
      const res = await fetch(`/api/social/posts/${resolvedParams.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish_now' }),
      })
      
      if (!res.ok) throw new Error('Fehler')
      
      toast.success('Veröffentlichung gestartet')
      loadPost()
    } catch (error) {
      console.error('Publish error:', error)
      toast.error('Fehler beim Veröffentlichen')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Post nicht gefunden</h2>
        <Button asChild>
          <Link href="/admin/marketing/social-media/posts">Zurück zur Übersicht</Link>
        </Button>
      </div>
    )
  }

  const status = statusConfig[post.status] || statusConfig.DRAFT
  const StatusIcon = status.icon
  const canEdit = ['DRAFT', 'SCHEDULED'].includes(post.status)
  const canPublish = ['DRAFT', 'SCHEDULED'].includes(post.status)
  const canDelete = post.status !== 'PUBLISHED'

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/marketing/social-media/posts">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Post Details</h1>
              <Badge className={cn('text-white', status.color)}>
                <StatusIcon className={cn('h-3 w-3 mr-1', status.icon === Loader2 && 'animate-spin')} />
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Erstellt am {format(new Date(post.createdAt), 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/admin/marketing/social-media/posts/${post.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Link>
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
                <Copy className="h-4 w-4 mr-2" />
                Duplizieren
              </DropdownMenuItem>
              {canPublish && (
                <DropdownMenuItem onClick={handlePublishNow}>
                  <Send className="h-4 w-4 mr-2" />
                  Jetzt veröffentlichen
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inhalt</CardTitle>
                {post.aiGenerated && (
                  <CardDescription className="flex items-center gap-1 text-purple-500">
                    <Sparkles className="h-4 w-4" />
                    Mit KI generiert
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="whitespace-pre-wrap">{post.content || <span className="text-muted-foreground italic">Kein Text</span>}</p>
                </div>
                
                {/* Hashtags */}
                {post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.hashtags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Link */}
                {post.linkUrl && (
                  <div className="flex items-center gap-2 p-3 rounded-lg border">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={post.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline truncate flex-1"
                    >
                      {post.linkUrl}
                    </a>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Media */}
          {post.mediaUrls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Medien ({post.mediaUrls.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    'grid gap-3',
                    post.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'
                  )}>
                    {post.mediaUrls.map((url, index) => {
                      const isVideo = post.mediaTypes[index] === 'video'
                      return (
                        <div 
                          key={index}
                          className={cn(
                            'relative rounded-lg overflow-hidden bg-muted group',
                            post.mediaUrls.length === 1 ? 'aspect-video max-h-[400px]' : 'aspect-square'
                          )}
                        >
                          {isVideo ? (
                            <>
                              <video
                                src={url}
                                className="w-full h-full object-cover"
                                loop
                                muted
                                playsInline
                                onMouseEnter={(e) => e.currentTarget.play()}
                                onMouseLeave={(e) => e.currentTarget.pause()}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:opacity-0 transition-opacity">
                                <Play className="h-12 w-12 text-white" />
                              </div>
                              <Badge className="absolute bottom-2 right-2 bg-cyan-500">
                                <Film className="h-3 w-3 mr-1" />
                                Video
                              </Badge>
                            </>
                          ) : (
                            <Image
                              src={url}
                              alt={`Media ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* AI Info */}
          {post.aiGenerated && post.aiPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    KI-Prompt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{post.aiPrompt}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Platforms */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plattformen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {post.platforms.map((platform) => (
                  <div key={platform} className="flex items-center gap-3">
                    <div className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center text-white',
                      platformColors[platform]
                    )}>
                      {platformIcons[platform]}
                    </div>
                    <span className="font-medium">{platform}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Schedule */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Zeitplan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {post.scheduledFor && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Geplant für:</span>
                    <span className="font-medium">
                      {format(new Date(post.scheduledFor), 'dd.MM.yyyy, HH:mm', { locale: de })} Uhr
                    </span>
                  </div>
                )}
                
                {post.publishedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Veröffentlicht:</span>
                    <span className="font-medium">
                      {format(new Date(post.publishedAt), 'dd.MM.yyyy, HH:mm', { locale: de })} Uhr
                    </span>
                  </div>
                )}
                
                {!post.scheduledFor && !post.publishedAt && (
                  <p className="text-sm text-muted-foreground">
                    Noch nicht geplant
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance (nur wenn veröffentlicht) */}
          {post.status === 'PUBLISHED' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Eye className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xl font-bold">—</p>
                      <p className="text-xs text-muted-foreground">Impressionen</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Heart className="h-5 w-5 mx-auto mb-1 text-red-500" />
                      <p className="text-xl font-bold">—</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <MessageCircle className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-xl font-bold">—</p>
                      <p className="text-xs text-muted-foreground">Kommentare</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Share2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
                      <p className="text-xl font-bold">—</p>
                      <p className="text-xs text-muted-foreground">Shares</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Performance-Daten werden automatisch synchronisiert
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Post wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Post wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

