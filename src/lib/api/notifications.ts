import { fetcher, put } from './client'

export interface Notification {
  _id: string
  user: string
  type: 'rsvp' | 'guest_added' | 'invitation_sent' | 'invitation_failed' | 'message' | 'system'
  title: string
  description: string
  data: {
    guestId?: string
    guestName?: string
    status?: string
    method?: string
  }
  read: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationsResponse {
  success: boolean
  message: string
  data: {
    notifications: Notification[]
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  timestamp: string
}

export interface UnreadCountResponse {
  success: boolean
  message: string
  data: {
    count: number
  }
  timestamp: string
}

export const notificationsApi = {
  getNotifications: async (page = 1, limit = 20): Promise<{
    notifications: Notification[]
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> => {
    console.log('Fetching notifications...')
    const response = await fetcher<NotificationsResponse>(`/api/v1/notifications?page=${page}&limit=${limit}`)
    return response.data
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      console.log('Fetching unread count...')
      const response = await fetcher<UnreadCountResponse>('/api/v1/notifications/unread-count')
      return response.data.count
    } catch (error) {
      console.error('Failed to get unread count:', error)
      return 0
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    console.log('Marking notification as read:', id)
    await put(`/api/v1/notifications/${id}/read`, {})
  },

  markAllAsRead: async (): Promise<void> => {
    console.log('Marking all notifications as read')
    await put('/api/v1/notifications/read-all', {})
  },
}