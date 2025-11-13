import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authApi } from '../services/api'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthProvider - useEffect called')
    const token = localStorage.getItem('token')
    console.log('AuthProvider - token from localStorage:', token ? 'exists' : 'none')

    if (token) {
      console.log('AuthProvider - Calling getProfile API')
      authApi.getProfile()
        .then((userData) => {
          console.log('AuthProvider - User data received:', userData)
          setUser(userData)
        })
        .catch((error) => {
          console.error('AuthProvider - Error getting profile:', error)
          localStorage.removeItem('token')
        })
        .finally(() => {
          console.log('AuthProvider - Setting loading to false')
          setLoading(false)
        })
    } else {
      console.log('AuthProvider - No token, setting loading to false')
      setLoading(false)
    }
  }, [])

  const login = (token: string, userData: User) => {
    console.log('useAuth - login called with:', { token: token.substring(0, 20) + '...', userData })
    localStorage.setItem('token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}