//lib/api/wedding.ts
import { GalleryImage } from '@/types'
import { post, fetcher, put } from './client'
import { ScheduleEvent } from './schedule'

export interface Wedding {
  _id: string
  user: string
  title: string
  description?: string
  date: string
  venue: string
  venueAddress?: string
  dressCode?: string
  themeColor?: string
  coverImage?: string
  gallery?: string[]
  schedule: Array<{
    time: string
    event: string
    description?: string
  }>
  createdAt: string
  updatedAt: string
}

export const weddingApi = {
  createWedding: async (data: Partial<Wedding>): Promise<Wedding> => {
    console.log('Creating wedding with data:', data)
    const response = await post<Wedding>('/api/v1/wedding', data)
    console.log('Create wedding response:', response)
    return response
  },

  getWedding: async (): Promise<Wedding> => {
    try {
      console.log('Fetching wedding...')
      const response = await fetcher<Wedding>('/api/v1/wedding')
      console.log('Get wedding response:', response)
      return response
    } catch (error: any) {
      console.error('Get wedding error:', error)
      throw error
    }
  },

  updateWedding: async (data: Partial<Wedding>): Promise<Wedding> => {
    console.log('Updating wedding with data:', data)
    const response = await put<Wedding>('/api/v1/wedding', data)
    console.log('Update wedding response:', response)
    return response
  },

   checkWeddingExists: async (): Promise<boolean> => {
    try {
      const response = await fetcher<{ exists: boolean }>('/api/v1/wedding/check')
      return response?.exists || false
    } catch (error: any) {
      console.log('Wedding check response:', error)
      // If 404, wedding doesn't exist
      if (error.status === 404) {
        return false
      }
      throw error
    }
  },
  getWeddingByToken: async (token: string): Promise<{
    wedding: {
      id: string;
      title: string;
      description?: string;
      date: string;
      venue: string;
      venueAddress?: string;
      themeColor?: string;
      coverImage?: string;
    };
    gallery: GalleryImage[];
    schedule: ScheduleEvent[];
  }> => {
    try {
      console.log('Fetching wedding by token:', token);
      const response = await fetcher(`/api/v1/wedding/public/${token}`);
      console.log('Wedding by token response:', response);
      
      // Handle API response format
      if (response.success) {
        return response.data;
      }
      
      return response;
    } catch (error: any) {
      console.error('Get wedding by token error:', error);
      
      // If 404, return empty data instead of throwing
      if (error.status === 404) {
        return {
          wedding: {
            id: '',
            title: '',
            date: '',
            venue: ''
          },
          gallery: [],
          schedule: []
        };
      }
      
      throw error;
    }
  }

}