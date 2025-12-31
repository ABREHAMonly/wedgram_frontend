//src\lib\api\gallery.ts
import { fetcher, post, put, del } from './client'

export interface GalleryImage {
  _id?: string; // Make sure this is optional
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

export interface UploadResponse {
  url: string;
  name: string;
  size: number;
  publicId: string;
  success?: boolean;
}

export interface MultipleUploadResponse {
  results: (UploadResponse | { error: string; name: string; success: false })[];
  total: number;
  successful: number;
  failed: number;
}

export const galleryApi = {
  getGallery: async (): Promise<GalleryImage[]> => {
    try {
      console.log('Fetching gallery...')
      const response = await fetcher<GalleryImage[]>('/api/v1/gallery')
      console.log('Gallery response:', response)
      return Array.isArray(response) ? response : []
    } catch (error: any) {
      console.error('Gallery fetch error:', error)
      if (error.status === 404) {
        return []
      }
      throw error
    }
  },

  updateGallery: async (gallery: GalleryImage[]): Promise<any> => {
    return put('/api/v1/gallery', { gallery })
  },

  addImage: async (image: Omit<GalleryImage, '_id' | 'preview' | 'file'>): Promise<any> => {
    return post('/api/v1/gallery/images', image)
  },

  deleteImage: async (imageId: string): Promise<any> => {
    return del(`/api/v1/gallery/images/${imageId}`)
  },
   deleteCloudinaryImage: async (publicId: string): Promise<any> => {
    return del(`/api/v1/gallery/cloudinary/${publicId}`);
  },

  uploadImages: async (files: File[]): Promise<MultipleUploadResponse> => {
  const formData = new FormData();
  
  // Debug: Log the files
  console.log('Uploading files:', files.map(f => ({
    name: f.name,
    size: f.size,
    type: f.type
  })));
  
  files.forEach((file, index) => {
    // Use the same field name as the backend expects
    formData.append('images', file, file.name);
    console.log(`Added file ${index}: ${file.name}`);
  });

  // Debug: Check FormData contents
  console.log('FormData entries:');
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  try {
    const response = await post<MultipleUploadResponse>('/api/v1/gallery/upload', formData);
    console.log('Upload response:', response);
    return response;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw error;
  }
},
updateImage: async (imageId: string, updates: Partial<GalleryImage>): Promise<any> => {
    try {
      // First get the current image data
      const gallery = await fetcher<GalleryImage[]>('/api/v1/gallery');
      const imageToUpdate = gallery.find(img => img._id === imageId);
      
      if (!imageToUpdate) {
        throw new Error('Image not found');
      }

      // Merge updates with existing image
      const updatedImage = {
        ...imageToUpdate,
        ...updates,
        _id: imageId // Ensure _id is preserved
      };

      // Remove preview and file fields if present
      const { preview, file, ...cleanImage } = updatedImage;

      console.log('Updating image with data:', cleanImage);
      return post(`/api/v1/gallery/images`, cleanImage);
    } catch (error) {
      console.error('Update image error:', error);
      throw error;
    }
  },
}