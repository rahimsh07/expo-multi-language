import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 1 day
      retry: 1, // retry once on failure
      refetchOnWindowFocus: false, // mobile apps usually don't need this
    },
  },
});

