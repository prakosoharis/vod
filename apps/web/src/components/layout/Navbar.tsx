import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const Navbar = () => {
  // Authentication state
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  // State for mobile menu, scroll detection, and dropdown
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Ref for dropdown click outside detection
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll detection effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu (used for link clicks)
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md shadow-lg border-b border-white/10'
          : 'bg-black/70 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl md:text-2xl font-bold text-[#e50914] hover:text-red-400 transition-colors duration-200"
            onClick={closeMenu}
          >
            StreamKita
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-0">
            <Link
              to="/"
              className="text-sm font-medium text-white/80 hover:text-white hover:underline px-4 py-2 transition-all duration-200"
            >
              Beranda
            </Link>
            <Link
              to="/browse"
              className="text-sm font-medium text-white/80 hover:text-white hover:underline px-4 py-2 transition-all duration-200"
            >
              Jelajah
            </Link>
            <a
              href="#pricing"
              className="text-sm font-medium text-white/80 hover:text-white hover:underline px-4 py-2 transition-all duration-200"
            >
              Harga
            </a>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center space-x-3">
                  {/* Search Icon */}
                  <button className="text-white/80 hover:text-white transition-colors duration-200">
                    <Search size={20} />
                  </button>

                  {/* User Avatar */}
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-10 h-10 rounded-full bg-[#e50914] flex items-center justify-center text-white font-semibold hover:bg-red-700 transition-colors duration-200"
                  >
                    {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </button>
                </div>

                {/* User Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-200"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profil
                    </Link>
                    <Link
                      to="/my-list"
                      className="block px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-200"
                      onClick={() => setShowDropdown(false)}
                    >
                      Daftar Saya
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-200"
                      onClick={() => setShowDropdown(false)}
                    >
                      Pengaturan Akun
                    </Link>
                    <div className="border-t border-gray-700 my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-200"
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button className="text-white font-medium px-6 py-2 rounded-md hover:bg-white/10 transition-colors duration-200">
                    Masuk
                  </button>
                </Link>
                <Link to="/register">
                  <button className="bg-[#e50914] text-white font-semibold px-6 py-2 rounded-md hover:bg-red-700 transition-colors duration-200">
                    Daftar
                  </button>
                </Link>
              </>
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

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-lg transition-all duration-300">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Nav Links */}
            <Link
              to="/"
              onClick={closeMenu}
              className="block w-full py-4 px-6 text-white hover:bg-white/10 transition-colors duration-200"
            >
              Beranda
            </Link>
            <Link
              to="/browse"
              onClick={closeMenu}
              className="block w-full py-4 px-6 text-white hover:bg-white/10 transition-colors duration-200"
            >
              Jelajah
            </Link>
            <a
              href="#pricing"
              onClick={closeMenu}
              className="block w-full py-4 px-6 text-white hover:bg-white/10 transition-colors duration-200"
            >
              Harga
            </a>

            {/* Mobile Auth Section */}
            {isAuthenticated ? (
              <div className="mt-6 space-y-4">
                {/* User Info */}
                <div className="px-4 py-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-[#e50914] flex items-center justify-center text-white font-bold">
                      {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {user?.full_name || user?.email || 'User'}
                      </p>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Menu Items */}
                <Link
                  to="/profile"
                  onClick={() => { closeMenu(); setShowDropdown(false); }}
                  className="block w-full py-3 px-4 text-white hover:bg-gray-800 transition-colors duration-200 rounded-lg"
                >
                  Profil
                </Link>
                <Link
                  to="/my-list"
                  onClick={() => { closeMenu(); setShowDropdown(false); }}
                  className="block w-full py-3 px-4 text-white hover:bg-gray-800 transition-colors duration-200 rounded-lg"
                >
                  Daftar Saya
                </Link>
                <Link
                  to="/settings"
                  onClick={() => { closeMenu(); setShowDropdown(false); }}
                  className="block w-full py-3 px-4 text-white hover:bg-gray-800 transition-colors duration-200 rounded-lg"
                >
                  Pengaturan Akun
                </Link>

                <div className="border-t border-gray-700 my-2" />

                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="w-full py-3 px-4 text-white hover:bg-gray-800 transition-colors duration-200 rounded-lg text-left"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <Link to="/login" onClick={closeMenu}>
                  <button className="w-full border border-white text-white font-medium px-6 py-3 rounded-md hover:bg-white/10 transition-colors duration-200">
                    Masuk
                  </button>
                </Link>
                <Link to="/register" onClick={closeMenu}>
                  <button className="w-full bg-[#e50914] text-white font-semibold px-6 py-3 rounded-md hover:bg-red-700 transition-colors duration-200">
                    Daftar
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

