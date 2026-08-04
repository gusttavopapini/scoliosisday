// src/app/App.jsx
// Shell de nível mais alto. AuthProvider envolve todo o app.
// QueryClientProvider para TanStack Query, Toaster para notificações.


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import { router } from './router.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      gcTime: 1000 * 60 * 10, // 10 min (formerly cacheTime)
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster
        position="bottom-right"
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--surface-raised)',
            color: 'var(--text-heading)',
            border: 'var(--border-hairline)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
    </QueryClientProvider>
  );
}
