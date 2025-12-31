//src\app\dashboard\stats-widget.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Mail, CheckCircle, Gift, Calendar, Heart } from 'lucide-react'
import { useGuests } from '@/lib/hooks/use-guests'
import { useWedding } from '@/lib/hooks/use-wedding'
import { useGifts } from '@/lib/hooks/use-gifts'
import { cn } from '@/lib/utils'

interface StatsWidgetProps {
  className?: string
}

export default function StatsWidget({ className }: StatsWidgetProps) {
  const { guests, meta } = useGuests()
  const { wedding } = useWedding()
  const { gifts, stats } = useGifts()

  const statsData = [
    {
      title: 'Total Guests',
      value: meta?.total || guests.length,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      description: 'Total invited guests',
    },
    {
      title: 'RSVPs Received',
      value: guests.filter(g => g.hasRSVPed).length,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
      description: 'Confirmed responses',
    },
    {
      title: 'Invitations Sent',
      value: guests.filter(g => g.invited).length,
      icon: Mail,
      color: 'bg-purple-500',
      change: '+5%',
      description: 'Invitations delivered',
    },
    {
      title: 'Days to Wedding',
      value: wedding?.date ? 
        Math.max(0, Math.ceil((new Date(wedding.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 
        0,
      icon: Calendar,
      color: 'bg-amber-500',
      change: '-1',
      description: 'Countdown',
    },
    {
      title: 'Gifts Received',
      value: stats?.purchased || 0,
      icon: Gift,
      color: 'bg-pink-500',
      change: '+3',
      description: 'Gifts purchased',
    },
    {
      title: 'Wedding Budget',
      value: '$12,450',
      icon: Heart,
      color: 'bg-red-500',
      change: 'On track',
      description: 'Total spending',
    },
  ]

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4', className)}>
      {statsData.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="border-wedding-gold/20 hover:border-wedding-gold/40 transition-all duration-300 hover:shadow-lg"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-wedding-navy/70">
              {stat.title}
            </CardTitle>
            <div className={cn('p-2 rounded-lg', stat.color)}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-wedding-navy">{stat.value}</div>
            <p className="text-xs text-wedding-navy/60 mt-1">
              {stat.description}
            </p>
            <div className="flex items-center mt-2">
              <span className={cn(
                'text-xs font-medium',
                stat.change.startsWith('+') ? 'text-green-600' : 
                stat.change.startsWith('-') ? 'text-red-600' : 'text-blue-600'
              )}>
                {stat.change}
              </span>
              <span className="text-xs text-wedding-navy/40 ml-2">
                from last month
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}