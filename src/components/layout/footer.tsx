// src/components/layout/footer.tsx
import Link from 'next/link'
import { Heart, Sparkles, Instagram, Facebook, Mail, Phone } from 'lucide-react'

export default function Footer() {
  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Templates', href: '#templates' },
    ],
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    Resources: [
      { name: 'Help Center', href: '/help' },
      { name: 'Wedding Planning Guide', href: '/guide' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
  }

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/wedgram' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/wedgram' },
    { name: 'Email', icon: Mail, href: 'mailto:hello@wedgram.com' },
  ]

  return (
    <footer className="relative bg-gradient-to-b from-white to-wedding-champagne/30 border-t border-wedding-gold/10 mt-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 left-1/4 w-64 h-64 bg-wedding-gold/5 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-1/4 w-48 h-48 bg-wedding-blush/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-wedding-gold to-wedding-blush rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-cursive text-3xl text-wedding-navy">WedGram</span>
                <p className="text-sm text-wedding-navy/60 font-serif">Where love meets planning</p>
              </div>
            </div>
            
            <p className="text-wedding-navy/70 max-w-md">
              Creating beautiful digital wedding invitations and making wedding planning 
              stress-free for couples around the world. Your perfect day starts here.
            </p>
            
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="h-10 w-10 rounded-full bg-white border border-wedding-gold/20 flex items-center justify-center text-wedding-navy hover:text-wedding-gold hover:border-wedding-gold hover:shadow-sm transition-all duration-200"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-serif font-semibold text-wedding-navy mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-wedding-navy/70 hover:text-wedding-gold transition-colors inline-flex items-center group"
                    >
                      <Sparkles className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-wedding-gold/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2 text-sm text-wedding-navy/60">
              <Heart className="h-4 w-4 text-wedding-gold" />
              <span>Made with love for couples worldwide</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-wedding-navy/60">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+2 (519) 512-17455</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@wedgram.com</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-wedding-navy/50">
            <p>© {new Date().getFullYear()} WedGram. All rights reserved. Your love story starts here.</p>
            <p className="mt-1">Beautiful wedding planning for beautiful couples.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}