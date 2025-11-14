import { Link } from 'react-router-dom'

interface AuthButtonsProps {
  onLinkClick?: () => void
  className?: string
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ onLinkClick, className = '' }) => {
  const handleLinkClick = () => {
    onLinkClick?.()
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <Link
        to="/login"
        className="text-white hover:text-red-500 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-white/10"
        onClick={handleLinkClick}
      >
        Sign In
      </Link>
      <Link
        to="/register"
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
        onClick={handleLinkClick}
      >
        Register
      </Link>
    </div>
  )
}

export default AuthButtons