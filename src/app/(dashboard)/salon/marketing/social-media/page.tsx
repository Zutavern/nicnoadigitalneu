'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Calendar,
  BarChart3,
  Share2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Loader2,
  TrendingUp,
  Heart,
  MessageCircle,
  Eye,
  Clock,
  Sparkles,
  FileText,
  Hash,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

interface PostStats {
  total: number
  byStatus: Record<string, number>
}

interface Performance {
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalImpressions: number
  avgEngagementRate: number
}

interface Account {
  id: string
  platform: string
  accountName: string
  followersCount: number | null
  postsInPeriod: number
}

interface RecentPost {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduledFor: string | null
  createdAt: string
}

const platformIcons: Record<string, React.ReactNode> = {
  INSTAGRAM: <Instagram className="h-4 w-4" />,
  FACEBOOK: <Facebook className="h-4 w-4" />,
  LINKEDIN: <Linkedin className="h-4 w-4" />,
  TWITTER: <Twitter className="h-4 w-4" />,
  YOUTUBE: <Youtube className="h-4 w-4" />,
  TIKTOK: <Share2 className="h-4 w-4" />,
  PINTEREST: <Share2 className="h-4 w-4" />,
  THREADS: <Share2 className="h-4 w-4" />,
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

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500',
  SCHEDULED: 'bg-blue-500',
  PUBLISHING: 'bg-yellow-500',
  PUBLISHED: 'bg-green-500',
  FAILED: 'bg-red-500',
  CANCELLED: 'bg-gray-400',
}

export default function SocialMediaDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [postStats, setPostStats] = useState<PostStats | null>(null)
  const [performance, setPerformance] = useState<Performance | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      const [analyticsRes, postsRes, accountsRes] = await Promise.all([
        fetch('/api/social/analytics?period=30'),
        fetch('/api/social/posts?limit=5'),
        fetch('/api/social/accounts'),
      ])

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setPostStats(analyticsData.postStats)
        setPerformance(analyticsData.performance)
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setRecentPosts(postsData.posts || [])
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json()
        setAccounts(accountsData.accounts || [])
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Fehler beim Laden des Dashboards')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const hasAccounts = accounts.length > 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Social Media
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalte und plane deine Social Media Präsenz
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/salon/marketing/social-media/calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Kalender
            </Link>
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" asChild>
            <Link href="/salon/marketing/social-media/posts/create">
              <Plus className="h-4 w-4 mr-2" />
              Neuer Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Keine Accounts verbunden - Setup-Anleitung */}
      {!hasAccounts && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-dashed border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Share2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Verbinde deine Social Media Accounts</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Verknüpfe Instagram, Facebook, LinkedIn und mehr, um Posts zu planen und deine Performance zu tracken.
              </p>
              <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Link href="/salon/marketing/social-media/accounts">
                  <Plus className="h-4 w-4 mr-2" />
                  Accounts verbinden
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Geplante Posts</p>
                <p className="text-2xl font-bold">{postStats?.byStatus?.SCHEDULED || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Veröffentlicht</p>
                <p className="text-2xl font-bold">{postStats?.byStatus?.PUBLISHED || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entwürfe</p>
                <p className="text-2xl font-bold">{postStats?.byStatus?.DRAFT || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accounts</p>
                <p className="text-2xl font-bold">{accounts.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Performance (30 Tage)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Heart className="h-5 w-5 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{performance?.totalLikes || 0}</p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <MessageCircle className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{performance?.totalComments || 0}</p>
                <p className="text-xs text-muted-foreground">Kommentare</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Share2 className="h-5 w-5 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{performance?.totalShares || 0}</p>
                <p className="text-xs text-muted-foreground">Shares</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Eye className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">{performance?.totalImpressions || 0}</p>
                <p className="text-xs text-muted-foreground">Impressionen</p>
              </div>
            </div>

            {performance && performance.avgEngagementRate > 0 && (
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Engagement Rate</span>
                  <span className="ml-auto text-xl font-bold text-purple-500">
                    {(performance.avgEngagementRate * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Verbundene Accounts</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/salon/marketing/social-media/accounts">
                  Verwalten
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Noch keine Accounts verbunden
              </p>
            ) : (
              <div className="space-y-3">
                {accounts.slice(0, 5).map((account) => (
                  <div key={account.id} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full ${platformColors[account.platform] || 'bg-gray-500'} flex items-center justify-center text-white`}>
                      {platformIcons[account.platform]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{account.accountName}</p>
                      <p className="text-xs text-muted-foreground">
                        {account.followersCount?.toLocaleString() || '–'} Follower
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Letzte Posts
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/salon/marketing/social-media/posts">
                  Alle anzeigen
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Noch keine Posts erstellt</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/salon/marketing/social-media/posts/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Ersten Post erstellen
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className={`${statusColors[post.status]} text-white text-xs`}>
                          {post.status}
                        </Badge>
                        <div className="flex gap-1">
                          {post.platforms.map((p) => (
                            <span key={p} className="text-muted-foreground">
                              {platformIcons[p]}
                            </span>
                          ))}
                        </div>
                        {post.scheduledFor && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.scheduledFor).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schnellzugriff</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/salon/marketing/social-media/posts/create">
                <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                Mit KI erstellen
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/salon/marketing/social-media/templates">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                Vorlagen
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/salon/marketing/social-media/calendar">
                <Calendar className="h-4 w-4 mr-2 text-green-500" />
                Kalender öffnen
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/salon/marketing/social-media/analytics">
                <BarChart3 className="h-4 w-4 mr-2 text-orange-500" />
                Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

