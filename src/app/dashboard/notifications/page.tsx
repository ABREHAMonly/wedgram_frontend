// src/app/dashboard/notifications/page.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { notificationsApi } from '@/lib/api/notifications'
import { Notification } from '@/lib/api/notifications'
import { toast } from 'sonner'
import { 
  Bell, 
  CheckCircle, 
  UserPlus, 
  MessageSquare, 
  Send, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Check,
  Eye,
  EyeOff,
  Settings,
  Volume2,
  BellOff,
  Calendar,
  Mail
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function NotificationsPage() {
  // State management
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    rsvpAlerts: true,
    guestAdded: true,
    invitationSent: true,
    invitationFailed: true,
    weeklyDigest: false,
    dailySummary: true
  })

  // Load notifications on mount
  useEffect(() => {
    loadNotifications()
    loadUnreadCount()
  }, [])

  // Filter notifications when tab changes
  useEffect(() => {
    filterNotifications()
  }, [notifications, activeTab])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const response = await notificationsApi.getNotifications(1, 50)
      setNotifications(response.notifications || [])
    } catch (error) {
      console.error('Failed to load notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }

  const filterNotifications = () => {
    let filtered = [...notifications]

    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter(n => !n.read)
        break
      case 'rsvp':
        filtered = filtered.filter(n => n.type === 'rsvp')
        break
      case 'guest':
        filtered = filtered.filter(n => n.type === 'guest_added')
        break
      case 'invitation':
        filtered = filtered.filter(n => n.type === 'invitation_sent' || n.type === 'invitation_failed')
        break
    }

    setFilteredNotifications(filtered)
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(prev => prev.map(n => 
        n._id === id ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
      toast.success('Notification marked as read')
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      toast.info('No unread notifications')
      return
    }

    setMarkingAll(true)
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      // Note: You'll need to implement delete API in backend
      setNotifications(prev => prev.filter(n => n._id !== id))
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const handleSettingsUpdate = async () => {
    try {
      // Save settings to API
      toast.success('Notification preferences saved')
    } catch (error) {
      toast.error('Failed to save preferences')
    }
  }

  const getIcon = (type: string) => {
    const icons = {
      rsvp: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
      guest_added: { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-100' },
      invitation_sent: { icon: Send, color: 'text-purple-500', bg: 'bg-purple-100' },
      invitation_failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
      message: { icon: MessageSquare, color: 'text-yellow-500', bg: 'bg-yellow-100' },
      system: { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100' }
    }
    return icons[type as keyof typeof icons] || icons.system
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 7) {
        return format(date, 'MMM dd, yyyy')
      }
      if (days > 0) return `${days}d ago`
      if (hours > 0) return `${hours}h ago`
      if (minutes > 0) return `${minutes}m ago`
      return 'Just now'
    } catch {
      return 'Recently'
    }
  }

  const memoizedNotifications = useMemo(() => filteredNotifications, [filteredNotifications])

  const unreadNotifications = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600">
            Stay updated with wedding activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="outline" className="border-wedding-gold/30">
              {unreadCount} unread
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={markingAll || unreadCount === 0}
            className="flex items-center"
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">RSVP Updates</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.type === 'rsvp').length}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Guest Activity</p>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => n.type === 'guest_added').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="rsvp">RSVP</TabsTrigger>
          <TabsTrigger value="guest">Guests</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Notifications List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {activeTab === 'all' && 'All Notifications'}
                    {activeTab === 'unread' && 'Unread Notifications'}
                    {activeTab === 'rsvp' && 'RSVP Updates'}
                    {activeTab === 'guest' && 'Guest Activity'}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({memoizedNotifications.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-wedding-gold" />
                    </div>
                  ) : memoizedNotifications.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-gold/10">
                        <Bell className="h-8 w-8 text-wedding-gold" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">No notifications</h3>
                        <p className="text-gray-600 mt-1">
                          {activeTab === 'unread' 
                            ? 'You have no unread notifications'
                            : 'You\'re all caught up! Check back later for updates.'
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {memoizedNotifications.map((notification, index) => {
                        const Icon = getIcon(notification.type).icon
                        const iconColor = getIcon(notification.type).color
                        const iconBg = getIcon(notification.type).bg
                        
                        return (
                          <motion.div
                            key={notification._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className={cn(
                              "flex items-start gap-4 p-4 rounded-lg border transition-all duration-200",
                              !notification.read 
                                ? "bg-blue-50 border-blue-100" 
                                : "bg-white border-gray-200 hover:bg-gray-50"
                            )}>
                              {/* Icon */}
                              <div className={cn(
                                "p-2 rounded-full flex-shrink-0",
                                iconBg
                              )}>
                                <Icon className={cn("h-5 w-5", iconColor)} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-sm">{notification.title}</h4>
                                      {!notification.read && (
                                        <Badge className="bg-blue-600 text-xs">New</Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                                    
                                    {/* Metadata */}
                                    {notification.data && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {notification.data.guestName && (
                                          <Badge variant="outline" className="text-xs">
                                            {notification.data.guestName}
                                          </Badge>
                                        )}
                                        {notification.data.status && (
                                          <Badge className={cn(
                                            "text-xs",
                                            notification.data.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                            notification.data.status === 'declined' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                          )}>
                                            {notification.data.status}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                      {formatTime(notification.createdAt)}
                                    </span>
                                    {!notification.read && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleMarkAsRead(notification._id)}
                                        className="h-6 px-2 text-xs"
                                      >
                                        Mark read
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Settings Panel */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-wedding-gold" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Control how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <Label className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Notifications
                      </Label>
                      <p className="text-xs text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({...prev, emailNotifications: checked}))
                      }
                      className="data-[state=checked]:bg-wedding-gold"
                    />
                  </div>

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <Label className="font-medium flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Push Notifications
                      </Label>
                      <p className="text-xs text-gray-600">Receive browser notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({...prev, pushNotifications: checked}))
                      }
                      className="data-[state=checked]:bg-wedding-gold"
                    />
                  </div>

                  {/* RSVP Alerts */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <Label className="font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        RSVP Alerts
                      </Label>
                      <p className="text-xs text-gray-600">When guests RSVP</p>
                    </div>
                    <Switch
                      checked={notificationSettings.rsvpAlerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({...prev, rsvpAlerts: checked}))
                      }
                      className="data-[state=checked]:bg-wedding-gold"
                    />
                  </div>

                  {/* Guest Added */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <Label className="font-medium flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Guest Added
                      </Label>
                      <p className="text-xs text-gray-600">When new guests are added</p>
                    </div>
                    <Switch
                      checked={notificationSettings.guestAdded}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({...prev, guestAdded: checked}))
                      }
                      className="data-[state=checked]:bg-wedding-gold"
                    />
                  </div>

                  {/* Invitation Sent */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <Label className="font-medium flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Invitation Sent
                      </Label>
                      <p className="text-xs text-gray-600">When invitations are sent</p>
                    </div>
                    <Switch
                      checked={notificationSettings.invitationSent}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({...prev, invitationSent: checked}))
                      }
                      className="data-[state=checked]:bg-wedding-gold"
                    />
                  </div>

                  {/* Daily Summary */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <Label className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Daily Summary
                      </Label>
                      <p className="text-xs text-gray-600">Daily activity summary</p>
                    </div>
                    <Switch
                      checked={notificationSettings.dailySummary}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({...prev, dailySummary: checked}))
                      }
                      className="data-[state=checked]:bg-wedding-gold"
                    />
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={handleSettingsUpdate}
                      className="w-full bg-gradient-to-r from-wedding-gold to-wedding-blush"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Save Preferences
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNotificationSettings({
                          emailNotifications: true,
                          pushNotifications: true,
                          rsvpAlerts: true,
                          guestAdded: true,
                          invitationSent: true,
                          invitationFailed: true,
                          weeklyDigest: false,
                          dailySummary: true
                        })
                      }}
                      className="w-full border-wedding-gold/30 text-wedding-gold"
                    >
                      Reset to Default
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="mt-6 border-wedding-sage/20 bg-wedding-sage/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-wedding-sage" />
                    Notification Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Enable push notifications for real-time updates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Keep RSVP alerts on to track guest responses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Daily summaries help you stay organized</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}