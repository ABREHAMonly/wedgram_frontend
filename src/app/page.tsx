// src/app/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowRight, CheckCircle, Users, Bell, Calendar, Heart, Sparkles, Star, 
  Gift, Camera, Mail, Shield, Zap, Infinity, Palette, MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function HomePage() {
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [howItWorksRef, howItWorksInView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const features = [
    {
      icon: <Palette className="h-8 w-8" />,
      title: 'Beautiful Designs',
      description: 'Choose from our collection of elegant, customizable wedding invitation templates',
      color: 'from-wedding-gold/20 to-wedding-blush/20',
      iconColor: 'text-wedding-gold',
      gradient: 'bg-gradient-to-br'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Guest Management',
      description: 'Easily manage your guest list and track RSVPs in real-time',
      color: 'from-wedding-sage/20 to-wedding-champagne/20',
      iconColor: 'text-wedding-sage',
      gradient: 'bg-gradient-to-br'
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: 'Smart Notifications',
      description: 'Automatic reminders and updates keep everyone informed',
      color: 'from-wedding-blush/20 to-wedding-gold/20',
      iconColor: 'text-wedding-blush',
      gradient: 'bg-gradient-to-br'
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Event Planning',
      description: 'Plan your wedding timeline and share details with guests',
      color: 'from-wedding-champagne/20 to-wedding-sage/20',
      iconColor: 'text-wedding-champagne',
      gradient: 'bg-gradient-to-br'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure & Private',
      description: 'Your wedding details are safe with enterprise-grade security',
      color: 'from-blue-100 to-indigo-100',
      iconColor: 'text-blue-600',
      gradient: 'bg-gradient-to-br'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Fast & Easy',
      description: 'Create stunning invitations in minutes, no design skills needed',
      color: 'from-amber-100 to-yellow-100',
      iconColor: 'text-amber-600',
      gradient: 'bg-gradient-to-br'
    },
  ]

  const testimonials = [
    {
      name: 'Sarah & Michael',
      wedding: 'June 2024 • New York',
      text: 'WedGram made our wedding planning so effortless. The invitations were absolutely stunning and our guests couldn’t stop complimenting them!',
      rating: 5,
      image: 'SM',
    },
    {
      name: 'James & Emily',
      wedding: 'August 2024 • California',
      text: 'Tracking RSVPs was a breeze. Our guests loved the beautiful digital invitations and the seamless RSVP experience.',
      rating: 5,
      image: 'JE',
    },
    {
      name: 'David & Jessica',
      wedding: 'October 2024 • Paris',
      text: 'The most beautiful wedding platform we found. The customization options are incredible and the support team is amazing!',
      rating: 5,
      image: 'DJ',
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'Create Your Wedding',
      description: 'Set up your wedding details, choose colors, and customize your theme',
      icon: <Heart className="h-6 w-6" />,
    },
    {
      number: '02',
      title: 'Add Your Guests',
      description: 'Import or add guests individually, organize by categories',
      icon: <Users className="h-6 w-6" />,
    },
    {
      number: '03',
      title: 'Send Invitations',
      description: 'Send beautiful digital invitations via email or social media',
      icon: <Mail className="h-6 w-6" />,
    },
    {
      number: '04',
      title: 'Track & Manage',
      description: 'Monitor RSVPs, send reminders, and manage your guest list',
      icon: <CheckCircle className="h-6 w-6" />,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden pt-8 lg:pt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-6xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-wedding-gold/20 shadow-soft mb-8 animate-in">
              <Sparkles className="h-4 w-4 text-wedding-gold" />
              <span className="text-sm font-medium text-wedding-navy">Trusted by 10,000+ happy couples</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6">
              <span className="block font-cursive text-5xl sm:text-6xl lg:text-8xl text-wedding-gold mb-2">
                Celebrate Your Love
              </span>
              <span className="block font-display text-3xl sm:text-4xl lg:text-5xl text-wedding-navy leading-tight">
                With Beautiful Digital<br className="hidden sm:block" /> Wedding Invitations
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl text-wedding-navy/70 mb-10 max-w-3xl mx-auto leading-relaxed font-serif">
              Create stunning wedding invitations, manage your guest list effortlessly, and 
              track RSVPs all in one beautiful platform. Make your special day unforgettable.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/auth/register" className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-wedding-gold to-wedding-blush rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                <Button 
                  size="lg" 
                  className="relative px-8 py-6 text-lg font-semibold group-hover:scale-105 transition-all duration-200 shadow-xl"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Planning Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-6 text-lg border-2 border-wedding-gold/30 text-wedding-navy hover:border-wedding-gold hover:bg-wedding-gold/5 transition-all duration-200"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { value: '10K+', label: 'Happy Couples', icon: <Heart className="h-4 w-4" /> },
                { value: '50K+', label: 'Invitations Sent', icon: <Mail className="h-4 w-4" /> },
                { value: '99%', label: 'Satisfaction Rate', icon: <Star className="h-4 w-4" /> },
                { value: '24/7', label: 'Support', icon: <Infinity className="h-4 w-4" /> },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-wedding-gold/10 shadow-soft"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="p-2 bg-gradient-to-br from-wedding-gold/10 to-wedding-blush/10 rounded-lg">
                      <div className="text-wedding-gold">{stat.icon}</div>
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-wedding-navy mb-1">{stat.value}</div>
                  <div className="text-sm text-wedding-navy/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-16 lg:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6 text-wedding-navy">
              Everything You Need for Your{' '}
              <span className="wedding-text">Perfect Wedding</span>
            </h2>
            <p className="text-lg lg:text-xl text-wedding-navy/70 max-w-3xl mx-auto font-serif">
              From stunning invitations to seamless guest management, we&apos;ve got every detail covered
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-wedding-gold/20 hover:border-wedding-gold/40 transition-all duration-300 hover:shadow-elegant group hover:-translate-y-1">
                  <div className={`absolute inset-0 ${feature.gradient} ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg`} />
                  <CardHeader className="relative">
                    <div className="mb-4">
                      <div className={`inline-flex p-3 rounded-xl bg-white border border-wedding-gold/20 ${feature.iconColor} shadow-soft group-hover:shadow-md transition-shadow`}>
                        {feature.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-display text-wedding-navy">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-wedding-navy/70">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" ref={howItWorksRef} className="py-16 lg:py-24 bg-gradient-to-b from-white to-wedding-champagne/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6 text-wedding-navy">
              Simple Steps to Your{' '}
              <span className="wedding-text">Dream Wedding</span>
            </h2>
            <p className="text-lg lg:text-xl text-wedding-navy/70 max-w-2xl mx-auto font-serif">
              Create beautiful wedding invitations and manage everything in just four easy steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connecting lines */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-wedding-gold/30 to-wedding-blush/30" />
                )}
                
                <div className="relative text-center p-8 bg-white rounded-2xl border border-wedding-gold/10 shadow-soft hover:shadow-elegant transition-all duration-300 group h-full">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-wedding-gold to-wedding-blush text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    {step.number}
                  </div>
                  <div className="mt-8 mb-6">
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-wedding-gold/10 to-wedding-blush/10 text-wedding-gold">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3 text-wedding-navy">{step.title}</h3>
                  <p className="text-wedding-navy/70">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6 text-wedding-navy">
              Love Stories from{' '}
              <span className="wedding-text">Happy Couples</span>
            </h2>
            <p className="text-lg lg:text-xl text-wedding-navy/70 max-w-2xl mx-auto font-serif">
              Join thousands of couples who made their wedding planning stress-free and beautiful
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="relative overflow-hidden border-wedding-gold/20 hover:border-wedding-gold/40 transition-all duration-300 group h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-wedding-gold/5 to-wedding-blush/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="p-6 relative">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-wedding-gold text-wedding-gold" />
                      ))}
                    </div>
                    <p className="text-wedding-navy/80 italic mb-6 text-lg font-serif leading-relaxed">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    <div className="flex items-center">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-wedding-gold to-wedding-blush flex items-center justify-center text-white font-bold text-xl mr-4 shadow-md">
                        {testimonial.image}
                      </div>
                      <div>
                        <div className="font-display font-semibold text-wedding-navy">{testimonial.name}</div>
                        <div className="text-sm text-wedding-navy/60 font-serif">{testimonial.wedding}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-wedding-gold/10 via-wedding-blush/10 to-wedding-champagne/10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center bg-white/90 backdrop-blur-sm rounded-3xl border border-wedding-gold/20 p-8 lg:p-12 shadow-2xl"
          >
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-wedding-gold/10 to-wedding-blush/10 mb-6">
              <Sparkles className="h-8 w-8 text-wedding-gold" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6 text-wedding-navy">
              Ready to Create Your Perfect<br />
              <span className="wedding-text">Wedding Experience?</span>
            </h2>
            <p className="text-lg lg:text-xl text-wedding-navy/70 mb-8 max-w-2xl mx-auto font-serif">
              Join thousands of couples who have made their wedding planning 
              stress-free and beautiful with WedGram.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="group">
                <Button 
                  size="lg" 
                  className="px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 bg-gradient-to-r from-wedding-gold to-wedding-blush"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Your Free Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-6 text-lg font-semibold border-2 border-wedding-gold/30 text-wedding-navy hover:border-wedding-gold hover:bg-wedding-gold/5 transition-all duration-200"
                >
                  Already Have Account?
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-wedding-navy/60">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}