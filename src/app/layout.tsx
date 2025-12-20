// src/app/layout.tsx
'use client' // Add this at the top

import type { Metadata } from 'next'
import { Inter, Playfair_Display, Great_Vibes, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import { NetworkStatus } from '@/components/shared/network-status'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { usePathname } from 'next/navigation'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-cursive',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

// Note: Metadata needs to be in a server component, so we'll move it to page.tsx
// Or keep it here and use generateMetadata function if needed

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  
  // Determine if we should show Header & Footer
  const shouldShowHeaderFooter = () => {
    // Don't show on these paths
    if (pathname.startsWith('/auth')) return false
    if (pathname.startsWith('/dashboard')) return false
    // Show on all other pages (home, about, contact, etc.)
    return true
  }

  const showHeaderFooter = shouldShowHeaderFooter()

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${greatVibes.variable} ${cormorant.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#F8E5E5" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <title>WedGram - Create Beautiful Wedding Invitations & Manage Your Big Day</title>
        <meta name="description" content="Design stunning digital wedding invitations, track RSVPs, and manage your guest list all in one elegant platform. Make your wedding planning stress-free and beautiful." />
        <meta name="keywords" content="wedding invitations, wedding planning, RSVP tracker, digital invitations, wedding website, guest management" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content="https://wedgram.com" />
        <meta property="og:title" content="WedGram - Beautiful Wedding Invitations & Planning" />
        <meta property="og:description" content="Create stunning digital wedding invitations and manage your entire wedding planning in one beautiful platform." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="WedGram Wedding Invitations" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="WedGram - Beautiful Wedding Invitations & Planning" />
        <meta name="twitter:description" content="Create stunning digital wedding invitations and manage your entire wedding planning in one beautiful platform." />
        <meta name="twitter:image" content="/og-image.png" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-gradient-to-br from-wedding-champagne/10 via-white to-wedding-blush/10`}>
        <Providers>
          {/* Background decorative elements - Always show */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-wedding-gold/5 to-wedding-blush/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-wedding-sage/5 to-wedding-champagne/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-wedding-gold/3 via-transparent to-wedding-blush/3 blur-3xl rounded-full" />
          </div>
          
          {/* Floating decorative elements - Always show */}
          <div className="fixed top-20 left-10 w-4 h-4 bg-wedding-gold/20 rounded-full animate-float pointer-events-none" />
          <div className="fixed top-40 right-20 w-6 h-6 bg-wedding-blush/20 rounded-full animate-float pointer-events-none" style={{ animationDelay: '1s' }} />
          <div className="fixed bottom-40 left-20 w-8 h-8 bg-wedding-sage/20 rounded-full animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
          
          {/* Conditionally render Header */}
          {showHeaderFooter && <Header />}
          
          <main className="flex-1">
            {children}
          </main>
          
          {/* Conditionally render Footer */}
          {showHeaderFooter && <Footer />}
          
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              className: 'font-sans backdrop-blur-sm',
              style: {
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
              },
            }}
          />
          <NetworkStatus />
        </Providers>
      </body>
    </html>
  )
}