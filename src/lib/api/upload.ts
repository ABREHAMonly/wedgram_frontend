//src\lib\api\upload.ts
import { api } from './client';

export interface UploadResponse {
  url: string;
  name: string;
  size: number;
  publicId: string;
  success?: boolean;
}

export interface MultipleUploadResponse {
  results: Array<UploadResponse | { error: string; name: string; success: false }>;
  total: number;
  successful: number;
  failed: number;
}

export const uploadApi = {
  // Upload multiple images via gallery endpoint
  uploadMultipleImages: async (files: File[]): Promise<MultipleUploadResponse> => {
    console.log('Starting upload of', files.length, 'files');
    
    const formData = new FormData();
    
    // Append each file with the correct field name
    files.forEach((file, index) => {
      // The field name must match what multer expects: 'images'
      formData.append('images', file);
      console.log(`Added file ${index}: ${file.name} (${file.size} bytes, ${file.type})`);
    });

    // Optional: Add folder parameter
    formData.append('folder', 'wedgram');

    try {
      // Use the api instance directly for FormData
      const response = await api.post('/api/v1/gallery/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds timeout for large files
      });

      console.log('Upload successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Upload failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },

  // Delete image from Cloudinary
  deleteImage: async (publicId: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/upload/${publicId}`);
    } catch (error: any) {
      console.error('Delete image error:', error);
      throw error;
    }
  }
};