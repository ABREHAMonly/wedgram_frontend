// src/lib/hooks/use-gifts.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { giftsApi } from '@/lib/api/gifts'
import { GiftItem, GiftStats } from '@/types'

export const useGifts = () => {
  const queryClient = useQueryClient()

  const giftsQuery = useQuery({
    queryKey: ['gifts'],
    queryFn: () => giftsApi.getGifts(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const statsQuery = useQuery({
    queryKey: ['gifts', 'stats'],
    queryFn: () => giftsApi.getStats(),
    staleTime: 2 * 60 * 1000,
  })

  const createGift = useMutation({
    mutationFn: giftsApi.createGift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] })
      queryClient.invalidateQueries({ queryKey: ['gifts', 'stats'] })
    },
  })

  const updateGift = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GiftItem> }) => 
      giftsApi.updateGift(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] })
      queryClient.invalidateQueries({ queryKey: ['gifts', 'stats'] })
    },
  })

  const deleteGift = useMutation({
    mutationFn: giftsApi.deleteGift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] })
      queryClient.invalidateQueries({ queryKey: ['gifts', 'stats'] })
    },
  })

  return {
    gifts: giftsQuery.data || [],
    stats: statsQuery.data,
    isLoading: giftsQuery.isLoading,
    isError: giftsQuery.isError,
    error: giftsQuery.error,
    createGift: createGift.mutateAsync,
    isCreating: createGift.isPending,
    updateGift: updateGift.mutateAsync,
    isUpdating: updateGift.isPending,
    deleteGift: deleteGift.mutateAsync,
    isDeleting: deleteGift.isPending,
    refetchGifts: giftsQuery.refetch,
  }
}