//src\types\invite.ts
export interface Guest {
  _id: string // Changed from id
  name: string
  email?: string
  telegramUsername: string
  invited: boolean
  hasRSVPed: boolean
  rsvpStatus: 'pending' | 'accepted' | 'declined' | 'maybe'
  plusOneAllowed: boolean
  invitationMethod: 'telegram' | 'email' | 'whatsapp'
  invitationToken: string
  invitationSentAt?: string
  createdAt: string
  updatedAt: string
}

export interface GuestResponse {
  _id: string
  name: string
  email?: string
  telegramUsername: string
  invited: boolean
  hasRSVPed: boolean
  rsvpStatus: 'pending' | 'accepted' | 'declined' | 'maybe'
  plusOneAllowed: boolean
  invitationMethod: 'telegram' | 'email' | 'whatsapp'
  invitationToken: string
  invitationSentAt?: string
  createdAt: string
  updatedAt: string
  __v?: number
}

export interface RSVPResponse {
  response: 'accepted' | 'declined' | 'maybe'
  attendingCount: number
  message?: string
  dietaryRestrictions?: string
  songRequests?: string[]
  accommodationNeeded: boolean
  transportationNeeded: boolean
}

export interface CreateInviteRequest {
  guests: Array<{
    name: string
    email?: string
    telegramUsername: string
    invitationMethod: 'telegram' | 'email' | 'whatsapp'
    plusOneAllowed: boolean
    dietaryRestrictions?: string
  }>
  templateId?: string
  sendImmediately: boolean
}

export interface CreateInviteResponse {
  results: Array<{
    id: string
    name: string
    status: string
  }>
  total: number
}