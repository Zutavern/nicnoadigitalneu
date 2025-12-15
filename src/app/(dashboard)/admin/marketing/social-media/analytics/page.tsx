'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Users,
  FileText,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Clock,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

interface Analytics {
  period: number
  postStats: {
    total: number
    byStatus: Record<string, number>
  }
  performance: {
    totalPosts: number
    totalLikes: number
    totalComments: number
    totalShares: number
    totalImpressions: number
    totalReach: number
    avgEngagementRate: number
  }
  topPosts: Array<{
    id: string
    content: string
    platforms: string[]
    publishedAt: string
    totalLikes: number
    totalComments: number
    totalShares: number
    engagementRate: number
  }>
  accounts: Array<{
    id: string
    platform: string
    accountName: string
    followersCount: number | null
    postsInPeriod: number
  }>
}

const platformIcons: Record<string, React.ReactNode> = {
  INSTAGRAM: <Instagram className="h-4 w-4" />,
  FACEBOOK: <Facebook className="h-4 w-4" />,
  LINKEDIN: <Linkedin className="h-4 w-4" />,
  TWITTER: <Twitter className="h-4 w-4" />,
}

const platformColors: Record<string, string> = {
  INSTAGRAM: '#E4405F',
  FACEBOOK: '#1877F2',
  LINKEDIN: '#0A66C2',
  TWITTER: '#1DA1F2',
  TIKTOK: '#000000',
}

export default function SocialMediaAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/social/analytics?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Fehler beim Laden der Analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  const perf = analytics?.performance

  // Dummy-Daten für Charts (in Produktion aus Timeline-Daten generieren)
  const chartData = [
    { name: 'Woche 1', likes: 120, comments: 45, shares: 23 },
    { name: 'Woche 2', likes: 180, comments: 62, shares: 35 },
    { name: 'Woche 3', likes: 150, comments: 55, shares: 28 },
    { name: 'Woche 4', likes: 220, comments: 78, shares: 42 },
  ]

  const platformData = analytics?.accounts.map(acc => ({
    name: acc.platform,
    posts: acc.postsInPeriod,
    followers: acc.followersCount || 0,
  })) || []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-500" />
            Social Media Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Verfolge die Performance deiner Social Media Posts
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Zeitraum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Letzte 7 Tage</SelectItem>
            <SelectItem value="30">Letzte 30 Tage</SelectItem>
            <SelectItem value="90">Letzte 90 Tage</SelectItem>
            <SelectItem value="365">Letztes Jahr</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Haupt-KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gesamt Likes</p>
                  <p className="text-3xl font-bold">{perf?.totalLikes?.toLocaleString() || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kommentare</p>
                  <p className="text-3xl font-bold">{perf?.totalComments?.toLocaleString() || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Shares</p>
                  <p className="text-3xl font-bold">{perf?.totalShares?.toLocaleString() || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Impressionen</p>
                  <p className="text-3xl font-bold">{perf?.totalImpressions?.toLocaleString() || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Engagement Rate Highlight */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
        <CardContent className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Durchschnittliche Engagement Rate</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {perf?.avgEngagementRate 
                    ? `${(perf.avgEngagementRate * 100).toFixed(2)}%` 
                    : '0.00%'}
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground mb-1">
                Veröffentlichte Posts im Zeitraum
              </p>
              <p className="text-2xl font-semibold">{perf?.totalPosts || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Engagement Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Engagement-Verlauf</CardTitle>
            <CardDescription>Likes, Kommentare & Shares über Zeit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="likes" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="comments" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="shares" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">Likes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-muted-foreground">Kommentare</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Shares</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts by Platform */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Posts nach Plattform</CardTitle>
            <CardDescription>Verteilung deiner Posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="posts" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Post-Statistiken */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              Entwürfe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.postStats?.byStatus?.DRAFT || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Posts in Bearbeitung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Geplant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.postStats?.byStatus?.SCHEDULED || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Posts zur Veröffentlichung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Veröffentlicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.postStats?.byStatus?.PUBLISHED || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Erfolgreich gepostet</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Posts */}
      {analytics?.topPosts && analytics.topPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              Top-performing Posts
            </CardTitle>
            <CardDescription>Deine erfolgreichsten Posts im Zeitraum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPosts.map((post, index) => (
                <div key={post.id} className="flex items-start gap-4 p-3 rounded-lg border">
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm',
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {post.totalLikes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> {post.totalComments || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" /> {post.totalShares || 0}
                      </span>
                      <div className="flex gap-1 ml-auto">
                        {post.platforms.map(p => (
                          <span key={p}>{platformIcons[p]}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account-Übersicht */}
      {analytics?.accounts && analytics.accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Account-Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.accounts.map(account => (
                <div key={account.id} className="p-4 rounded-lg border text-center">
                  <div className="flex items-center justify-center mb-2">
                    {platformIcons[account.platform]}
                    <span className="ml-2 font-medium">{account.accountName}</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {account.followersCount?.toLocaleString() || '–'}
                  </p>
                  <p className="text-xs text-muted-foreground">Follower</p>
                  <Badge variant="secondary" className="mt-2">
                    {account.postsInPeriod} Posts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

