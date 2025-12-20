//src\lib\api\wedding.ts
import { post, fetcher, put } from './client'

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

export interface WeddingResponse {
  success: boolean
  message: string
  data: Wedding
  timestamp: string
}

export const weddingApi = {
  createWedding: async (data: Partial<Wedding>): Promise<Wedding> => {
    console.log('Creating wedding with data:', data)
    const response = await post<WeddingResponse>('/api/v1/wedding', data)
    console.log('Create wedding response:', response)
    return response.data
  },

  getWedding: async (): Promise<Wedding> => {
    console.log('Fetching wedding...')
    const response = await fetcher<WeddingResponse>('/api/v1/wedding')
    console.log('Get wedding response:', response)
    // The fetcher returns the full API response, so we need to extract the data
    return response.data
  },

  updateWedding: async (data: Partial<Wedding>): Promise<Wedding> => {
    console.log('Updating wedding with data:', data)
    const response = await put<WeddingResponse>('/api/v1/wedding', data)
    console.log('Update wedding response:', response)
    return response.data
  },

  checkWeddingExists: async (): Promise<boolean> => {
    try {
      console.log('Checking wedding existence...')
      await fetcher('/api/v1/wedding/check')
      return true
    } catch (error: any) {
      console.log('Wedding check error:', error.message)
      return false
    }
  }
}