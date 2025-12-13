import { Link } from 'react-router-dom'
import { useState } from 'react'

interface LogoProps {
  onClick?: () => void
  className?: string
}

const Logo: React.FC<LogoProps> = ({ onClick, className = '' }) => {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    console.error('Logo failed to load')
    setImageError(true)
  }

  // Fallback text logo when image fails to load
  if (imageError) {
    return (
      <Link
        to="/"
        className={`flex items-center hover:opacity-90 transition-all duration-300 hover:scale-105 ${className}`}
        onClick={onClick}
      >
        <div className="text-2xl md:text-3xl font-bold text-white hover:text-red-500 transition-all duration-300 hover:scale-105">
          MOST
        </div>
      </Link>
    )
  }

  return (
    <Link
      to="/"
      className={`flex items-center hover:opacity-90 transition-all duration-300 hover:scale-105 ${className}`}
      onClick={onClick}
    >
      <img
        src="https://api.mostara.id/api/uploads/logos/logo1.jpg"
        alt="MOST Logo"
        className="h-12 md:h-14 w-auto object-contain"
        onError={handleImageError}
      />
    </Link>
  )
}

export default Logo