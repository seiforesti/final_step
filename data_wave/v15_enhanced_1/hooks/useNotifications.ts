"use client"

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface AppNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read?: boolean
  meta?: Record<string, any>
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const push = useCallback((n: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const notification: AppNotification = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...n,
    }
    setNotifications((prev) => [notification, ...prev].slice(0, 200))
    switch (notification.type) {
      case 'success':
        toast.success(notification.title, { description: notification.message })
        break
      case 'warning':
        toast.warning(notification.title, { description: notification.message })
        break
      case 'error':
        toast.error(notification.title, { description: notification.message })
        break
      default:
        toast(notification.title, { description: notification.message })
    }
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const clear = useCallback(() => setNotifications([]), [])

  useEffect(() => {
    // placeholder for server push subscription integration
  }, [])

  return { notifications, push, markRead, clear }
}



