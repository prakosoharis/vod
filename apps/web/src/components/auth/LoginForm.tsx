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

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate('/browse');
    } catch (error: any) {
      // Error is handled by the store
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-600 text-white rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
          />
          <label htmlFor="remember-me" className="ml-2 text-sm text-gray-300">
            Ingat saya
          </label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Masuk...
            </div>
          ) : (
            'Masuk'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-2">
        <div className="h-px bg-gray-700 flex-1" />
        <span className="text-gray-400 text-sm">Atau lanjutkan dengan</span>
        <div className="h-px bg-gray-700 flex-1" />
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => alert('Social login akan diimplementasikan nanti')}
          className="h-12 w-full inline-flex items-center justify-center gap-3 rounded-md border border-gray-600 bg-white/90 text-gray-900 hover:bg-gray-100 transition-colors"
        >
          {/* Simple Google G */}
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-black font-bold">G</span>
          <span className="font-medium">Google</span>
        </button>
        <button
          type="button"
          onClick={() => alert('Social login akan diimplementasikan nanti')}
          className="h-12 w-full inline-flex items-center justify-center gap-3 rounded-md border border-gray-600 bg-white/90 text-gray-900 hover:bg-gray-100 transition-colors"
        >
          {/* Simple Facebook f */}
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1877F2] text-white font-bold">f</span>
          <span className="font-medium">Facebook</span>
        </button>
      </div>
    </div>
  );
}
