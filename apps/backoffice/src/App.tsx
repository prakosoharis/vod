import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AuthProvider } from './hooks/useAuth'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Movies from './pages/Movies'
import Uploads from './pages/Uploads'
import Login from './pages/Login'
import Publishers from './pages/Publishers'
import StaffUsers from './pages/StaffUsers'

function RoleRoute({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user } = useAuth()
  return user?.role && roles.includes(user.role) ? <>{children}</> : <Navigate to="/movies" replace />
}

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to={user?.role === 'PUBLISHER' ? '/movies' : '/dashboard'} replace /> : <Login />
        }
      />
      <Route path="/" element={
        isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />
      }>
        <Route path="dashboard" element={<RoleRoute roles={['SUPERUSER','ADMIN']}><Dashboard /></RoleRoute>} />
        <Route path="users" element={<RoleRoute roles={['SUPERUSER','ADMIN']}><Users /></RoleRoute>} />
        <Route path="movies" element={<Movies />} />
        <Route path="uploads" element={<RoleRoute roles={['SUPERUSER','ADMIN']}><Uploads /></RoleRoute>} />
        <Route path="publishers" element={<RoleRoute roles={['SUPERUSER','ADMIN']}><Publishers /></RoleRoute>} />
        <Route path="staff" element={<RoleRoute roles={['SUPERUSER']}><StaffUsers /></RoleRoute>} />
        <Route index element={<Navigate to={user?.role === 'PUBLISHER' ? '/movies' : '/dashboard'} replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
