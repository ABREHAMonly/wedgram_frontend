// src/app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, Heart, Sparkles, Key } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await login(email, password, rememberMe)
    } catch (error) {
      // Error is already handled in the auth hook
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setEmail('test@example.com')
    setPassword('12121212')
    toast.info('Demo credentials loaded. Click Login to continue.', {
      icon: '🎭',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-wedding-gold/10 to-wedding-blush/10 mb-2">
          <Key className="h-6 w-6 text-wedding-gold" />
        </div>
        <h1 className="text-2xl font-display font-bold text-wedding-navy">
          Welcome Back
        </h1>
        <p className="text-wedding-navy/60">
          Sign in to continue your wedding planning journey
        </p>
      </div>

      {/* Login Form */}
      <Card className="border-wedding-gold/20 shadow-elegant overflow-hidden">
        <div className="bg-gradient-to-r from-wedding-gold/5 via-wedding-blush/5 to-wedding-champagne/5 p-1">
          <div className="h-1 bg-gradient-to-r from-wedding-gold to-wedding-blush" />
        </div>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-wedding-navy">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 h-11 bg-white/50 border-wedding-gold/20 focus:border-wedding-gold"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium text-wedding-navy">
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-wedding-gold hover:text-wedding-gold/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-gold/60" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>
            
            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={loading}
                className="border-wedding-gold/30 data-[state=checked]:bg-wedding-gold data-[state=checked]:border-wedding-gold"
              />
              <Label htmlFor="remember" className="text-sm text-wedding-navy/70 cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full h-11 font-semibold bg-gradient-to-r from-wedding-gold to-wedding-blush hover:shadow-lg hover:scale-[1.02] transition-all duration-200 mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Sign In to Dashboard
                </>
              )}
            </Button>
          </form>
        </CardContent>

        {/* Divider */}
        <div className="relative px-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-wedding-gold/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-wedding-navy/50">
              Quick options
            </span>
          </div>
        </div>

        <CardFooter className="flex flex-col space-y-3 pt-6">
          {/* Demo Account Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 border-wedding-gold/30 text-wedding-navy hover:border-wedding-gold hover:bg-wedding-gold/5 transition-all duration-200"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <Sparkles className="mr-2 h-4 w-4 text-wedding-gold" />
            Try Demo Account
          </Button>

          {/* Register Link */}
          <div className="text-sm text-center text-wedding-navy/60 pt-4 border-t border-wedding-gold/10">
            New to WedGram?{' '}
            <Link
              href="/auth/register"
              className="text-wedding-gold hover:text-wedding-gold/80 font-semibold transition-colors"
            >
              Create your wedding account
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Additional Info */}
      <div className="text-center">
        <p className="text-xs text-wedding-navy/40">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-wedding-gold hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-wedding-gold hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}