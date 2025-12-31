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

// src/lib/api/client.ts - Update the fetcher function
export const fetcher = async <T>(url: string): Promise<T> => {
  try {
    const response = await api.get(url)
    console.log('Fetcher response:', { url, data: response.data })
    
    // If response.data exists and has a success field (our API format)
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      console.log('API format detected, returning data field')
      return response.data.data // Extract data from API response
    }
    
    // If response.data exists but no success field, return it as-is
    if (response.data !== undefined) {
      console.log('Direct data format, returning as-is')
      return response.data
    }
    
    // Otherwise return the response
    console.log('Returning full response')
    return response
  } catch (error: any) {
    console.error('Fetcher error:', error)
    throw error
  }
}

// Update these helper functions in client.ts
export const post = async <T, D = unknown>(url: string, data: D): Promise<T> => {
  try {
    console.log('POST request:', { 
      url, 
      dataType: data instanceof FormData ? 'FormData' : typeof data,
      isFormData: data instanceof FormData
    });

    // Handle FormData differently
    if (data instanceof FormData) {
      console.log('FormData detected, setting multipart headers');
      
      const response = await api.post(url, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('POST response (FormData):', { 
        url, 
        status: response.status, 
        data: response.data 
      });
      
      // Handle API response format
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        return response.data.data;
      }
      
      return response.data;
    } else {
      // Regular JSON request
      console.log('JSON request data:', JSON.stringify(data).substring(0, 200));
      const response = await api.post(url, data);
      console.log('POST response (JSON):', { url, status: response.status, data: response.data });
      
      // Handle API response format
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        return response.data.data;
      }
      
      return response.data;
    }
  } catch (error: any) {
    console.error('POST error details:', {
      url,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      request: error.request
    });
    throw error;
  }
};

export const put = async <T, D = unknown>(url: string, data: D): Promise<T> => {
  try {
    const response = await api.put(url, data)
    console.log('PUT response:', { url, response: response.data })
    
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data.data
    }
    
    return response.data
  } catch (error: any) {
    console.error('PUT error:', error)
    throw error
  }
}

export const del = async <T>(url: string): Promise<T> => {
  try {
    const response = await api.delete(url)
    console.log('DELETE response:', { url, response: response.data })
    
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data.data
    }
    
    return response.data
  } catch (error: any) {
    console.error('DELETE error:', error)
    throw error
  }
}