import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
  const location = useLocation()

  const handleLinkClick = () => {
    onLinkClick?.()
  }

  const handleProtectedClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      setShowAuthModal(true)
    } else {
      handleLinkClick()
    }
  }

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const linkClass = "px-5 py-2.5 text-base font-semibold rounded-xl transition-all duration-300"
  const activeClass = "bg-accent-500 text-cream-50 shadow-coffee-glow"
  const inactiveClass = "text-cream-100 hover:text-cream-50 hover:bg-warm-charcoal-50"

  return (
    <>
      <nav className={`flex items-center gap-2 ${className}`}>
        {/* BERANDA - Clear, everyone knows this */}
        <Link
          to="/"
          className={`${linkClass} ${isActive('/') ? activeClass : inactiveClass}`}
          onClick={handleLinkClick}
        >
          Beranda
        </Link>

        {/* JELAJAH - Browse content */}
        <Link
          to="/browse"
          className={`${linkClass} ${isActive('/browse') ? activeClass : inactiveClass}`}
          onClick={handleLinkClick}
        >
          Jelajah
        </Link>

        {/* LIVE - Live events */}
        <Link
          to="/live-events"
          className={`${linkClass} ${isActive('/live-events') ? activeClass : inactiveClass}`}
          onClick={handleLinkClick}
        >
          Live
        </Link>

        {/* DAFTAR SAYA - My watchlist (protected) */}
        {isAuthenticated && (
          <Link
            to="/my-list"
            className={`${linkClass} ${isActive('/my-list') ? activeClass : inactiveClass}`}
            onClick={handleProtectedClick}
          >
            Daftar Saya
          </Link>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login untuk Mengakses"
        subtitle="Daftar untuk menikmati semua fitur MOST"
      />
    </>
  )
}

export default NavigationLinks
