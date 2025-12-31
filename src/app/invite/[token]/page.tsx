// src/app/invite/[token]/page.tsx - Elegant Wedding Design
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { rsvpApi } from '@/lib/api/rsvp'
import { weddingApi } from '@/lib/api/wedding'
import { toast } from 'sonner'
// Replace the import line at the top
import { 
  Loader2, 
  Calendar, 
  MapPin, 
  Image as ImageIcon, 
  Users, 
  Clock,
  Heart,
  Camera,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Gift,
  Music,
  Car,
  Home,
  ArrowLeft,
  Share2,
  Download,
  Printer,
  Sparkles,
  Flower2,
  PartyPopper,
  CameraIcon,
  Palette,
  CalendarDays,
  MapPinIcon,
  Clock4,
  UserCheck,
  MessageCircle,
  Music2,
  Coffee,
  Utensils,
  Cake,
  Wine,
  Circle, // Add Circle as replacement for Ring
  Crown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

type RSVPData = {
  response: 'accepted' | 'declined' | 'maybe'
  attendingCount: number
  message?: string
  dietaryRestrictions?: string
  songRequests?: string[]
  accommodationNeeded: boolean
  transportationNeeded: boolean
}

type GuestData = {
  guest?: {
    name: string
    rsvpStatus: string
    hasRSVPed: boolean
    rsvpSubmittedAt?: string
  }
  wedding?: {
    title: string
    date: string
    venue: string
  }
  rsvp?: {
    response: string
    attendingCount: number
    message?: string
    dietaryRestrictions?: string
    songRequests?: string[]
    submittedAt: string
  }
}

type WeddingDetails = {
  wedding: {
    id: string;
    title: string;
    description?: string;
    date: string;
    venue: string;
    venueAddress?: string;
    themeColor?: string;
    coverImage?: string;
  };
  gallery: Array<{
    _id: string;
    url: string;
    name: string;
    description?: string;
    uploadedAt: string;
  }>;
  schedule: Array<{
    time: string;
    event: string;
    description?: string;
    location?: string;
  }>;
}

export default function RSVPPage() {
  const params = useParams()
  const token = params.token as string
  
  const [loading, setLoading] = useState(true)
  const [weddingLoading, setWeddingLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [guestData, setGuestData] = useState<GuestData | null>(null)
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails | null>(null)
  const [activeTab, setActiveTab] = useState('rsvp')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [formData, setFormData] = useState<RSVPData>({
    response: 'accepted',
    attendingCount: 1,
    message: '',
    dietaryRestrictions: '',
    songRequests: [],
    accommodationNeeded: false,
    transportationNeeded: false,
  })

  useEffect(() => {
    loadAllData()
  }, [token])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const rsvpData = await rsvpApi.getRSVPStatus(token)
      console.log('RSVP data loaded:', rsvpData)
      
      const actualData = rsvpData.data || rsvpData
      
      setGuestData({
        guest: actualData.guest,
        wedding: actualData.wedding,
        rsvp: actualData.rsvp,
      })
      
      if (actualData.rsvp) {
        setFormData({
          response: actualData.rsvp.response as 'accepted' | 'declined' | 'maybe',
          attendingCount: actualData.rsvp.attendingCount,
          message: actualData.rsvp.message || '',
          dietaryRestrictions: actualData.rsvp.dietaryRestrictions || '',
          songRequests: actualData.rsvp.songRequests || [],
          accommodationNeeded: false,
          transportationNeeded: false,
        })
      }
      
      await loadWeddingDetails()
    } catch (error: any) {
      console.error('Failed to load RSVP data:', error)
      if (error.status !== 404) {
        toast.error('Failed to load invitation data')
      }
      setGuestData(null)
    } finally {
      setLoading(false)
    }
  }

  const loadWeddingDetails = async () => {
    setWeddingLoading(true)
    try {
      const details = await weddingApi.getWeddingByToken(token)
      setWeddingDetails(details)
    } catch (error: any) {
      console.error('Failed to load wedding details:', error)
    } finally {
      setWeddingLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await rsvpApi.submitRSVP(token, formData)
      toast.success('RSVP submitted successfully!')
      await loadAllData()
    } catch (error: any) {
      console.error('Submit RSVP error:', error)
      toast.error(error.message || 'Failed to submit RSVP')
    } finally {
      setSubmitting(false)
    }
  }

  const formatWeddingDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, MMMM do, yyyy 'at' h:mm a")
    } catch {
      return dateString
    }
  }

  const nextImage = () => {
    if (weddingDetails?.gallery) {
      setCurrentImageIndex((prev) => 
        prev === weddingDetails.gallery.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (weddingDetails?.gallery) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? weddingDetails.gallery.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-white">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-rose-600 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="h-6 w-6 text-rose-500 animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-lg font-serif text-gray-700">Loading your invitation</p>
            <p className="text-sm text-gray-500">Getting ready for the celebration...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!guestData || !guestData.guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-white p-4">
        <Card className="w-full max-w-md border-rose-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-rose-600" />
            </div>
            <CardTitle className="font-serif text-2xl text-rose-900">Invitation Not Found</CardTitle>
            <CardDescription>
              The invitation link may be invalid or expired
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              If you believe this is an error, please contact the wedding couple.
            </p>
            <Button variant="outline" className="border-rose-300 text-rose-700">
              <Mail className="mr-2 h-4 w-4" />
              Contact the Couple
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white font-sans">
      {/* Elegant Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-200">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 py-8 md:py-12 relative">
          {/* Wedding Title Section */}
          <div className="max-w-4xl mx-auto text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-rose-300"></div>
              <Sparkles className="h-6 w-6 text-amber-500" />
              <div className="h-px w-12 bg-rose-300"></div>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-rose-900 mb-4 tracking-tight">
              {weddingDetails?.wedding.title || guestData.wedding?.title || 'Wedding Celebration'}
            </h1>
            
            {weddingDetails?.wedding.description && (
              <p className="text-lg text-gray-600 mb-8 italic max-w-2xl mx-auto">
                {weddingDetails.wedding.description}
              </p>
            )}

            {/* Invitation Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-rose-200 shadow-sm mb-8">
              <Crown className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-rose-800">
                You're Invited, {guestData.guest.name}!
              </span>
            </div>
          </div>

          {/* Wedding Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Date Card */}
            <Card className="border-rose-200 bg-white/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-amber-50 border border-amber-200">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-amber-600 mb-1">
                      Date & Time
                    </p>
                    <p className="text-lg text-gray-800 font-medium">
                      {formatWeddingDate(weddingDetails?.wedding.date || guestData.wedding?.date || '')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venue Card */}
            <Card className="border-rose-200 bg-white/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-rose-50 border border-rose-200">
                    <MapPinIcon className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-rose-600 mb-1">
                      Venue
                    </p>
                    <p className="text-lg text-gray-800 font-medium">
                      {weddingDetails?.wedding.venue || guestData.wedding?.venue || ''}
                    </p>
                    {weddingDetails?.wedding.venueAddress && (
                      <p className="text-sm text-gray-600 mt-1">
                        {weddingDetails.wedding.venueAddress}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Info Card */}
            <Card className="border-rose-200 bg-white/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-emerald-50 border border-emerald-200">
                    <UserCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-1">
                      Guest Information
                    </p>
                    <p className="text-lg text-gray-800 font-medium">
                      {guestData.guest.name}
                    </p>
                    <p className={cn(
                      "text-sm font-medium mt-1",
                      guestData.guest.hasRSVPed 
                        ? guestData.guest.rsvpStatus === 'accepted' 
                          ? "text-emerald-600"
                          : "text-rose-600"
                        : "text-amber-600"
                    )}>
                      {guestData.guest.hasRSVPed 
                        ? `RSVP: ${guestData.guest.rsvpStatus}`
                        : 'RSVP Pending'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-rose-100/50 to-transparent rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-amber-100/30 to-transparent rounded-full translate-x-24 translate-y-24"></div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Tabs Navigation */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-rose-900 mb-2">
                Wedding Details
              </h2>
              <p className="text-gray-600">
                Explore the celebration and share your response
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Link copied to clipboard!')
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto bg-rose-50/50 backdrop-blur-sm border border-rose-200 rounded-xl p-1">
              <TabsTrigger value="rsvp" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span className="font-medium">RSVP</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span className="font-medium">Gallery</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Schedule</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* RSVP Tab */}
            <TabsContent value="rsvp" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* RSVP Form - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Current RSVP Status */}
                  {guestData.guest.hasRSVPed && (
                    <Card className="border-emerald-200 bg-emerald-50/50">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-emerald-100">
                            <Heart className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-emerald-800">
                              RSVP Already Submitted
                            </h3>
                            <p className="text-sm text-emerald-600">
                              Thank you for your response! You can update it below.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* RSVP Form Card */}
                  <Card className="border-rose-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-rose-50 to-white border-b border-rose-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white border border-rose-200">
                          <MessageCircle className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                          <CardTitle className="text-rose-900">Your Response</CardTitle>
                          <CardDescription>
                            Please let us know if you can join our celebration
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <form onSubmit={handleSubmit}>
                      <CardContent className="space-y-6 p-6">
                        {/* Attendance Selection */}
                        <div className="space-y-4">
                          <Label className="text-base font-medium text-gray-800">
                            Will you be attending?
                          </Label>
                          <RadioGroup
                            value={formData.response}
                            onValueChange={(value: 'accepted' | 'declined' | 'maybe') =>
                              setFormData({ ...formData, response: value })
                            }
                            className="grid grid-cols-1 md:grid-cols-3 gap-3"
                          >
                            <div className={cn(
                              "relative p-4 rounded-xl border-2 transition-all cursor-pointer group",
                              formData.response === 'accepted' 
                                ? "border-emerald-500 bg-emerald-50" 
                                : "border-gray-200 hover:border-emerald-300 bg-white"
                            )}>
                              <RadioGroupItem value="accepted" id="accepted" className="sr-only" />
                              <Label htmlFor="accepted" className="cursor-pointer">
                                <div className="flex flex-col items-center text-center space-y-3">
                                  <div className={cn(
                                    "p-3 rounded-full transition-colors",
                                    formData.response === 'accepted' 
                                      ? "bg-emerald-100" 
                                      : "bg-gray-100 group-hover:bg-emerald-50"
                                  )}>
                                    <Heart className={cn(
                                      "h-6 w-6",
                                      formData.response === 'accepted' 
                                        ? "text-emerald-600" 
                                        : "text-gray-400 group-hover:text-emerald-500"
                                    )} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800">Joyfully Accept</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      Can't wait to celebrate!
                                    </p>
                                  </div>
                                </div>
                              </Label>
                            </div>

                            <div className={cn(
                              "relative p-4 rounded-xl border-2 transition-all cursor-pointer group",
                              formData.response === 'maybe' 
                                ? "border-amber-500 bg-amber-50" 
                                : "border-gray-200 hover:border-amber-300 bg-white"
                            )}>
                              <RadioGroupItem value="maybe" id="maybe" className="sr-only" />
                              <Label htmlFor="maybe" className="cursor-pointer">
                                <div className="flex flex-col items-center text-center space-y-3">
                                  <div className={cn(
                                    "p-3 rounded-full transition-colors",
                                    formData.response === 'maybe' 
                                      ? "bg-amber-100" 
                                      : "bg-gray-100 group-hover:bg-amber-50"
                                  )}>
                                    <Clock className={cn(
                                      "h-6 w-6",
                                      formData.response === 'maybe' 
                                        ? "text-amber-600" 
                                        : "text-gray-400 group-hover:text-amber-500"
                                    )} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800">Regretfully Decline</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      Send our love
                                    </p>
                                  </div>
                                </div>
                              </Label>
                            </div>

                            <div className={cn(
                              "relative p-4 rounded-xl border-2 transition-all cursor-pointer group",
                              formData.response === 'declined' 
                                ? "border-rose-500 bg-rose-50" 
                                : "border-gray-200 hover:border-rose-300 bg-white"
                            )}>
                              <RadioGroupItem value="declined" id="declined" className="sr-only" />
                              <Label htmlFor="declined" className="cursor-pointer">
                                <div className="flex flex-col items-center text-center space-y-3">
                                  <div className={cn(
                                    "p-3 rounded-full transition-colors",
                                    formData.response === 'declined' 
                                      ? "bg-rose-100" 
                                      : "bg-gray-100 group-hover:bg-rose-50"
                                  )}>
                                    <Heart className={cn(
                                      "h-6 w-6",
                                      formData.response === 'declined' 
                                        ? "text-rose-600" 
                                        : "text-gray-400 group-hover:text-rose-500"
                                    )} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800">Still Deciding</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      Not sure yet
                                    </p>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Number of Guests */}
                        {formData.response === 'accepted' && (
                          <div className="space-y-3">
                            <Label htmlFor="attendingCount" className="text-base font-medium text-gray-800">
                              Number of guests
                            </Label>
                            <div className="flex items-center gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-xl border-rose-300 text-rose-700 hover:bg-rose-50"
                                onClick={() => 
                                  setFormData({ 
                                    ...formData, 
                                    attendingCount: Math.max(1, formData.attendingCount - 1) 
                                  })
                                }
                              >
                                -
                              </Button>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-rose-900">
                                  {formData.attendingCount}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formData.attendingCount === 1 ? 'person' : 'people'}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-xl border-rose-300 text-rose-700 hover:bg-rose-50"
                                onClick={() => 
                                  setFormData({ 
                                    ...formData, 
                                    attendingCount: Math.min(10, formData.attendingCount + 1) 
                                  })
                                }
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Message Section */}
                        <div className="space-y-3">
                          <Label htmlFor="message" className="text-base font-medium text-gray-800">
                            Message to the couple (optional)
                          </Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="min-h-[120px] resize-none border-rose-200 focus:border-rose-300"
                            placeholder="Share your excitement, memories, or wishes for the couple..."
                            maxLength={500}
                          />
                          <div className="flex justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-3 w-3" />
                              <span>Share your joy</span>
                            </div>
                            <span>{formData.message?.length || 0}/500</span>
                          </div>
                        </div>

                        {/* Dietary Restrictions */}
                        <div className="space-y-3">
                          <Label htmlFor="dietaryRestrictions" className="text-base font-medium text-gray-800">
                            Dietary restrictions (optional)
                          </Label>
                          <Input
                            id="dietaryRestrictions"
                            value={formData.dietaryRestrictions}
                            onChange={(e) =>
                              setFormData({ ...formData, dietaryRestrictions: e.target.value })
                            }
                            className="border-rose-200 focus:border-rose-300"
                            placeholder="e.g., Vegetarian, Gluten-free, Nut allergies, etc."
                            maxLength={200}
                          />
                        </div>

                        {/* Special Requests */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium text-gray-800">
                            Special requests
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className={cn(
                              "flex items-center space-x-3 p-3 rounded-xl border transition-colors",
                              formData.accommodationNeeded 
                                ? "border-amber-300 bg-amber-50" 
                                : "border-gray-200 hover:border-amber-200"
                            )}>
                              <Checkbox
                                id="accommodationNeeded"
                                checked={formData.accommodationNeeded}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, accommodationNeeded: checked as boolean })
                                }
                                className="data-[state=checked]:bg-amber-500"
                              />
                              <Label htmlFor="accommodationNeeded" className="cursor-pointer flex-1">
                                <div className="flex items-center gap-2">
                                  <Home className="h-4 w-4 text-amber-600" />
                                  <span>Need accommodation</span>
                                </div>
                              </Label>
                            </div>

                            <div className={cn(
                              "flex items-center space-x-3 p-3 rounded-xl border transition-colors",
                              formData.transportationNeeded 
                                ? "border-blue-300 bg-blue-50" 
                                : "border-gray-200 hover:border-blue-200"
                            )}>
                              <Checkbox
                                id="transportationNeeded"
                                checked={formData.transportationNeeded}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, transportationNeeded: checked as boolean })
                                }
                                className="data-[state=checked]:bg-blue-500"
                              />
                              <Label htmlFor="transportationNeeded" className="cursor-pointer flex-1">
                                <div className="flex items-center gap-2">
                                  <Car className="h-4 w-4 text-blue-600" />
                                  <span>Need transportation</span>
                                </div>
                              </Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      <div className="p-6 pt-0">
                        <Button 
                          type="submit" 
                          className="w-full h-12 text-base bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700"
                          disabled={submitting}
                          size="lg"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Heart className="mr-2 h-5 w-5" />
                              Submit RSVP
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                  {/* Gallery Preview */}
                  {weddingDetails?.gallery && weddingDetails.gallery.length > 0 && (
                    <Card className="border-rose-200 shadow-sm overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-rose-50 to-white border-b border-rose-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white border border-rose-200">
                            <CameraIcon className="h-5 w-5 text-rose-600" />
                          </div>
                          <div>
                            <CardTitle className="text-rose-900">Photo Gallery</CardTitle>
                            <CardDescription>
                              Browse {weddingDetails.gallery.length} memories
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-2">
                          {weddingDetails.gallery.slice(0, 4).map((image, index) => (
                            <motion.div
                              key={image._id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                              onClick={() => {
                                setCurrentImageIndex(index)
                                setActiveTab('gallery')
                              }}
                            >
                              <Image
                                src={image.url}
                                alt={image.description || 'Wedding photo'}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </motion.div>
                          ))}
                        </div>
                        <Button 
                          variant="ghost" 
                          className="w-full mt-4 text-rose-700 hover:text-rose-800 hover:bg-rose-50"
                          onClick={() => setActiveTab('gallery')}
                        >
                          View All Photos
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Schedule Preview */}
                  {weddingDetails?.schedule && weddingDetails.schedule.length > 0 && (
                    <Card className="border-rose-200 shadow-sm overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-rose-50 to-white border-b border-rose-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white border border-rose-200">
                            <Clock4 className="h-5 w-5 text-rose-600" />
                          </div>
                          <div>
                            <CardTitle className="text-rose-900">Event Schedule</CardTitle>
                            <CardDescription>
                              Timeline of the day
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <ScrollArea className="h-64">
                          <div className="space-y-3">
                            {weddingDetails.schedule.slice(0, 5).map((event, index) => (
                              <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-rose-50 transition-colors">
                                <div className="flex-shrink-0 w-16">
                                  <div className="text-sm font-medium text-rose-700">{event.time}</div>
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-800">{event.event}</div>
                                  {event.location && (
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3" />
                                      {event.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        <Button 
                          variant="ghost" 
                          className="w-full mt-4 text-rose-700 hover:text-rose-800 hover:bg-rose-50"
                          onClick={() => setActiveTab('schedule')}
                        >
                          View Full Schedule
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="space-y-6">
              {weddingLoading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                </div>
              ) : weddingDetails?.gallery && weddingDetails.gallery.length > 0 ? (
                <>
                  {/* Featured Image */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-2xl text-rose-900">Wedding Gallery</h3>
                        <p className="text-gray-600">
                          {weddingDetails.gallery.length} precious moments captured
                        </p>
                      </div>
                      <Badge variant="outline" className="border-rose-300 text-rose-700">
                        {currentImageIndex + 1} of {weddingDetails.gallery.length}
                      </Badge>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-rose-50 to-white border border-rose-200 shadow-lg">
                      {weddingDetails.gallery[currentImageIndex] && (
                        <>
                          <div className="relative aspect-video md:aspect-[21/9] bg-gradient-to-br from-rose-50 to-amber-50">
                            <Image
                              src={weddingDetails.gallery[currentImageIndex].url}
                              alt={weddingDetails.gallery[currentImageIndex].description || 'Wedding photo'}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                            />
                          </div>
                          
                          {/* Navigation */}
                          <div className="absolute inset-0 flex items-center justify-between p-4">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg border-rose-200"
                              onClick={prevImage}
                            >
                              <ChevronLeft className="h-5 w-5 text-rose-700" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg border-rose-200"
                              onClick={nextImage}
                            >
                              <ChevronRight className="h-5 w-5 text-rose-700" />
                            </Button>
                          </div>
                          
                          {/* Image Info */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-6">
                            <div className="text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-lg">
                                    {weddingDetails.gallery[currentImageIndex]?.name}
                                  </p>
                                  {weddingDetails.gallery[currentImageIndex]?.description && (
                                    <p className="text-sm opacity-90 mt-1">
                                      {weddingDetails.gallery[currentImageIndex].description}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white hover:bg-white/20"
                                  onClick={() => setShowLightbox(true)}
                                >
                                  <CameraIcon className="mr-2 h-4 w-4" />
                                  Full Screen
                                </Button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">Browse all photos</p>
                      <p className="text-sm text-gray-500">
                        Click any photo to view
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {weddingDetails.gallery.map((image, index) => (
                        <motion.div
                          key={image._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 transition-all duration-200",
                            currentImageIndex === index 
                              ? "border-rose-500 ring-2 ring-rose-500/20" 
                              : "border-transparent hover:border-rose-300"
                          )}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <Image
                            src={image.url}
                            alt={image.description || 'Wedding photo'}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Card className="border-rose-200">
                  <CardContent className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 mb-6">
                      <CameraIcon className="h-10 w-10 text-rose-600" />
                    </div>
                    <h3 className="text-xl font-serif text-rose-900 mb-2">Gallery Coming Soon</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      The couple is preparing their wedding gallery. Check back soon for beautiful memories!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6">
              {weddingDetails?.schedule && weddingDetails.schedule.length > 0 ? (
                <div className="space-y-6">
                  <div className="text-center max-w-2xl mx-auto">
                    <h3 className="font-serif text-3xl text-rose-900 mb-3">Wedding Day Timeline</h3>
                    <p className="text-gray-600">
                      A celebration of love throughout the day
                    </p>
                  </div>

                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-rose-300 via-amber-300 to-emerald-300"></div>
                    
                    {/* Timeline Events */}
                    <div className="space-y-8">
                      {weddingDetails.schedule.map((event, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "relative flex flex-col md:flex-row items-start gap-6",
                            index % 2 === 0 ? "md:flex-row-reverse" : ""
                          )}
                        >
                          {/* Timeline Dot */}
                          <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-6 z-10">
                            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 border-4 border-white shadow-lg"></div>
                          </div>

                          {/* Time Card */}
                          <div className={cn(
                            "flex-1 md:w-48",
                            index % 2 === 0 ? "md:text-right" : ""
                          )}>
                            <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-600" />
                                <span className="font-semibold text-gray-800">{event.time}</span>
                              </div>
                            </div>
                          </div>

                          {/* Event Card */}
                          <div className="flex-1">
                            <Card className="border-rose-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h4 className="font-serif text-xl text-rose-900 mb-2">
                                      {event.event}
                                    </h4>
                                    {event.description && (
                                      <p className="text-gray-600 mb-3">{event.description}</p>
                                    )}
                                    {event.location && (
                                      <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin className="h-4 w-4" />
                                        <span>{event.location}</span>
                                      </div>
                                    )}
                                  </div>
                                  {/* Icon based on event type */}
                                  <div className="p-3 rounded-full bg-rose-50 border border-rose-200">
                                    {event.event.toLowerCase().includes('ceremony') ? (
                                      <Circle  className="h-6 w-6 text-rose-600" />
                                    ) : event.event.toLowerCase().includes('reception') ? (
                                      <PartyPopper className="h-6 w-6 text-amber-600" />
                                    ) : event.event.toLowerCase().includes('dinner') ? (
                                      <Utensils className="h-6 w-6 text-emerald-600" />
                                    ) : event.event.toLowerCase().includes('cake') ? (
                                      <Cake className="h-6 w-6 text-rose-600" />
                                    ) : (
                                      <Sparkles className="h-6 w-6 text-amber-600" />
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="border-rose-200">
                  <CardContent className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-6">
                      <Clock className="h-10 w-10 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-serif text-amber-900 mb-2">Schedule Coming Soon</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      The couple is finalizing the wedding day schedule. Stay tuned for the celebration timeline!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Bottom Call to Action */}
          <div className="mt-12 pt-8 border-t border-rose-200">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full">
                <Heart className="h-4 w-4 text-rose-600" />
                <span className="text-sm font-medium text-rose-700">
                  We can't wait to celebrate with you!
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  className="border-rose-300 text-rose-700 hover:bg-rose-50"
                  onClick={() => window.print()}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Save Invitation
                </Button>
                <Button
                  variant="outline"
                  className="border-rose-300 text-rose-700 hover:bg-rose-50"
                  onClick={() => {
                    const url = window.location.href
                    const text = `I've been invited to ${weddingDetails?.wedding.title || 'a wedding'}!`
                    if (navigator.share) {
                      navigator.share({
                        title: 'Wedding Invitation',
                        text: text,
                        url: url,
                      })
                    } else {
                      navigator.clipboard.writeText(`${text}\n${url}`)
                      toast.success('Invitation link copied!')
                    }
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Invitation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && weddingDetails?.gallery[currentImageIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLightbox(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 h-10 w-10 bg-white/20 hover:bg-white/40 text-white rounded-full"
                onClick={() => setShowLightbox(false)}
              >
                ✕
              </Button>
              
              {/* Main Image */}
              <div className="relative h-[80vh] bg-gradient-to-br from-gray-900 to-black">
                <Image
                  src={weddingDetails.gallery[currentImageIndex].url}
                  alt={weddingDetails.gallery[currentImageIndex].description || 'Wedding photo'}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
              
              {/* Navigation Buttons */}
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6">
                <div className="text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-xl">
                        {weddingDetails.gallery[currentImageIndex].name}
                      </p>
                      {weddingDetails.gallery[currentImageIndex].description && (
                        <p className="text-sm opacity-90 mt-2">
                          {weddingDetails.gallery[currentImageIndex].description}
                        </p>
                      )}
                    </div>
                    <div className="text-sm opacity-75">
                      {currentImageIndex + 1} / {weddingDetails.gallery.length}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-rose-50 border-t border-rose-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Heart className="h-5 w-5 text-rose-500" />
            <Circle  className="h-5 w-5 text-amber-500" />
            <Flower2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-gray-600 text-sm">
            Created with love using WedGram • {new Date().getFullYear()}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Questions? Please contact the wedding couple directly
          </p>
        </div>
      </footer>
    </div>
  )
}