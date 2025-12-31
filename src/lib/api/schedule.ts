//src\lib\api\schedule.ts
import { fetcher, post, put, del } from './client'

export interface ScheduleEvent {
  _id?: string
  time: string
  event: string
  description?: string
  location?: string
  responsible?: string
  status: 'pending' | 'confirmed' | 'completed'
}

export const scheduleApi = {
  getSchedule: async (): Promise<ScheduleEvent[]> => {
    try {
      console.log('Fetching schedule...')
      const response = await fetcher<ScheduleEvent[]>('/api/v1/schedule')
      console.log('Schedule response:', response)
      return Array.isArray(response) ? response : []
    } catch (error: any) {
      console.error('Schedule fetch error:', error)
      if (error.status === 404) {
        return []
      }
      throw error
    }
  },

  updateSchedule: async (schedule: ScheduleEvent[]): Promise<any> => {
    return put('/api/v1/schedule', { schedule })
  },

  addEvent: async (event: Omit<ScheduleEvent, '_id'>): Promise<any> => {
    return post('/api/v1/schedule/events', event)
  },

  updateEvent: async (eventId: string, event: Partial<ScheduleEvent>): Promise<any> => {
    return put(`/api/v1/schedule/events/${eventId}`, event)
  },

  deleteEvent: async (eventId: string): Promise<any> => {
    return del(`/api/v1/schedule/events/${eventId}`)
  }
}