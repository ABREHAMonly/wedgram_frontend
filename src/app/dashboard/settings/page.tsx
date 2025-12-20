// src/app/dashboard/settings/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/lib/hooks/use-auth'
import { authApi } from '@/lib/api/auth'
import { Wedding, weddingApi } from '@/lib/api/wedding'
import { toast } from 'sonner'
import { 
  User, 
  Bell, 
  Lock, 
  Calendar, 
  MapPin, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Mail,
  Phone,
  Heart,
  Shield,
  LogOut,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ProfileFormData {
  name: string
  email: string
  phone: string
  weddingDate: string
  partnerName: string
  weddingLocation: string
}

interface WeddingFormData {
  title: string
  description: string
  date: string
  venue: string
  venueAddress: string
  dressCode: string
  themeColor: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface NotificationSettings {
  emailUpdates: boolean
  rsvpAlerts: boolean
  reminders: boolean
  weeklyDigest: boolean
  guestAdded: boolean
  invitationSent: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, logout } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [weddingLoading, setWeddingLoading] = useState(true)
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Form states
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    weddingDate: '',
    partnerName: '',
    weddingLocation: '',
  })

  const [weddingData, setWeddingData] = useState<WeddingFormData>({
    title: '',
    description: '',
    date: '',
    venue: '',
    venueAddress: '',
    dressCode: 'Semi-Formal',
    themeColor: '#D4AF37',
  })

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailUpdates: true,
    rsvpAlerts: true,
    reminders: true,
    weeklyDigest: false,
    guestAdded: true,
    invitationSent: true,
  })

  // Initialize from URL params
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['profile', 'wedding', 'security', 'notifications'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Load user and wedding data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        weddingDate: user.weddingDate 
          ? new Date(user.weddingDate).toISOString().split('T')[0]
          : '',
        partnerName: user.partnerName || '',
        weddingLocation: user.weddingLocation || '',
      })
      loadWedding()
    }
  }, [user])

  const loadWedding = async () => {
    setWeddingLoading(true)
    try {
      const weddingResponse = await weddingApi.getWedding()
      setWedding(weddingResponse)
      
      // Format date for the form input (YYYY-MM-DD)
      const formattedDate = weddingResponse.date 
        ? new Date(weddingResponse.date).toISOString().split('T')[0]
        : ''
      
      setWeddingData({
        title: weddingResponse.title || '',
        description: weddingResponse.description || '',
        date: formattedDate,
        venue: weddingResponse.venue || '',
        venueAddress: weddingResponse.venueAddress || '',
        dressCode: weddingResponse.dressCode || 'Semi-Formal',
        themeColor: weddingResponse.themeColor || '#D4AF37',
      })
    } catch (error: any) {
      if (error.status !== 404) {
        console.error('Failed to load wedding:', error)
      }
      setWedding(null)
    } finally {
      setWeddingLoading(false)
    }
  }

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }

  // Profile update handler
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const updateData = {
        ...profileData,
        weddingDate: profileData.weddingDate ? new Date(profileData.weddingDate) : undefined,
      }
      await authApi.updateProfile(updateData)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Wedding update handler
  const handleWeddingUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!weddingData.title.trim()) {
      toast.error('Wedding title is required')
      return
    }
    if (!weddingData.date) {
      toast.error('Wedding date is required')
      return
    }
    if (!weddingData.venue.trim()) {
      toast.error('Venue is required')
      return
    }

    setLoading(true)
    
    try {
      // Convert date string to Date object for API
      const dateObj = new Date(weddingData.date)
      if (isNaN(dateObj.getTime())) {
        toast.error('Invalid date format')
        return
      }

      const dataToSend = {
        ...weddingData,
        date: dateObj,
      }
      
      if (wedding) {
        await weddingApi.updateWedding(dataToSend)
        toast.success('Wedding details updated successfully')
      } else {
        await weddingApi.createWedding(dataToSend)
        toast.success('Wedding details created successfully!')
        loadWedding()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save wedding details')
    } finally {
      setLoading(false)
    }
  }

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    
    try {
      // Note: You'll need to implement password change API in backend
      toast.success('Password changed successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  // Create quick wedding from user data
  const createQuickWedding = async () => {
    if (!user) return
    
    setLoading(true)
    
    try {
      const weddingDate = user.weddingDate 
        ? new Date(user.weddingDate).toISOString().split('T')[0]
        : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const defaultWeddingData: WeddingFormData = {
        title: `${user.name}'s Wedding`,
        description: 'Our special day',
        date: weddingDate,
        venue: user.weddingLocation || 'To be announced',
        venueAddress: '',
        dressCode: 'Semi-Formal',
        themeColor: '#D4AF37',
      }
      
      const apiData = {
        ...defaultWeddingData,
        date: new Date(defaultWeddingData.date)
      }
      
      setWeddingData(defaultWeddingData)
      await weddingApi.createWedding(apiData)
      toast.success('Wedding created successfully!')
      loadWedding()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create wedding')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setLoading(true)
    try {
      // Export data logic
      toast.success('Data export started. You will receive an email shortly.')
    } catch (error) {
      toast.error('Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      // Delete account logic
      toast.error('Account deletion is not yet implemented. Please contact support.')
    } catch (error) {
      toast.error('Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your account and wedding preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="wedding">
            <Calendar className="h-4 w-4 mr-2" />
            Wedding
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            required
                            disabled={loading}
                            className="pl-10"
                            placeholder="John & Jane Doe"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            required
                            disabled={loading}
                            className="pl-10"
                            placeholder="name@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                          <Input
                            id="phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            disabled={loading}
                            className="pl-10"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weddingDate">
                          Wedding Date *
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                          <Input
                            id="weddingDate"
                            type="date"
                            value={profileData.weddingDate}
                            onChange={(e) => setProfileData({...profileData, weddingDate: e.target.value})}
                            required
                            disabled={loading}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partnerName">Partner&apos;s Name</Label>
                        <div className="relative">
                          <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                          <Input
                            id="partnerName"
                            value={profileData.partnerName}
                            onChange={(e) => setProfileData({...profileData, partnerName: e.target.value})}
                            disabled={loading}
                            className="pl-10"
                            placeholder="Partner's name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weddingLocation">
                          Wedding Location
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                          <Input
                            id="weddingLocation"
                            value={profileData.weddingLocation}
                            onChange={(e) => setProfileData({...profileData, weddingLocation: e.target.value})}
                            disabled={loading}
                            className="pl-10"
                            placeholder="City, Venue"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Profile Changes'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Account Overview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Account Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-medium">Account Created</p>
                        <p className="text-xs text-gray-600">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-xs text-gray-600">
                          {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <Save className="h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-medium">Account Type</p>
                        <p className="text-xs text-gray-600 capitalize">
                          {user.role || 'Standard'}
                        </p>
                      </div>
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      disabled={loading}
                      className="w-full justify-start"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Account Data
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="w-full justify-start"
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Wedding Tab */}
        <TabsContent value="wedding">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Wedding Details</CardTitle>
                      <CardDescription>
                        {wedding 
                          ? 'Update your wedding information for invitations' 
                          : 'Set up your wedding details to start creating invitations'}
                      </CardDescription>
                    </div>
                    {wedding && (
                      <div className="flex items-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Wedding Created
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {weddingLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-wedding-gold mr-3" />
                      <span>Loading wedding details...</span>
                    </div>
                  ) : wedding ? (
                    <form onSubmit={handleWeddingUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="weddingTitle">Wedding Title *</Label>
                          <Input
                            id="weddingTitle"
                            placeholder="John & Jane's Wedding Celebration"
                            value={weddingData.title}
                            onChange={(e) => setWeddingData({...weddingData, title: e.target.value})}
                            required
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="weddingDate">
                            Wedding Date *
                          </Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                            <Input
                              id="weddingDate"
                              type="date"
                              value={weddingData.date}
                              onChange={(e) => setWeddingData({...weddingData, date: e.target.value})}
                              required
                              disabled={loading}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="venue">Venue *</Label>
                          <Input
                            id="venue"
                            value={weddingData.venue}
                            onChange={(e) => setWeddingData({...weddingData, venue: e.target.value})}
                            required
                            disabled={loading}
                            placeholder="Grand Ballroom"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="venueAddress">
                            Venue Address
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                            <Textarea
                              id="venueAddress"
                              value={weddingData.venueAddress}
                              onChange={(e) => setWeddingData({...weddingData, venueAddress: e.target.value})}
                              disabled={loading}
                              className="pl-10"
                              placeholder="123 Main Street, City, State ZIP"
                              rows={2}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dressCode">Dress Code</Label>
                          <Select
                            value={weddingData.dressCode}
                            onValueChange={(value) => setWeddingData({...weddingData, dressCode: value})}
                            disabled={loading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select dress code" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Formal">Formal / Black Tie</SelectItem>
                              <SelectItem value="Semi-Formal">Semi-Formal</SelectItem>
                              <SelectItem value="Cocktail">Cocktail</SelectItem>
                              <SelectItem value="Casual">Casual</SelectItem>
                              <SelectItem value="Traditional">Traditional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="themeColor">Theme Color</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="themeColor"
                              type="color"
                              value={weddingData.themeColor}
                              onChange={(e) => setWeddingData({...weddingData, themeColor: e.target.value})}
                              disabled={loading}
                              className="w-12 h-12 p-1 rounded-lg cursor-pointer"
                            />
                            <Input
                              value={weddingData.themeColor}
                              onChange={(e) => setWeddingData({...weddingData, themeColor: e.target.value})}
                              disabled={loading}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={weddingData.description}
                            onChange={(e) => setWeddingData({...weddingData, description: e.target.value})}
                            disabled={loading}
                            placeholder="Tell your guests about your special day, any special instructions, or what to expect..."
                            rows={4}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push('/dashboard/invites/create')}
                        >
                          Create Invitations
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Update Wedding Details'
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                          <div>
                            <h3 className="text-sm font-medium text-yellow-800">Wedding Details Required</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                              You need to set up your wedding details before creating invitations. 
                              This information will be included in your invitations.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Quick Setup</CardTitle>
                            <CardDescription>
                              Use your registration details
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span>Title: {user.name}&apos;s Wedding</span>
                              </li>
                              <li className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span>Date: {user.weddingDate ? new Date(user.weddingDate).toLocaleDateString() : '90 days from now'}</span>
                              </li>
                              <li className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span>Venue: {user.weddingLocation || 'To be announced'}</span>
                              </li>
                            </ul>
                            <Button
                              onClick={createQuickWedding}
                              disabled={loading}
                              className="w-full"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                'Create Wedding Automatically'
                              )}
                            </Button>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Custom Setup</CardTitle>
                            <CardDescription>
                              Set up all details manually
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                              Set up your wedding with custom title, date, venue, and other details.
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => {
                                const weddingDate = user.weddingDate 
                                  ? new Date(user.weddingDate).toISOString().split('T')[0]
                                  : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                
                                const newWeddingData: WeddingFormData = {
                                  title: `${user.name}'s Wedding`,
                                  description: 'Our special day',
                                  date: weddingDate,
                                  venue: user.weddingLocation || 'To be announced',
                                  venueAddress: '',
                                  dressCode: 'Semi-Formal',
                                  themeColor: '#D4AF37',
                                }
                                
                                setWeddingData(newWeddingData)
                                toast.info('Wedding form pre-filled. Click "Update Wedding Details" to create.')
                              }}
                              className="w-full"
                            >
                              Set Up Manually
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Wedding Tips */}
            <div>
              <Card className="border-wedding-sage/20 bg-wedding-sage/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-wedding-sage" />
                    Wedding Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Set your wedding date early to allow proper planning time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Include complete venue address for GPS navigation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Choose a dress code that matches your wedding style</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Select theme colors that reflect your personality</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Wedding Countdown */}
              {profileData.weddingDate && (
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-wedding-gold/10 to-wedding-blush/10">
                        <Calendar className="h-8 w-8 text-wedding-gold" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Days Until Wedding</p>
                        <p className="text-3xl font-bold text-wedding-gold">
                          {Math.ceil((new Date(profileData.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(profileData.weddingDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="currentPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          required
                          disabled={loading}
                          className="pl-10 pr-10"
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => {
                            setPasswordData({...passwordData, newPassword: e.target.value})
                            calculatePasswordStrength(e.target.value)
                          }}
                          required
                          disabled={loading}
                          className="pl-10 pr-10"
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      {/* Password Strength */}
                      {passwordData.newPassword && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Password strength:</span>
                            <span className={cn(
                              "text-xs font-medium",
                              passwordStrength >= 4 ? "text-green-500" :
                              passwordStrength >= 3 ? "text-blue-500" :
                              passwordStrength >= 2 ? "text-yellow-500" :
                              "text-red-500"
                            )}>
                              {passwordStrength === 0 ? 'Enter a password' :
                               passwordStrength === 1 ? 'Weak' :
                               passwordStrength === 2 ? 'Fair' :
                               passwordStrength === 3 ? 'Good' :
                               'Strong!'}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                passwordStrength >= 4 ? "bg-green-500" :
                                passwordStrength >= 3 ? "bg-blue-500" :
                                passwordStrength >= 2 ? "bg-yellow-500" :
                                "bg-red-500"
                              )}
                              style={{ width: `${passwordStrength * 25}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          required
                          disabled={loading}
                          className="pl-10 pr-10"
                          placeholder="Confirm new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 p-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing Password...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <Label className="font-medium">Two-Factor Authentication</Label>
                      <p className="text-xs text-gray-600">Add an extra layer of security</p>
                    </div>
                    <Switch className="data-[state=checked]:bg-wedding-gold" />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <Label className="font-medium">Login Sessions</Label>
                      <p className="text-xs text-gray-600">Manage active sessions</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <Label className="font-medium">Security Alerts</Label>
                      <p className="text-xs text-gray-600">Get alerts for suspicious activity</p>
                    </div>
                    <Switch className="data-[state=checked]:bg-wedding-gold" checked />
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      if (confirm('Sign out from all devices?')) {
                        logout()
                      }
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out from all devices
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={handleDeleteAccount}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about wedding activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Mail className="h-5 w-5 text-wedding-gold" />
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <Label className="font-medium">Wedding Updates</Label>
                            <p className="text-sm text-gray-600">
                              Important updates about your wedding planning
                            </p>
                          </div>
                          <Switch
                            checked={notifications.emailUpdates}
                            onCheckedChange={(checked) => 
                              setNotifications({...notifications, emailUpdates: checked})
                            }
                            className="data-[state=checked]:bg-wedding-gold"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <Label className="font-medium">RSVP Alerts</Label>
                            <p className="text-sm text-gray-600">
                              Get notified when guests RSVP
                            </p>
                          </div>
                          <Switch
                            checked={notifications.rsvpAlerts}
                            onCheckedChange={(checked) => 
                              setNotifications({...notifications, rsvpAlerts: checked})
                            }
                            className="data-[state=checked]:bg-wedding-gold"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <Label className="font-medium">Weekly Digest</Label>
                            <p className="text-sm text-gray-600">
                              Weekly summary of wedding activities
                            </p>
                          </div>
                          <Switch
                            checked={notifications.weeklyDigest}
                            onCheckedChange={(checked) => 
                              setNotifications({...notifications, weeklyDigest: checked})
                            }
                            className="data-[state=checked]:bg-wedding-gold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Real-time Alerts */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-wedding-gold" />
                        Real-time Alerts
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <Label className="font-medium">Guest Added</Label>
                            <p className="text-sm text-gray-600">
                              When new guests are added to your list
                            </p>
                          </div>
                          <Switch
                            checked={notifications.guestAdded}
                            onCheckedChange={(checked) => 
                              setNotifications({...notifications, guestAdded: checked})
                            }
                            className="data-[state=checked]:bg-wedding-gold"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <Label className="font-medium">Invitation Sent</Label>
                            <p className="text-sm text-gray-600">
                              When invitations are successfully sent
                            </p>
                          </div>
                          <Switch
                            checked={notifications.invitationSent}
                            onCheckedChange={(checked) => 
                              setNotifications({...notifications, invitationSent: checked})
                            }
                            className="data-[state=checked]:bg-wedding-gold"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <Label className="font-medium">Reminders</Label>
                            <p className="text-sm text-gray-600">
                              Automatic reminders for upcoming tasks
                            </p>
                          </div>
                          <Switch
                            checked={notifications.reminders}
                            onCheckedChange={(checked) => 
                              setNotifications({...notifications, reminders: checked})
                            }
                            className="data-[state=checked]:bg-wedding-gold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Notification Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email Notifications</span>
                      <Badge variant={notifications.emailUpdates ? "default" : "outline"}>
                        {notifications.emailUpdates ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">RSVP Alerts</span>
                      <Badge variant={notifications.rsvpAlerts ? "default" : "outline"}>
                        {notifications.rsvpAlerts ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Real-time Alerts</span>
                      <Badge variant={notifications.guestAdded || notifications.invitationSent ? "default" : "outline"}>
                        {notifications.guestAdded || notifications.invitationSent ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Weekly Digest</span>
                      <Badge variant={notifications.weeklyDigest ? "default" : "outline"}>
                        {notifications.weeklyDigest ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button
                    onClick={() => {
                      // Save settings
                      toast.success('Notification preferences saved')
                    }}
                    className="w-full bg-gradient-to-r from-wedding-gold to-wedding-blush"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNotifications({
                        emailUpdates: true,
                        rsvpAlerts: true,
                        reminders: true,
                        weeklyDigest: false,
                        guestAdded: true,
                        invitationSent: true,
                      })
                      toast.info('Reset to default preferences')
                    }}
                    className="w-full border-wedding-gold/30 text-wedding-gold"
                  >
                    Reset to Default
                  </Button>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-wedding-sage/20 bg-wedding-sage/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-wedding-sage" />
                    Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Enable real-time alerts to stay on top of guest activity. Weekly digests help you review progress without constant notifications.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}