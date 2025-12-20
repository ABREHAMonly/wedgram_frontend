//src\app\dashboard\invites\create\page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { inviteApi } from '@/lib/api/invites'
import { weddingApi } from '@/lib/api/wedding'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'
import { Plus, Trash2, UserPlus, Loader2, Calendar, MapPin } from 'lucide-react'

type GuestFormData = {
  name: string
  email: string
  telegramUsername: string
  invitationMethod: 'telegram' | 'email' | 'whatsapp'
  plusOneAllowed: boolean
  dietaryRestrictions: string
}

export default function CreateInvitePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [weddingLoading, setWeddingLoading] = useState(true)
  const [hasWedding, setHasWedding] = useState(false)
  const [guests, setGuests] = useState<GuestFormData[]>([
    {
      name: '',
      email: '',
      telegramUsername: '',
      invitationMethod: 'telegram',
      plusOneAllowed: false,
      dietaryRestrictions: '',
    }
  ])
  const [sendImmediately, setSendImmediately] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    checkWedding()
  }, [])

  const checkWedding = async () => {
    setWeddingLoading(true)
    try {
      await weddingApi.checkWeddingExists()
      setHasWedding(true)
    } catch {
      setHasWedding(false)
    } finally {
      setWeddingLoading(false)
    }
  }

  const createDefaultWedding = async () => {
    setLoading(true)
    try {
      if (!user) {
        toast.error('User not found')
        return
      }

      const weddingData = {
        title: `${user.name}'s Wedding`,
        date: user.weddingDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default to 90 days from now
        venue: user.weddingLocation || 'To be announced',
        description: 'Our special day',
      }

      await weddingApi.createWedding(weddingData)
      toast.success('Wedding details created successfully!')
      setHasWedding(true)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create wedding details')
      router.push('/dashboard/settings?setup=wedding')
    } finally {
      setLoading(false)
    }
  }

  const addGuest = () => {
    setGuests([
      ...guests,
      {
        name: '',
        email: '',
        telegramUsername: '',
        invitationMethod: 'telegram',
        plusOneAllowed: false,
        dietaryRestrictions: '',
      }
    ])
    // Clear errors for new guest
    setErrors({})
  }

  const removeGuest = (index: number) => {
    if (guests.length === 1) return
    setGuests(guests.filter((_, i) => i !== index))
    // Clear errors for removed guest
    const newErrors = { ...errors }
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`${index}-`)) {
        delete newErrors[key]
      }
    })
    setErrors(newErrors)
  }

  const updateGuest = (index: number, field: keyof GuestFormData, value: any) => {
    const newGuests = [...guests]
    newGuests[index] = { ...newGuests[index], [field]: value }
    setGuests(newGuests)
    
    // Clear error for this field
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors }
      delete newErrors[`${index}-${field}`]
      setErrors(newErrors)
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    guests.forEach((guest, index) => {
      if (!guest.name.trim()) {
        newErrors[`${index}-name`] = 'Name is required'
      }
      
      if (!guest.telegramUsername.trim()) {
        newErrors[`${index}-telegramUsername`] = 'Telegram username is required'
      } else if (!guest.telegramUsername.match(/^@?[a-zA-Z0-9_]{5,32}$/)) {
        newErrors[`${index}-telegramUsername`] = 'Telegram username must be 5-32 characters (letters, numbers, underscores)'
      }
      
      if (guest.email && !guest.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        newErrors[`${index}-email`] = 'Invalid email format'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors')
      return
    }

    setLoading(true)
    try {
      const formattedGuests = guests.map(g => ({
        name: g.name,
        email: g.email || undefined,
        telegramUsername: g.telegramUsername.startsWith('@') 
          ? g.telegramUsername 
          : `@${g.telegramUsername}`,
        invitationMethod: g.invitationMethod,
        plusOneAllowed: g.plusOneAllowed,
        dietaryRestrictions: g.dietaryRestrictions || undefined,
      }))

      const result = await inviteApi.createInvites({
        guests: formattedGuests,
        sendImmediately,
      })
      
      toast.success(`${guests.length} guest(s) added successfully`)
      
      if (sendImmediately) {
        toast.info('Invitations are being sent...')
      }
      
      router.push('/dashboard/invites')
    } catch (error: any) {
      console.error('Create invite error:', error)
      
      // Handle wedding not found error
      if (error.message.includes('wedding details')) {
        toast.error('Please set up your wedding details first', {
          action: {
            label: 'Set Up Now',
            onClick: () => router.push('/dashboard/settings?setup=wedding')
          }
        })
        return
      }
      
      // Handle validation errors from backend
      if (error.errors && Array.isArray(error.errors)) {
        const backendErrors: {[key: string]: string} = {}
        error.errors.forEach((err: any) => {
          if (err.field && err.message) {
            backendErrors[err.field] = err.message
          }
        })
        setErrors(backendErrors)
        toast.error('Please check the form for errors')
      } else {
        toast.error(error.message || 'Failed to create invitations')
      }
    } finally {
      setLoading(false)
    }
  }

  if (weddingLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!hasWedding) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Set Up Your Wedding First</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Wedding Details Required</h3>
                <p className="text-gray-600 mt-2">
                  Before creating invitations, please set up your wedding details including date, venue, and other important information.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Quick Setup</p>
                  <p className="text-sm text-gray-600">
                    Use your registration details to create a wedding automatically
                  </p>
                </div>
              </div>

              {user?.weddingDate && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Your registered wedding date:</p>
                  <p className="font-medium">
                    {new Date(user.weddingDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={createDefaultWedding}
                disabled={loading}
                className="flex-1"
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
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/settings?setup=wedding')}
                disabled={loading}
              >
                Set Up Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Invitations</h1>
        <p className="text-gray-600">Add guests and send them wedding invitations</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {guests.map((guest, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Guest {index + 1}</CardTitle>
                {guests.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGuest(index)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`}>Full Name *</Label>
                    <Input
                      id={`name-${index}`}
                      placeholder="John Doe"
                      value={guest.name}
                      onChange={(e) => updateGuest(index, 'name', e.target.value)}
                      className={errors[`${index}-name`] ? 'border-red-500' : ''}
                      disabled={loading}
                    />
                    {errors[`${index}-name`] && (
                      <p className="text-sm text-red-500">{errors[`${index}-name`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`email-${index}`}>Email</Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      placeholder="john@example.com"
                      value={guest.email}
                      onChange={(e) => updateGuest(index, 'email', e.target.value)}
                      className={errors[`${index}-email`] ? 'border-red-500' : ''}
                      disabled={loading}
                    />
                    {errors[`${index}-email`] && (
                      <p className="text-sm text-red-500">{errors[`${index}-email`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`telegram-${index}`}>Telegram Username *</Label>
                    <Input
                      id={`telegram-${index}`}
                      placeholder="username"
                      value={guest.telegramUsername}
                      onChange={(e) => updateGuest(index, 'telegramUsername', e.target.value)}
                      className={errors[`${index}-telegramUsername`] ? 'border-red-500' : ''}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">
                      Without @, 5-32 characters (letters, numbers, underscores)
                    </p>
                    {errors[`${index}-telegramUsername`] && (
                      <p className="text-sm text-red-500">{errors[`${index}-telegramUsername`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`method-${index}`}>Invitation Method</Label>
                    <Select
                      value={guest.invitationMethod}
                      onValueChange={(value: 'telegram' | 'email' | 'whatsapp') => 
                        updateGuest(index, 'invitationMethod', value)
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`dietary-${index}`}>Dietary Restrictions</Label>
                    <Input
                      id={`dietary-${index}`}
                      placeholder="Vegetarian, allergies, etc."
                      value={guest.dietaryRestrictions}
                      onChange={(e) => updateGuest(index, 'dietaryRestrictions', e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id={`plusOne-${index}`}
                      checked={guest.plusOneAllowed}
                      onCheckedChange={(checked) => 
                        updateGuest(index, 'plusOneAllowed', checked)
                      }
                      disabled={loading}
                    />
                    <Label htmlFor={`plusOne-${index}`} className="cursor-pointer">
                      Allow plus one
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={addGuest}
              disabled={loading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Guest
            </Button>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendImmediately"
                checked={sendImmediately}
                onCheckedChange={(checked) => setSendImmediately(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="sendImmediately" className="cursor-pointer">
                Send invitations immediately
              </Label>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    {guests.length} guest(s) will be added
                  </p>
                  {sendImmediately && (
                    <p className="text-sm text-green-600">
                      Invitations will be sent immediately
                    </p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Invitations
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}