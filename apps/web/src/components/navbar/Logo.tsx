import { Link } from 'react-router-dom'

interface LogoProps {
  onClick?: () => void
  className?: string
}

const Logo: React.FC<LogoProps> = ({ onClick, className = '' }) => {
  return (
    <Link
      to="/"
      className={`text-2xl md:text-2xl font-bold text-[#e50914] hover:text-red-400 transition-colors duration-200 ${className}`}
      onClick={onClick}
    >
      MOST
    </Link>
  )
}

export default Logo