// src/lib/hooks/use-wedding.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { weddingApi } from '@/lib/api/wedding'

export const useWedding = () => {
  const queryClient = useQueryClient()

  const weddingQuery = useQuery({
    queryKey: ['wedding'],
    queryFn: () => weddingApi.getWedding(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const createWedding = useMutation({
    mutationFn: weddingApi.createWedding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding'] })
    },
  })

  const updateWedding = useMutation({
    mutationFn: weddingApi.updateWedding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding'] })
    },
  })

  const checkWeddingExists = useQuery({
    queryKey: ['wedding', 'exists'],
    queryFn: () => weddingApi.checkWeddingExists(),
    staleTime: 60 * 1000,
  })

  return {
    wedding: weddingQuery.data,
    isLoading: weddingQuery.isLoading,
    isError: weddingQuery.isError,
    error: weddingQuery.error,
    createWedding: createWedding.mutateAsync,
    isCreating: createWedding.isPending,
    updateWedding: updateWedding.mutateAsync,
    isUpdating: updateWedding.isPending,
    weddingExists: checkWeddingExists.data,
    refetchWedding: weddingQuery.refetch,
  }
}

