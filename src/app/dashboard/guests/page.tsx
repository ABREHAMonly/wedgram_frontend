// src/app/dashboard/guests/page.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { guestApi } from '@/lib/api/guest'
import { Guest } from '@/lib/api/guest'
import { toast } from 'sonner'
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  Loader2, 
  Send, 
  RefreshCw,
  Filter,
  UserPlus,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Download,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { format } from 'date-fns'
import debounce from 'lodash/debounce'

type GuestStatus = 'pending' | 'accepted' | 'declined' | 'maybe'
type InvitationStatus = 'sent' | 'not_sent'

export default function GuestsPage() {
  // State management
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [invitationFilter, setInvitationFilter] = useState<string>('all')
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sending, setSending] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
    declined: 0,
    maybe: 0,
    notSent: 0
  })

  // Load guests on mount and when filters change
  useEffect(() => {
    loadGuests()
  }, [currentPage])

  // Filter guests when search or filters change
  useEffect(() => {
    filterGuests()
    calculateStats()
  }, [guests, search, statusFilter, invitationFilter])

  const loadGuests = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: currentPage,
        limit: 50
      }

      if (statusFilter !== 'all' && statusFilter !== 'invitation') {
        params.status = statusFilter
      }

      const response = await guestApi.getGuests(params)
      console.log('Guests response:', response)
      
      if (response?.guests) {
        setGuests(response.guests)
        setTotalPages(response.meta?.totalPages || 1)
      }
    } catch (error: any) {
      console.error('Failed to load guests:', error)
      toast.error(error.message || 'Failed to load guests')
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
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
      if (statusFilter === 'invitation') {
        filtered = filtered.filter(guest => !guest.invited)
      } else {
        filtered = filtered.filter(guest => guest.rsvpStatus === statusFilter)
      }
    }

    // Apply invitation filter
    if (invitationFilter !== 'all') {
      if (invitationFilter === 'sent') {
        filtered = filtered.filter(guest => guest.invited)
      } else {
        filtered = filtered.filter(guest => !guest.invited)
      }
    }

    setFilteredGuests(filtered)
  }

  const calculateStats = () => {
    const stats = {
      total: guests.length,
      accepted: guests.filter(g => g.rsvpStatus === 'accepted').length,
      pending: guests.filter(g => g.rsvpStatus === 'pending').length,
      declined: guests.filter(g => g.rsvpStatus === 'declined').length,
      maybe: guests.filter(g => g.rsvpStatus === 'maybe').length,
      notSent: guests.filter(g => !g.invited).length
    }
    setStats(stats)
  }

  const handleSendInvitation = async (guestId: string) => {
    setSending(guestId)
    try {
      await guestApi.sendInvitations([guestId])
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

  const handleSendBulkInvitations = async () => {
    const guestsToSend = filteredGuests.filter(g => !g.invited)
    
    if (guestsToSend.length === 0) {
      toast.info('All selected guests have already been invited')
      return
    }

    if (!confirm(`Send invitations to ${guestsToSend.length} guest(s)?`)) return

    setSending('bulk')
    try {
      const guestIds = guestsToSend.map(g => g._id)
      await guestApi.sendInvitations(guestIds)
      toast.success(`Invitations sent to ${guestsToSend.length} guest(s)`)
      
      // Update guest status locally
      setGuests(prev => prev.map(guest => 
        guestIds.includes(guest._id) 
          ? { ...guest, invited: true, invitationSentAt: new Date().toISOString() }
          : guest
      ))
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitations')
    } finally {
      setSending(null)
    }
  }

  const toggleSelectGuest = (guestId: string) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedGuests.length === filteredGuests.length) {
      setSelectedGuests([])
    } else {
      setSelectedGuests(filteredGuests.map(g => g._id))
    }
  }

  const getStatusIcon = (status: GuestStatus) => {
    const icons = {
      accepted: { icon: CheckCircle, color: 'text-green-500' },
      declined: { icon: XCircle, color: 'text-red-500' },
      maybe: { icon: Clock, color: 'text-yellow-500' },
      pending: { icon: Clock, color: 'text-gray-400' }
    }
    return icons[status] || icons.pending
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
      case 'whatsapp': return <Send className="h-4 w-4" />
      default: return <Send className="h-4 w-4" />
    }
  }

  // Memoized guest list for performance
  const memoizedGuestList = useMemo(() => filteredGuests, [filteredGuests])

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
          <h1 className="text-2xl lg:text-3xl font-bold">Guest Management</h1>
          <p className="text-gray-600">
            Manage your wedding guests and track RSVPs
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Button
            variant="outline"
            onClick={handleSendBulkInvitations}
            disabled={sending === 'bulk' || stats.notSent === 0}
            className="flex items-center justify-center"
          >
            {sending === 'bulk' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send All ({stats.notSent})
          </Button>
          <Link href="/dashboard/invites/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-wedding-gold to-wedding-blush">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Guest
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-blue-100 rounded-lg mb-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-green-100 rounded-lg mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-yellow-100 rounded-lg mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-red-100 rounded-lg mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Declined</p>
              <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-gray-100 rounded-lg mb-2">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Maybe</p>
              <p className="text-2xl font-bold text-gray-600">{stats.maybe}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-purple-100 rounded-lg mb-2">
                <Send className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">To Send</p>
              <p className="text-2xl font-bold text-purple-600">{stats.notSent}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search guests by name, email, or username..."
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
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="RSVP Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All RSVP Status</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="maybe">Maybe</SelectItem>
                    <SelectItem value="invitation">Not Invited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={invitationFilter} onValueChange={setInvitationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Invitation Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Invitations</SelectItem>
                  <SelectItem value="sent">Invitation Sent</SelectItem>
                  <SelectItem value="not_sent">Not Sent</SelectItem>
                </SelectContent>
              </Select>

              {selectedGuests.length > 0 && (
                <Badge variant="outline" className="border-wedding-gold/30">
                  {selectedGuests.length} selected
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Guest List</CardTitle>
          <CardDescription>
            {filteredGuests.length} guest(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {memoizedGuestList.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-gold/10">
                <Users className="h-8 w-8 text-wedding-gold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No guests found</h3>
                <p className="text-gray-600 mt-1">
                  {search || statusFilter !== 'all' || invitationFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start by adding your first guest'
                  }
                </p>
              </div>
              {!search && statusFilter === 'all' && invitationFilter === 'all' && (
                <Link href="/dashboard/invites/create">
                  <Button className="mt-4 bg-gradient-to-r from-wedding-gold to-wedding-blush">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add First Guest
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedGuests.length === filteredGuests.length && filteredGuests.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>RSVP Status</TableHead>
                      <TableHead>Invitation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memoizedGuestList.map((guest) => {
                      const StatusIcon = getStatusIcon(guest.rsvpStatus).icon
                      const statusColor = getStatusIcon(guest.rsvpStatus).color
                      return (
                        <motion.tr
                          key={guest._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedGuests.includes(guest._id)}
                              onCheckedChange={() => toggleSelectGuest(guest._id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-wedding-gold to-wedding-blush flex items-center justify-center">
                                <span className="font-semibold text-white">
                                  {guest.name?.charAt(0) || 'G'}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{guest.name || 'Unnamed Guest'}</div>
                                {guest.plusOneAllowed && (
                                  <Badge variant="outline" className="text-xs border-blue-200 bg-blue-50 text-blue-700">
                                    +1 Allowed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {guest.email && (
                                <div className="flex items-center text-sm">
                                  <Mail className="h-3 w-3 mr-2 text-gray-500" />
                                  <span className="truncate max-w-[200px]">{guest.email}</span>
                                </div>
                              )}
                              <div className="flex items-center text-sm">
                                <span className="mr-2 text-gray-500">@</span>
                                <span>{guest.telegramUsername?.replace('@', '') || 'No username'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={cn("h-4 w-4", statusColor)} />
                              <span className="capitalize">{guest.rsvpStatus}</span>
                              {guest.hasRSVPed && guest.rsvpSubmittedAt && (
                                <span className="text-xs text-gray-500">
                                  ({formatDate(guest.rsvpSubmittedAt)})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {getInvitationMethodIcon(guest.invitationMethod)}
                                <span className="text-sm capitalize">{guest.invitationMethod}</span>
                                <Badge variant={guest.invited ? "default" : "outline"}>
                                  {guest.invited ? 'Sent' : 'Not Sent'}
                                </Badge>
                              </div>
                              {guest.invited && guest.invitationSentAt && (
                                <div className="text-xs text-gray-500">
                                  {formatDate(guest.invitationSentAt)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              {!guest.invited ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendInvitation(guest._id)}
                                  disabled={sending === guest._id}
                                  className="h-8 px-3"
                                >
                                  {sending === guest._id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Send className="h-3 w-3" />
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendInvitation(guest._id)}
                                  disabled={sending === guest._id}
                                  className="h-8 px-3"
                                >
                                  {sending === guest._id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {memoizedGuestList.map((guest) => {
                  const StatusIcon = getStatusIcon(guest.rsvpStatus).icon
                  const statusColor = getStatusIcon(guest.rsvpStatus).color
                  return (
                    <Card key={guest._id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedGuests.includes(guest._id)}
                              onCheckedChange={() => toggleSelectGuest(guest._id)}
                            />
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-wedding-gold to-wedding-blush flex items-center justify-center">
                              <span className="font-semibold text-white">
                                {guest.name?.charAt(0) || 'G'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{guest.name || 'Unnamed Guest'}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={cn(
                                  "text-xs",
                                  guest.rsvpStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                                  guest.rsvpStatus === 'declined' ? 'bg-red-100 text-red-800' :
                                  guest.rsvpStatus === 'maybe' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                )}>
                                  {guest.rsvpStatus}
                                </Badge>
                                {guest.plusOneAllowed && (
                                  <Badge variant="outline" className="text-xs border-blue-200 bg-blue-50 text-blue-700">
                                    +1
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Contact</p>
                              <div className="space-y-1 mt-1">
                                {guest.email && (
                                  <div className="flex items-center text-sm">
                                    <Mail className="h-3 w-3 mr-1 text-gray-500" />
                                    <span className="truncate">{guest.email}</span>
                                  </div>
                                )}
                                <div className="flex items-center text-sm">
                                  <span className="mr-1 text-gray-500">@</span>
                                  <span>{guest.telegramUsername?.replace('@', '')}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Invitation</p>
                              <div className="mt-1">
                                <div className="flex items-center gap-2">
                                  {getInvitationMethodIcon(guest.invitationMethod)}
                                  <span className="text-sm capitalize">{guest.invitationMethod}</span>
                                </div>
                                <Badge variant={guest.invited ? "default" : "outline"} className="mt-1">
                                  {guest.invited ? 'Sent' : 'Not Sent'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {guest.invited && guest.invitationSentAt && (
                            <div className="text-xs text-gray-500">
                              Sent: {formatDate(guest.invitationSentAt)}
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
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
                                  <RefreshCw className="mr-2 h-3 w-3" />
                                )}
                                Resend
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="mr-2 h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card className="border-wedding-sage/20 bg-wedding-sage/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-wedding-sage" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
              <Download className="h-8 w-8 mb-2 text-wedding-gold" />
              <span>Export Guest List</span>
              <span className="text-xs text-gray-500 mt-1">CSV or Excel</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
              <Eye className="h-8 w-8 mb-2 text-wedding-gold" />
              <span>Preview Invitations</span>
              <span className="text-xs text-gray-500 mt-1">See how guests will view</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
              <RefreshCw className="h-8 w-8 mb-2 text-wedding-gold" />
              <span>Send Reminders</span>
              <span className="text-xs text-gray-500 mt-1">To pending RSVPs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}