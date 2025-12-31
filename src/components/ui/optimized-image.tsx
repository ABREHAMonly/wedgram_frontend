// src/components/ui/optimized-image.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  fill?: boolean
  loading?: 'lazy' | 'eager'
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  fill = false,
  loading = 'lazy',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Check if it's a Cloudinary image for optimization
  const isCloudinary = src.includes('res.cloudinary.com')
  let optimizedSrc = src

  if (isCloudinary) {
    // Add Cloudinary optimization parameters
    const params = [
      'f_auto', // Auto format
      'q_auto:good', // Auto quality
      'c_limit', // Limit cropping
    ]

    if (width && height) {
      params.push(`w_${width}`, `h_${height}`, 'c_fill')
    }

    const [baseUrl, extension] = src.split('.')
    optimizedSrc = `${baseUrl}/${params.join(',')}.${extension}`
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={cn(
          'object-cover transition-all duration-300',
          isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0'
        )}
        priority={priority}
        sizes={sizes}
        quality={quality}
        fill={fill}
        loading={loading}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
      
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-wedding-blush/20 to-wedding-gold/10 animate-pulse" />
      )}
    </div>
  )
}