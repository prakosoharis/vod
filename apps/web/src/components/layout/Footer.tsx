import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-black border-t border-gray-800">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div>
            <h3 className="text-2xl font-bold text-red-600 mb-4">MOST</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Platform streaming pilihan untuk konten hiburan berkualitas dari dalam dan luar negeri.
            </p>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Perusahaan</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="block text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="block text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Kontak
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="block text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Karir
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="block text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Berita
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="block text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="block text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="block text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Pusat Bantuan
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="block text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Cookie Preferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Ikuti Kami</h4>
            <div className="flex space-x-4 mb-4">
              <a
                href="https://twitter.com/most"
                target="_blank"
                rel="noopener noreferrer"
                className="w-5 h-5 p-2 bg-gray-800 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-700 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://facebook.com/most"
                target="_blank"
                rel="noopener noreferrer"
                className="w-5 h-5 p-2 bg-gray-800 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-700 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com/most"
                target="_blank"
                rel="noopener noreferrer"
                className="w-5 h-5 p-2 bg-gray-800 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-700 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://youtube.com/@most"
                target="_blank"
                rel="noopener noreferrer"
                className="w-5 h-5 p-2 bg-gray-800 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-700 transition-colors duration-200"
                aria-label="Youtube"
              >
                <Youtube size={20} />
              </a>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mt-4">
              Dapatkan update terbaru tentang rilis konten baru dan penawaran spesial.
            </p>
          </div>
        </div>

        {/* Copyright section */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">© 2025 MOST. All rights reserved.</p>
          <div className="mt-2 text-xs text-gray-600">
            <Link to="/privacy" className="hover:text-gray-400 transition-colors duration-200">
              Kebijakan Privasi
            </Link>
            {' • '}
            <Link to="/terms" className="hover:text-gray-400 transition-colors duration-200">
              Syarat Layanan
            </Link>
            {' • '}
            <Link to="/cookies" className="hover:text-gray-400 transition-colors duration-200">
              Preferensi Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
