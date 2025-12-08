'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Check, CheckCheck, ExternalLink, FileText, MessageSquare, UserPlus, AlertTriangle, CreditCard, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

const notificationIcons: Record<string, React.ReactNode> = {
  ONBOARDING_SUBMITTED: <UserPlus className="h-4 w-4 text-blue-500" />,
  ONBOARDING_APPROVED: <Check className="h-4 w-4 text-emerald-500" />,
  ONBOARDING_REJECTED: <AlertTriangle className="h-4 w-4 text-red-500" />,
  NEW_MESSAGE: <MessageSquare className="h-4 w-4 text-purple-500" />,
  DOCUMENT_UPLOADED: <FileText className="h-4 w-4 text-orange-500" />,
  DOCUMENT_APPROVED: <Check className="h-4 w-4 text-emerald-500" />,
  DOCUMENT_REJECTED: <AlertTriangle className="h-4 w-4 text-red-500" />,
  SUBSCRIPTION_EXPIRING: <CreditCard className="h-4 w-4 text-amber-500" />,
  SUBSCRIPTION_EXPIRED: <CreditCard className="h-4 w-4 text-red-500" />,
  SYSTEM_ALERT: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  WELCOME: <Sparkles className="h-4 w-4 text-purple-500" />,
}

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?take=10')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread-count')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Polling alle 30 Sekunden
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications, fetchUnreadCount])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      })
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
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

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id)
    }
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative rounded-full', className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Benachrichtigungen</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Alle gelesen
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Keine Benachrichtigungen</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex flex-col items-start gap-1 p-3 cursor-pointer',
                  !notification.isRead && 'bg-primary/5'
                )}
                onClick={() => handleNotificationClick(notification)}
                asChild={!!notification.link}
              >
                {notification.link ? (
                  <Link href={notification.link} className="w-full">
                    <NotificationContent notification={notification} />
                  </Link>
                ) : (
                  <div className="w-full">
                    <NotificationContent notification={notification} />
                  </div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/admin/notifications"
                className="flex items-center justify-center gap-2 py-2 text-sm text-primary hover:text-primary"
              >
                Alle anzeigen
                <ExternalLink className="h-3 w-3" />
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationContent({ notification }: { notification: Notification }) {
  return (
    <>
      <div className="flex items-start gap-3 w-full">
        <div className="flex-shrink-0 mt-0.5">
          {notificationIcons[notification.type] || <Bell className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn('text-sm font-medium truncate', !notification.isRead && 'text-foreground')}>
              {notification.title}
            </p>
            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: de,
            })}
          </p>
        </div>
      </div>
    </>
  )
}



