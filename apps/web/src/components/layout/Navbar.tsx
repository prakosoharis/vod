import { Bookmark, Grid2X2, Home, Menu, Radio, Search, UserRound, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import useNavbar from '@/hooks/useNavbar'
import { useAuthStore } from '@/stores/authStore'
import Logo from '@/components/navbar/Logo'
import NavigationLinks from '@/components/navbar/NavigationLinks'
import SearchBar from '@/components/navbar/SearchBar'
import UserMenu from '@/components/navbar/UserMenu'
import AuthButtons from '@/components/navbar/AuthButtons'

const Navbar = () => {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuthStore()
  const {
    isMenuOpen,
    isScrolled,
    showSearch,
    toggleMenu,
    closeMenu,
    toggleSearch,
    closeSearch,
  } = useNavbar()

  return (
    <>
      <header className={`nusantara-nav ${isScrolled ? 'is-solid' : ''}`}>
        <Logo onClick={closeMenu} />
        <div className="nusantara-nav__links">
          <NavigationLinks isAuthenticated={isAuthenticated} />
        </div>
        <div className="nusantara-nav__actions">
          <button className="nusantara-nav__round" onClick={toggleSearch} aria-label="Cari tayangan">
            <Search />
          </button>
          <div className="nusantara-nav__account">
            {isAuthenticated ? (
              <UserMenu onLogout={() => {
                logout()
                navigate('/')
              }} />
            ) : (
              <AuthButtons />
            )}
          </div>
          <button className="nusantara-nav__menu" onClick={toggleMenu} aria-label="Buka menu">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="nusantara-nav__mobile-menu">
            <NavigationLinks isAuthenticated={isAuthenticated} onLinkClick={closeMenu} className="is-mobile" />
            {!isAuthenticated && <AuthButtons onLinkClick={closeMenu} className="is-mobile" />}
          </div>
        )}
        <SearchBar isOpen={showSearch} onClose={closeSearch} />
      </header>
      <div className="nusantara-nav-spacer" />

      <nav className="nusantara-bottom-nav" aria-label="Navigasi utama mobile">
        <NavLink to="/"><Home /><span>Beranda</span></NavLink>
        <NavLink to="/browse"><Grid2X2 /><span>Jelajah</span></NavLink>
        <NavLink to="/live-events"><Radio /><span>Live</span></NavLink>
        <NavLink to={isAuthenticated ? '/my-list' : '/login'}><Bookmark /><span>Koleksi</span></NavLink>
        <NavLink to={isAuthenticated ? '/profile' : '/login'}><UserRound /><span>Profil</span></NavLink>
      </nav>
    </>
  )
}

export default Navbar
