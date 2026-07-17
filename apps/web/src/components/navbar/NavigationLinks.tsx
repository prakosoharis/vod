import { NavLink } from 'react-router-dom'

interface NavigationLinksProps {
  isAuthenticated: boolean
  onLinkClick?: () => void
  className?: string
}

const NavigationLinks = ({ isAuthenticated, onLinkClick, className = '' }: NavigationLinksProps) => (
  <nav className={`nusantara-links ${className}`}>
    <NavLink to="/" end onClick={onLinkClick}>Beranda</NavLink>
    <NavLink to="/browse" onClick={onLinkClick}>Jelajah</NavLink>
    <NavLink to="/live-events" onClick={onLinkClick}>Live</NavLink>
    {isAuthenticated && <NavLink to="/my-list" onClick={onLinkClick}>Daftar Saya</NavLink>}
  </nav>
)

export default NavigationLinks
