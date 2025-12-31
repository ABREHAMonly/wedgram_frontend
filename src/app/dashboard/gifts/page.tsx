// src/app/dashboard/gifts/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { giftsApi, GiftItem, GiftStats } from '@/lib/api/gifts'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'
import { 
  Gift, 
  Plus, 
  Edit2, 
  Trash2, 
  ShoppingBag, 
  DollarSign,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Package,
  AlertCircle,
  Share2,
  Copy,
  X,
  TrendingUp,
  Tag,
  Filter,
  Search,
  BarChart3,
  CreditCard,
  Heart,
  Home,
  UtensilsCrossed,
  Plane,
  Music
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function GiftsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [gifts, setGifts] = useState<GiftItem[]>([])
  const [stats, setStats] = useState<GiftStats>({
    total: 0,
    available: 0,
    reserved: 0,
    purchased: 0,
    totalValue: 0,
    purchasedValue: 0,
    byCategory: {}
  })
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null)
  const [newGift, setNewGift] = useState<Partial<GiftItem>>({
    name: '',
    description: '',
    price: 0,
    link: '',
    priority: 'medium',
    status: 'available',
    category: 'home',
    quantity: 1,
    purchased: 0
  })
  const [isAdding, setIsAdding] = useState(false)
  const [showRegistry, setShowRegistry] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [shareModal, setShareModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'priority' | 'createdAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Load gifts on mount
  useEffect(() => {
    loadGifts()
  }, [])

  const loadGifts = useCallback(async () => {
    setLoading(true)
    try {
      // Load gifts
      const giftsData = await giftsApi.getGifts()
      setGifts(giftsData || [])
      
      // Load stats
      try {
        const statsData = await giftsApi.getStats()
        if (statsData) {
          setStats({
            total: statsData.total || 0,
            available: statsData.available || 0,
            reserved: statsData.reserved || 0,
            purchased: statsData.purchased || 0,
            totalValue: statsData.totalValue || 0,
            purchasedValue: statsData.purchasedValue || 0,
            byCategory: statsData.byCategory || {}
          })
        }
      } catch (statsError) {
        console.error('Failed to load stats:', statsError)
        // Calculate stats from gifts data
        const calculatedStats = calculateStats(giftsData || [])
        setStats(calculatedStats)
      }
    } catch (error: any) {
      console.error('Failed to load gifts:', error)
      if (error.status !== 404) {
        toast.error('Failed to load gift registry')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const calculateStats = (giftsList: GiftItem[]): GiftStats => {
    const purchased = giftsList.filter(g => g.status === 'purchased')
    const reserved = giftsList.filter(g => g.status === 'reserved')
    const available = giftsList.filter(g => g.status === 'available')
    
    return {
      total: giftsList.length,
      available: available.length,
      reserved: reserved.length,
      purchased: purchased.length,
      totalValue: giftsList.reduce((sum, g) => sum + (g.price || 0), 0),
      purchasedValue: purchased.reduce((sum, g) => sum + (g.price || 0), 0),
      byCategory: giftsList.reduce((acc, gift) => {
        const category = gift.category || 'other'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }

  const generateShareLink = () => {
    const baseUrl = window.location.origin
    const userId = user?._id || Math.random().toString(36).substring(7)
    return `${baseUrl}/registry/${userId}`
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      kitchen: <UtensilsCrossed className="h-4 w-4" />,
      bedroom: <Home className="h-4 w-4" />,
      living: <Home className="h-4 w-4" />,
      dining: <UtensilsCrossed className="h-4 w-4" />,
      travel: <Plane className="h-4 w-4" />,
      entertainment: <Music className="h-4 w-4" />,
      home: <Home className="h-4 w-4" />,
      other: <Gift className="h-4 w-4" />,
      honeymoon: <Heart className="h-4 w-4" />,
      cash: <CreditCard className="h-4 w-4" />
    }
    return icons[category] || <Gift className="h-4 w-4" />
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      kitchen: 'bg-orange-100 text-orange-800',
      bedroom: 'bg-blue-100 text-blue-800',
      living: 'bg-green-100 text-green-800',
      dining: 'bg-amber-100 text-amber-800',
      travel: 'bg-cyan-100 text-cyan-800',
      entertainment: 'bg-purple-100 text-purple-800',
      home: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
      honeymoon: 'bg-red-100 text-red-800',
      cash: 'bg-emerald-100 text-emerald-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newGift.name?.trim()) {
      toast.error('Gift name is required')
      return
    }

    if (!newGift.price || newGift.price <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    if (!newGift.category?.trim()) {
      toast.error('Category is required')
      return
    }

    setSaving(true)
    try {
      const giftData: Omit<GiftItem, '_id' | 'createdAt' | 'updatedAt'> = {
        name: newGift.name!,
        description: newGift.description || '',
        price: newGift.price!,
        link: newGift.link,
        priority: newGift.priority || 'medium',
        status: 'available',
        category: newGift.category!,
        quantity: newGift.quantity || 1,
        purchased: 0
      }

      const createdGift = await giftsApi.createGift(giftData)
      toast.success('Gift added to registry')
      
      // Reset form
      setNewGift({
        name: '',
        description: '',
        price: 0,
        link: '',
        priority: 'medium',
        status: 'available',
        category: 'home',
        quantity: 1,
        purchased: 0
      })
      setIsAdding(false)
      
      // Refresh data
      await loadGifts()
    } catch (error: any) {
      console.error('Failed to add gift:', error)
      toast.error(error.message || 'Failed to add gift')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateGift = async () => {
    if (!editingGift?._id) return

    setSaving(true)
    try {
      await giftsApi.updateGift(editingGift._id, editingGift)
      toast.success('Gift updated successfully')
      setEditingGift(null)
      await loadGifts()
    } catch (error: any) {
      console.error('Failed to update gift:', error)
      toast.error(error.message || 'Failed to update gift')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGift = async (id: string) => {
    if (!confirm('Are you sure you want to remove this gift?')) return

    setSaving(true)
    try {
      await giftsApi.deleteGift(id)
      toast.success('Gift removed from registry')
      await loadGifts()
    } catch (error: any) {
      console.error('Failed to delete gift:', error)
      toast.error(error.message || 'Failed to delete gift')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = () => {
    const link = generateShareLink()
    navigator.clipboard.writeText(link)
    toast.success('Link copied to clipboard!')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Our Wedding Registry',
        text: 'Check out our wedding gift registry',
        url: generateShareLink()
      })
    } else {
      setShareModal(true)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      reserved: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      purchased: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return colors[status as keyof typeof colors] || colors.available
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      available: <Package className="h-3 w-3" />,
      reserved: <Eye className="h-3 w-3" />,
      purchased: <CheckCircle className="h-3 w-3" />
    }
    return icons[status as keyof typeof icons] || <Package className="h-3 w-3" />
  }

  const filteredAndSortedGifts = gifts
    .filter(gift => {
      // Filter by category
      if (selectedCategory !== 'all' && gift.category !== selectedCategory) {
        return false
      }
      
      // Filter by status
      if (filter !== 'all' && gift.status !== filter) {
        return false
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          gift.name.toLowerCase().includes(query) ||
          gift.description?.toLowerCase().includes(query) ||
          gift.category.toLowerCase().includes(query)
        )
      }
      
      return true
    })
    .sort((a, b) => {
      let compareValue = 0
      
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
        case 'price':
          compareValue = (a.price || 0) - (b.price || 0)
          break
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          compareValue = priorityOrder[b.priority as keyof typeof priorityOrder] - 
                        priorityOrder[a.priority as keyof typeof priorityOrder]
          break
        case 'createdAt':
          compareValue = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          break
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue
    })

  const categories = [
    { value: 'all', label: 'All Categories', icon: <Filter className="h-4 w-4" /> },
    { value: 'kitchen', label: 'Kitchen', icon: <UtensilsCrossed className="h-4 w-4" /> },
    { value: 'bedroom', label: 'Bedroom', icon: <Home className="h-4 w-4" /> },
    { value: 'living', label: 'Living Room', icon: <Home className="h-4 w-4" /> },
    { value: 'dining', label: 'Dining', icon: <UtensilsCrossed className="h-4 w-4" /> },
    { value: 'travel', label: 'Travel', icon: <Plane className="h-4 w-4" /> },
    { value: 'entertainment', label: 'Entertainment', icon: <Music className="h-4 w-4" /> },
    { value: 'home', label: 'Home Decor', icon: <Home className="h-4 w-4" /> },
    { value: 'honeymoon', label: 'Honeymoon', icon: <Heart className="h-4 w-4" /> },
    { value: 'cash', label: 'Cash Fund', icon: <CreditCard className="h-4 w-4" /> },
    { value: 'other', label: 'Other', icon: <Gift className="h-4 w-4" /> }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-wedding-gold" />
        <span className="ml-2 text-gray-600">Loading gift registry...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gift Registry</h1>
          <p className="text-gray-600">
            Create and manage your wedding gift list
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={showRegistry}
              onCheckedChange={setShowRegistry}
              className="data-[state=checked]:bg-wedding-gold"
            />
            <Label className="flex items-center gap-2 cursor-pointer">
              {showRegistry ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Public Registry
            </Label>
          </div>
          <Button
            onClick={handleShare}
            variant="outline"
            className="border-wedding-gold/30 text-wedding-gold hover:bg-wedding-gold/5"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-gradient-to-r from-wedding-gold to-wedding-blush hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Gift
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gifts</p>
                <p className="text-2xl font-bold">{stats.total || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Purchased</p>
                <p className="text-2xl font-bold text-blue-600">{stats.purchased || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  ${(stats.purchasedValue || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${(stats.totalValue || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.total > 0 ? `$${Math.round((stats.totalValue || 0) / stats.total)} avg` : '$0 avg'}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-wedding-gold" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="text-center">
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-full mb-2",
                  getCategoryColor(category)
                )}>
                  {getCategoryIcon(category)}
                </div>
                <p className="text-sm font-medium capitalize">{category}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
                <p className="text-xs text-gray-500">
                  {Math.round((count / stats.total) * 100)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search gifts by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Category:</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="flex items-center gap-2">
                          {cat.icon}
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Status:</Label>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="purchased">Purchased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Sort by:</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Newest First</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="price">Price Low-High</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="h-9 w-9 p-0"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredAndSortedGifts.length} of {gifts.length} gifts
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Gift Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6 border-wedding-gold/20 bg-gradient-to-r from-wedding-gold/5 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Add New Gift</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdding(false)}
                    disabled={saving}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddGift} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gift-name">Gift Name *</Label>
                      <Input
                        id="gift-name"
                        placeholder="e.g., KitchenAid Stand Mixer"
                        value={newGift.name || ''}
                        onChange={(e) => setNewGift({...newGift, name: e.target.value})}
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gift-price">Price *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="gift-price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={newGift.price || ''}
                          onChange={(e) => setNewGift({...newGift, price: parseFloat(e.target.value) || 0})}
                          required
                          disabled={saving}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gift-category">Category *</Label>
                      <Select
                        value={newGift.category}
                        onValueChange={(value) => setNewGift({...newGift, category: value})}
                        disabled={saving}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map((cat) => (
                            <SelectItem key={cat.value} value={cat.value} className="flex items-center gap-2">
                              {cat.icon}
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gift-priority">Priority</Label>
                      <Select
                        value={newGift.priority}
                        onValueChange={(value: 'high' | 'medium' | 'low') => 
                          setNewGift({...newGift, priority: value})
                        }
                        disabled={saving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high" className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            High Priority
                          </SelectItem>
                          <SelectItem value="medium" className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            Medium Priority
                          </SelectItem>
                          <SelectItem value="low" className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Low Priority
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gift-quantity">Quantity</Label>
                      <Input
                        id="gift-quantity"
                        type="number"
                        min="1"
                        value={newGift.quantity || 1}
                        onChange={(e) => setNewGift({...newGift, quantity: parseInt(e.target.value) || 1})}
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gift-link" className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Store Link
                      </Label>
                      <Input
                        id="gift-link"
                        type="url"
                        placeholder="https://example.com/product"
                        value={newGift.link || ''}
                        onChange={(e) => setNewGift({...newGift, link: e.target.value})}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gift-description">Description</Label>
                    <Textarea
                      id="gift-description"
                      placeholder="Describe the gift, brand, color, size, or any specific preferences..."
                      value={newGift.description || ''}
                      onChange={(e) => setNewGift({...newGift, description: e.target.value})}
                      disabled={saving}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAdding(false)}
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
                          Add Gift
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

      {/* Gifts Grid */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Your Gift Registry</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {showRegistry ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Registry is visible to guests
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 text-gray-500" />
                    Registry is private
                  </>
                )}
              </CardDescription>
            </div>
            {filteredAndSortedGifts.length > 0 && (
              <Badge variant="outline" className="border-wedding-gold/30 text-wedding-gold">
                <TrendingUp className="h-3 w-3 mr-1" />
                {Math.round((stats.purchased / stats.total) * 100)}% Purchased
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedGifts.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-gold/10">
                <Gift className="h-8 w-8 text-wedding-gold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {searchQuery || selectedCategory !== 'all' || filter !== 'all' 
                    ? 'No gifts match your search'
                    : 'No gifts yet'
                  }
                </h3>
                <p className="text-gray-600 mt-1">
                  {searchQuery || selectedCategory !== 'all' || filter !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'Start by adding gifts to your registry'
                  }
                </p>
              </div>
              {(searchQuery || selectedCategory !== 'all' || filter !== 'all') ? (
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setFilter('all')
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  onClick={() => setIsAdding(true)}
                  className="mt-4 bg-gradient-to-r from-wedding-gold to-wedding-blush hover:opacity-90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Gift
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedGifts.map((gift) => (
                <motion.div
                  key={gift._id || gift.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-wedding-gold/20 hover:border-wedding-gold/40 hover:-translate-y-1">
                    <CardContent className="p-6">
                      {editingGift?._id === gift._id ? (
                        <div className="space-y-4">
                          <Input
                            value={editingGift.name}
                            onChange={(e) => setEditingGift({...editingGift, name: e.target.value})}
                            className="font-semibold"
                            required
                          />
                          <Textarea
                            value={editingGift.description || ''}
                            onChange={(e) => setEditingGift({...editingGift, description: e.target.value})}
                            rows={2}
                            placeholder="Description"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                              <Label>Price</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  type="number"
                                  value={editingGift.price}
                                  onChange={(e) => setEditingGift({...editingGift, price: parseFloat(e.target.value) || 0})}
                                  required
                                  className="pl-9"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Priority</Label>
                              <Select
                                value={editingGift.priority}
                                onValueChange={(value: 'high' | 'medium' | 'low') => 
                                  setEditingGift({...editingGift, priority: value})
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <Select
                                value={editingGift.status}
                                onValueChange={(value: 'available' | 'reserved' | 'purchased') => 
                                  setEditingGift({...editingGift, status: value})
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="available">Available</SelectItem>
                                  <SelectItem value="reserved">Reserved</SelectItem>
                                  <SelectItem value="purchased">Purchased</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Category</Label>
                              <Select
                                value={editingGift.category}
                                onValueChange={(value) => setEditingGift({...editingGift, category: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.slice(1).map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                      {cat.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                min="1"
                                value={editingGift.quantity}
                                onChange={(e) => setEditingGift({...editingGift, quantity: parseInt(e.target.value) || 1})}
                              />
                            </div>
                            <div>
                              <Label>Purchased</Label>
                              <Input
                                type="number"
                                min="0"
                                max={editingGift.quantity}
                                value={editingGift.purchased || 0}
                                onChange={(e) => setEditingGift({...editingGift, purchased: parseInt(e.target.value) || 0})}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingGift(null)}
                              disabled={saving}
                              className="min-w-[80px]"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleUpdateGift}
                              disabled={saving}
                              className="bg-gradient-to-r from-wedding-gold to-wedding-blush hover:opacity-90 min-w-[80px]"
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className={cn(
                                  "border",
                                  getCategoryColor(gift.category)
                                )}>
                                  <span className="flex items-center gap-1">
                                    {getCategoryIcon(gift.category)}
                                    {gift.category.charAt(0).toUpperCase() + gift.category.slice(1)}
                                  </span>
                                </Badge>
                                <Badge className={cn(
                                  "border",
                                  getPriorityColor(gift.priority)
                                )}>
                                  {gift.priority.charAt(0).toUpperCase() + gift.priority.slice(1)}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-lg text-gray-800">{gift.name}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingGift(gift)}
                                className="h-8 w-8 p-0 hover:bg-wedding-gold/10"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => gift._id && handleDeleteGift(gift._id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {gift.description && (
                            <p className="text-gray-600 mb-4 text-sm">{gift.description}</p>
                          )}

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-2xl font-bold text-wedding-gold">
                                <DollarSign className="h-5 w-5 mr-1" />
                                {(gift.price || 0).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </div>
                              <Badge className={cn(
                                "border px-3 py-1",
                                getStatusColor(gift.status)
                              )}>
                                <span className="flex items-center gap-2">
                                  {getStatusIcon(gift.status)}
                                  {gift.status.charAt(0).toUpperCase() + gift.status.slice(1)}
                                </span>
                              </Badge>
                            </div>

                            {(gift.quantity || 1) > 1 && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>
                                    {gift.purchased || 0} of {gift.quantity || 1} purchased
                                  </span>
                                  <span className="font-medium">
                                    {Math.round(((gift.purchased || 0) / (gift.quantity || 1)) * 100)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-wedding-gold to-wedding-blush h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(((gift.purchased || 0) / (gift.quantity || 1)) * 100) || 0}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {gift.link && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(gift.link, '_blank')}
                                className="w-full border-wedding-gold/30 text-wedding-gold hover:bg-wedding-gold/5"
                              >
                                <LinkIcon className="mr-2 h-3 w-3" />
                                View Product
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-wedding-sage/20 bg-gradient-to-r from-wedding-sage/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-wedding-sage" />
            Registry Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Price Range</h4>
                  <p className="text-sm text-gray-600 mt-1">Include gifts at various price points for all budgets</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <LinkIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Direct Links</h4>
                  <p className="text-sm text-gray-600 mt-1">Add links to make purchasing easier for guests</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Update Status</h4>
                  <p className="text-sm text-gray-600 mt-1">Update promptly when gifts are purchased</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Heart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Cash Funds</h4>
                  <p className="text-sm text-gray-600 mt-1">Consider cash funds for honeymoon or home projects</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-gold/10 mb-4">
                    <Share2 className="h-8 w-8 text-wedding-gold" />
                  </div>
                  <h3 className="text-xl font-bold">Share Your Registry</h3>
                  <p className="text-gray-600 mt-1">
                    Share this link with friends and family
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Registry Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generateShareLink()}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="font-medium">Registry Status</p>
                      <p className={cn(
                        "mt-1",
                        showRegistry ? "text-green-600" : "text-gray-600"
                      )}>
                        {showRegistry ? 'Public' : 'Private'}
                      </p>
                    </div>
                    <Switch
                      checked={showRegistry}
                      onCheckedChange={setShowRegistry}
                      className="data-[state=checked]:bg-wedding-gold"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {showRegistry 
                      ? 'Your registry is visible to anyone with the link'
                      : 'Only you can see your registry. Turn on to share.'
                    }
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShareModal(false)}
                    className="min-w-[100px]"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleCopyLink}
                    className="bg-gradient-to-r from-wedding-gold to-wedding-blush hover:opacity-90 min-w-[100px]"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}