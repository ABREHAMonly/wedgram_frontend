//src\app\invite\[token]\page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { rsvpApi } from '@/lib/api/rsvp'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

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

export default function RSVPPage() {
  const params = useParams()
  const token = params.token as string
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [guestData, setGuestData] = useState<GuestData | null>(null)
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
    loadRSVPData()
  }, [token])

  const loadRSVPData = async () => {
    setLoading(true)
    try {
      const data = await rsvpApi.getRSVPStatus(token)
      console.log('RSVP data loaded:', data)
      
      // Check if data has the expected structure
      if (data && (data.guest || data.data?.guest)) {
        // Handle both response formats
        const actualData = data.data || data
        
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
      } else {
        console.error('Invalid guest data structure:', data)
        setGuestData(null)
      }
    } catch (error: any) {
      console.error('Failed to load RSVP data:', error)
      toast.error('Failed to load invitation data')
      setGuestData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await rsvpApi.submitRSVP(token, formData)
      toast.success('RSVP submitted successfully!')
      
      // Reload data to show updated status
      await loadRSVPData()
    } catch (error: any) {
      console.error('Submit RSVP error:', error)
      toast.error(error.message || 'Failed to submit RSVP')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!guestData || !guestData.guest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The invitation link may be invalid or expired.</p>
            <p className="text-sm text-gray-600 mt-2">
              If you believe this is an error, please contact the wedding couple.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {guestData.wedding && (
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">{guestData.wedding.title}</h1>
              <p className="text-xl text-gray-600">
                {new Date(guestData.wedding.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-lg text-gray-600">{guestData.wedding.venue}</p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>RSVP for {guestData.guest.name}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base">Will you be attending?</Label>
                  <RadioGroup
                    value={formData.response}
                    onValueChange={(value: 'accepted' | 'declined' | 'maybe') =>
                      setFormData({ ...formData, response: value })
                    }
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="accepted" id="accepted" />
                      <Label htmlFor="accepted" className="cursor-pointer">
                        Yes, I&apos;ll be there
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maybe" id="maybe" />
                      <Label htmlFor="maybe" className="cursor-pointer">
                        Maybe
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="declined" id="declined" />
                      <Label htmlFor="declined" className="cursor-pointer">
                        No, I can&apos;t make it
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.response === 'accepted' && (
                  <div>
                    <Label htmlFor="attendingCount">Number of guests attending</Label>
                    <Input
                      id="attendingCount"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.attendingCount}
                      onChange={(e) =>
                        setFormData({ ...formData, attendingCount: parseInt(e.target.value) || 1 })
                      }
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="message">Message to the couple (optional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-1"
                    rows={3}
                    maxLength={1000}
                    placeholder="Share your excitement or send your wishes..."
                  />
                </div>

                <div>
                  <Label htmlFor="dietaryRestrictions">Dietary restrictions (optional)</Label>
                  <Input
                    id="dietaryRestrictions"
                    value={formData.dietaryRestrictions}
                    onChange={(e) =>
                      setFormData({ ...formData, dietaryRestrictions: e.target.value })
                    }
                    className="mt-1"
                    maxLength={500}
                    placeholder="e.g., Vegetarian, Gluten-free, etc."
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accommodationNeeded"
                      checked={formData.accommodationNeeded}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, accommodationNeeded: checked as boolean })
                      }
                    />
                    <Label htmlFor="accommodationNeeded" className="cursor-pointer">
                      I need accommodation assistance
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="transportationNeeded"
                      checked={formData.transportationNeeded}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, transportationNeeded: checked as boolean })
                      }
                    />
                    <Label htmlFor="transportationNeeded" className="cursor-pointer">
                      I need transportation assistance
                    </Label>
                  </div>
                </div>
              </CardContent>

              <div className="p-6 pt-0">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting || guestData.guest.hasRSVPed}
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : guestData.guest.hasRSVPed ? (
                    'RSVP Already Submitted'
                  ) : (
                    'Submit RSVP'
                  )}
                </Button>
                
                {guestData.guest.hasRSVPed && (
                  <p className="mt-3 text-center text-sm text-green-600">
                    Your RSVP has been recorded. Thank you!
                    {guestData.guest.rsvpSubmittedAt && (
                      <span className="block text-xs text-gray-500">
                        Submitted on {new Date(guestData.guest.rsvpSubmittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}