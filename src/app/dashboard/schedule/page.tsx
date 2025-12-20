// src/app/dashboard/schedule/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { weddingApi, Wedding } from '@/lib/api/wedding'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  CalendarDays,
  MapPin,
  Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ScheduleEvent {
  _id?: string
  time: string
  event: string
  description?: string
  location?: string
  responsible?: string
  status?: 'pending' | 'confirmed' | 'completed'
}

export default function SchedulePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState<ScheduleEvent>({
    time: '09:00',
    event: '',
    description: '',
    location: '',
    responsible: '',
    status: 'pending'
  })

  // Load wedding data
  useEffect(() => {
    loadWedding()
  }, [])

  const loadWedding = useCallback(async () => {
    setLoading(true)
    try {
      const weddingData = await weddingApi.getWedding()
      setWedding(weddingData)
    } catch (error: any) {
      console.error('Failed to load wedding:', error)
      if (error.status !== 404) {
        toast.error('Failed to load schedule')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newEvent.event.trim()) {
      toast.error('Event name is required')
      return
    }

    if (!wedding) {
      toast.error('Wedding not found')
      return
    }

    setLoading(true)
    try {
      const updatedSchedule = [...(wedding.schedule || []), { ...newEvent }]
      await weddingApi.updateWedding({
        ...wedding,
        schedule: updatedSchedule
      })
      
      toast.success('Event added successfully')
      setIsAddingEvent(false)
      setNewEvent({
        time: '09:00',
        event: '',
        description: '',
        location: '',
        responsible: '',
        status: 'pending'
      })
      await loadWedding()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add event')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEvent = async (index: number, updatedEvent: ScheduleEvent) => {
    if (!wedding) return

    setLoading(true)
    try {
      const updatedSchedule = [...wedding.schedule]
      updatedSchedule[index] = updatedEvent
      
      await weddingApi.updateWedding({
        ...wedding,
        schedule: updatedSchedule
      })
      
      toast.success('Event updated successfully')
      setEditingEvent(null)
      await loadWedding()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update event')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (index: number) => {
    if (!wedding) return

    if (!confirm('Are you sure you want to delete this event?')) return

    setLoading(true)
    try {
      const updatedSchedule = wedding.schedule.filter((_, i) => i !== index)
      
      await weddingApi.updateWedding({
        ...wedding,
        schedule: updatedSchedule
      })
      
      toast.success('Event deleted successfully')
      await loadWedding()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-3 w-3" /> },
      completed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> }
    }
    return variants[status as keyof typeof variants] || variants.pending
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  if (loading && !wedding) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-wedding-gold" />
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>No Wedding Found</CardTitle>
            <CardDescription>
              You need to set up your wedding details first
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-gold/10">
                <CalendarDays className="h-8 w-8 text-wedding-gold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Wedding Schedule</h3>
                <p className="text-gray-600 mt-2">
                  Create your wedding timeline and share it with guests
                </p>
              </div>
            </div>
            <div className="text-center">
              <Button onClick={() => window.location.href = '/dashboard/settings?setup=wedding'}>
                <Calendar className="mr-2 h-4 w-4" />
                Set Up Wedding
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wedding Schedule</h1>
          <p className="text-gray-600">
            Plan and manage your wedding day timeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-wedding-gold/30">
            <Calendar className="h-3 w-3 mr-1" />
            {wedding.date ? new Date(wedding.date).toLocaleDateString() : 'Date not set'}
          </Badge>
          <Button
            onClick={() => setIsAddingEvent(true)}
            disabled={loading || isAddingEvent}
            className="bg-gradient-to-r from-wedding-gold to-wedding-blush"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Add Event Form */}
      <AnimatePresence>
        {isAddingEvent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6 border-wedding-gold/20">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Add New Event</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingEvent(false)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-time">Time *</Label>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-wedding-gold mr-2" />
                        <Input
                          id="event-time"
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                          required
                          disabled={loading}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-name">Event Name *</Label>
                      <Input
                        id="event-name"
                        placeholder="e.g., Ceremony Begins"
                        value={newEvent.event}
                        onChange={(e) => setNewEvent({...newEvent, event: e.target.value})}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-location">Location</Label>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-wedding-gold mr-2" />
                        <Input
                          id="event-location"
                          placeholder="Main Hall, Garden, etc."
                          value={newEvent.location || ''}
                          onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-responsible">Responsible</Label>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-wedding-gold mr-2" />
                        <Input
                          id="event-responsible"
                          placeholder="Coordinator, Best Man, etc."
                          value={newEvent.responsible || ''}
                          onChange={(e) => setNewEvent({...newEvent, responsible: e.target.value})}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      placeholder="Details about the event, special instructions..."
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      disabled={loading}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingEvent(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Add Event
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Wedding Day Timeline</CardTitle>
          <CardDescription>
            {wedding.schedule?.length || 0} events scheduled for {wedding.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wedding.schedule && wedding.schedule.length > 0 ? (
            <div className="space-y-6">
              {wedding.schedule
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {editingEvent?._id === event._id ? (
                      <Card className="mb-4 border-wedding-gold/20 bg-wedding-blush/5">
                        <CardContent className="pt-6">
                          <form onSubmit={(e) => {
                            e.preventDefault()
                            handleUpdateEvent(index, editingEvent)
                          }} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Time</Label>
                                <Input
                                  type="time"
                                  value={editingEvent.time}
                                  onChange={(e) => setEditingEvent({...editingEvent, time: e.target.value})}
                                  required
                                  disabled={loading}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Event Name</Label>
                                <Input
                                  value={editingEvent.event}
                                  onChange={(e) => setEditingEvent({...editingEvent, event: e.target.value})}
                                  required
                                  disabled={loading}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                  value={editingEvent.location || ''}
                                  onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                                  disabled={loading}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Responsible</Label>
                                <Input
                                  value={editingEvent.responsible || ''}
                                  onChange={(e) => setEditingEvent({...editingEvent, responsible: e.target.value})}
                                  disabled={loading}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={editingEvent.description || ''}
                                onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                                disabled={loading}
                                rows={2}
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingEvent(null)}
                                disabled={loading}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={loading}>
                                {loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Save Changes'
                                )}
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="relative pl-8 pb-6 last:pb-0 group">
                        {/* Timeline line */}
                        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-wedding-gold/20 to-transparent" />
                        
                        {/* Timeline dot */}
                        <div className="absolute left-3 top-1 w-4 h-4 rounded-full bg-gradient-to-r from-wedding-gold to-wedding-blush ring-4 ring-white z-10" />
                        
                        <Card className="hover:shadow-md transition-shadow duration-300 border-wedding-gold/20 group-hover:border-wedding-gold/40">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center text-sm text-wedding-gold font-medium">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatTime(event.time)}
                                  </div>
                                  {event.status && (
                                    <Badge className={cn(
                                      "text-xs",
                                      getStatusBadge(event.status).color
                                    )}>
                                      <span className="flex items-center gap-1">
                                        {getStatusBadge(event.status).icon}
                                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                      </span>
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-lg">{event.event}</h3>
                                {event.description && (
                                  <p className="text-sm text-gray-600">{event.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {event.location && (
                                    <div className="flex items-center text-xs text-gray-500">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {event.location}
                                    </div>
                                  )}
                                  {event.responsible && (
                                    <div className="flex items-center text-xs text-gray-500">
                                      <Users className="h-3 w-3 mr-1" />
                                      {event.responsible}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingEvent({ ...event, _id: event._id || `temp-${index}` })}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEvent(index)}
                                  disabled={loading}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-gold/10">
                <Calendar className="h-8 w-8 text-wedding-gold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No events scheduled yet</h3>
                <p className="text-gray-600 mt-1">
                  Start by adding events to create your wedding day timeline
                </p>
              </div>
              <Button
                onClick={() => setIsAddingEvent(true)}
                className="mt-4 bg-gradient-to-r from-wedding-gold to-wedding-blush"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Event
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-wedding-sage/20 bg-wedding-sage/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-wedding-sage" />
            Schedule Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Plan buffer time between events (15-30 minutes)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Share the schedule with vendors and wedding party</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Consider travel time between locations</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Include setup and breakdown times for each event</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}