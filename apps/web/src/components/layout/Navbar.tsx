import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  // State for mobile menu and scroll detection
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
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

            {/* Mobile Auth Buttons */}
            <div className="mt-6 space-y-4">
              <Link to="/login" onClick={closeMenu}>
                <button className="w-full border border-white text-white font-medium px-6 py-2 rounded-md hover:bg-white/10 transition-colors duration-200">
                  Masuk
                </button>
              </Link>
              <Link to="/register" onClick={closeMenu}>
                <button className="w-full bg-[#e50914] text-white font-semibold px-6 py-2 rounded-md hover:bg-red-700 transition-colors duration-200">
                  Daftar
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

