//src\types\auth.ts
export interface User {
  _id: string // Changed from id
  name: string
  email: string
  role: 'admin' | 'inviter'
  isActive: boolean
  phone?: string
  weddingDate?: Date
  partnerName?: string
  weddingLocation?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
  timestamp: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  weddingDate: Date
  partnerName?: string
  weddingLocation?: string
}