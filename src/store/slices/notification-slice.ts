import { StateCreator } from 'zustand'
import { Notification } from '@/types/entities'

export interface NotificationSlice {
  notifications: Notification[]
  unreadNotificationCount: number
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markNotificationRead: (notificationId: number) => void
  markAllNotificationsRead: () => void
}

export const createNotificationSlice: StateCreator<NotificationSlice> = (set) => ({
  notifications: [],
  unreadNotificationCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadNotificationCount: notifications.filter(n => !n.read_at).length
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 500),
      unreadNotificationCount: state.unreadNotificationCount + 1
    })),
  markNotificationRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read_at: Math.floor(Date.now() / 1000) } : n
      ),
      unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1)
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.read_at ? n : { ...n, read_at: Math.floor(Date.now() / 1000) }
      ),
      unreadNotificationCount: 0
    })),
})
