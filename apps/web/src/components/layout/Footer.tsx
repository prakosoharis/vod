import { Link } from 'react-router-dom'
import Logo from '@/components/navbar/Logo'

const Footer = () => (
  <footer className="nusantara-footer">
    <div>
      <Logo />
      <p>Hiburan Indonesia, dalam cerita terbaiknya.</p>
    </div>
    <nav>
      <Link to="/contact">Kontak</Link>
      <Link to="/terms">Syarat</Link>
      <Link to="/privacy">Privasi</Link>
      <Link to="/refund-policy">Refund</Link>
      <Link to="/account-deletion">Hapus Akun</Link>
      <button type="button" onClick={() => window.dispatchEvent(new Event('smash-open-cookie-preferences'))}>Cookie Preferences</button>
    </nav>
    <small>© {new Date().getFullYear()} SMASH</small>
  </footer>
)

export { Footer }
