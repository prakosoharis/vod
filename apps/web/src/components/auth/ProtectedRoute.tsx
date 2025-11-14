import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, token, hasHydrated } = useAuthStore()

  console.log('🛡️ [ProtectedRoute] State:', { isAuthenticated, isLoading, hasToken: !!token, hasHydrated });

  // Show loading while store is hydrating or checking auth
  if (!hasHydrated || isLoading) {
    console.log('⏳ [ProtectedRoute] Showing loading spinner', { reason: !hasHydrated ? 'not hydrated' : 'loading' });
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/90">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
      </div>
    )
  }

  // Redirect to login if not authenticated and hydration is complete
  if (!isAuthenticated) {
    console.log('🚪 [ProtectedRoute] Redirecting to login');
    return <Navigate to="/login" replace />
  }

  console.log('✅ [ProtectedRoute] Rendering protected content');
  return <>{children}</>
}

export default ProtectedRoute
