// src/types/api.ts - Fix inconsistencies
export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

export interface GalleryImage {
  _id?: string;
  url: string;
  name: string;
  size: number;
  uploadedAt: string;
  description?: string;
  publicId?: string;
  format?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  preview?: string;
  file?: File;
}

export interface Gift {
  _id: string;
  name: string;
  description?: string;
  price: number;
  link?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'available' | 'reserved' | 'purchased';
  category: string;
  quantity: number;
  purchased: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface APIError {
  message: string;
  status?: number;
  errors?: string[];
  code?: string;
}

// Add this if not exists
export interface Wedding {
  _id: string;
  user: string;
  title: string;
  description?: string;
  date: string;
  venue: string;
  venueAddress?: string;
  dressCode?: string;
  themeColor?: string;
  coverImage?: string;
  gallery?: string[];
  schedule: Array<{
    time: string;
    event: string;
    description?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}