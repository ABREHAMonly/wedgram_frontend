// src/lib/hooks/use-guests.ts
'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { guestApi } from '@/lib/api/guest'

export const useGuests = (params?: { page?: number; limit?: number; status?: string }) => {
  const queryClient = useQueryClient()

  const guestsQuery = useQuery({
    queryKey: ['guests', params],
    queryFn: () => guestApi.getGuests(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  const guestsInfiniteQuery = useInfiniteQuery({
    queryKey: ['guests', 'infinite'],
    queryFn: ({ pageParam = 1 }) => 
      guestApi.getGuests({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
  })

  const createGuests = useMutation({
    mutationFn: guestApi.createGuests,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] })
    },
  })

  const sendInvitations = useMutation({
    mutationFn: guestApi.sendInvitations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] })
    },
  })

  return {
    guests: guestsQuery.data?.guests || [],
    meta: guestsQuery.data?.meta,
    isLoading: guestsQuery.isLoading,
    isError: guestsQuery.isError,
    error: guestsQuery.error,
    createGuests: createGuests.mutateAsync,
    isCreating: createGuests.isPending,
    sendInvitations: sendInvitations.mutateAsync,
    isSending: sendInvitations.isPending,
    refetchGuests: guestsQuery.refetch,
    // Infinite query
    infiniteGuests: guestsInfiniteQuery.data?.pages.flatMap(page => page.guests) || [],
    fetchNextPage: guestsInfiniteQuery.fetchNextPage,
    hasNextPage: guestsInfiniteQuery.hasNextPage,
    isFetchingNextPage: guestsInfiniteQuery.isFetchingNextPage,
  }
}