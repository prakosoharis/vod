import { Link } from 'react-router-dom'

interface LogoProps {
  onClick?: () => void
  className?: string
}

const Logo = ({ onClick, className = '' }: LogoProps) => (
  <Link to="/" className={`nusantara-logo ${className}`} onClick={onClick} aria-label="SMASH Beranda">
    <img src="/smash-logo-transparent.png" alt="SMASH" />
  </Link>
)

export default Logo
