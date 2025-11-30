import { useNavigate } from 'react-router-dom'
import { Menu, X, Search } from 'lucide-react'

// Import custom hooks and store
import useNavbar from '@/hooks/useNavbar'
import { useAuthStore } from '@/stores/authStore'

// Import components
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
    closeSearch
  } = useNavbar()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/95 backdrop-blur-md shadow-lg border-b border-white/10'
            : 'bg-black/70 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Logo onClick={closeMenu} />

            {/* Desktop Navigation Links */}
            <div className="hidden md:block">
              <NavigationLinks isAuthenticated={isAuthenticated} />
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Search Button */}
              <button
                onClick={toggleSearch}
                className="text-white hover:text-red-500 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Auth Section */}
              {isAuthenticated ? (
                <UserMenu onLogout={handleLogout} />
              ) : (
                <AuthButtons onLinkClick={closeMenu} />
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-white p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar Overlay */}
        <SearchBar isOpen={showSearch} onClose={closeSearch} />

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-lg transition-all duration-300">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation Links */}
              <NavigationLinks
                isAuthenticated={isAuthenticated}
                onLinkClick={closeMenu}
                className="flex-col space-y-2"
              />

              {/* Mobile Search */}
              <div className="border-b border-gray-700 pb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search movies, TV shows..."
                    className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <div className="space-y-4">
                  <UserMenu onLogout={handleLogout} />
                </div>
              ) : (
                <div className="space-y-3">
                  <AuthButtons
                    onLinkClick={closeMenu}
                    className="flex-col space-y-3"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content overlap */}
      <div className="h-20" />
    </>
  )
}

export default Navbar