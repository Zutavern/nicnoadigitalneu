'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Eye,
  Users,
  FolderOpen,
  Tags,
  Plus,
  TrendingUp,
  Clock,
  Loader2,
} from 'lucide-react'

interface BlogStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
  totalAuthors: number
  totalCategories: number
  totalTags: number
  recentPosts: Array<{
    id: string
    title: string
    status: string
    viewCount: number
    publishedAt: string | null
  }>
}

export default function AdminBlogPage() {
  const [stats, setStats] = useState<BlogStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch all data in parallel
      const [postsRes, authorsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/admin/blog/posts?limit=5'),
        fetch('/api/admin/blog/authors'),
        fetch('/api/admin/blog/categories'),
        fetch('/api/admin/blog/tags'),
      ])

      const [postsData, authorsData, categoriesData, tagsData] = await Promise.all([
        postsRes.json(),
        authorsRes.json(),
        categoriesRes.json(),
        tagsRes.json(),
      ])

      // Calculate stats
      const posts = postsData.posts || []
      const publishedPosts = posts.filter((p: { status: string }) => p.status === 'PUBLISHED').length
      const draftPosts = posts.filter((p: { status: string }) => p.status === 'DRAFT').length
      const totalViews = posts.reduce((sum: number, p: { viewCount: number }) => sum + (p.viewCount || 0), 0)

      setStats({
        totalPosts: postsData.pagination?.total || 0,
        publishedPosts,
        draftPosts,
        totalViews,
        totalAuthors: authorsData.authors?.length || 0,
        totalCategories: categoriesData.categories?.length || 0,
        totalTags: tagsData.tags?.length || 0,
        recentPosts: posts.slice(0, 5),
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Verwalte deine Blog-Inhalte und Autoren
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Artikel
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artikel gesamt</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.publishedPosts || 0} veröffentlicht, {stats?.draftPosts || 0} Entwürfe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aufrufe gesamt</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Alle veröffentlichten Artikel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autoren</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAuthors || 0}</div>
            <Link href="/admin/blog/authors" className="text-xs text-primary hover:underline">
              Autoren verwalten →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategorien & Tags</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.totalCategories || 0) + (stats?.totalTags || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalCategories || 0} Kategorien, {stats?.totalTags || 0} Tags
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Posts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Schnellzugriff auf wichtige Funktionen</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/blog/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                Neuen Artikel erstellen
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/blog/posts">
                <FileText className="mr-2 h-4 w-4" />
                Alle Artikel anzeigen
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/blog/categories">
                <FolderOpen className="mr-2 h-4 w-4" />
                Kategorien verwalten
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/blog/authors">
                <Users className="mr-2 h-4 w-4" />
                Autoren verwalten
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/blog/tags">
                <Tags className="mr-2 h-4 w-4" />
                Tags verwalten
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Letzte Artikel</CardTitle>
            <CardDescription>Zuletzt bearbeitete Blog-Posts</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentPosts && stats.recentPosts.length > 0 ? (
              <div className="space-y-4">
                {stats.recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between">
                    <div className="space-y-1 min-w-0">
                      <Link
                        href={`/admin/blog/posts/${post.id}`}
                        className="text-sm font-medium hover:underline truncate block"
                      >
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {post.viewCount || 0} Aufrufe
                        {post.publishedAt && (
                          <>
                            <Clock className="h-3 w-3 ml-2" />
                            {new Date(post.publishedAt).toLocaleDateString('de-DE')}
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {post.status === 'PUBLISHED' ? 'Live' : 'Entwurf'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Noch keine Artikel vorhanden
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


