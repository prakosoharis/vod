import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate, Link } from 'react-router-dom';

const registerSchema = z.object({
  full_name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, "Harus menyetujui syarat & ketentuan")
}).refine(data => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

const getPasswordStrength = (password: string) => {
  if (password.length < 8) return { level: 'weak', color: 'bg-red-500' };
  if (password.length < 12) return { level: 'medium', color: 'bg-yellow-500' };

  // Check for mix of characters
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const mixCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

  if (mixCount >= 3) return { level: 'strong', color: 'bg-green-500' };
  return { level: 'medium', color: 'bg-yellow-500' };
};

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setApiError(null);
      await registerUser(data.email, data.password, data.full_name);
      navigate('/browse');
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="p-4 bg-red-600 text-white rounded-md text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Nama Lengkap"
            className={`h-12 text-white placeholder:text-gray-400 bg-gray-800 border-gray-600 focus:border-red-500 focus:ring-red-500 ${
              errors.full_name ? 'border-red-500' : ''
            }`}
            {...register('full_name')}
          />
          {errors.full_name && (
            <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <Input
            type="email"
            placeholder="Email"
            className={`h-12 text-white placeholder:text-gray-400 bg-gray-800 border-gray-600 focus:border-red-500 focus:ring-red-500 ${
              errors.email ? 'border-red-500' : ''
            }`}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className={`h-12 text-white placeholder:text-gray-400 bg-gray-800 border-gray-600 focus:border-red-500 focus:ring-red-500 pr-12 ${
                errors.password ? 'border-red-500' : ''
              }`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex space-x-1">
                <div className={`h-1 flex-1 rounded ${passwordStrength.level === 'weak' ? passwordStrength.color : passwordStrength.level === 'medium' ? passwordStrength.color : 'bg-gray-600'}`}></div>
                <div className={`h-1 flex-1 rounded ${passwordStrength.level === 'medium' ? passwordStrength.color : passwordStrength.level === 'strong' ? passwordStrength.color : 'bg-gray-600'}`}></div>
                <div className={`h-1 flex-1 rounded ${passwordStrength.level === 'strong' ? passwordStrength.color : 'bg-gray-600'}`}></div>
              </div>
              <p className="text-xs text-gray-400 mt-1 capitalize">
                Kekuatan: {passwordStrength.level === 'weak' ? 'Lemah' : passwordStrength.level === 'medium' ? 'Sedang' : 'Kuat'}
              </p>
            </div>
          )}
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Konfirmasi Password"
            className={`h-12 text-white placeholder:text-gray-400 bg-gray-800 border-gray-600 focus:border-red-500 focus:ring-red-500 pr-12 ${
              errors.confirmPassword ? 'border-red-500' : ''
            }`}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start space-x-3">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500 focus:ring-2 mt-1"
            {...register('terms')}
          />
          <label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
            Saya setuju dengan{' '}
            <Link
              to="/terms"
              className="text-red-500 hover:text-red-400 transition-colors underline"
            >
              Syarat & Ketentuan
            </Link>
          </label>
        </div>
        {errors.terms && (
          <p className="text-red-500 text-sm">{errors.terms.message}</p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Daftar...
            </div>
          ) : (
            'Daftar'
          )}
        </Button>
      </form>
    </div>
  );
}

