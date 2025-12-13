import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calendar, Film, Armchair, Sparkles } from 'lucide-react'
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

  const handleProtectedClick = (e: React.MouseEvent, _path: string) => {
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

  const linkBaseClass = "group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-semibold transition-all duration-300"
  const activeLinkClass = "bg-accent-500 text-cream-50 shadow-coffee-glow"
  const inactiveLinkClass = "text-cream-100 hover:text-cream-50 hover:bg-warm-charcoal-50"

  return (
    <>
      <nav className={`flex items-center gap-2 ${className}`}>
        {/* TONIGHT - Homepage/Live events */}
        <Link
          to="/"
          className={`${linkBaseClass} ${isActive('/') ? activeLinkClass : inactiveLinkClass}`}
          onClick={handleLinkClick}
        >
          <Sparkles className="w-5 h-5" />
          <span>TONIGHT</span>
          {isActive('/') && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-cream-50 rounded-full" />
          )}
        </Link>

        {/* UPCOMING - Calendar/Future events */}
        <Link
          to="/upcoming"
          className={`${linkBaseClass} ${isActive('/upcoming') ? activeLinkClass : inactiveLinkClass}`}
          onClick={handleLinkClick}
        >
          <Calendar className="w-5 h-5" />
          <span>UPCOMING</span>
          {isActive('/upcoming') && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-cream-50 rounded-full" />
          )}
        </Link>

        {/* CINEMA - Browse/VOD Library */}
        <Link
          to="/browse"
          className={`${linkBaseClass} ${isActive('/browse') ? activeLinkClass : inactiveLinkClass}`}
          onClick={handleLinkClick}
        >
          <Film className="w-5 h-5" />
          <span>CINEMA</span>
          {isActive('/browse') && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-cream-50 rounded-full" />
          )}
        </Link>

        {/* MY SEAT - Watchlist (protected) */}
        <Link
          to="/my-list"
          className={`${linkBaseClass} ${isActive('/my-list') ? activeLinkClass : inactiveLinkClass}`}
          onClick={(e) => handleProtectedClick(e, '/my-list')}
        >
          <Armchair className="w-5 h-5" />
          <span>MY SEAT</span>
          {isActive('/my-list') && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-cream-50 rounded-full" />
          )}
        </Link>
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
