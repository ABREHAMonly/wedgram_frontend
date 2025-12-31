//src\lib\hooks\use-gallery.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryApi, GalleryImage } from '@/lib/api/gallery';
import { uploadApi } from '@/lib/api/upload';
import { toast } from 'sonner';
import { useCallback } from 'react';

export const useGallery = () => {
  const queryClient = useQueryClient();

  const galleryQuery = useQuery({
    queryKey: ['gallery'],
    queryFn: () => galleryApi.getGallery(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const uploadImages = useMutation({
    mutationFn: async (files: File[]) => {
      const uploadResponse = await galleryApi.uploadImages(files);
      
      const uploadedImages = uploadResponse.results
        .filter((result): result is any => 
          'url' in result && result.url !== undefined && result.success !== false
        )
        .map((result, index) => ({
          url: result.url,
          publicId: result.publicId,
          name: result.name,
          size: result.size,
          description: '',
          uploadedAt: new Date().toISOString(),
        }));

      // Save images in parallel
      const savePromises = uploadedImages.map(async (imageData) => {
        try {
          const savedImage = await galleryApi.addImage(imageData);
          return {
            ...imageData,
            _id: savedImage._id || savedImage.image?._id || `saved-${Date.now()}`,
          };
        } catch (error: any) {
          console.error('Failed to save image:', error);
          toast.error(`Failed to save "${imageData.name}"`);
          return null;
        }
      });

      const savedImages = (await Promise.all(savePromises)).filter(Boolean) as GalleryImage[];
      
      if (savedImages.length > 0) {
        queryClient.setQueryData(['gallery'], (old: GalleryImage[] = []) => [
          ...savedImages,
          ...old,
        ]);
      }

      return savedImages;
    },
  });

  const deleteImage = useMutation({
    mutationFn: async ({ imageId, publicId }: { imageId: string; publicId?: string }) => {
      if (publicId) {
        await uploadApi.deleteImage(publicId);
      }
      await galleryApi.deleteImage(imageId);
    },
    onSuccess: (_, { imageId }) => {
      queryClient.setQueryData(['gallery'], (old: GalleryImage[] = []) =>
        old.filter(img => img._id !== imageId)
      );
    },
  });

  const updateImageDescription = useMutation({
    mutationFn: ({ imageId, description }: { imageId: string; description: string }) =>
      galleryApi.updateImage(imageId, { description }),
    onMutate: async ({ imageId, description }) => {
      await queryClient.cancelQueries({ queryKey: ['gallery'] });
      
      const previousGallery = queryClient.getQueryData(['gallery']);
      
      queryClient.setQueryData(['gallery'], (old: GalleryImage[] = []) =>
        old.map(img =>
          img._id === imageId ? { ...img, description } : img
        )
      );

      return { previousGallery };
    },
    onError: (err, variables, context) => {
      if (context?.previousGallery) {
        queryClient.setQueryData(['gallery'], context.previousGallery);
      }
      toast.error('Failed to update description');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  return {
    gallery: galleryQuery.data || [],
    isLoading: galleryQuery.isLoading,
    isError: galleryQuery.isError,
    error: galleryQuery.error,
    uploadImages: uploadImages.mutateAsync,
    isUploading: uploadImages.isPending,
    deleteImage: deleteImage.mutateAsync,
    isDeleting: deleteImage.isPending,
    updateImageDescription: updateImageDescription.mutateAsync,
    isUpdating: updateImageDescription.isPending,
    refetchGallery: galleryQuery.refetch,
  };
};