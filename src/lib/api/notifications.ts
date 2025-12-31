//src\lib\api\notifications.ts
import { fetcher, put } from './client'

export interface Notification {
  _id: string
  user: string
  type: 'rsvp' | 'guest_added' | 'invitation_sent' | 'invitation_failed' | 'message' | 'system'
  title: string
  description: string
  data?: Record<string, any>
  read: boolean
  createdAt: string
  updatedAt: string
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
    try {
      const response = await fetcher<any>(`/api/v1/notifications?page=${page}&limit=${limit}`)
      console.log('Notifications API response:', response)
      
      // The backend returns { success, message, data, meta }
      if (response.success) {
        return {
          notifications: response.data?.notifications || [],
          meta: response.data?.meta || { page, limit, total: 0, totalPages: 0 }
        }
      }
      
      // If response is direct data format
      if (response.notifications) {
        return {
          notifications: response.notifications,
          meta: response.meta || { page, limit, total: response.total || 0, totalPages: response.totalPages || 0 }
        }
      }
      
      return {
        notifications: [],
        meta: { page, limit, total: 0, totalPages: 0 }
      }
    } catch (error) {
      console.error('Failed to get notifications:', error)
      return {
        notifications: [],
        meta: { page, limit, total: 0, totalPages: 0 }
      }
    }
  },

 getUnreadCount: async (): Promise<number> => {
    try {
      const response = await fetcher<any>('/api/v1/notifications/unread-count')
      console.log('Unread count response:', response)
      
      // The backend returns { success, data: { count } }
      if (response.success) {
        return response.data?.count || 0
      }
      
      // If response is direct { count }
      return response.count || 0
    } catch (error) {
      console.error('Failed to get unread count:', error)
      return 0
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    try {
      await put(`/api/v1/notifications/${id}/read`, {})
    } catch (error) {
      console.error('Failed to mark as read:', error)
      throw error
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await put('/api/v1/notifications/read-all', {})
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      throw error
    }
  }
}