import { Link } from 'react-router-dom'
import Logo from '@/components/navbar/Logo'

const Footer = () => (
  <footer className="nusantara-footer">
    <div>
      <Logo />
      <p>Hiburan Indonesia, dalam cerita terbaiknya.</p>
    </div>
    <nav>
      <Link to="/help">Bantuan</Link>
      <Link to="/terms">Syarat</Link>
      <Link to="/privacy">Privasi</Link>
    </nav>
    <small>© {new Date().getFullYear()} SMASH</small>
  </footer>
)

export { Footer }
