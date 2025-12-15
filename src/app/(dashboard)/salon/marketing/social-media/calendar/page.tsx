'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  getDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { de } from 'date-fns/locale'

interface Post {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduledFor: string | null
  createdAt: string
}

const platformIcons: Record<string, React.ReactNode> = {
  INSTAGRAM: <Instagram className="h-3 w-3" />,
  FACEBOOK: <Facebook className="h-3 w-3" />,
  LINKEDIN: <Linkedin className="h-3 w-3" />,
  TWITTER: <Twitter className="h-3 w-3" />,
  TIKTOK: <Share2 className="h-3 w-3" />,
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200',
  PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
  FAILED: 'bg-red-100 text-red-700 border-red-200',
}

const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export default function SocialMediaCalendar() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

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
    
    return dayPosts
  }, [selectedDay, postsByDay, filterStatus])

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-purple-500" />
            Content-Kalender
          </h1>
          <p className="text-muted-foreground mt-1">
            Plane und überblicke deine Social Media Posts
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" asChild>
          <Link href="/salon/marketing/social-media/posts/create">
            <Plus className="h-4 w-4 mr-2" />
            Neuer Post
          </Link>
        </Button>
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
                        {dayPosts.slice(0, 3).map((post, i) => (
                          <div
                            key={post.id}
                            className={cn(
                              'text-[10px] px-1 py-0.5 rounded truncate',
                              statusColors[post.status]
                            )}
                          >
                            {post.content.substring(0, 15)}...
                          </div>
                        ))}
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
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {selectedDay 
                  ? format(selectedDay, 'EEEE, d. MMMM', { locale: de })
                  : 'Tag auswählen'
                }
              </CardTitle>
              {selectedDay && (
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="DRAFT">Entwürfe</SelectItem>
                    <SelectItem value="SCHEDULED">Geplant</SelectItem>
                    <SelectItem value="PUBLISHED">Veröffentlicht</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedDay ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Klicke auf einen Tag um Posts zu sehen
              </p>
            ) : selectedDayPosts.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  Keine Posts für diesen Tag
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/salon/marketing/social-media/posts/create">
                    <Plus className="h-3 w-3 mr-1" />
                    Post erstellen
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {selectedDayPosts.map(post => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg border hover:border-purple-500/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/salon/marketing/social-media/posts/${post.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="secondary" className={cn('text-xs', statusColors[post.status])}>
                        {post.status}
                      </Badge>
                      <div className="flex gap-1">
                        {post.platforms.map(p => (
                          <span key={p} className="text-muted-foreground">
                            {platformIcons[p]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    {post.scheduledFor && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(post.scheduledFor), 'HH:mm')} Uhr
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

