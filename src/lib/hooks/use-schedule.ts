// src/lib/hooks/use-schedule.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleApi } from '@/lib/api/schedule'
import { ScheduleEvent } from '@/types'

export const useSchedule = () => {
  const queryClient = useQueryClient()

  const scheduleQuery = useQuery({
    queryKey: ['schedule'],
    queryFn: () => scheduleApi.getSchedule(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const addEvent = useMutation({
    mutationFn: scheduleApi.addEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] })
    },
  })

  const updateEvent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScheduleEvent> }) =>
      scheduleApi.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] })
    },
  })

  const deleteEvent = useMutation({
    mutationFn: scheduleApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] })
    },
  })

  return {
    schedule: scheduleQuery.data || [],
    isLoading: scheduleQuery.isLoading,
    isError: scheduleQuery.isError,
    error: scheduleQuery.error,
    addEvent: addEvent.mutateAsync,
    isAdding: addEvent.isPending,
    updateEvent: updateEvent.mutateAsync,
    isUpdating: updateEvent.isPending,
    deleteEvent: deleteEvent.mutateAsync,
    isDeleting: deleteEvent.isPending,
    refetchSchedule: scheduleQuery.refetch,
  }
}