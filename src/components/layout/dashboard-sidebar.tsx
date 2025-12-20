// src/components/layout/dashboard-sidebar.tsx (fully updated with mobile fixes)
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Calendar, 
  Settings,
  Bell,
  PlusCircle,
  Heart,
  Gift,
  Camera,
  Mail,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface DashboardSidebarProps {
  user: any
  isOpen: boolean
  onClose: () => void
}

const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Guests', href: '/dashboard/guests', icon: Users },
  { name: 'Invitations', href: '/dashboard/invites', icon: Mail },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Gallery', href: '/dashboard/gallery', icon: Camera },
  { name: 'Gifts', href: '/dashboard/gifts', icon: Gift },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardSidebar({ user, isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Detect mobile and handle body scroll
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle body scroll and backdrop
  useEffect(() => {
    if (isMobile) {
      if (isOpen) {
        // Add class to body to prevent scrolling
        document.body.classList.add('sidebar-open')
        // Prevent any touch events on body while sidebar is open
        document.body.style.overflow = 'hidden'
        document.body.style.touchAction = 'none'
      } else {
        // Remove class from body
        document.body.classList.remove('sidebar-open')
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
      }
    }

    return () => {
      document.body.classList.remove('sidebar-open')
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isMobile, isOpen])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }, [onClose])

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Mobile backdrop component
  const MobileBackdrop = () => {
    if (!isMobile || !isOpen) return null

    return (
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
        onClick={handleClose}
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'none'
        }}
      />
    )
  }

  const sidebarClasses = cn(
    'fixed lg:sticky top-0 left-0 h-screen bg-gradient-to-b from-wedding-blush/95 via-white/95 to-wedding-champagne/95',
    'backdrop-blur-lg border-r border-wedding-gold/20 shadow-xl transition-all duration-300 z-40',
    'touch-auto select-none pointer-events-auto', // Mobile touch fixes
    isMobile 
      ? (isOpen 
          ? 'translate-x-0 shadow-2xl' 
          : '-translate-x-full')
      : 'translate-x-0',
    collapsed ? 'w-20' : 'w-64'
  )

  return (
    <>
      <MobileBackdrop />
      
      <aside 
        className={sidebarClasses}
        style={{
          WebkitBackdropFilter: 'blur(16px)', // Safari support
          backdropFilter: 'blur(16px)',
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity'
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-wedding-gold/20">
          <Link 
            href="/dashboard" 
            className={cn(
              "flex items-center gap-3 transition-all duration-300",
              collapsed ? "opacity-0 scale-0 w-0" : "opacity-100 scale-100"
            )}
            onClick={() => isMobile && handleClose()}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-wedding-gold to-wedding-blush flex items-center justify-center shadow-md">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-cursive text-xl text-wedding-navy">WedGram</h1>
              <p className="text-xs text-wedding-navy/60">Planning made perfect</p>
            </div>
          </Link>
          
          {/* Toggle button for desktop */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-wedding-gold/10 touch-manipulation"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4 text-wedding-gold" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-wedding-gold" />
              )}
            </Button>
          )}

          {/* Close button for mobile */}
          {isMobile && isOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-wedding-gold/10 touch-manipulation"
              onClick={handleClose}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4 text-wedding-gold" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 no-scrollbar">
          <div className="space-y-1">
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group touch-manipulation active:scale-[0.98]',
                    'min-h-[44px]', // Better touch target for mobile
                    isActive
                      ? 'bg-gradient-to-r from-wedding-gold/20 to-wedding-blush/30 text-wedding-navy border-l-4 border-wedding-gold'
                      : 'text-wedding-navy/70 hover:bg-wedding-blush/40 hover:text-wedding-navy'
                  )}
                  onClick={() => {
                    if (isMobile) {
                      handleClose()
                    }
                  }}
                  style={{
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <div className={cn(
                    'flex items-center justify-center h-9 w-9 rounded-lg transition-colors flex-shrink-0',
                    isActive
                      ? 'bg-wedding-gold text-white shadow-sm'
                      : 'bg-wedding-blush/30 text-wedding-gold group-hover:bg-wedding-gold/20'
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    "font-medium transition-all duration-300 truncate",
                    collapsed ? "opacity-0 scale-0 w-0" : "opacity-100 scale-100"
                  )}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Create Invitation Button */}
          <div className={cn(
            "mt-8 px-3 transition-all duration-300",
            collapsed ? "opacity-0 scale-0 h-0" : "opacity-100 scale-100"
          )}>
            <Link
              href="/dashboard/invites/create"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-wedding-gold to-wedding-blush text-white rounded-lg hover:shadow-lg active:scale-[0.98] transition-all duration-200 shadow-md touch-manipulation min-h-[48px]"
              onClick={() => isMobile && handleClose()}
              style={{
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <PlusCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-semibold">New Invitation</span>
            </Link>
          </div>

          {/* Wedding Countdown (only when expanded) */}
          {!collapsed && user?.weddingDate && (
            <div className="mt-8 mx-3 p-4 bg-gradient-to-br from-wedding-sage/20 to-wedding-champagne/30 rounded-lg border border-wedding-gold/20 backdrop-blur-sm">
              <p className="text-xs text-wedding-navy/60 mb-1">Days Until Wedding</p>
              <p className="text-2xl font-serif font-bold text-wedding-gold">
                {Math.max(0, Math.ceil((new Date(user.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
              </p>
              <p className="text-xs text-wedding-navy/60 mt-2">
                {new Date(user.weddingDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div className={cn(
          "border-t border-wedding-gold/20 p-4 transition-all duration-300 bg-white/30 backdrop-blur-sm",
          collapsed ? "px-2" : "px-4"
        )}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-wedding-gold to-wedding-blush flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="font-semibold text-white text-sm">
                {getInitials(user?.name)}
              </span>
            </div>
            <div className={cn(
              "transition-all duration-300 overflow-hidden min-w-0",
              collapsed ? "opacity-0 scale-0 w-0" : "opacity-100 scale-100"
            )}>
              <p className="text-sm font-medium text-wedding-navy truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-wedding-navy/60 capitalize truncate">{user?.role || 'couple'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}