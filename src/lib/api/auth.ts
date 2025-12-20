//src\lib\api\auth.ts
import { post, fetcher, put } from './client'
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse['data']> => {
    return post('/api/v1/auth/login', credentials)
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse['data']> => {
    return post('/api/v1/auth/register', credentials)
  },

  getProfile: async (): Promise<User> => {
    return fetcher('/api/v1/auth/profile')
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return put('/api/v1/auth/profile', data)
  },

  logout: async (): Promise<void> => {
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wedgram_token')
      localStorage.removeItem('wedgram_user')
    }
  },
}