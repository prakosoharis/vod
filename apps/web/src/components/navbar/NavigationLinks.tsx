import { Link } from 'react-router-dom'
import { Radio } from 'lucide-react'

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
  const handleLinkClick = () => {
    onLinkClick?.()
  }

  return (
    <div className={`flex items-center space-x-0 ${className}`}>
      <Link
        to="/browse"
        className="text-white hover:text-red-500 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-white/10"
        onClick={handleLinkClick}
      >
        Browse
      </Link>

      {isAuthenticated && (
        <Link
          to="/my-list"
          className="text-white hover:text-red-500 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-white/10"
          onClick={handleLinkClick}
        >
          My List
        </Link>
      )}

      <Link
        to="/live"
        className="flex items-center text-white hover:text-red-500 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-white/10 bg-red-600/20"
        onClick={handleLinkClick}
      >
        <Radio className="w-4 h-4 mr-2" />
        Live
      </Link>
    </div>
  )
}

export default NavigationLinks