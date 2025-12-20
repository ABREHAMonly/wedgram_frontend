//src\lib\api\rsvp.ts
import { post, fetcher } from './client'
import { RSVPResponse } from '@/types/invite'

export const rsvpApi = {
  submitRSVP: async (token: string, data: RSVPResponse): Promise<{
    message: string
    rsvp: {
      id: string
      response: string
      attendingCount: number
      submittedAt: string
    }
    guest: {
      name: string
      rsvpStatus: string
    }
    wedding: {
      title: string
      date: string
      venue: string
    }
  }> => {
    return post(`/api/v1/rsvp/${token}`, data)
  },

  getRSVPStatus: async (token: string): Promise<{
    guest: {
      name: string
      rsvpStatus: string
      hasRSVPed: boolean
      rsvpSubmittedAt?: string
    }
    wedding: {
      title: string
      date: string
      venue: string
    } | null
    rsvp: {
      response: string
      attendingCount: number
      message?: string
      dietaryRestrictions?: string
      songRequests?: string[]
      submittedAt: string
    } | null
  }> => {
    return fetcher(`/api/v1/rsvp/${token}`)
  },
}