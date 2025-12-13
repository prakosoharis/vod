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
        className="text-cream-100 hover:text-accent-400 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-white/10"
        onClick={handleLinkClick}
      >
        Sign In
      </Link>
      <Link
        to="/register"
        className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-cream-50 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/40"
        onClick={handleLinkClick}
      >
        Register
      </Link>
    </div>
  )
}

export default AuthButtons