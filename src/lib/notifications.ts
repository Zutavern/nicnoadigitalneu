import { prisma } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, unknown>
}

/**
 * Erstellt eine neue Benachrichtigung für einen Benutzer
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  metadata,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        metadata: metadata || null,
      },
    })
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

/**
 * Erstellt Benachrichtigungen für alle Admins
 */
export async function notifyAllAdmins({
  type,
  title,
  message,
  link,
  metadata,
}: Omit<CreateNotificationParams, 'userId'>) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    const notifications = await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type,
          title,
          message,
          link,
          metadata,
        })
      )
    )

    return notifications
  } catch (error) {
    console.error('Error notifying admins:', error)
    throw error
  }
}

/**
 * Markiert eine Benachrichtigung als gelesen
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })
    return notification
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

/**
 * Markiert alle Benachrichtigungen eines Users als gelesen
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
    return result
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

/**
 * Holt die Anzahl ungelesener Benachrichtigungen
 */
export async function getUnreadNotificationCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    })
    return count
  } catch (error) {
    console.error('Error getting unread notification count:', error)
    throw error
  }
}

/**
 * Holt Benachrichtigungen eines Users mit Pagination
 */
export async function getUserNotifications(
  userId: string,
  options: { take?: number; skip?: number; unreadOnly?: boolean } = {}
) {
  const { take = 20, skip = 0, unreadOnly = false } = options

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    })
    return notifications
  } catch (error) {
    console.error('Error getting user notifications:', error)
    throw error
  }
}

/**
 * Löscht alte gelesene Benachrichtigungen (älter als 30 Tage)
 */
export async function cleanupOldNotifications() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    const result = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lt: thirtyDaysAgo },
      },
    })
    return result
  } catch (error) {
    console.error('Error cleaning up old notifications:', error)
    throw error
  }
}








