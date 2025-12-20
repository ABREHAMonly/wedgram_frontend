import { post, fetcher, put } from './client'

export interface Guest {
  _id: string
  inviter: string
  name: string
  email?: string
  telegramUsername: string
  chatId?: string
  invited: boolean
  hasRSVPed: boolean
  rsvpStatus: 'pending' | 'accepted' | 'declined' | 'maybe'
  plusOneAllowed: boolean
  plusOneCount: number
  dietaryRestrictions?: string
  invitationMethod: 'telegram' | 'email' | 'whatsapp'
  invitationSentAt?: string
  rsvpSubmittedAt?: string
  invitationToken: string
  createdAt: string
  updatedAt: string
}

export interface GuestsResponse {
  success: boolean
  message: string
  data: Guest[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  timestamp: string
}

export const guestApi = {
  getGuests: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{
    guests: Guest[]
    meta: GuestsResponse['meta']
  }> => {
    console.log('Fetching guests with params:', params)
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    
    const queryString = queryParams.toString()
    const url = `/api/v1/invites${queryString ? `?${queryString}` : ''}`
    
    const response = await fetcher<GuestsResponse>(url)
    console.log('Get guests response:', response)
    return {
      guests: response.data || [],
      meta: response.meta || { page: 1, limit: 20, total: 0, totalPages: 0 }
    }
  },

  createGuests: async (data: {
    guests: Array<{
      name: string
      email?: string
      telegramUsername: string
      invitationMethod: 'telegram' | 'email' | 'whatsapp'
      plusOneAllowed?: boolean
      dietaryRestrictions?: string
    }>
    sendImmediately?: boolean
  }): Promise<any> => {
    console.log('Creating guests with data:', data)
    const response = await post('/api/v1/invites', data)
    console.log('Create guests response:', response)
    return response
  },

  sendInvitations: async (guestIds: string[]): Promise<any> => {
    console.log('Sending invitations for guest IDs:', guestIds)
    const response = await post('/api/v1/invites/send', { guestIds })
    console.log('Send invitations response:', response)
    return response
  },
}