// src/lib/hooks/use-performance.ts
'use client'

import { useEffect, useState } from 'react'

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: Math.round(entry.startTime) }))
          }
        } else if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({ ...prev, lcp: Math.round(entry.startTime) }))
        } else if (entry.entryType === 'first-input') {
          setMetrics(prev => ({ ...prev, fid: Math.round(entry.processingStart - entry.startTime) }))
        } else if (entry.entryType === 'layout-shift') {
          setMetrics(prev => ({ ...prev, cls: Math.round(entry.value * 1000) / 1000 }))
        }
      }
    })

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })

    // Capture TTFB
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      setMetrics(prev => ({ ...prev, ttfb: Math.round(navigationEntry.responseStart - navigationEntry.requestStart) }))
    }

    return () => observer.disconnect()
  }, [])

  return metrics
}

// Hook for measuring component render time
export function useRenderTime(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now()
      
      return () => {
        const end = performance.now()
        const duration = end - start
        
        if (duration > 16) { // More than one frame at 60fps
          console.warn(`🚨 ${componentName} took ${duration.toFixed(2)}ms to render`)
        }
      }
    }
  }, [componentName])
}