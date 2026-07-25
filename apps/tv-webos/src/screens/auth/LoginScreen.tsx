/**
 * Login Screen - TV-friendly with on-screen keyboard support
 * Uses HTML inputs that webOS will display IME for
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Focusable } from '@/components/Focusable';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { useSpatialNavigation, setFocus } from '@/lib/spatialNavigation';
import { COLORS, THEME } from '@/constants';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Set initial focus
  useEffect(() => {
    setTimeout(() => setFocus('login-email'), 200);
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/home', { replace: true });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Login gagal. Periksa kredensial Anda.');
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: `linear-gradient(135deg, ${COLORS.warmCharcoal[100]} 0%, ${COLORS.warmCharcoal[300]} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Decorative side image */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '55%',
          background: `
            radial-gradient(circle at 30% 50%, ${COLORS.accent[500]}20 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, ${COLORS.primary[500]}15 0%, transparent 50%)
          `,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 120px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          <div
            style={{
              width: 128,
              height: 128,
              borderRadius: 28,
              background: COLORS.warmCharcoal[300],
              border: `2px solid ${COLORS.warmCharcoal[50]}`,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: THEME.shadows.medium,
            }}
          >
            <img
              src="./splash.png"
              alt="Most"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                color: COLORS.cream[50],
                fontSize: 72,
                fontWeight: THEME.typography.fontWeight.bold,
              }}
            >
              Most
            </h1>
            <p style={{ margin: 0, color: COLORS.cream[200], fontSize: 28, marginTop: 8 }}>
              VOD • Streaming Music, Film, & Live Event
            </p>
          </div>
        </div>
        <p style={{ color: COLORS.cream[100], fontSize: 24, lineHeight: 1.6, maxWidth: 600 }}>
          Nonton streaming musik, film dan live event kapan saja di TV Anda.
          Login untuk mulai menikmati pengalaman bioskop dari rumah.
        </p>
      </div>

      {/* Login form */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '45%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 600,
            background: COLORS.warmCharcoal[200] + 'E0',
            border: `2px solid ${COLORS.warmCharcoal[50]}`,
            borderRadius: 24,
            padding: 56,
            boxShadow: THEME.shadows.large,
          }}
        >
          <h2
            style={{
              color: COLORS.cream[50],
              fontSize: 44,
              fontWeight: THEME.typography.fontWeight.bold,
              margin: 0,
              marginBottom: 12,
            }}
          >
            Selamat Datang
          </h2>
          <p
            style={{
              color: COLORS.cream[200],
              fontSize: 20,
              margin: 0,
              marginBottom: 40,
            }}
          >
            Masuk untuk melanjutkan
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div style={{ marginBottom: 28 }}>
              <label
                style={{
                  display: 'block',
                  color: COLORS.cream[100],
                  fontSize: 22,
                  marginBottom: 12,
                  fontWeight: THEME.typography.fontWeight.semibold,
                }}
              >
                Email
              </label>
              <Focusable focusKey="login-email" focusScale={1.0} focusGlow={false}>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="email@contoh.com"
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    fontSize: 24,
                    background: COLORS.warmCharcoal[400],
                    border: `2px solid ${errors.email ? COLORS.error : COLORS.warmCharcoal[50]}`,
                    borderRadius: 12,
                    color: COLORS.cream[50],
                    fontFamily: 'inherit',
                  }}
                />
              </Focusable>
              {errors.email && (
                <p style={{ color: COLORS.error, fontSize: 18, marginTop: 8 }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 36 }}>
              <label
                style={{
                  display: 'block',
                  color: COLORS.cream[100],
                  fontSize: 22,
                  marginBottom: 12,
                  fontWeight: THEME.typography.fontWeight.semibold,
                }}
              >
                Password
              </label>
              <Focusable focusKey="login-password" focusScale={1.0} focusGlow={false}>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    fontSize: 24,
                    background: COLORS.warmCharcoal[400],
                    border: `2px solid ${errors.password ? COLORS.error : COLORS.warmCharcoal[50]}`,
                    borderRadius: 12,
                    color: COLORS.cream[50],
                    fontFamily: 'inherit',
                  }}
                />
              </Focusable>
              {errors.password && (
                <p style={{ color: COLORS.error, fontSize: 18, marginTop: 8 }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div
                style={{
                  padding: '16px 20px',
                  background: COLORS.error + '20',
                  border: `1px solid ${COLORS.error}60`,
                  borderRadius: 8,
                  color: COLORS.error,
                  fontSize: 18,
                  marginBottom: 24,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              focusKey="login-submit"
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              size="lg"
              disabled={isLoading}
              style={{ width: '100%' }}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <p
            style={{
              marginTop: 32,
              color: COLORS.cream[200],
              fontSize: 18,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            Belum punya akun?{' '}
            <a
              href="https://mostara.id/register"
              target="_blank"
              rel="noreferrer"
              style={{ color: COLORS.accent[400], fontWeight: 'bold' }}
            >
              Daftar di mostara.id/register
            </a>{' '}
            via HP atau browser.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
