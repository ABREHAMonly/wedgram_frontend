// In /src/app/dashboard/layout.tsx
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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-wedding-blush/20 via-white to-wedding-champagne/20">
        <div className="text-center space-y-6">
          <LoadingSpinner size="lg" />
          <p className="text-wedding-navy/60">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-wedding-blush/10 via-white to-wedding-champagne/10">
      <DashboardSidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          user={user} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
      
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}