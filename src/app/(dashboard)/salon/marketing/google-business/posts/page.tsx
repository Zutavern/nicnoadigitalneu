'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Megaphone,
  Plus,
  Eye,
  MousePointer,
  Calendar,
  Tag,
  Sparkles,
} from 'lucide-react'
import { DevelopmentBadge } from '@/components/google-business'
import { MOCK_POSTS } from '@/lib/google-business/mock-data'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import type { BusinessPost } from '@/lib/google-business/types'

const POST_TYPES = {
  update: { label: 'Update', color: 'bg-blue-500', description: 'Teile Neuigkeiten' },
  offer: { label: 'Angebot', color: 'bg-green-500', description: 'Bewerbe ein Angebot' },
  event: { label: 'Event', color: 'bg-purple-500', description: 'Kündige ein Event an' },
}

export default function PostsPage() {
  const [posts, setPosts] = useState<BusinessPost[]>(MOCK_POSTS)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPost, setNewPost] = useState({
    type: 'update' as BusinessPost['type'],
    title: '',
    content: '',
  })

  const handleCreatePost = () => {
    if (!newPost.content) {
      toast.error('Bitte füge einen Text hinzu')
      return
    }

    const post: BusinessPost = {
      id: `post-${Date.now()}`,
      type: newPost.type,
      title: newPost.title || undefined,
      content: newPost.content,
      publishedAt: new Date(),
      views: 0,
      clicks: 0,
    }

    setPosts([post, ...posts])
    setNewPost({ type: 'update', title: '', content: '' })
    setIsDialogOpen(false)
    toast.success('Post erstellt!', {
      description: 'Dein Post wurde veröffentlicht. (Demo)',
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/salon/marketing/google-business">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Posts</h1>
            <DevelopmentBadge variant="badge" />
          </div>
          <p className="text-muted-foreground ml-12">
            Veröffentliche Updates, Angebote und Events
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post erstellen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Neuen Post erstellen</DialogTitle>
              <DialogDescription>
                Erstelle einen Post für dein Google Business Profil
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Typ</Label>
                <Select
                  value={newPost.type}
                  onValueChange={(value) => setNewPost({ ...newPost, type: value as BusinessPost['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(POST_TYPES).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${config.color}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newPost.type !== 'update' && (
                <div className="space-y-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="z.B. Winterspecial 2025"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="content">Inhalt</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Was möchtest du teilen?"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {newPost.content.length}/1500 Zeichen
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreatePost}>
                <Megaphone className="h-4 w-4 mr-2" />
                Veröffentlichen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Schnellvorlagen
          </CardTitle>
          <CardDescription>Starte mit einer Vorlage für häufige Posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => {
                setNewPost({
                  type: 'update',
                  title: '',
                  content: 'Wir haben noch kurzfristige Termine diese Woche verfügbar! 💇‍♀️ Ruft uns an oder bucht direkt online.',
                })
                setIsDialogOpen(true)
              }}
            >
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-sm">Freie Termine</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => {
                setNewPost({
                  type: 'offer',
                  title: 'Diese Woche: 15% Rabatt',
                  content: 'Sichere dir diese Woche 15% Rabatt auf alle Colorationen! Gültig bis Samstag.',
                })
                setIsDialogOpen(true)
              }}
            >
              <Tag className="h-5 w-5 text-green-500" />
              <span className="text-sm">Rabatt-Aktion</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => {
                setNewPost({
                  type: 'event',
                  title: 'Styling-Workshop',
                  content: 'Lerne von unseren Experten, wie du deine Haare zu Hause perfekt stylst. Jetzt anmelden!',
                })
                setIsDialogOpen(true)
              }}
            >
              <Megaphone className="h-5 w-5 text-purple-500" />
              <span className="text-sm">Event ankündigen</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-blue-500" />
            Deine Posts
          </CardTitle>
          <CardDescription>
            {posts.length} Post{posts.length !== 1 && 's'} veröffentlicht
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Noch keine Posts vorhanden</p>
              <p className="text-sm mt-1">Erstelle deinen ersten Post!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border"
                >
                  <div className="flex items-start gap-4">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={POST_TYPES[post.type].color}>
                          {POST_TYPES[post.type].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(post.publishedAt, { addSuffix: true, locale: de })}
                        </span>
                      </div>
                      {post.title && (
                        <h3 className="font-medium mb-1">{post.title}</h3>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views} Aufrufe
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          {post.clicks} Klicks
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




