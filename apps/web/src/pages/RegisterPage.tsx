import { Link } from 'react-router-dom';
import { RegisterForm } from '@/components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Alkamus</h1>
            <p className="text-gray-400 text-sm">Buat akun baru</p>
          </div>

          <RegisterForm />

          <div className="mt-6 text-center space-y-2">
            <div className="text-sm text-gray-400">
              Sudah punya akun?{' '}
              <Link
                to="/login"
                className="text-red-500 hover:text-red-400 transition-colors font-medium"
              >
                Masuk sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
