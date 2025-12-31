// src/components/calendar/calendar-view.tsx (if doesn't exist)
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Clock } from 'lucide-react'
import { useSchedule } from '@/lib/hooks/use-schedule'
import { cn } from '@/lib/utils'

export default function CalendarView() {
  const { schedule } = useSchedule()

  return (
    <Card className="border-wedding-gold/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-wedding-gold" />
          Wedding Schedule
        </CardTitle>
        <Clock className="h-5 w-5 text-wedding-navy/40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedule.slice(0, 5).map((event, index) => (
            <div 
              key={event._id || index} 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-wedding-blush/20 transition-colors"
            >
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-sm font-medium text-wedding-gold">{event.time}</div>
                <div className={cn(
                  "text-xs px-2 py-1 rounded-full mt-1",
                  event.status === 'confirmed' ? "bg-green-100 text-green-800" :
                  event.status === 'completed' ? "bg-blue-100 text-blue-800" :
                  "bg-amber-100 text-amber-800"
                )}>
                  {event.status}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-wedding-navy">{event.event}</h4>
                {event.description && (
                  <p className="text-sm text-wedding-navy/60 mt-1">{event.description}</p>
                )}
                {event.location && (
                  <div className="flex items-center gap-1 text-xs text-wedding-navy/40 mt-2">
                    📍 {event.location}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {schedule.length === 0 && (
            <div className="text-center py-8 text-wedding-navy/40">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No events scheduled yet</p>
              <p className="text-sm mt-1">Add events to your wedding schedule</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

