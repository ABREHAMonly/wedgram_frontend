//src\lib\api\invites.ts
import { post, fetcher, put, del } from './client'
import { CreateInviteRequest, Guest, CreateInviteResponse } from '@/types/invite'
import { PaginatedResponse } from '@/types/api'

export const inviteApi = {
  createInvites: async (data: CreateInviteRequest): Promise<CreateInviteResponse> => {
    return post('/api/v1/invites', data)
  },

  getGuests: async (page = 1, limit = 20, status?: string): Promise<PaginatedResponse<Guest>> => {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    if (status) params.append('status', status)
    
    const response = await fetcher<any>(`/api/v1/invites?${params.toString()}`)
    
    // Transform backend response to match frontend structure
    const guests = response?.data || []
    const meta = response?.meta || {
      page,
      limit,
      total: guests.length,
      totalPages: Math.ceil(guests.length / limit)
    }
    
    return {
      data: guests,
      meta
    }
  },

  sendInvitations: async (guestIds: string[]): Promise<{ message: string; results: Array<{ id: string; name: string; sent: boolean }> }> => {
    return post('/api/v1/invites/send', { guestIds })
  },
}