//src\lib\api\client.ts
import axios from 'axios'
import { APIResponse } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://wedgram.onrender.com'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: false, // Changed to false if you're not using cookies
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('wedgram_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    if (response.data && typeof response.data === 'object') {
      // If it's already our API response format
      if ('success' in response.data) {
        return response.data
      }
    }
    return response
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    })
    
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('wedgram_token')
          localStorage.removeItem('wedgram_user')
          if (!window.location.pathname.includes('/auth')) {
            window.location.href = '/auth/login'
          }
        }
      }
      
      // Return a structured error
      return Promise.reject({
        message: data?.message || `Request failed with status code ${status}`,
        status,
        data: data?.data || data,
        errors: data?.errors || data?.data?.errors || []
      })
    } else if (error.request) {
      console.error('No response received:', error.request)
      return Promise.reject({
        message: 'No response from server. Please check your internet connection.',
        status: 0
      })
    } else {
      console.error('Request setup error:', error.message)
      return Promise.reject({
        message: error.message || 'Request failed',
        status: 0
      })
    }
  }
)

// Helper function for GET requests
// Helper function for GET requests
export const fetcher = async <T>(url: string): Promise<T> => {
  try {
    const response = await api.get(url)
    console.log('Fetcher raw response:', response)
    
    // Check if response has the API structure
    if (response && typeof response === 'object') {
      // If it's our API response format with success field
      if ('success' in response) {
        console.log('API response format detected, success:', response.success)
        // Return the entire response object, not just data
        return response
      }
    }
    
    console.log('Non-API response format, returning as-is')
    return response
  } catch (error: any) {
    console.error('Fetcher error:', error)
    throw error
  }
}

// Helper function for POST requests
export const post = async <T, D = unknown>(url: string, data: D): Promise<T> => {
  try {
    const response = await api.post(url, data)
    return response.data?.data || response.data
  } catch (error: any) {
    console.error('POST error:', error)
    throw error
  }
}

// Helper function for PUT requests
export const put = async <T, D = unknown>(url: string, data: D): Promise<T> => {
  try {
    const response = await api.put(url, data)
    return response.data?.data || response.data
  } catch (error: any) {
    console.error('PUT error:', error)
    throw error
  }
}

// Helper function for DELETE requests
export const del = async <T>(url: string): Promise<T> => {
  try {
    const response = await api.delete(url)
    return response.data?.data || response.data
  } catch (error: any) {
    console.error('DELETE error:', error)
    throw error
  }
}