//src\types\api.ts
export interface APIResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}