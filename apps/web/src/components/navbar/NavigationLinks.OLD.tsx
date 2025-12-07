import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Radio } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'

interface NavigationLinksProps {
  isAuthenticated: boolean
  onLinkClick?: () => void
  className?: string
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({
  isAuthenticated,
  onLinkClick,
  className = ''
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleLinkClick = () => {
    onLinkClick?.()
  }

  const handleLiveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setShowAuthModal(true)
    } else {
      // Navigate to live page
      window.location.href = '/live'
    }
  }

  return (
    <>
      <div className={`flex items-center space-x-0 ${className}`}>
        <Link
          to="/browse"
          className="text-white hover:text-red-500 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-white/10"
          onClick={handleLinkClick}
        >
          Browse
        </Link>

        {isAuthenticated && (
          <Link
            to="/my-list"
            className="text-white hover:text-red-500 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-white/10"
            onClick={handleLinkClick}
          >
            My List
          </Link>
        )}

        <button
          onClick={handleLiveClick}
          className="flex items-center text-white hover:text-red-500 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-white/10 bg-red-600/20"
        >
          <Radio className="w-4 h-4 mr-2" />
          Live
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login untuk Mengakses Live"
        subtitle="Nikmati streaming langsung dengan akun Anda"
      />
    </>
  )
}

export default NavigationLinks