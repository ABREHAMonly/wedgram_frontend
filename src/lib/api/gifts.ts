//src\lib\api\gifts.ts
import { fetcher, post, put, del } from './client'

export interface GiftItem {
  _id?: string
  name: string
  description?: string
  price: number
  link?: string
  priority: 'high' | 'medium' | 'low'
  status: 'available' | 'reserved' | 'purchased'
  category: string
  quantity: number
  purchased: number
  image?: string
  createdAt?: string
  updatedAt?: string
}

export interface GiftStats {
  total: number
  available: number
  reserved: number
  purchased: number
  totalValue: number
  purchasedValue: number
  byCategory: Record<string, number>
}

export const giftsApi = {
  getGifts: async (): Promise<GiftItem[]> => {
    try {
      console.log('Fetching gifts...')
      const response = await fetcher<GiftItem[]>('/api/v1/gifts')
      console.log('Gifts response:', response)
      return Array.isArray(response) ? response : []
    } catch (error: any) {
      console.error('Gifts fetch error:', error)
      if (error.status === 404) {
        return []
      }
      throw error
    }
  },

  getGift: async (id: string): Promise<GiftItem> => {
    return fetcher<GiftItem>(`/api/v1/gifts/${id}`)
  },

  createGift: async (gift: Omit<GiftItem, '_id' | 'createdAt' | 'updatedAt'>): Promise<GiftItem> => {
    return post('/api/v1/gifts', gift)
  },

  updateGift: async (id: string, gift: Partial<GiftItem>): Promise<GiftItem> => {
    return put(`/api/v1/gifts/${id}`, gift)
  },

  deleteGift: async (id: string): Promise<{ message: string }> => {
    return del(`/api/v1/gifts/${id}`)
  },

  getStats: async (): Promise<GiftStats> => {
    try {
      return await fetcher<GiftStats>('/api/v1/gifts/stats')
    } catch (error: any) {
      console.error('Stats fetch error:', error)
      // Return default stats if endpoint doesn't exist
      return {
        total: 0,
        available: 0,
        reserved: 0,
        purchased: 0,
        totalValue: 0,
        purchasedValue: 0,
        byCategory: {}
      }
    }
  }
}