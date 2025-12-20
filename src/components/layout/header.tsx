// src/components/layout/header.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Heart, Menu, X, Sparkles, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
  ]

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled 
        ? "bg-white/90 backdrop-blur-md border-b border-wedding-gold/10 shadow-soft py-3"
        : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-wedding-gold to-wedding-blush rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-10 w-10 bg-gradient-to-br from-wedding-gold to-wedding-blush rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-cursive text-2xl text-wedding-navy leading-none">WedGram</span>
              <span className="text-xs text-wedding-navy/60 font-serif tracking-wider">Where love meets planning</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-wedding-gold relative group",
                  pathname === item.href || (item.href.startsWith('#') && pathname === '/') 
                    ? "text-wedding-gold" 
                    : "text-wedding-navy/80"
                )}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-wedding-gold to-wedding-blush transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Auth Buttons - Always show Sign Up/Login since we're on public pages */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button asChild variant="ghost" className="text-wedding-navy hover:bg-wedding-blush/20">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-wedding-gold to-wedding-blush hover:shadow-lg hover:scale-105 transition-all duration-200">
              <Link href="/auth/register" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Get Started Free
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-wedding-navy hover:text-wedding-gold transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4">
            <div className="space-y-3 bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-wedding-gold/20 shadow-elegant">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block px-4 py-3 text-base font-medium rounded-lg transition-colors",
                    pathname === item.href || (item.href.startsWith('#') && pathname === '/')
                      ? "bg-gradient-to-r from-wedding-gold/10 to-wedding-blush/20 text-wedding-gold"
                      : "text-wedding-navy hover:bg-wedding-blush/10"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-3 border-t border-wedding-gold/20">
                <Button asChild variant="outline" className="w-full border-wedding-gold/30 text-wedding-navy">
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full bg-gradient-to-r from-wedding-gold to-wedding-blush">
                  <Link href="/auth/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Get Started Free
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}