// src/components/layout/dashboard-header.tsx
'use client'

import { Bell, Search, User, LogOut, Settings, Heart, Calendar, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { notificationsApi } from '@/lib/api/notifications'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface DashboardHeaderProps {
  user: any
  onMenuClick: () => void
  isSidebarOpen: boolean
}

export default function DashboardHeader({ user, onMenuClick, isSidebarOpen }: DashboardHeaderProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load unread count on mount and periodically
  useEffect(() => {
    if (user) {
      loadUnreadCount()
      const interval = setInterval(loadUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const loadUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const response = await notificationsApi.getNotifications(1, 5)
      setNotifications(response.notifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleBellClick = () => {
    if (!showNotifications) {
      loadNotifications()
    }
    setShowNotifications(!showNotifications)
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleProfileClick = () => {
    router.push('/dashboard/settings')
    setShowDropdown(false)
  }

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      toast.info(`Searching for "${searchQuery}"`)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'rsvp': return <Heart className="h-4 w-4 text-green-600" />
      case 'guest_added': return <User className="h-4 w-4 text-blue-600" />
      case 'invitation_sent': return <Mail className="h-4 w-4 text-purple-600" />
      case 'invitation_failed': return <Mail className="h-4 w-4 text-red-600" />
      default: return <Bell className="h-4 w-4 text-wedding-gold" />
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-wedding-gold/20 shadow-soft">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side: Menu toggle and wedding countdown */}
        <div className="flex items-center gap-4">
          {/* Menu toggle button - only visible on mobile */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="hover:bg-wedding-blush/40"
            >
              <svg className="h-5 w-5 text-wedding-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
          
          {/* Wedding Countdown Badge */}
          {user?.weddingDate && (
            <Badge variant="outline" className="hidden md:flex items-center gap-1 border-wedding-gold/30 bg-wedding-blush/20 text-wedding-navy">
              <Calendar className="h-3 w-3" />
              <span className="font-semibold">
                {Math.ceil((new Date(user.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
              </span>
            </Badge>
          )}
        </div>

        {/* Center: Search - hidden on mobile, shown on tablet and desktop */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
            <Input
              placeholder="Search guests, invitations..."
              className="pl-10 bg-wedding-blush/20 border-wedding-gold/20 focus:border-wedding-gold focus:ring-wedding-gold/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick invite button - hidden on mobile */}
          <div className="hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              className="text-wedding-navy hover:bg-wedding-blush/40"
              onClick={() => router.push('/dashboard/invites/create')}
            >
              <Mail className="h-4 w-4 mr-1" />
              <span className="hidden lg:inline">Invite</span>
            </Button>
          </div>
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <Button 
              variant="ghost" 
              size="icon"
              className="relative hover:bg-wedding-blush/40"
              onClick={handleBellClick}
            >
              <Bell className="h-5 w-5 text-wedding-navy" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-elegant border border-wedding-gold/20 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-wedding-gold/20">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif font-semibold text-wedding-navy">Notifications</h3>
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-wedding-gold hover:text-wedding-gold/80"
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                </div>
                
                {loading ? (
                  <div className="p-8 text-center text-wedding-navy/60">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-wedding-gold"></div>
                    <p className="mt-2">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-wedding-navy/60">
                    <Bell className="h-12 w-12 mx-auto text-wedding-gold/30 mb-3" />
                    <p>No notifications yet</p>
                    <p className="text-sm mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-wedding-gold/10">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 hover:bg-wedding-blush/20 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-1 p-2 rounded-full ${
                            !notification.read 
                              ? 'bg-wedding-gold/10 text-wedding-gold' 
                              : 'bg-wedding-blush text-wedding-navy/60'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm text-wedding-navy">{notification.title}</h4>
                                <p className="text-sm text-wedding-navy/70 mt-1 line-clamp-2">
                                  {notification.description}
                                </p>
                              </div>
                              {!notification.read && (
                                <span className="h-2 w-2 bg-wedding-gold rounded-full flex-shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="text-xs text-wedding-navy/50 mt-2">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {notifications.length > 0 && (
                  <div className="p-4 border-t border-wedding-gold/20">
                    <Button
                      variant="ghost"
                      className="w-full text-sm text-wedding-gold hover:text-wedding-gold/80 hover:bg-wedding-blush/20"
                      onClick={() => router.push('/dashboard/notifications')}
                    >
                      View all notifications
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 hover:bg-wedding-blush/40 pl-2 pr-2"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <Avatar className="h-8 w-8 border border-wedding-gold/30">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-wedding-gold to-wedding-blush text-white">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-wedding-navy">{user?.name}</p>
                <p className="text-xs text-wedding-navy/60 capitalize">{user?.role}</p>
              </div>
            </Button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 md:w-56 bg-white rounded-xl shadow-elegant border border-wedding-gold/20 z-50 overflow-hidden">
                {/* Profile header */}
                <div className="p-4 bg-gradient-to-r from-wedding-blush/20 to-wedding-champagne/20 border-b border-wedding-gold/20">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-wedding-gold/30">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-wedding-gold to-wedding-blush text-white">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-wedding-navy">{user?.name}</p>
                      <p className="text-xs text-wedding-navy/60">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-3 text-sm text-wedding-navy hover:bg-wedding-blush/40 transition-colors"
                  >
                    <User className="h-4 w-4 mr-3 text-wedding-gold" />
                    Profile & Settings
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/settings/wedding')}
                    className="flex items-center w-full px-4 py-3 text-sm text-wedding-navy hover:bg-wedding-blush/40 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-3 text-wedding-gold" />
                    Wedding Details
                  </button>
                  <div className="border-t border-wedding-gold/10 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}