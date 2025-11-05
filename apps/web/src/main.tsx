import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

// React Query DevTools (optional - install @tanstack/react-query-devtools to use)
// Lazy load to avoid breaking build if package is not installed
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      // @ts-expect-error - Optional package, may not be installed
      import('@tanstack/react-query-devtools')
        .then((res) => ({ default: res.ReactQueryDevtools }))
        .catch(() => ({ default: (_props: { initialIsOpen?: boolean }) => null }))
    )
  : null

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime in v4)
      retry: 1,
    },
  },
})

// Ensure dark mode is enabled by default
document.documentElement.classList.add('dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        {ReactQueryDevtools && (
          <Suspense fallback={null}>
            {/* @ts-expect-error - Optional package, may not be installed */}
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
