import { Link } from 'react-router-dom';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { getLogoUrl } from '@/utils/logoUrl';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-warm-charcoal-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="bg-warm-charcoal-50 border-2 border-accent-500/20 rounded-2xl p-8 shadow-2xl shadow-accent-500/10">
          <div className="text-center mb-8">
            <img
              src="https://api.mostara.id/api/uploads/logos/logo1.jpg"
              alt="MOST Logo"
              className="h-16 md:h-20 w-auto mx-auto mb-6 object-contain"
            />
            <h1 className="text-2xl font-bold text-cream-50 mb-2">Bergabung dengan MOST</h1>
            <p className="text-cream-200 text-sm">Mulai petualangan menonton Anda</p>
          </div>

          <RegisterForm />

          <div className="mt-6 text-center">
            <div className="text-sm text-cream-200">
              Sudah punya akun?{' '}
              <Link
                to="/login"
                className="text-accent-400 hover:text-accent-300 transition-colors font-semibold"
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
