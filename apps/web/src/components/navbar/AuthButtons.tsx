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
    <div className={`nusantara-auth-buttons ${className}`}>
      <Link
        to="/login"
        className="nusantara-auth-link"
        onClick={handleLinkClick}
      >
        Masuk
      </Link>
      <Link
        to="/register"
        className="nusantara-auth-register"
        onClick={handleLinkClick}
      >
        Daftar
      </Link>
    </div>
  )
}

export default AuthButtons
