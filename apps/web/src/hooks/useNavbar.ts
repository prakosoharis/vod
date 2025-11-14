import { useState, useEffect } from 'react'

interface UseNavbarReturn {
  isMenuOpen: boolean
  isScrolled: boolean
  showSearch: boolean
  toggleMenu: () => void
  closeMenu: () => void
  toggleSearch: () => void
  closeSearch: () => void
}

const useNavbar = (): UseNavbarReturn => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking on links or pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false)
        setShowSearch(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    setShowSearch(false) // Close search when opening menu
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleSearch = () => {
    setShowSearch(!showSearch)
    setIsMenuOpen(false) // Close menu when opening search
  }

  const closeSearch = () => {
    setShowSearch(false)
  }

  return {
    isMenuOpen,
    isScrolled,
    showSearch,
    toggleMenu,
    closeMenu,
    toggleSearch,
    closeSearch
  }
}

export default useNavbar