import { Link } from 'react-router-dom'

interface LogoProps {
  onClick?: () => void
  className?: string
}

const Logo: React.FC<LogoProps> = ({ onClick, className = '' }) => {
  return (
    <Link
      to="/"
      className={`flex items-center hover:opacity-80 transition-opacity duration-200 ${className}`}
      onClick={onClick}
    >
      <img
        src="/api/uploads/logos/logo1.jpg"
        alt="Logo"
        className="h-8 md:h-10 w-auto object-contain"
      />
    </Link>
  )
}

export default Logo