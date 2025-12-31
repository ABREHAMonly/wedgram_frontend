// src/lib/hooks/use-auth.ts - Enhanced version
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { User } from '@/types/auth'
import { toast } from 'sonner'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }, [])

  const loadUser = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('wedgram_token') : null
      
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem('wedgram_token')
        localStorage.removeItem('wedgram_user')
        setLoading(false)
        return
      }

      // Try to load from cache first
      const cachedUser = localStorage.getItem('wedgram_user')
      if (cachedUser) {
        const { data, timestamp } = JSON.parse(cachedUser)
        // Use cache if less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setUser(data)
          setLoading(false)
          return
        }
      }

      // Fetch fresh user data
      const userData = await authApi.getProfile()
      setUser(userData)
      
      localStorage.setItem('wedgram_user', JSON.stringify({
        data: userData,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Failed to load user:', error)
      localStorage.removeItem('wedgram_token')
      localStorage.removeItem('wedgram_user')
    } finally {
      setLoading(false)
    }
  }, [isTokenExpired])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true)
      const response = await authApi.login({ email, password, rememberMe })
      
      localStorage.setItem('wedgram_token', response.token)
      localStorage.setItem('wedgram_user', JSON.stringify({
        data: response.user,
        timestamp: Date.now()
      }))
      setUser(response.user)
      
      toast.success('Login successful!')
      router.push('/dashboard')
      router.refresh()
      
      return response.user
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed. Please check your credentials.')
      throw error
    } finally {
      setLoading(false)
    }
  }, [router])

  const register = useCallback(async (userData: any) => {
    try {
      setLoading(true)
      const response = await authApi.register(userData)
      
      localStorage.setItem('wedgram_token', response.token)
      localStorage.setItem('wedgram_user', JSON.stringify({
        data: response.user,
        timestamp: Date.now()
      }))
      setUser(response.user)
      
      toast.success('Registration successful!')
      router.push('/dashboard')
      router.refresh()
      
      return response.user
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Registration failed. Please try again.')
      throw error
    } finally {
      setLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
      localStorage.removeItem('wedgram_token')
      localStorage.removeItem('wedgram_user')
      setUser(null)
      
      toast.success('Logged out successfully')
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }, [router])

  const isAuthenticated = useMemo(() => !!user, [user])

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    refreshUser: loadUser,
  }
}