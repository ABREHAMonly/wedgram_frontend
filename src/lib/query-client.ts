// src/lib/query-client.ts - Optimized QueryClient
import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        structuralSharing: true,
        networkMode: 'online',
      },
      mutations: {
        retry: 1,
        networkMode: 'online',
      },
    },
  });
