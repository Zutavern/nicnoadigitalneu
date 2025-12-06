'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  RefreshCw,
  UserPlus,
  MessageSquare,
  FileText,
  AlertTriangle,
  CreditCard,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
  metadata: Record<string, unknown> | null
}

const notificationIcons: Record<string, React.ReactNode> = {
  ONBOARDING_SUBMITTED: <UserPlus className="h-5 w-5 text-blue-500" />,
  ONBOARDING_APPROVED: <Check className="h-5 w-5 text-emerald-500" />,
  ONBOARDING_REJECTED: <AlertTriangle className="h-5 w-5 text-red-500" />,
  NEW_MESSAGE: <MessageSquare className="h-5 w-5 text-purple-500" />,
  DOCUMENT_UPLOADED: <FileText className="h-5 w-5 text-orange-500" />,
  DOCUMENT_APPROVED: <Check className="h-5 w-5 text-emerald-500" />,
  DOCUMENT_REJECTED: <AlertTriangle className="h-5 w-5 text-red-500" />,
  SUBSCRIPTION_EXPIRING: <CreditCard className="h-5 w-5 text-amber-500" />,
  SUBSCRIPTION_EXPIRED: <CreditCard className="h-5 w-5 text-red-500" />,
  SYSTEM_ALERT: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  WELCOME: <Sparkles className="h-5 w-5 text-purple-500" />,
}

const notificationLabels: Record<string, string> = {
  ONBOARDING_SUBMITTED: 'Onboarding eingereicht',
  ONBOARDING_APPROVED: 'Onboarding genehmigt',
  ONBOARDING_REJECTED: 'Onboarding abgelehnt',
  NEW_MESSAGE: 'Neue Nachricht',
  DOCUMENT_UPLOADED: 'Dokument hochgeladen',
  DOCUMENT_APPROVED: 'Dokument genehmigt',
  DOCUMENT_REJECTED: 'Dokument abgelehnt',
  SUBSCRIPTION_EXPIRING: 'Abo läuft ab',
  SUBSCRIPTION_EXPIRED: 'Abo abgelaufen',
  SYSTEM_ALERT: 'System-Warnung',
  WELCOME: 'Willkommen',
}

const notificationColors: Record<string, string> = {
  ONBOARDING_SUBMITTED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  ONBOARDING_APPROVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  ONBOARDING_REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  NEW_MESSAGE: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  DOCUMENT_UPLOADED: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  DOCUMENT_APPROVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  DOCUMENT_REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  SUBSCRIPTION_EXPIRING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  SUBSCRIPTION_EXPIRED: 'bg-red-500/10 text-red-500 border-red-500/20',
  SYSTEM_ALERT: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  WELCOME: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<string>('all')
  const [filterRead, setFilterRead] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const pageSize = 20

  const fetchNotifications = useCallback(async () => {
    try {
      const skip = (page - 1) * pageSize
      const unreadOnly = filterRead === 'unread'
      
      const response = await fetch(
        `/api/notifications?take=${pageSize}&skip=${skip}${unreadOnly ? '&unreadOnly=true' : ''}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setTotal(data.total)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [page, filterRead])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchNotifications()
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      })
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)))
    }
  }

  const handleMarkSelectedAsRead = async () => {
    const promises = Array.from(selectedIds).map((id) =>
      fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    )
    await Promise.all(promises)
    fetchNotifications()
    setSelectedIds(new Set())
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return 'Heute'
    if (isYesterday(date)) return 'Gestern'
    if (isThisWeek(date)) return format(date, 'EEEE', { locale: de })
    return format(date, 'dd. MMMM yyyy', { locale: de })
  }

  const groupedNotifications = notifications.reduce(
    (groups, notification) => {
      const dateKey = formatDate(notification.createdAt)
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(notification)
      return groups
    },
    {} as Record<string, Notification[]>
  )

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filterType)

  const filteredGrouped = Object.entries(groupedNotifications).reduce(
    (acc, [date, notifs]) => {
      const filtered = filterType === 'all'
        ? notifs
        : notifs.filter((n) => n.type === filterType)
      if (filtered.length > 0) {
        acc[date] = filtered
      }
      return acc
    },
    {} as Record<string, Notification[]>
  )

  const totalPages = Math.ceil(total / pageSize)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            Benachrichtigungen
          </h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} ungelesene Benachrichtigung${unreadCount === 1 ? '' : 'en'}`
              : 'Alle Benachrichtigungen gelesen'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
            Aktualisieren
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Alle gelesen
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                {Object.entries(notificationLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRead} onValueChange={(v) => { setFilterRead(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="unread">Ungelesen</SelectItem>
              </SelectContent>
            </Select>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size} ausgewählt
                </span>
                <Button variant="outline" size="sm" onClick={handleMarkSelectedAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Als gelesen markieren
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {Object.keys(filteredGrouped).length === 0 ? (
            <div className="text-center py-16">
              <Bell className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Benachrichtigungen</h3>
              <p className="text-muted-foreground">
                {filterType !== 'all' || filterRead !== 'all'
                  ? 'Keine Benachrichtigungen mit diesen Filtern gefunden'
                  : 'Du hast noch keine Benachrichtigungen erhalten'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {/* Select All */}
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
                <Checkbox
                  checked={selectedIds.size === filteredNotifications.length && filteredNotifications.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedIds.size === filteredNotifications.length
                    ? 'Alle abwählen'
                    : 'Alle auswählen'}
                </span>
              </div>

              {Object.entries(filteredGrouped).map(([date, notifs]) => (
                <div key={date}>
                  <div className="px-4 py-2 bg-muted/50 sticky top-0">
                    <span className="text-sm font-medium text-muted-foreground">{date}</span>
                  </div>
                  <AnimatePresence>
                    {notifs.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className={cn(
                          'flex items-start gap-4 px-4 py-4 hover:bg-muted/30 transition-colors',
                          !notification.isRead && 'bg-primary/5'
                        )}
                      >
                        <Checkbox
                          checked={selectedIds.has(notification.id)}
                          onCheckedChange={() => handleToggleSelect(notification.id)}
                        />
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {notificationIcons[notification.type] || (
                            <Bell className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p
                                  className={cn(
                                    'font-medium truncate',
                                    !notification.isRead && 'text-foreground'
                                  )}
                                >
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs',
                                    notificationColors[notification.type]
                                  )}
                                >
                                  {notificationLabels[notification.type]}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                    locale: de,
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {notification.link && (
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={notification.link}>Anzeigen</Link>
                                </Button>
                              )}
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Seite {page} von {totalPages} ({total} Benachrichtigungen)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
