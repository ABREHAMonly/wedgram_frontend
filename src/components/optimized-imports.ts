// src/components/optimized-imports.ts
import dynamic from 'next/dynamic'

// Dynamically import heavy components
export const HeavyCalendar = dynamic(
  () => import('@/components/calendar/calendar-view'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse bg-gradient-to-br from-wedding-blush/20 to-wedding-champagne/20 rounded-lg" />
    )
  }
)

export const GalleryLightbox = dynamic(
  () => import('@/components/gallery/lightbox-view'),
  { 
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="aspect-square animate-pulse bg-gradient-to-br from-wedding-blush/20 to-wedding-champagne/20 rounded-lg" 
          />
        ))}
      </div>
    )
  }
)

export const RichTextEditor = dynamic(
  () => import('@/components/editor/rich-text-editor'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-48 animate-pulse bg-gradient-to-br from-wedding-blush/20 to-wedding-champagne/20 rounded-lg" />
    )
  }
)

// Dashboard stats with prefetch
export const DashboardStats = dynamic(
  () => import('@/app/dashboard/stats-widget'),
  { 
    ssr: true, // Render on server for better SEO
    loading: () => (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="h-32 animate-pulse bg-gradient-to-br from-wedding-blush/20 to-wedding-champagne/20 rounded-lg" 
          />
        ))}
      </div>
    )
  }
)