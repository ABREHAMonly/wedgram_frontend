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
import { toast } from 'sonner'
import { 
  Gift, 
  Plus, 
  Edit2, 
  Trash2, 
  Heart, 
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
  Copy
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GiftItem {
  id: string
  name: string
  description: string
  price: number
  link?: string
  priority: 'high' | 'medium' | 'low'
  status: 'available' | 'reserved' | 'purchased'
  category: string
  quantity: number
  purchased: number
  image?: string
}

export default function GiftsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [gifts, setGifts] = useState<GiftItem[]>([])
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
  const [shareModal, setShareModal] = useState(false)
  const [shareLink, setShareLink] = useState('')

  // Load gifts on mount
  useEffect(() => {
    loadGifts()
    generateShareLink()
  }, [])

  const loadGifts = useCallback(async () => {
    setLoading(true)
    try {
      // In a real app, fetch from API
      const mockGifts: GiftItem[] = [
        {
          id: '1',
          name: 'Kitchen Mixer',
          description: 'Stand mixer for baking enthusiasts',
          price: 299.99,
          link: 'https://example.com/mixer',
          priority: 'high',
          status: 'available',
          category: 'kitchen',
          quantity: 1,
          purchased: 0,
          image: '/placeholder-mixer.jpg'
        },
        {
          id: '2',
          name: 'Luggage Set',
          description: 'Travel set for honeymoon adventures',
          price: 199.99,
          priority: 'medium',
          status: 'reserved',
          category: 'travel',
          quantity: 1,
          purchased: 0
        },
        {
          id: '3',
          name: 'Coffee Machine',
          description: 'Espresso machine for coffee lovers',
          price: 149.99,
          priority: 'high',
          status: 'available',
          category: 'kitchen',
          quantity: 1,
          purchased: 0
        },
        {
          id: '4',
          name: 'Bedding Set',
          description: 'Luxury cotton bedding for master bedroom',
          price: 129.99,
          priority: 'low',
          status: 'purchased',
          category: 'bedroom',
          quantity: 1,
          purchased: 1
        }
      ]
      setGifts(mockGifts)
    } catch (error) {
      toast.error('Failed to load gift registry')
    } finally {
      setLoading(false)
    }
  }, [])

  const generateShareLink = () => {
    // In a real app, generate from user ID
    const baseUrl = window.location.origin
    const userId = Math.random().toString(36).substring(7)
    setShareLink(`${baseUrl}/registry/${userId}`)
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

    setSaving(true)
    try {
      const gift: GiftItem = {
        id: Date.now().toString(),
        name: newGift.name!,
        description: newGift.description || '',
        price: newGift.price!,
        link: newGift.link,
        priority: newGift.priority || 'medium',
        status: 'available',
        category: newGift.category || 'home',
        quantity: newGift.quantity || 1,
        purchased: 0
      }

      setGifts(prev => [gift, ...prev])
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
    } catch (error) {
      toast.error('Failed to add gift')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateGift = async () => {
    if (!editingGift) return

    setSaving(true)
    try {
      setGifts(prev => prev.map(g => 
        g.id === editingGift.id ? editingGift : g
      ))
      toast.success('Gift updated successfully')
      setEditingGift(null)
    } catch (error) {
      toast.error('Failed to update gift')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGift = (id: string) => {
    if (!confirm('Are you sure you want to remove this gift?')) return

    setGifts(prev => prev.filter(g => g.id !== id))
    toast.success('Gift removed from registry')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast.success('Link copied to clipboard!')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Our Wedding Registry',
        text: 'Check out our wedding gift registry',
        url: shareLink
      })
    } else {
      setShareModal(true)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      purchased: 'bg-blue-100 text-blue-800'
    }
    return colors[status as keyof typeof colors] || colors.available
  }

  const filteredGifts = gifts.filter(gift => {
    if (filter === 'all') return true
    if (filter === 'available') return gift.status === 'available'
    if (filter === 'purchased') return gift.status === 'purchased'
    return gift.category === filter
  })

  const stats = {
    total: gifts.length,
    available: gifts.filter(g => g.status === 'available').length,
    purchased: gifts.filter(g => g.status === 'purchased').length,
    totalValue: gifts.reduce((sum, g) => sum + g.price, 0),
    purchasedValue: gifts.filter(g => g.status === 'purchased').reduce((sum, g) => sum + g.price, 0)
  }

  const categories = [
    'all', 'kitchen', 'bedroom', 'living', 'dining', 'travel', 'entertainment', 'home'
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-wedding-gold" />
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
            <Label className="flex items-center gap-1">
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
            className="bg-gradient-to-r from-wedding-gold to-wedding-blush"
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
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
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
                <p className="text-2xl font-bold text-blue-600">{stats.purchased}</p>
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
                <p className="text-sm font-medium text-gray-600">Registry Value</p>
                <p className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={filter === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(category)}
                  className={cn(
                    "capitalize",
                    filter === category && "bg-wedding-gold text-white"
                  )}
                >
                  {category === 'all' ? 'All Gifts' : category}
                </Button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredGifts.length} of {gifts.length} gifts
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
            <Card className="mb-6 border-wedding-gold/20">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Add New Gift</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdding(false)}
                    disabled={saving}
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
                        placeholder="e.g., Kitchen Mixer"
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
                          onChange={(e) => setNewGift({...newGift, price: parseFloat(e.target.value)})}
                          required
                          disabled={saving}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gift-category">Category</Label>
                      <Select
                        value={newGift.category}
                        onValueChange={(value) => setNewGift({...newGift, category: value})}
                        disabled={saving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kitchen">Kitchen</SelectItem>
                          <SelectItem value="bedroom">Bedroom</SelectItem>
                          <SelectItem value="living">Living Room</SelectItem>
                          <SelectItem value="dining">Dining</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="home">Home Decor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
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
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
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
                        onChange={(e) => setNewGift({...newGift, quantity: parseInt(e.target.value)})}
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gift-link">
                        <LinkIcon className="h-4 w-4 inline mr-1" />
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
                      placeholder="Describe the gift, brand, color, size, etc."
                      value={newGift.description || ''}
                      onChange={(e) => setNewGift({...newGift, description: e.target.value})}
                      disabled={saving}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAdding(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
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
          <CardTitle>Your Gift Registry</CardTitle>
          <CardDescription>
            {showRegistry ? 'Registry is visible to guests' : 'Registry is private'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredGifts.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-gold/10">
                <Gift className="h-8 w-8 text-wedding-gold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No gifts yet</h3>
                <p className="text-gray-600 mt-1">
                  {filter === 'all' 
                    ? 'Start by adding gifts to your registry'
                    : `No gifts found in ${filter} category`
                  }
                </p>
              </div>
              {filter === 'all' && (
                <Button
                  onClick={() => setIsAdding(true)}
                  className="mt-4 bg-gradient-to-r from-wedding-gold to-wedding-blush"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Gift
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGifts.map((gift) => (
                <motion.div
                  key={gift.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow duration-300 border-wedding-gold/20">
                    <CardContent className="p-6">
                      {editingGift?.id === gift.id ? (
                        <div className="space-y-4">
                          <Input
                            value={editingGift.name}
                            onChange={(e) => setEditingGift({...editingGift, name: e.target.value})}
                            className="font-semibold"
                          />
                          <Textarea
                            value={editingGift.description}
                            onChange={(e) => setEditingGift({...editingGift, description: e.target.value})}
                            rows={2}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              value={editingGift.price}
                              onChange={(e) => setEditingGift({...editingGift, price: parseFloat(e.target.value)})}
                              className="col-span-2"
                            />
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
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingGift(null)}
                              disabled={saving}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleUpdateGift}
                              disabled={saving}
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-4">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">{gift.name}</h3>
                              <div className="flex items-center gap-2">
                                <Badge className={getPriorityColor(gift.priority)}>
                                  {gift.priority} priority
                                </Badge>
                                <Badge className={getStatusColor(gift.status)}>
                                  {gift.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingGift(gift)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteGift(gift.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {gift.description && (
                            <p className="text-gray-600 mb-4">{gift.description}</p>
                          )}

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-2xl font-bold text-wedding-gold">
                                <DollarSign className="h-5 w-5" />
                                {gift.price.toFixed(2)}
                              </div>
                              {gift.link && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(gift.link, '_blank')}
                                  className="border-wedding-gold/30 text-wedding-gold hover:bg-wedding-gold/5"
                                >
                                  <LinkIcon className="mr-2 h-3 w-3" />
                                  View Product
                                </Button>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span className="capitalize">{gift.category}</span>
                              <span>
                                {gift.purchased}/{gift.quantity} purchased
                              </span>
                            </div>

                            {gift.quantity > 1 && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-wedding-gold to-wedding-blush h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(gift.purchased / gift.quantity) * 100}%` }}
                                />
                              </div>
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
      <Card className="border-wedding-sage/20 bg-wedding-sage/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-wedding-sage" />
            Registry Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Include gifts at various price points for all budgets</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Add direct links to make purchasing easier for guests</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Update status promptly when gifts are purchased</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Consider cash funds for honeymoon or home projects</span>
            </li>
          </ul>
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
                      value={shareLink}
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

                <div className="text-sm text-gray-500">
                  <p>Your registry is currently: <strong>{showRegistry ? 'Public' : 'Private'}</strong></p>
                  <p className="mt-1">Change visibility in settings above.</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShareModal(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleCopyLink}
                    className="bg-gradient-to-r from-wedding-gold to-wedding-blush"
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