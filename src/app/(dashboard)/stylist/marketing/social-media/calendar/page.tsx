'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Share2,
  Calendar as CalendarIcon,
  Clock,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Sparkles,
  Eye,
  Send,
  CheckCircle2,
  AlertCircle,
  Youtube,
  Image as ImageIcon,
  Film,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isPast,
  isFuture,
  addDays,
} from 'date-fns'
import { de } from 'date-fns/locale'

interface Post {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduledFor: string | null
  createdAt: string
  mediaUrls?: string[]
  aiGenerated?: boolean
}

const platformIcons: Record<string, React.ReactNode> = {
  INSTAGRAM: <Instagram className="h-3 w-3" />,
  FACEBOOK: <Facebook className="h-3 w-3" />,
  LINKEDIN: <Linkedin className="h-3 w-3" />,
  TWITTER: <Twitter className="h-3 w-3" />,
  TIKTOK: <Share2 className="h-3 w-3" />,
  YOUTUBE: <Youtube className="h-3 w-3" />,
}

const platformColors: Record<string, string> = {
  INSTAGRAM: 'from-purple-500 to-pink-500',
  FACEBOOK: 'from-blue-500 to-blue-600',
  LINKEDIN: 'from-blue-600 to-blue-700',
  TWITTER: 'from-gray-700 to-black',
  TIKTOK: 'from-pink-500 to-cyan-500',
  YOUTUBE: 'from-red-500 to-red-600',
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string; icon: React.ElementType }> = {
  DRAFT: { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800', label: 'Entwurf', icon: Edit },
  SCHEDULED: { color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', label: 'Geplant', icon: Clock },
  PUBLISHING: { color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Wird veröffentlicht', icon: Loader2 },
  PUBLISHED: { color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', label: 'Veröffentlicht', icon: CheckCircle2 },
  FAILED: { color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', label: 'Fehlgeschlagen', icon: AlertCircle },
}

const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

// Beste Posting-Zeiten (aus Branchenanalysen)
const bestPostingTimes: Record<string, string[]> = {
  INSTAGRAM: ['11:00', '13:00', '19:00'],
  FACEBOOK: ['09:00', '13:00', '16:00'],
  LINKEDIN: ['08:00', '12:00', '17:00'],
  TWITTER: ['09:00', '12:00', '17:00'],
  TIKTOK: ['19:00', '21:00', '22:00'],
  YOUTUBE: ['14:00', '16:00', '21:00'],
}

export default function SocialMediaCalendar() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date())
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  useEffect(() => {
    loadPosts()
  }, [currentDate])

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/social/posts?limit=100')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error loading posts:', error)
      toast.error('Fehler beim Laden der Posts')
    } finally {
      setIsLoading(false)
    }
  }

  // Kalender-Tage berechnen
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentDate])

  // Posts nach Tag gruppieren
  const postsByDay = useMemo(() => {
    const grouped: Record<string, Post[]> = {}
    
    posts.forEach(post => {
      const dateKey = post.scheduledFor 
        ? format(new Date(post.scheduledFor), 'yyyy-MM-dd')
        : format(new Date(post.createdAt), 'yyyy-MM-dd')
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(post)
    })
    
    return grouped
  }, [posts])

  // Posts für ausgewählten Tag
  const selectedDayPosts = useMemo(() => {
    if (!selectedDay) return []
    const dateKey = format(selectedDay, 'yyyy-MM-dd')
    let dayPosts = postsByDay[dateKey] || []
    
    if (filterStatus !== 'all') {
      dayPosts = dayPosts.filter(p => p.status === filterStatus)
    }
    
    if (filterPlatform !== 'all') {
      dayPosts = dayPosts.filter(p => p.platforms.includes(filterPlatform))
    }
    
    // Nach Zeit sortieren
    return dayPosts.sort((a, b) => {
      const timeA = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0
      const timeB = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0
      return timeA - timeB
    })
  }, [selectedDay, postsByDay, filterStatus, filterPlatform])

  // Statistiken für den Monat
  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    
    const monthPosts = posts.filter(post => {
      const postDate = post.scheduledFor ? new Date(post.scheduledFor) : new Date(post.createdAt)
      return postDate >= monthStart && postDate <= monthEnd
    })
    
    return {
      total: monthPosts.length,
      scheduled: monthPosts.filter(p => p.status === 'SCHEDULED').length,
      published: monthPosts.filter(p => p.status === 'PUBLISHED').length,
      draft: monthPosts.filter(p => p.status === 'DRAFT').length,
    }
  }, [posts, currentDate])

  // Schnell-Post für bestimmten Tag erstellen
  const createPostForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    router.push(`/stylist/marketing/social-media/posts/create?date=${dateStr}`)
  }

  // Post duplizieren
  const duplicatePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/social/posts/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate' }),
      })
      if (res.ok) {
        const newPost = await res.json()
        toast.success('Post dupliziert')
        router.push(`/stylist/marketing/social-media/posts/${newPost.id}/edit`)
      }
    } catch {
      toast.error('Fehler beim Duplizieren')
    }
  }

  // Post löschen
  const deletePost = async (postId: string) => {
    if (!confirm('Post wirklich löschen?')) return
    try {
      const res = await fetch(`/api/social/posts/${postId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Post gelöscht')
        loadPosts()
      }
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDay(new Date())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              Content-Kalender
            </h1>
            <p className="text-muted-foreground mt-1">
              Plane und überblicke deine Social Media Posts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/stylist/marketing/social-media/posts">
                <Eye className="h-4 w-4 mr-2" />
                Alle Posts
              </Link>
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" asChild>
              <Link href="/stylist/marketing/social-media/posts/create">
                <Plus className="h-4 w-4 mr-2" />
                Neuer Post
              </Link>
            </Button>
          </div>
        </div>

        {/* Monats-Statistiken */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-0">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Gesamt</p>
                  <p className="text-2xl font-bold">{monthStats.total}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">Geplant</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{monthStats.scheduled}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide">Veröffentlicht</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{monthStats.published}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-0">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wide">Entwürfe</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{monthStats.draft}</p>
                </div>
                <Edit className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Kalender */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold min-w-[180px] text-center">
                  {format(currentDate, 'MMMM yyyy', { locale: de })}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Heute
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Wochentage */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Kalender-Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const dayPosts = postsByDay[dateKey] || []
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isSelected = selectedDay && isSameDay(day, selectedDay)
                const isDayToday = isToday(day)

                return (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      'relative min-h-[80px] p-1 rounded-lg border transition-all',
                      'hover:border-purple-500/50 hover:bg-purple-500/5',
                      !isCurrentMonth && 'opacity-40',
                      isSelected && 'border-purple-500 bg-purple-500/10',
                      isDayToday && !isSelected && 'border-purple-500/30'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={cn(
                      'text-sm font-medium mb-1',
                      isDayToday && 'text-purple-500'
                    )}>
                      {format(day, 'd')}
                    </div>

                    {/* Post-Indikatoren */}
                    {dayPosts.length > 0 && (
                      <div className="space-y-0.5">
                        {dayPosts.slice(0, 3).map((post) => {
                          const config = statusConfig[post.status] || statusConfig.DRAFT
                          return (
                            <div
                              key={post.id}
                              className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium',
                                config.bgColor,
                                config.color
                              )}
                            >
                              {post.content?.substring(0, 15) || 'Ohne Text'}...
                            </div>
                          )
                        })}
                        {dayPosts.length > 3 && (
                          <div className="text-[10px] text-muted-foreground text-center">
                            +{dayPosts.length - 3} mehr
                          </div>
                        )}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Legende */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-200" />
                <span className="text-xs text-muted-foreground">Entwurf</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-200" />
                <span className="text-xs text-muted-foreground">Geplant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-200" />
                <span className="text-xs text-muted-foreground">Veröffentlicht</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tagesansicht */}
        <Card className="lg:sticky lg:top-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {selectedDay 
                    ? format(selectedDay, 'EEEE, d. MMMM', { locale: de })
                    : 'Tag auswählen'
                  }
                </CardTitle>
                {selectedDay && isToday(selectedDay) && (
                  <Badge variant="secondary" className="mt-1 text-xs bg-purple-100 text-purple-700">
                    Heute
                  </Badge>
                )}
              </div>
              {selectedDay && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => createPostForDay(selectedDay)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Post
                </Button>
              )}
            </div>
            
            {/* Filter */}
            {selectedDay && (
              <div className="flex gap-2 mt-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="DRAFT">Entwürfe</SelectItem>
                    <SelectItem value="SCHEDULED">Geplant</SelectItem>
                    <SelectItem value="PUBLISHED">Veröffentlicht</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Plattform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                    <SelectItem value="FACEBOOK">Facebook</SelectItem>
                    <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                    <SelectItem value="TWITTER">X/Twitter</SelectItem>
                    <SelectItem value="TIKTOK">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {!selectedDay ? (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-muted-foreground text-center py-8"
                >
                  Klicke auf einen Tag um Posts zu sehen
                </motion.p>
              ) : selectedDayPosts.length === 0 ? (
                <motion.div
                  key="no-posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="font-medium mb-1">Keine Posts geplant</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isFuture(selectedDay) ? 'Plane einen Post für diesen Tag' : 'Keine Posts an diesem Tag'}
                  </p>
                  {isFuture(selectedDay) && (
                    <div className="space-y-2">
                      <Button 
                        onClick={() => createPostForDay(selectedDay)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Post erstellen
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        💡 Tipp: Beste Zeit für {filterPlatform !== 'all' ? filterPlatform : 'Instagram'}: {bestPostingTimes[filterPlatform !== 'all' ? filterPlatform : 'INSTAGRAM']?.join(', ') || '12:00'} Uhr
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3 max-h-[500px] overflow-y-auto pr-1"
                >
                  {selectedDayPosts.map((post, index) => {
                    const config = statusConfig[post.status] || statusConfig.DRAFT
                    const StatusIcon = config.icon
                    
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'p-3 rounded-xl border transition-all group',
                          'hover:border-purple-500/50 hover:shadow-md'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={cn('text-xs gap-1', config.bgColor, config.color)}>
                              <StatusIcon className={cn('h-3 w-3', config.icon === Loader2 && 'animate-spin')} />
                              {config.label}
                            </Badge>
                            {post.aiGenerated && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Sparkles className="h-3 w-3 text-purple-500" />
                                </TooltipTrigger>
                                <TooltipContent>KI-generiert</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/stylist/marketing/social-media/posts/${post.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Anzeigen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/stylist/marketing/social-media/posts/${post.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => duplicatePost(post.id)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplizieren
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => deletePost(post.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Platforms */}
                        <div className="flex items-center gap-1 mb-2">
                          {post.platforms.map(p => (
                            <Tooltip key={p}>
                              <TooltipTrigger>
                                <div className={cn(
                                  'h-5 w-5 rounded flex items-center justify-center text-white',
                                  `bg-gradient-to-r ${platformColors[p]}`
                                )}>
                                  {platformIcons[p]}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>{p}</TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                        
                        {/* Content Preview */}
                        <p 
                          className="text-sm line-clamp-2 cursor-pointer hover:text-purple-600 transition-colors"
                          onClick={() => router.push(`/stylist/marketing/social-media/posts/${post.id}`)}
                        >
                          {post.content || <span className="italic text-muted-foreground">Kein Text</span>}
                        </p>
                        
                        {/* Media indicator */}
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <ImageIcon className="h-3 w-3" />
                            {post.mediaUrls.length} {post.mediaUrls.length === 1 ? 'Bild' : 'Bilder'}
                          </div>
                        )}
                        
                        {/* Time */}
                        {post.scheduledFor && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(post.scheduledFor), 'HH:mm')} Uhr
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
    </TooltipProvider>
  )
}

