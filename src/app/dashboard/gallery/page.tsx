// src/app/dashboard/gallery/page.tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { weddingApi, Wedding } from '@/lib/api/wedding'
import { toast } from 'sonner'
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  Download, 
  Loader2,
  Plus,
  X,
  Grid3x3,
  List,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface GalleryImage {
  id: string
  url: string
  name: string
  size: number
  uploadedAt: string
  description?: string
}

export default function GalleryPage() {
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<GalleryImage[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load wedding and gallery
  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = useCallback(async () => {
    setLoading(true)
    try {
      const weddingData = await weddingApi.getWedding()
      setWedding(weddingData)
      
      // Convert gallery string array to GalleryImage objects
      if (weddingData.gallery && Array.isArray(weddingData.gallery)) {
        const galleryImages = weddingData.gallery.map((url, index) => ({
          id: `img-${index}`,
          url,
          name: url.split('/').pop() || `image-${index + 1}`,
          size: 1024, // Mock size
          uploadedAt: new Date().toISOString(),
          description: `Wedding photo ${index + 1}`
        }))
        setUploadedImages(galleryImages)
      }
    } catch (error: any) {
      console.error('Failed to load gallery:', error)
      if (error.status !== 404) {
        toast.error('Failed to load gallery')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return
    
    // Validate file types and sizes
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
    
    // Create preview URLs and add to uploaded images
    const newImages = validFiles.map(file => ({
      id: `new-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      description: ''
    }))
    
    setUploadedImages(prev => [...prev, ...newImages])
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    toast.success(`Added ${newImages.length} image(s)`)
  }

  const handleUpload = async () => {
    if (!wedding) {
      toast.error('Wedding not found')
      return
    }

    if (uploadedImages.length === 0) {
      toast.info('No images to upload')
      return
    }

    setUploading(true)
    try {
      // In a real app, you would upload images to a storage service
      // For now, we'll simulate by updating the wedding with image URLs
      const imageUrls = uploadedImages.map(img => img.url)
      
      await weddingApi.updateWedding({
        ...wedding,
        gallery: imageUrls
      })
      
      toast.success('Gallery updated successfully')
      setShowUploadModal(false)
      await loadGallery()
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId))
    setSelectedImages(prev => prev.filter(id => id !== imageId))
  }

  const handleDeleteSelected = () => {
    if (selectedImages.length === 0) {
      toast.info('No images selected')
      return
    }
    
    setUploadedImages(prev => prev.filter(img => !selectedImages.includes(img.id)))
    setSelectedImages([])
    toast.success(`Deleted ${selectedImages.length} image(s)`)
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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading && !wedding) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-wedding-gold" />
      </div>
    )
  }

  return (
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
            className="bg-gradient-to-r from-wedding-gold to-wedding-blush"
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
                <p className="text-2xl font-bold">{uploadedImages.length}</p>
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
                  {formatFileSize(uploadedImages.reduce((sum, img) => sum + img.size, 0))}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Download className="h-6 w-6 text-purple-600" />
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
                {uploadedImages.length} photos in your gallery
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
                  className="h-9"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {uploadedImages.length === 0 ? (
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
                className="mt-4 bg-gradient-to-r from-wedding-gold to-wedding-blush"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {uploadedImages.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "relative group rounded-lg overflow-hidden border-2 transition-all duration-200",
                    selectedImages.includes(image.id)
                      ? "border-wedding-gold ring-2 ring-wedding-gold/20"
                      : "border-gray-200 hover:border-wedding-gold/50"
                  )}
                >
                  {/* Checkbox */}
                  <div className="absolute top-2 left-2 z-20">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-6 w-6 p-0 bg-white/90 backdrop-blur-sm rounded-full",
                        selectedImages.includes(image.id) && "bg-wedding-gold text-white"
                      )}
                      onClick={() => toggleImageSelection(image.id)}
                    >
                      {selectedImages.includes(image.id) && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <Image
                      src={image.url}
                      alt={image.description || image.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm"
                        onClick={() => handleDeleteImage(image.id)}
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
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedImages.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg border transition-all duration-200",
                    selectedImages.includes(image.id)
                      ? "border-wedding-gold bg-wedding-gold/5"
                      : "border-gray-200 hover:border-wedding-gold/30 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-5 w-5 p-0 rounded",
                        selectedImages.includes(image.id) && "bg-wedding-gold text-white"
                      )}
                      onClick={() => toggleImageSelection(image.id)}
                    >
                      {selectedImages.includes(image.id) && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                    </Button>
                    <div className="relative h-12 w-12 rounded overflow-hidden bg-gray-100">
                      <Image
                        src={image.url}
                        alt={image.description || image.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{image.name}</p>
                    {image.description && (
                      <p className="text-sm text-gray-600 truncate">{image.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                      <p className="text-xs text-gray-500">{formatDate(image.uploadedAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(image.url, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteImage(image.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
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
                <div className="border-2 border-dashed border-wedding-gold/30 rounded-xl p-8 text-center bg-wedding-gold/5">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-gold/10 mb-4">
                    <Upload className="h-8 w-8 text-wedding-gold" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Drag & drop photos here</h3>
                  <p className="text-gray-600 mb-4">or click to browse</p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Label htmlFor="photo-upload">
                    <Button
                      as="span"
                      variant="outline"
                      className="cursor-pointer"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Select Photos
                    </Button>
                  </Label>
                  <p className="text-xs text-gray-500 mt-4">
                    Supports JPG, PNG, GIF up to 10MB each
                  </p>
                </div>

                {/* Preview */}
                {uploadedImages.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Selected Photos ({uploadedImages.length})</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {uploadedImages.slice(-8).map((image) => (
                        <div key={image.id} className="relative aspect-square rounded overflow-hidden bg-gray-100">
                          <Image
                            src={image.url}
                            alt={image.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 33vw, 25vw"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteImage(image.id)}
                            className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/90 backdrop-blur-sm"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {uploadedImages.length > 8 && (
                        <div className="aspect-square rounded bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            +{uploadedImages.length - 8} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {uploadedImages.length} photos selected
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowUploadModal(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading || uploadedImages.length === 0}
                      className="bg-gradient-to-r from-wedding-gold to-wedding-blush"
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
  )
}