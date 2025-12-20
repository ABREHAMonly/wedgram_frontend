// src/app/auth/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'
import { Calendar, Heart, User, Mail, Lock, Phone, MapPin, Sparkles, CheckCircle, EyeOff, Eye } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    weddingDate: '',
    partnerName: '',
    weddingLocation: '',
  })
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const { register } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Calculate password strength
    if (name === 'password') {
      let strength = 0
      if (value.length >= 8) strength++
      if (/[A-Z]/.test(value)) strength++
      if (/[0-9]/.test(value)) strength++
      if (/[^A-Za-z0-9]/.test(value)) strength++
      setPasswordStrength(strength)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (!formData.weddingDate) {
      toast.error('Wedding date is required')
      return
    }

    setLoading(true)
    try {
      await register({
        ...formData,
        weddingDate: new Date(formData.weddingDate),
      })
    } catch (error) {
      // Error is handled in the auth hook
    } finally {
      setLoading(false)
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]
  const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0]

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200'
    if (passwordStrength === 1) return 'bg-red-400'
    if (passwordStrength === 2) return 'bg-yellow-400'
    if (passwordStrength === 3) return 'bg-blue-400'
    return 'bg-green-500'
  }

  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 0: return 'Enter a password'
      case 1: return 'Weak'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Strong!'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-wedding-gold/10 to-wedding-blush/10 mb-2">
          <Heart className="h-6 w-6 text-wedding-gold" />
        </div>
        <h1 className="text-2xl font-display font-bold text-wedding-navy">
          Begin Your Love Story
        </h1>
        <p className="text-wedding-navy/60">
          Create your account to start planning your perfect wedding
        </p>
      </div>

      {/* Registration Form */}
      <Card className="border-wedding-gold/20 shadow-elegant overflow-hidden">
        <div className="bg-gradient-to-r from-wedding-gold/5 via-wedding-blush/5 to-wedding-champagne/5 p-1">
          <div className="h-1 bg-gradient-to-r from-wedding-gold to-wedding-blush" />
        </div>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-wedding-navy">
                Couple's Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., John & Jane"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="pl-10 h-11 bg-white/50 border-wedding-gold/20 focus:border-wedding-gold"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-wedding-navy">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="pl-10 h-11 bg-white/50 border-wedding-gold/20 focus:border-wedding-gold"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-wedding-navy">
                  Phone (Optional)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 h-11 bg-white/50 border-wedding-gold/20 focus:border-wedding-gold"
                  />
                </div>
              </div>
            </div>

            {/* Wedding Date */}
            <div className="space-y-2">
              <Label htmlFor="weddingDate" className="text-sm font-medium text-wedding-navy">
                Wedding Date *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                <Input
                  id="weddingDate"
                  name="weddingDate"
                  type="date"
                  value={formData.weddingDate}
                  onChange={handleChange}
                  min={minDate}
                  max={maxDate}
                  required
                  disabled={loading}
                  className="pl-10 h-11 bg-white/50 border-wedding-gold/20 focus:border-wedding-gold"
                />
              </div>
            </div>

            {/* Partner Name & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partnerName" className="text-sm font-medium text-wedding-navy">
                  Partner's Name
                </Label>
                <Input
                  id="partnerName"
                  name="partnerName"
                  placeholder="Partner's name"
                  value={formData.partnerName}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-11 bg-white/50 border-wedding-gold/20 focus:border-wedding-gold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weddingLocation" className="text-sm font-medium text-wedding-navy">
                  Wedding Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                  <Input
                    id="weddingLocation"
                    name="weddingLocation"
                    placeholder="City, Venue"
                    value={formData.weddingLocation}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 h-11 bg-white/50 border-wedding-gold/20 focus:border-wedding-gold"
                  />
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-wedding-navy">
                  Create Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="pl-10 pr-10 h-11 bg-white/50 border-wedding-gold/20 focus:border-wedding-gold"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-wedding-gold/60 hover:text-wedding-gold"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-wedding-navy/60">Password strength:</span>
                      <span className="text-xs font-medium" style={{ color: passwordStrength >= 4 ? '#10B981' : passwordStrength >= 3 ? '#3B82F6' : passwordStrength >= 2 ? '#F59E0B' : '#EF4444' }}>
                        {getStrengthLabel()}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength * 25}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-wedding-navy">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="pl-10 pr-10 h-11 bg-white/50 border-wedding-gold/20 focus:border-wedding-gold"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-wedding-gold/60 hover:text-wedding-gold"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gradient-to-br from-wedding-gold/5 to-wedding-blush/5 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-wedding-navy">Password Requirements:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { check: formData.password.length >= 6, text: 'At least 6 characters' },
                  { check: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
                  { check: /[0-9]/.test(formData.password), text: 'One number' },
                  { check: /[^A-Za-z0-9]/.test(formData.password), text: 'One special character' },
                ].map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {req.check ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-wedding-navy/20" />
                    )}
                    <span className={`text-xs ${req.check ? 'text-green-600' : 'text-wedding-navy/60'}`}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-11 font-semibold bg-gradient-to-r from-wedding-gold to-wedding-blush hover:shadow-lg hover:scale-[1.02] transition-all duration-200 mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Creating Your Account...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Your Wedding Journey
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-6">
          {/* Already have account */}
          <div className="text-sm text-center text-wedding-navy/60 pt-4 border-t border-wedding-gold/10 w-full">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-wedding-gold hover:text-wedding-gold/80 font-semibold transition-colors"
            >
              Sign in here
            </Link>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-wedding-navy/40">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-wedding-gold hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-wedding-gold hover:underline">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Wedding Countdown Preview */}
      {formData.weddingDate && (
        <div className="bg-gradient-to-r from-wedding-gold/10 via-wedding-blush/5 to-wedding-champagne/10 p-4 rounded-lg border border-wedding-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-wedding-navy">Your Wedding Countdown:</p>
              <p className="text-xs text-wedding-navy/60">
                {new Date(formData.weddingDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-display font-bold text-wedding-gold">
                {Math.ceil((new Date(formData.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
              </p>
              <p className="text-xs text-wedding-navy/60">days to go!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}