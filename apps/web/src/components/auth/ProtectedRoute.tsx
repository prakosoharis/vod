import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, token, hasHydrated } = useAuthStore()
  const location = useLocation()

  // Show loading while store is hydrating or checking auth
  if (!hasHydrated || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/90">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
      </div>
    )
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
