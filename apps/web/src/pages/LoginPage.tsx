import { Link } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { getLogoUrl } from '@/utils/logoUrl';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-warm-charcoal-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-warm-charcoal-50 border-2 border-accent-500/20 rounded-2xl p-8 shadow-2xl shadow-accent-500/10">
          <div className="text-center mb-8">
            <img
              src="https://api.mostara.id/api/uploads/logos/logo1.jpg"
              alt="MOST Logo"
              className="h-16 md:h-20 w-auto mx-auto mb-6 object-contain"
            />
            <h1 className="text-2xl font-bold text-cream-50 mb-2">Selamat Datang Kembali</h1>
            <p className="text-cream-200 text-sm">Masuk untuk melanjutkan menonton</p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center space-y-3">
            <Link
              to="#"
              className="block text-sm text-cream-200 hover:text-accent-400 transition-colors"
            >
              Lupa password?
            </Link>
            <div className="text-sm text-cream-200">
              Belum punya akun?{' '}
              <Link
                to="/register"
                className="text-accent-400 hover:text-accent-300 transition-colors font-semibold"
              >
                Daftar sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
