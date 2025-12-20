// src/app/dashboard/page.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, CheckCircle, Clock, TrendingUp, Mail, Bell } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalGuests: 0,
    rsvpsReceived: 0,
    pendingInvitations: 0,
    daysToWedding: user?.weddingDate 
      ? Math.ceil((new Date(user.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0,
  })

  // Simulate loading stats
  useEffect(() => {
    // In a real app, you would fetch these from an API
    const timer = setTimeout(() => {
      setStats(prev => ({
        ...prev,
        totalGuests: 0,
        rsvpsReceived: 0,
        pendingInvitations: 0,
      }))
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  const statCards = [
    {
      title: 'Total Guests',
      value: stats.totalGuests,
      icon: <Users className="h-5 w-5" />,
      color: 'from-blue-500 to-blue-600',
      change: '+0%',
      href: '/dashboard/guests'
    },
    {
      title: 'RSVPs Received',
      value: stats.rsvpsReceived,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'from-green-500 to-green-600',
      change: '+0%',
      href: '/dashboard/invites?status=accepted'
    },
    {
      title: 'Pending Invitations',
      value: stats.pendingInvitations,
      icon: <Clock className="h-5 w-5" />,
      color: 'from-yellow-500 to-yellow-600',
      change: '0%',
      href: '/dashboard/invites?status=pending'
    },
    {
      title: 'Days to Wedding',
      value: stats.daysToWedding,
      icon: <Calendar className="h-5 w-5" />,
      color: 'from-purple-500 to-purple-600',
      change: null,
      href: '/dashboard/settings/wedding'
    },
  ]

  const steps = [
    { id: 1, label: 'Profile Setup', completed: true },
    { id: 2, label: 'Wedding Details', completed: !!user?.weddingDate },
    { id: 3, label: 'Guest List', completed: stats.totalGuests > 0 },
    { id: 4, label: 'Invitations Sent', completed: stats.pendingInvitations === 0 && stats.totalGuests > 0 },
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const progress = (completedSteps / steps.length) * 100

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Only shows on dashboard home page */}
      <div className="bg-gradient-to-r from-wedding-gold/10 via-wedding-blush to-wedding-sage/20 rounded-2xl p-6 border border-wedding-gold/20 shadow-elegant">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-wedding-navy mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-wedding-navy/70 font-sans">
              {user?.weddingDate ? (
                <>
                  <span className="font-semibold text-wedding-gold">
                    {Math.ceil((new Date(user.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                  </span>{' '}
                  days until your special day! ✨
                </>
              ) : (
                'Let\'s start planning your perfect wedding 💍'
              )}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            {/* Wedding Progress Component */}
            <div className="w-full max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-wedding-navy">Wedding Progress</span>
                <span className="text-sm font-semibold text-wedding-gold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 mb-4 bg-wedding-blush/30" />
              
              <div className="grid grid-cols-4 gap-2">
                {steps.map((step) => (
                  <div key={step.id} className="text-center">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-1 ${
                      step.completed 
                        ? 'bg-green-100 text-green-600 border border-green-200' 
                        : 'bg-wedding-blush/30 text-wedding-navy/40 border border-wedding-gold/20'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-wedding-gold/40" />
                      )}
                    </div>
                    <div className="text-xs text-wedding-navy truncate">{step.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-in"
                  style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-wedding-navy">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-wedding-navy">{stat.value}</div>
                {stat.change && (
                  <div className="flex items-center text-xs text-wedding-navy/60 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    <span>{stat.change} from last week</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-wedding-gold" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-wedding-blush/20">
                <div className="h-8 w-8 rounded-full bg-wedding-gold/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-wedding-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-wedding-navy">No recent activity yet</p>
                  <p className="text-xs text-wedding-navy/60">Start by adding your first guest!</p>
                </div>
              </div>
              <div className="text-center py-8">
                <p className="text-wedding-navy/60">Your wedding planning activity will appear here</p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/invites/create">
                    <Mail className="mr-2 h-4 w-4" />
                    Create First Invitation
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/dashboard/invites">
                <Button variant="outline" className="w-full justify-start border-wedding-gold/20 hover:bg-wedding-blush/20">
                  <Users className="mr-2 h-4 w-4 text-wedding-gold" />
                  View Guest List
                </Button>
              </Link>
              <Link href="/dashboard/invites/create">
                <Button variant="outline" className="w-full justify-start border-wedding-gold/20 hover:bg-wedding-blush/20">
                  <Mail className="mr-2 h-4 w-4 text-wedding-gold" />
                  Add New Guests
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full justify-start border-wedding-gold/20 hover:bg-wedding-blush/20">
                  <Calendar className="mr-2 h-4 w-4 text-wedding-gold" />
                  Wedding Settings
                </Button>
              </Link>
              <Link href="/dashboard/notifications">
                <Button variant="outline" className="w-full justify-start border-wedding-gold/20 hover:bg-wedding-blush/20">
                  <Bell className="mr-2 h-4 w-4 text-wedding-gold" />
                  View Notifications
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}