import { Link } from 'react-router-dom'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { useState } from 'react'
import { getLogoUrl } from '@/utils/logoUrl'

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
      <div className="relative flex items-center justify-center">
        <OptimizedImage
          src={getLogoUrl()}
          alt="MOST Logo"
          width={64}
          height={56}
          className="object-contain"
          priority={true} // Logo is above the fold, so load it immediately
          placeholder="blur"
          onError={handleImageError}
        />
      </div>
    </Link>
  )
}

export default Logo