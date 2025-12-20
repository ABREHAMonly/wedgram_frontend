// src/app/auth/layout.tsx
import { Suspense } from 'react'
import { Heart, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative/Info Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-wedding-gold/10 via-wedding-blush/5 to-wedding-champagne/10 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-wedding-gold/5 to-wedding-blush/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-wedding-sage/5 to-wedding-champagne/5 rounded-full blur-3xl" />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-24 h-24 border border-wedding-gold/20 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/3 w-16 h-16 border border-wedding-blush/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 border border-wedding-sage/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-wedding-gold to-wedding-blush rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-12 w-12 bg-gradient-to-br from-wedding-gold to-wedding-blush rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-cursive text-3xl text-wedding-navy">WedGram</span>
              <span className="text-sm text-wedding-navy/60 font-serif tracking-wider">Where love meets planning</span>
            </div>
          </Link>

          {/* Features List */}
          <div className="max-w-md space-y-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-wedding-navy mb-4">
                Create Your Perfect<br />
                <span className="wedding-text">Wedding Experience</span>
              </h2>
              <p className="text-wedding-navy/70 font-serif">
                Join thousands of couples who have made their wedding planning stress-free and beautiful.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: '✨', text: 'Beautiful invitation designs' },
                { icon: '📋', text: 'Easy guest management' },
                { icon: '📊', text: 'Real-time RSVP tracking' },
                { icon: '🎨', text: 'Fully customizable themes' },
                { icon: '🔒', text: 'Secure & private' },
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-wedding-gold/10 to-wedding-blush/10 flex items-center justify-center">
                    <span className="text-wedding-gold">{feature.icon}</span>
                  </div>
                  <span className="text-wedding-navy/80">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div>
            <div className="flex items-center space-x-2 text-sm text-wedding-navy/60">
              <Sparkles className="h-4 w-4 text-wedding-gold" />
              <span>Made with love for couples worldwide</span>
            </div>
            <p className="text-xs text-wedding-navy/40 mt-2">
              Your love story starts here. Every detail matters.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-wedding-champagne/5">
        {/* Mobile header */}
        <div className="lg:hidden p-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-wedding-gold to-wedding-blush rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-10 w-10 bg-gradient-to-br from-wedding-gold to-wedding-blush rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-cursive text-2xl text-wedding-navy">WedGram</span>
              <span className="text-xs text-wedding-navy/60 font-serif tracking-wider">Where love meets planning</span>
            </div>
          </Link>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            <Suspense fallback={
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            }>
              {children}
            </Suspense>
          </div>
        </div>

        {/* Mobile footer */}
        <div className="lg:hidden p-6 text-center">
          <p className="text-sm text-wedding-navy/60">
            Your data is protected with bank-level security
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            {['💍', '✨', '💕', '🎉'].map((emoji, i) => (
              <span 
                key={i}
                className="text-xl animate-float"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}