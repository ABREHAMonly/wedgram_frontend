'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { weddingApi, Wedding } from '@/lib/api/wedding'
import { galleryApi, GalleryImage } from '@/lib/api/gallery'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  Loader2,
  Plus,
  X,
  Grid3x3,
  List,
  CheckCircle,
  AlertCircle,
  CloudUpload,
  ImagePlus,
  ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { uploadApi, UploadResponse } from '@/lib/api/upload'
import { ErrorBoundary } from 'react-error-boundary';

interface GalleryImageData extends GalleryImage {
  _id?: string
  file?: File
  preview?: string
}
function GalleryErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="text-red-500 mb-4">
        <AlertCircle className="h-12 w-12 mx-auto" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary} variant="outline">
        Try again
      </Button>
    </div>
  );
}
export default function GalleryPage() {
  const { user } = useAuth()
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [newImages, setNewImages] = useState<Array<GalleryImage & { file: File; preview: string }>>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load gallery
  useEffect(() => {
    loadGallery()
  }, [])
// Add this useEffect in your GalleryPage component
useEffect(() => {
  return () => {
    // Clean up all blob URLs when component unmounts
    newImages.forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
    });
  };
}, [newImages]);
  const loadGallery = useCallback(async () => {
    setLoading(true)
    try {
      const galleryData = await galleryApi.getGallery()
      setGallery(galleryData)
    } catch (error: any) {
      console.error('Failed to load gallery:', error)
      if (error.status === 404) {
        setGallery([])
      } else {
        toast.error('Failed to load gallery')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 10MB)`)
        return false
      }
      return true
    })
    
    if (validFiles.length === 0) return
    
    const newGalleryImages = validFiles.map(file => {
      const preview = URL.createObjectURL(file)
      return {
        _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: preview, // Temporary preview URL
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        description: '',
        preview,
        file
      }
    })
    
    setNewImages(prev => [...prev, ...newGalleryImages])
    toast.success(`Added ${newGalleryImages.length} image(s)`)
  }

const handleUpload = async () => {
  if (!user) {
    toast.error('You must be logged in');
    return;
  }

  if (newImages.length === 0) {
    toast.info('No images to upload');
    return;
  }

  setUploading(true);
  try {
    // Upload files to Cloudinary
    const files = newImages.map(img => img.file!);
    const uploadResponse = await galleryApi.uploadImages(files);
    
    console.log('Upload response:', uploadResponse);
    
    // Process successful uploads
    const uploadedImages = uploadResponse.results
      .filter((result): result is UploadResponse => 
        'url' in result && result.url !== undefined && result.success !== false
      )
      .map((result, index) => {
        const originalImage = newImages[index];
        return {
          url: result.url,
          publicId: result.publicId,
          name: originalImage.name || result.name,
          size: result.size,
          description: originalImage.description || '',
          uploadedAt: new Date().toISOString(),
        };
      });

    // Update the savePromises section to handle errors better
      const savePromises = uploadedImages.map(async (imageData, index) => {
        const originalImage = newImages[index];
        try {
          console.log('Saving to database:', { name: imageData.name, url: imageData.url });
          
          const savedImage = await galleryApi.addImage(imageData);
          
          console.log('Saved image response:', savedImage);
          
          if (!savedImage || (!savedImage._id && !savedImage.image?._id)) {
            console.warn('Image saved but no ID returned:', savedImage);
          }
          
          return { 
            ...imageData, 
            _id: savedImage._id || savedImage.image?._id || `saved-${Date.now()}-${index}`,
          };
        } catch (error: any) {
          console.error('Failed to save image to gallery:', {
            error: error.message,
            imageName: imageData.name,
            status: error.status
          });
          
          // Don't delete from Cloudinary immediately - let the user retry
          // Instead, mark it as failed
          toast.error(`Failed to save "${originalImage.name}" to gallery: ${error.message}`);
          
          return {
            ...imageData,
            _id: `failed-${Date.now()}-${index}`,
            error: error.message,
          };
        }
      });

    const savedImages = (await Promise.all(savePromises)).filter(img => img !== null) as GalleryImage[];

    // Add uploaded images to gallery state
    if (savedImages.length > 0) {
      setGallery(prev => [...savedImages, ...prev]);
    }
    
    // Clean up blob URLs AFTER we've updated the gallery
    newImages.forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
    });
    
    // Show success message
    const successfulUploads = uploadResponse.results.filter(r => 
      'success' in r && r.success !== false
    ).length;
    
    toast.success(`Uploaded ${successfulUploads} of ${uploadResponse.total} images`);
    
    // Show errors for failed uploads if any
    if (uploadResponse.failed > 0) {
      const failedResults = uploadResponse.results.filter(r => 
        'error' in r || (r as any).success === false
      );
      failedResults.forEach(result => {
        if ('error' in result) {
          toast.error(`Failed to upload ${result.name}: ${result.error}`);
        }
      });
    }

    setShowUploadModal(false);
    setNewImages([]);
    
  } catch (error: any) {
    console.error('Failed to upload images:', error);
    toast.error(error.message || 'Failed to upload images');
  } finally {
    setUploading(false);
  }
};

  // Delete image from both Cloudinary and database
  const handleDeleteImage = async (imageId: string, publicId?: string) => {
    if (!imageId) return;

    if (!confirm('Are you sure you want to delete this image?')) return;

    setUploading(true);
    try {
      // If it's a temporary image (not saved to backend yet)
      if (imageId.startsWith('temp-')) {
        // Remove from newImages
        setNewImages(prev => {
          const imageToRemove = prev.find(img => img._id === imageId);
          if (imageToRemove?.preview) {
            URL.revokeObjectURL(imageToRemove.preview);
          }
          return prev.filter(img => img._id !== imageId);
        });
        toast.success('Image removed');
      } else {
        // If it has a publicId, delete from Cloudinary
        if (publicId) {
          await uploadApi.deleteImage(publicId);
        }
        
        // Delete from database
        await galleryApi.deleteImage(imageId);
        
        // Remove from gallery state
        setGallery(prev => prev.filter(img => img._id !== imageId));
        setSelectedImages(prev => prev.filter(id => id !== imageId));
        
        toast.success('Image deleted successfully');
      }
    } catch (error: any) {
      console.error('Failed to delete image:', error);
      toast.error(error.message || 'Failed to delete image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) {
      toast.info('No images selected')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedImages.length} image(s)?`)) return

    setUploading(true)
    try {
      // Separate temporary and saved images
      const tempImages = selectedImages.filter(id => id.startsWith('temp-'))
      const savedImages = selectedImages.filter(id => !id.startsWith('temp-'))
      
      // Clean up blob URLs for temp images
      tempImages.forEach(imageId => {
        const image = newImages.find(img => img._id === imageId)
        if (image?.preview) {
          URL.revokeObjectURL(image.preview)
        }
      })
      
      // Remove temp images from state
      if (tempImages.length > 0) {
        setNewImages(prev => prev.filter(img => !tempImages.includes(img._id!)))
      }
      
      // Delete saved images from server
      if (savedImages.length > 0) {
        const deletePromises = savedImages.map(id => galleryApi.deleteImage(id))
        await Promise.all(deletePromises)
      }
      
      // Remove from gallery state
      setGallery(prev => prev.filter(img => !selectedImages.includes(img._id!)))
      setSelectedImages([])
      
      toast.success(`Deleted ${selectedImages.length} image(s)`)
    } catch (error: any) {
      console.error('Failed to delete images:', error)
      toast.error(error.message || 'Failed to delete images')
    } finally {
      setUploading(false)
    }
  }

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Unknown date'
    }
  }

// Update the updateImageDescription function in GalleryPage component
const updateImageDescription = async (imageId: string, description: string) => {
  try {
    if (imageId.startsWith('temp-')) {
      // For temporary images, update local state immediately
      setNewImages(prev => prev.map(img => 
        img._id === imageId ? { ...img, description } : img
      ));
      return;
    }

    // For saved images, update local state optimistically
    setGallery(prev => prev.map(img => 
      img._id === imageId ? { ...img, description } : img
    ));

    // Then make the API call
    await galleryApi.updateImage(imageId, { description });
    
    // No need to show toast here - handled by the GalleryImage component
    return;
  } catch (error: any) {
    console.error('Failed to update description:', error);
    
    // Revert optimistic update on error
    const originalImage = gallery.find(img => img._id === imageId);
    if (originalImage) {
      setGallery(prev => prev.map(img => 
        img._id === imageId ? { ...img, description: originalImage.description } : img
      ));
    }
    
    throw error; // Let the GalleryImage component handle the error display
  }
};

  if (loading && !wedding) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-wedding-gold" />
        <span className="ml-2 text-gray-600">Loading gallery...</span>
      </div>
    )
  }

  return (
    <ErrorBoundary
      FallbackComponent={GalleryErrorFallback}
      onReset={() => {
        // Reset the state
        window.location.reload();
      }}
    >
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Photo Gallery</h1>
          <p className="text-gray-600">
            Upload and manage wedding photos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-wedding-gold/20 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                "rounded-none border-0 h-9 px-3",
                viewMode === 'grid' && "bg-wedding-gold text-white"
              )}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                "rounded-none border-0 h-9 px-3",
                viewMode === 'list' && "bg-wedding-gold text-white"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            disabled={uploading}
            className="bg-gradient-to-r from-wedding-gold to-wedding-blush hover:opacity-90"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Photos
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Photos</p>
                <p className="text-2xl font-bold">{gallery.length + newImages.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ImageIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selected</p>
                <p className="text-2xl font-bold">{selectedImages.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold">
                  {formatFileSize([...gallery, ...newImages].reduce((sum, img) => sum + img.size, 0))}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CloudUpload className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gallery Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Your Photos</CardTitle>
              <CardDescription>
                {gallery.length} saved photos, {newImages.length} new photos
              </CardDescription>
            </div>
            {selectedImages.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-wedding-gold/30">
                  {selectedImages.length} selected
                </Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={uploading}
                  className="h-9"
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-3 w-3" />
                  )}
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {gallery.length === 0 && newImages.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-gold/10">
                <ImageIcon className="h-8 w-8 text-wedding-gold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No photos yet</h3>
                <p className="text-gray-600 mt-1">
                  Upload your first wedding photo to get started
                </p>
              </div>
              <Button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 bg-gradient-to-r from-wedding-gold to-wedding-blush hover:opacity-90"
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...newImages, ...gallery].map((image) => (
                <motion.div
                  key={image._id || image.url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "relative group rounded-lg overflow-hidden border-2 transition-all duration-200",
                    selectedImages.includes(image._id || '')
                      ? "border-wedding-gold ring-2 ring-wedding-gold/20"
                      : image._id?.startsWith('temp-')
                      ? "border-blue-500/30 hover:border-blue-500/50"
                      : "border-gray-200 hover:border-wedding-gold/50"
                  )}
                >
                  {/* Badge for new images */}
                  {image._id?.startsWith('temp-') && (
                    <Badge className="absolute top-2 right-2 z-20 bg-blue-500 text-white">
                      New
                    </Badge>
                  )}

                  {/* Checkbox */}
                  <div className="absolute top-2 left-2 z-20">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-6 w-6 p-0 bg-white/90 backdrop-blur-sm rounded-full",
                        selectedImages.includes(image._id || '') && "bg-wedding-gold text-white"
                      )}
                      onClick={() => toggleImageSelection(image._id || '')}
                      disabled={uploading}
                    >
                      {selectedImages.includes(image._id || '') && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <Image
                    src={image.preview || image.url}
                    alt={image.description || image.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Use a fallback image instead of throwing an error
                      if (image.url && image.url.startsWith('blob:')) {
                        // If it's a blob URL that failed, try the Cloudinary URL if available
                        // This can happen after blob URLs are revoked
                        if (image.url !== image.preview && image.preview) {
                          target.src = image.preview;
                        } else {
                          // Show a simple placeholder
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjYWFhYWFhIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                        }
                      }
                    }}
                  />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    
                    {/* Actions */}
                    <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm"
                        onClick={() => window.open(image.url, '_blank')}
                        disabled={uploading}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm"
                        onClick={() => handleDeleteImage(image._id || '')}
                        disabled={uploading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 bg-white">
                    <p className="text-sm font-medium truncate">{image.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {formatFileSize(image.size)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(image.uploadedAt)}
                      </p>
                    </div>
                    <div className="mt-2">
                      <Textarea
                        placeholder="Add description..."
                        value={image.description || ''}
                        onChange={(e) => updateImageDescription(image._id || '', e.target.value)}
                        className="text-xs min-h-[60px] resize-none"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[...newImages, ...gallery].map((image) => (
                <motion.div
                  key={image._id || image.url}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg border transition-all duration-200",
                    selectedImages.includes(image._id || '')
                      ? "border-wedding-gold bg-wedding-gold/5"
                      : image._id?.startsWith('temp-')
                      ? "border-blue-500/30 hover:border-blue-500/50"
                      : "border-gray-200 hover:border-wedding-gold/30 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-5 w-5 p-0 rounded",
                        selectedImages.includes(image._id || '') && "bg-wedding-gold text-white"
                      )}
                      onClick={() => toggleImageSelection(image._id || '')}
                      disabled={uploading}
                    >
                      {selectedImages.includes(image._id || '') && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                    </Button>
                    <div className="relative h-12 w-12 rounded overflow-hidden bg-gray-100">
                      <Image
                        src={image.preview || image.url}
                        alt={image.description || image.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                      {image._id?.startsWith('temp-') && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[8px] px-1 rounded-bl">
                          NEW
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{image.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                      <p className="text-xs text-gray-500">{formatDate(image.uploadedAt)}</p>
                    </div>
                    <div className="mt-2">
                      <Textarea
                        placeholder="Add description..."
                        value={image.description || ''}
                        onChange={(e) => updateImageDescription(image._id || '', e.target.value)}
                        className="text-xs min-h-[60px] resize-none w-full"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(image.url, '_blank')}
                      className="h-8 w-8 p-0"
                      disabled={uploading}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteImage(image._id || '')}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      disabled={uploading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-wedding-sage/20 bg-wedding-sage/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-wedding-sage" />
            Gallery Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Upload high-resolution photos for best quality</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Organize photos by event or category</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Add descriptions to help guests identify photos</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Regularly backup your gallery</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Upload Photos</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUploadModal(false)}
                    disabled={uploading}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-gray-600 mt-1">
                  Add photos to your wedding gallery
                </p>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                {/* Upload Zone */}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
                    isDragging 
                      ? "border-wedding-gold bg-wedding-gold/20" 
                      : "border-wedding-gold/30 bg-wedding-gold/5 hover:bg-wedding-gold/10"
                  )}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-gold/10 mb-4">
                    {isDragging ? (
                      <CloudUpload className="h-8 w-8 text-wedding-gold animate-pulse" />
                    ) : (
                      <Upload className="h-8 w-8 text-wedding-gold" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {isDragging ? 'Drop photos here' : 'Drag & drop photos here'}
                  </h3>
                  <p className="text-gray-600 mb-4">or click to browse</p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Label htmlFor="photo-upload">
                    <Button
                      as="span"
                      variant="outline"
                      className="cursor-pointer hover:bg-wedding-gold/10"
                      disabled={uploading}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Select Photos
                    </Button>
                  </Label>
                  <p className="text-xs text-gray-500 mt-4">
                    Supports JPG, PNG, GIF, WebP up to 10MB each
                  </p>
                </div>

                {/* Preview */}
                {newImages.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <ImagePlus className="h-4 w-4" />
                      New Photos ({newImages.length})
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {newImages.slice(0, 15).map((image) => (
                        <div key={image._id} className="relative aspect-square rounded overflow-hidden bg-gray-100 group">
                          <Image
                            src={image.preview || image.url}
                            alt={image.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteImage(image._id || '')
                            }}
                            className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={uploading}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate">
                            {image.name}
                          </div>
                        </div>
                      ))}
                      {newImages.length > 15 && (
                        <div className="aspect-square rounded bg-gradient-to-br from-wedding-gold/20 to-wedding-blush/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            +{newImages.length - 15} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {newImages.length} new photos ready to upload
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(newImages.reduce((sum, img) => sum + img.size, 0))} total
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUploadModal(false)
                        setNewImages([])
                      }}
                      disabled={uploading}
                      className="min-w-[100px]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading || newImages.length === 0}
                      className="bg-gradient-to-r from-wedding-gold to-wedding-blush hover:opacity-90 min-w-[100px]"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Photos
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  )
}