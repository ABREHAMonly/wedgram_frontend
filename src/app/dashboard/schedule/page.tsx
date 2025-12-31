// src/app/dashboard/schedule/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { weddingApi, Wedding } from '@/lib/api/wedding'
import { scheduleApi, ScheduleEvent } from '@/lib/api/schedule'
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
  Users,
  CalendarClock,
  AlertTriangle,
  MoreVertical,
  Copy
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function SchedulePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([])
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
  const [copyMessage, setCopyMessage] = useState('')

  // Load wedding and schedule data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Load wedding details
      const weddingData = await weddingApi.getWedding()
      setWedding(weddingData)
      
      // Load schedule
      const scheduleData = await scheduleApi.getSchedule()
      setSchedule(scheduleData)
    } catch (error: any) {
      console.error('Failed to load data:', error)
      if (error.status === 404) {
        setSchedule([])
      } else {
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

    if (!newEvent.time) {
      toast.error('Time is required')
      return
    }

    if (!user) {
      toast.error('You must be logged in')
      return
    }

    setSaving(true)
    try {
      await scheduleApi.addEvent(newEvent)
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
      
      // Refresh schedule
      await loadData()
    } catch (error: any) {
      console.error('Failed to add event:', error)
      toast.error(error.message || 'Failed to add event')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateEvent = async (eventId: string, updatedEvent: ScheduleEvent) => {
    if (!eventId) return

    setSaving(true)
    try {
      await scheduleApi.updateEvent(eventId, updatedEvent)
      toast.success('Event updated successfully')
      setEditingEvent(null)
      await loadData()
    } catch (error: any) {
      console.error('Failed to update event:', error)
      toast.error(error.message || 'Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!eventId) return

    if (!confirm('Are you sure you want to delete this event?')) return

    setSaving(true)
    try {
      await scheduleApi.deleteEvent(eventId)
      toast.success('Event deleted successfully')
      await loadData()
    } catch (error: any) {
      console.error('Failed to delete event:', error)
      toast.error(error.message || 'Failed to delete event')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAllSchedule = async () => {
    if (!schedule.length) return

    setSaving(true)
    try {
      await scheduleApi.updateSchedule(schedule)
      toast.success('Schedule saved successfully')
    } catch (error: any) {
      console.error('Failed to save schedule:', error)
      toast.error(error.message || 'Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  const handleCopySchedule = () => {
    const scheduleText = schedule
      .sort((a, b) => a.time.localeCompare(b.time))
      .map(event => {
        const time = formatTime(event.time)
        const status = getStatusBadge(event.status).label
        return `${time} - ${event.event}${event.location ? ` (${event.location})` : ''} [${status}]`
      })
      .join('\n')
    
    navigator.clipboard.writeText(scheduleText)
    setCopyMessage('Schedule copied to clipboard!')
    toast.success('Schedule copied to clipboard')
    
    setTimeout(() => {
      setCopyMessage('')
    }, 3000)
  }

  const getStatusBadge = (status: string = 'pending') => {
    const variants = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="h-3 w-3" />,
        label: 'Pending'
      },
      confirmed: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <CheckCircle className="h-3 w-3" />,
        label: 'Confirmed'
      },
      completed: { 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-3 w-3" />,
        label: 'Completed'
      }
    }
    return variants[status as keyof typeof variants] || variants.pending
  }

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':').map(Number)
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
    } catch {
      return time
    }
  }

  const getTimeOfDay = (time: string) => {
    const hour = parseInt(time.split(':')[0])
    if (hour < 12) return 'Morning'
    if (hour < 17) return 'Afternoon'
    return 'Evening'
  }

  const sortSchedule = (events: ScheduleEvent[]) => {
    return [...events].sort((a, b) => a.time.localeCompare(b.time))
  }

  const groupedSchedule = schedule.reduce((acc, event) => {
    const timeOfDay = getTimeOfDay(event.time)
    if (!acc[timeOfDay]) {
      acc[timeOfDay] = []
    }
    acc[timeOfDay].push(event)
    return acc
  }, {} as Record<string, ScheduleEvent[]>)

  if (loading && !wedding) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-wedding-gold" />
        <span className="ml-2 text-gray-600">Loading schedule...</span>
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              No Wedding Found
            </CardTitle>
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
              <Button 
                onClick={() => window.location.href = '/dashboard/settings'}
                className="bg-gradient-to-r from-wedding-gold to-wedding-blush hover:opacity-90"
              >
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
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-wedding-gold/30">
            <Calendar className="h-3 w-3 mr-1" />
            {wedding.date ? new Date(wedding.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Date not set'}
          </Badge>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCopySchedule}
              disabled={schedule.length === 0}
              className="border-wedding-gold/30 text-wedding-gold hover:bg-wedding-gold/5"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={() => setIsAddingEvent(true)}
              disabled={saving || isAddingEvent}
              className="bg-gradient-to-r from-wedding-gold to-wedding-blush hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>
      </div>

      {/* Copy Message */}
      {copyMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-green-800">{copyMessage}</p>
              <p className="text-sm text-green-600 mt-1">
                You can paste it in emails, messages, or documents
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{schedule.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CalendarClock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {schedule.filter(e => e.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {schedule.filter(e => e.status === 'confirmed').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {schedule.filter(e => e.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
            <Card className="mb-6 border-wedding-gold/20 bg-gradient-to-r from-wedding-gold/5 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Add New Event</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingEvent(false)}
                    disabled={saving}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-time" className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-wedding-gold" />
                        Time *
                      </Label>
                      <Input
                        id="event-time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-name">Event Name *</Label>
                      <Input
                        id="event-name"
                        placeholder="e.g., Ceremony Begins, Cocktail Hour, etc."
                        value={newEvent.event}
                        onChange={(e) => setNewEvent({...newEvent, event: e.target.value})}
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-wedding-gold" />
                        Location
                      </Label>
                      <Input
                        id="event-location"
                        placeholder="Main Hall, Garden, Reception Area, etc."
                        value={newEvent.location || ''}
                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-responsible" className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-wedding-gold" />
                        Responsible
                      </Label>
                      <Input
                        id="event-responsible"
                        placeholder="Coordinator, Best Man, Officiant, etc."
                        value={newEvent.responsible || ''}
                        onChange={(e) => setNewEvent({...newEvent, responsible: e.target.value})}
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-status">Status</Label>
                      <Select
                        value={newEvent.status}
                        onValueChange={(value: 'pending' | 'confirmed' | 'completed') => 
                          setNewEvent({...newEvent, status: value})
                        }
                        disabled={saving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending" className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            Pending
                          </SelectItem>
                          <SelectItem value="confirmed" className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            Confirmed
                          </SelectItem>
                          <SelectItem value="completed" className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Completed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      placeholder="Details about the event, special instructions, notes for guests..."
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      disabled={saving}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingEvent(false)}
                      disabled={saving}
                      className="min-w-[100px]"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="bg-gradient-to-r from-wedding-gold to-wedding-blush hover:opacity-90 min-w-[100px]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Wedding Day Timeline</CardTitle>
              <CardDescription>
                {schedule.length} events scheduled for {wedding.title || 'your wedding'}
              </CardDescription>
            </div>
            {schedule.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveAllSchedule}
                  disabled={saving}
                  variant="outline"
                  className="border-wedding-gold/30 text-wedding-gold hover:bg-wedding-gold/5"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save All Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {schedule.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedSchedule).map(([timeOfDay, events]) => (
                <div key={timeOfDay} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-wedding-gold/30 to-transparent" />
                    <h3 className="text-lg font-semibold text-gray-700 px-4 py-1 bg-gradient-to-r from-wedding-gold/10 to-wedding-blush/10 rounded-full">
                      {timeOfDay}
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-wedding-gold/30 to-transparent" />
                  </div>
                  {sortSchedule(events).map((event, index) => (
                    <motion.div
                      key={event._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {editingEvent?._id === event._id ? (
                        <Card className="mb-4 border-wedding-gold/20 bg-wedding-blush/5">
                          <CardContent className="pt-6">
                            <form onSubmit={(e) => {
                              e.preventDefault()
                              if (event._id) {
                                handleUpdateEvent(event._id, editingEvent)
                              }
                            }} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Time *</Label>
                                  <Input
                                    type="time"
                                    value={editingEvent.time}
                                    onChange={(e) => setEditingEvent({...editingEvent, time: e.target.value})}
                                    required
                                    disabled={saving}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Event Name *</Label>
                                  <Input
                                    value={editingEvent.event}
                                    onChange={(e) => setEditingEvent({...editingEvent, event: e.target.value})}
                                    required
                                    disabled={saving}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Location</Label>
                                  <Input
                                    value={editingEvent.location || ''}
                                    onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                                    disabled={saving}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Responsible</Label>
                                  <Input
                                    value={editingEvent.responsible || ''}
                                    onChange={(e) => setEditingEvent({...editingEvent, responsible: e.target.value})}
                                    disabled={saving}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Status</Label>
                                  <Select
                                    value={editingEvent.status}
                                    onValueChange={(value: 'pending' | 'confirmed' | 'completed') => 
                                      setEditingEvent({...editingEvent, status: value})
                                    }
                                    disabled={saving}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                  value={editingEvent.description || ''}
                                  onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                                  disabled={saving}
                                  rows={2}
                                />
                              </div>
                              <div className="flex justify-end gap-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setEditingEvent(null)}
                                  disabled={saving}
                                  className="min-w-[100px]"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={saving}
                                  className="bg-gradient-to-r from-wedding-gold to-wedding-blush hover:opacity-90 min-w-[100px]"
                                >
                                  {saving ? (
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
                          
                          <Card className="hover:shadow-md transition-all duration-300 border-wedding-gold/20 group-hover:border-wedding-gold/40 hover:-translate-y-1">
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center flex-wrap gap-3 mb-2">
                                    <div className="flex items-center text-sm font-medium text-wedding-gold bg-wedding-gold/10 px-3 py-1 rounded-full">
                                      <Clock className="h-3 w-3 mr-2" />
                                      {formatTime(event.time)}
                                    </div>
                                    <Badge className={cn(
                                      "border px-3 py-1",
                                      getStatusBadge(event.status).color
                                    )}>
                                      <span className="flex items-center gap-2">
                                        {getStatusBadge(event.status).icon}
                                        {getStatusBadge(event.status).label}
                                      </span>
                                    </Badge>
                                  </div>
                                  <h3 className="font-semibold text-lg text-gray-800">{event.event}</h3>
                                  {event.description && (
                                    <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                                  )}
                                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                    {event.location && (
                                      <div className="flex items-center text-gray-500">
                                        <MapPin className="h-3 w-3 mr-2" />
                                        {event.location}
                                      </div>
                                    )}
                                    {event.responsible && (
                                      <div className="flex items-center text-gray-500">
                                        <Users className="h-3 w-3 mr-2" />
                                        {event.responsible}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingEvent({ ...event })}
                                    className="h-8 w-8 p-0 hover:bg-wedding-gold/10"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => event._id && handleDeleteEvent(event._id)}
                                    disabled={saving}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                className="mt-4 bg-gradient-to-r from-wedding-gold to-wedding-blush hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Event
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-wedding-sage/20 bg-gradient-to-r from-wedding-sage/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-wedding-sage" />
            Schedule Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Buffer Time</h4>
                  <p className="text-sm text-gray-600 mt-1">Plan 15-30 minutes between events for setup and transitions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Share with Team</h4>
                  <p className="text-sm text-gray-600 mt-1">Share the schedule with vendors and wedding party</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Travel Time</h4>
                  <p className="text-sm text-gray-600 mt-1">Consider travel time between different locations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Contingency Plan</h4>
                  <p className="text-sm text-gray-600 mt-1">Include setup and breakdown times for each event</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}