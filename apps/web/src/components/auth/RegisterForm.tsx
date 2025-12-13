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
  if (password.length < 8) return { level: 'weak', color: 'bg-accent-600' };
  if (password.length < 12) return { level: 'medium', color: 'bg-accent-500' };

  // Check for mix of characters
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const mixCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

  if (mixCount >= 3) return { level: 'strong', color: 'bg-accent-400' };
  return { level: 'medium', color: 'bg-accent-500' };
};

interface RegisterFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export function RegisterForm({ onSuccess, isModal = false }: RegisterFormProps = {}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register: registerUser, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema as any),
  });

  const password = watch('password', '');
  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.email, data.password, data.full_name);
      if (isModal && onSuccess) {
        onSuccess();
      } else {
        navigate('/browse');
      }
    } catch (error: any) {
      // Error is handled by the store
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-4 bg-accent-500/20 border border-accent-500/40 text-accent-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Nama Lengkap"
            className={`h-12 text-cream-50 placeholder:text-cream-200/50 bg-warm-charcoal-100 border-accent-500/30 focus:border-accent-400 focus:ring-accent-400 rounded-xl ${
              errors.full_name ? 'border-accent-500' : ''
            }`}
            {...register('full_name')}
          />
          {errors.full_name && (
            <p className="text-accent-400 text-sm mt-1.5">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <Input
            type="email"
            placeholder="Email"
            className={`h-12 text-cream-50 placeholder:text-cream-200/50 bg-warm-charcoal-100 border-accent-500/30 focus:border-accent-400 focus:ring-accent-400 rounded-xl ${
              errors.email ? 'border-accent-500' : ''
            }`}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-accent-400 text-sm mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className={`h-12 text-cream-50 placeholder:text-cream-200/50 bg-warm-charcoal-100 border-accent-500/30 focus:border-accent-400 focus:ring-accent-400 rounded-xl pr-12 ${
                errors.password ? 'border-accent-500' : ''
              }`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cream-200 hover:text-accent-400 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex space-x-1">
                <div className={`h-1 flex-1 rounded ${passwordStrength.level === 'weak' ? passwordStrength.color : passwordStrength.level === 'medium' ? passwordStrength.color : 'bg-warm-charcoal-100'}`}></div>
                <div className={`h-1 flex-1 rounded ${passwordStrength.level === 'medium' ? passwordStrength.color : passwordStrength.level === 'strong' ? passwordStrength.color : 'bg-warm-charcoal-100'}`}></div>
                <div className={`h-1 flex-1 rounded ${passwordStrength.level === 'strong' ? passwordStrength.color : 'bg-warm-charcoal-100'}`}></div>
              </div>
              <p className="text-xs text-cream-200 mt-1.5 capitalize">
                Kekuatan: {passwordStrength.level === 'weak' ? 'Lemah' : passwordStrength.level === 'medium' ? 'Sedang' : 'Kuat'}
              </p>
            </div>
          )}
          {errors.password && (
            <p className="text-accent-400 text-sm mt-1.5">{errors.password.message}</p>
          )}
        </div>

        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Konfirmasi Password"
            className={`h-12 text-cream-50 placeholder:text-cream-200/50 bg-warm-charcoal-100 border-accent-500/30 focus:border-accent-400 focus:ring-accent-400 rounded-xl pr-12 ${
              errors.confirmPassword ? 'border-accent-500' : ''
            }`}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cream-200 hover:text-accent-400 transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.confirmPassword && (
            <p className="text-accent-400 text-sm mt-1.5">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start space-x-3">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 text-accent-500 bg-warm-charcoal-100 border-accent-500/40 rounded focus:ring-accent-400 focus:ring-2 mt-1 cursor-pointer"
            {...register('terms')}
          />
          <label htmlFor="terms" className="text-sm text-cream-100 leading-relaxed cursor-pointer">
            Saya setuju dengan{' '}
            <Link
              to="/terms"
              className="text-accent-400 hover:text-accent-300 transition-colors underline"
            >
              Syarat & Ketentuan
            </Link>
          </label>
        </div>
        {errors.terms && (
          <p className="text-accent-400 text-sm mt-1.5">{errors.terms.message}</p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-cream-50 font-semibold text-lg rounded-full shadow-lg shadow-accent-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cream-50 mr-2"></div>
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

