// src/app/dashboard/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import DashboardSidebar from '@/components/layout/dashboard-sidebar'
import DashboardHeader from '@/components/layout/dashboard-header'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [loading, isAuthenticated, router])

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-wedding-blush/20 via-white to-wedding-champagne/20">
        <div className="text-center space-y-6">
          <div className="relative">
            <LoadingSpinner size="lg" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-wedding-navy mb-2">
              Loading Your Dashboard
            </h3>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-wedding-blush/10 via-white to-wedding-champagne/10">
      {/* Sidebar - fixed on left */}
      <DashboardSidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header - fixed at top */}
        <DashboardHeader 
          user={user} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />
        
        {/* Main content - scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}