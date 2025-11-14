import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'

interface UserMenuProps {
  onLogout?: () => void
}

const UserMenu: React.FC<UserMenuProps> = ({ onLogout }) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    onLogout?.()
    navigate('/')
  }

  const getUserInitial = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getDisplayName = () => {
    if (user?.full_name) {
      return user.full_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 text-white hover:text-red-500 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
      >
        {/* User Avatar */}
        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {getUserInitial()}
          </span>
        </div>

        {/* User Name (Desktop only) */}
        <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
          {getDisplayName()}
        </span>

        {/* Dropdown Arrow */}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
          showDropdown ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-black/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50">
          {/* User Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {getUserInitial()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {getDisplayName()}
                </p>
                <p className="text-gray-400 text-sm truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setShowDropdown(false)
                navigate('/my-list')
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-white hover:bg-white/10 transition-colors duration-200"
            >
              <User className="w-4 h-4" />
              <span>My List</span>
            </button>

            <button
              onClick={() => {
                setShowDropdown(false)
                // Navigate to settings when implemented
                console.log('Settings clicked')
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-white hover:bg-white/10 transition-colors duration-200"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <div className="border-t border-white/10 my-2" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu