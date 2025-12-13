import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export function LoginForm({ onSuccess, isModal = false }: LoginFormProps = {}) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema as any),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
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
          {errors.password && (
            <p className="text-accent-400 text-sm mt-1.5">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-accent-500 bg-warm-charcoal-100 border-accent-500/40 rounded focus:ring-accent-400 focus:ring-2 cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 text-sm text-cream-100 cursor-pointer">
            Ingat saya
          </label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-cream-50 font-semibold text-lg rounded-full shadow-lg shadow-accent-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cream-50 mr-2"></div>
              Masuk...
            </div>
          ) : (
            'Masuk'
          )}
        </Button>
      </form>
    </div>
  );
}
