// src/app/dashboard/invites/page.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { inviteApi } from '@/lib/api/invites'
import { Guest } from '@/types/invite'
import { toast } from 'sonner'
import { 
  Users, 
  Send, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Mail, 
  Phone, 
  Loader2, 
  Eye,
  Download,
  Filter,
  Search,
  UserPlus,
  AlertCircle,
  MessageSquare,
  Share2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { format } from 'date-fns'
import debounce from 'lodash/debounce'
import { Input } from '@/components/ui/input'

export default function InvitesPage() {
  // State management
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
    declined: 0,
    maybe: 0,
    notSent: 0,
    sent: 0
  })

  // Load guests
  useEffect(() => {
    loadGuests()
  }, [])

  // Filter guests when search or filters change
  useEffect(() => {
    filterGuests()
    calculateStats()
  }, [guests, search, statusFilter, methodFilter, activeTab])

  const loadGuests = async () => {
    setLoading(true)
    try {
      const response = await inviteApi.getGuests(1, 100)
      setGuests(response.data || [])
    } catch (error: any) {
      console.error('Failed to load guests:', error)
      toast.error(error.message || 'Failed to load invitations')
      setGuests([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearch(value)
    }, 300),
    []
  )

  const filterGuests = () => {
    let filtered = [...guests]

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(guest =>
        guest.name?.toLowerCase().includes(searchLower) ||
        guest.email?.toLowerCase().includes(searchLower) ||
        guest.telegramUsername?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(guest => guest.rsvpStatus === statusFilter)
    }

    // Apply method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(guest => guest.invitationMethod === methodFilter)
    }

    // Apply tab filter
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(g => g.rsvpStatus === 'pending' && g.invited)
        break
      case 'accepted':
        filtered = filtered.filter(g => g.rsvpStatus === 'accepted')
        break
      case 'declined':
        filtered = filtered.filter(g => g.rsvpStatus === 'declined')
        break
      case 'maybe':
        filtered = filtered.filter(g => g.rsvpStatus === 'maybe')
        break
      case 'not-sent':
        filtered = filtered.filter(g => !g.invited)
        break
      case 'sent':
        filtered = filtered.filter(g => g.invited)
        break
    }

    setFilteredGuests(filtered)
  }

  const calculateStats = () => {
    const stats = {
      total: guests.length,
      accepted: guests.filter(g => g.rsvpStatus === 'accepted').length,
      pending: guests.filter(g => g.rsvpStatus === 'pending' && g.invited).length,
      declined: guests.filter(g => g.rsvpStatus === 'declined').length,
      maybe: guests.filter(g => g.rsvpStatus === 'maybe').length,
      notSent: guests.filter(g => !g.invited).length,
      sent: guests.filter(g => g.invited).length
    }
    setStats(stats)
  }

  const handleSendInvitation = async (guestId: string) => {
    setSending(guestId)
    try {
      await inviteApi.sendInvitations([guestId])
      toast.success('Invitation sent successfully')
      
      // Update guest status locally
      setGuests(prev => prev.map(guest => 
        guest._id === guestId ? { ...guest, invited: true, invitationSentAt: new Date().toISOString() } : guest
      ))
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation')
    } finally {
      setSending(null)
    }
  }

  const handleSendBatchInvitations = async () => {
    const guestsToSend = filteredGuests.filter(g => !g.invited)
    
    if (guestsToSend.length === 0) {
      toast.info('All invitations have been sent')
      return
    }

    setSending('batch')
    try {
      await inviteApi.sendInvitations(guestsToSend.map(g => g._id))
      toast.success(`Sent ${guestsToSend.length} invitation(s)`)
      
      // Update guest status locally
      setGuests(prev => prev.map(guest => 
        guestsToSend.some(g => g._id === guest._id)
          ? { ...guest, invited: true, invitationSentAt: new Date().toISOString() }
          : guest
      ))
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitations')
    } finally {
      setSending(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'maybe':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not sent'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  const getInvitationMethodIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'telegram': return <Send className="h-4 w-4" />
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />
      default: return <Send className="h-4 w-4" />
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'email': return 'bg-blue-100 text-blue-800'
      case 'telegram': return 'bg-purple-100 text-purple-800'
      case 'whatsapp': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Memoized guest cards for performance
  const memoizedGuestCards = useMemo(() => filteredGuests, [filteredGuests])

  if (loading && guests.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-wedding-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Invitations</h1>
          <p className="text-gray-600">
            Create and manage your wedding invitations
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Button
            variant="outline"
            onClick={handleSendBatchInvitations}
            disabled={sending === 'batch' || stats.notSent === 0}
            className="flex items-center justify-center"
          >
            {sending === 'batch' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send All ({stats.notSent})
          </Button>
          <Link href="/dashboard/invites/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-wedding-gold to-wedding-blush">
              <UserPlus className="mr-2 h-4 w-4" />
              New Invitation
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Guests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">RSVPs Received</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted + stats.declined + stats.maybe}</p>
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
                <p className="text-sm font-medium text-gray-600">Pending RSVPs</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
                <p className="text-sm font-medium text-gray-600">Invitations Sent</p>
                <p className="text-2xl font-bold text-purple-600">{stats.sent}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Send className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invitations..."
                  className="pl-10"
                  defaultValue={search}
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="RSVP Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="maybe">Maybe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="border-wedding-gold/30 text-wedding-gold">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="all">All Guests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
          <TabsTrigger value="maybe">Maybe</TabsTrigger>
          <TabsTrigger value="not-sent">Not Sent</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' && 'All Guests'}
                {activeTab === 'pending' && 'Pending RSVPs'}
                {activeTab === 'accepted' && 'Accepted'}
                {activeTab === 'declined' && 'Declined'}
                {activeTab === 'maybe' && 'Maybe'}
                {activeTab === 'not-sent' && 'Not Sent'}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredGuests.length} guests)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {memoizedGuestCards.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-gold/10">
                    <Users className="h-8 w-8 text-wedding-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No guests found</h3>
                    <p className="text-gray-600 mt-1">
                      {search || statusFilter !== 'all' || methodFilter !== 'all' || activeTab !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Start by creating your first invitation'
                      }
                    </p>
                  </div>
                  {!search && statusFilter === 'all' && methodFilter === 'all' && activeTab === 'all' && (
                    <Link href="/dashboard/invites/create">
                      <Button className="mt-4 bg-gradient-to-r from-wedding-gold to-wedding-blush">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create First Invitation
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {memoizedGuestCards.map((guest) => (
                    <motion.div
                      key={guest._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="h-full hover:shadow-md transition-shadow duration-300 border-wedding-gold/20">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-wedding-gold to-wedding-blush flex items-center justify-center">
                                <span className="font-semibold text-white">
                                  {guest.name?.charAt(0) || 'G'}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium">{guest.name || 'Unnamed Guest'}</h4>
                                <p className="text-sm text-gray-500">
                                  @{guest.telegramUsername?.replace('@', '') || 'username'}
                                </p>
                              </div>
                            </div>
                            {getStatusIcon(guest.rsvpStatus)}
                          </div>
                          
                          <div className="space-y-3">
                            {/* Contact Info */}
                            {guest.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-3 w-3 mr-2" />
                                <span className="truncate">{guest.email}</span>
                              </div>
                            )}

                            {/* Invitation Status */}
                            <div className="flex items-center justify-between">
                              <Badge 
                                className={cn(
                                  "capitalize",
                                  getMethodColor(guest.invitationMethod)
                                )}
                              >
                                <div className="flex items-center gap-1">
                                  {getInvitationMethodIcon(guest.invitationMethod)}
                                  {guest.invitationMethod}
                                </div>
                              </Badge>
                              <Badge variant={guest.invited ? "default" : "outline"}>
                                {guest.invited ? 'Invited' : 'Not Sent'}
                              </Badge>
                            </div>

                            {/* Dates */}
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {guest.invited ? formatDate(guest.invitationSentAt) : 'Not sent'}
                              </div>
                              {guest.rsvpSubmittedAt && (
                                <div>
                                  RSVP: {formatDate(guest.rsvpSubmittedAt)}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2 pt-2">
                              {!guest.invited ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendInvitation(guest._id)}
                                  disabled={sending === guest._id}
                                  className="flex-1"
                                >
                                  {sending === guest._id ? (
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  ) : (
                                    <Send className="mr-2 h-3 w-3" />
                                  )}
                                  Send
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendInvitation(guest._id)}
                                  disabled={sending === guest._id}
                                  className="flex-1"
                                >
                                  {sending === guest._id ? (
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  ) : (
                                    <Send className="mr-2 h-3 w-3" />
                                  )}
                                  Resend
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="flex-1">
                                <Eye className="mr-2 h-3 w-3" />
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {activeTab === 'not-sent' && filteredGuests.length > 0 && (
            <Card className="border-wedding-sage/20 bg-wedding-sage/5">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">Send all pending invitations?</h3>
                    <p className="text-sm text-gray-600">
                      Send invitations to {filteredGuests.length} guest(s) who haven't been invited yet
                    </p>
                  </div>
                  <Button
                    onClick={handleSendBatchInvitations}
                    disabled={sending === 'batch'}
                    className="bg-gradient-to-r from-wedding-gold to-wedding-blush"
                  >
                    {sending === 'batch' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send All ({filteredGuests.length})
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips Card */}
          <Card className="border-wedding-sage/20 bg-wedding-sage/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-wedding-sage" />
                Invitation Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Send invitations 6-8 weeks before the wedding</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Set RSVP deadline 2-3 weeks before the event</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Send reminders 1 week before RSVP deadline</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Use multiple methods (email, messaging) for better reach</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}