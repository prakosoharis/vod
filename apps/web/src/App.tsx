import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import { useAuthStore } from '@/stores/authStore'

function App() {
  const { checkAuth, isAuthenticated, isLoading, token, hasHydrated } = useAuthStore()

  useEffect(() => {
    console.log('🚀 [App] App component mounted');
    console.log('🔑 [App] Current state:', { hasToken: !!token, hasHydrated, isAuthenticated, isLoading });

    // Check auth only after Zustand has hydrated
    if (hasHydrated) {
      console.log('✅ [App] Store hydrated, checking auth...');
      checkAuth()
    } else {
      console.log('⏳ [App] Store not hydrated yet, waiting...');
    }
  }, [checkAuth, token, hasHydrated])

  // Set up an interval to check for hydration completion
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hasHydrated) {
        console.log('⏳ [App] Still waiting for hydration...');
      } else {
        console.log('✅ [App] Hydration completed');
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [hasHydrated]);

  console.log('📊 [App] Final auth state:', { isAuthenticated, isLoading, hasToken: !!token, hasHydrated });

  return <AppRoutes />
}

export default App
