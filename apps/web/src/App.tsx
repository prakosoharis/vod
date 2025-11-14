import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import { useAuthStore } from '@/stores/authStore'

function App() {
  const { checkAuth, token, hasHydrated } = useAuthStore()

  useEffect(() => {
    // Check auth only after Zustand has hydrated
    if (hasHydrated) {
      checkAuth()
    }
  }, [checkAuth, token, hasHydrated])

  
  return <AppRoutes />
}

export default App
