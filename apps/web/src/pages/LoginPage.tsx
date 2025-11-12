import { Link } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">MOST</h1>
            <p className="text-gray-400 text-sm">Masuk ke akun Anda</p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center space-y-2">
            <Link
              to="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Lupa password?
            </Link>
            <div className="text-sm text-gray-400">
              Belum punya akun?{' '}
              <Link
                to="/register"
                className="text-red-500 hover:text-red-400 transition-colors font-medium"
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
