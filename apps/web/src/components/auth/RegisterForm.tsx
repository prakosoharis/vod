import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { isAxiosError } from 'axios';
import { SocialAuthButtons } from './SocialAuthButtons';

type Method = 'email' | 'phone';
type RegistrationChallenge = {
  challenge_id: string;
  destination_masked: string;
  resend_after: number;
};

const requestErrorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ error?: string }>(error) ? error.response?.data?.error || fallback : fallback;

export function RegisterForm({ onSuccess }: { onSuccess?: () => void; isModal?: boolean } = {}) {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [method, setMethod] = useState<Method>('phone');
  const [form, setForm] = useState({
    full_name: '', username: '', destination: '', password: '', confirm: '',
  });
  const [consent, setConsent] = useState(false);
  const [challenge, setChallenge] = useState<RegistrationChallenge | null>(null);
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!seconds) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const start = async () => {
    setError('');
    if (!consent) return setError('Anda harus menyetujui Syarat dan Kebijakan Privasi.');
    if (form.password.length < 10) return setError('Password minimal 10 karakter.');
    if (form.password !== form.confirm) return setError('Konfirmasi password tidak cocok.');
    setLoading(true);
    try {
      const result = await authService.register({
        method,
        full_name: form.full_name,
        username: form.username,
        ...(method === 'email' ? { email: form.destination } : { phone: form.destination }),
        password: form.password,
        legal_consent: true,
        terms_version: '2026-07-25',
        privacy_version: '2026-07-25',
        source_platform: 'web',
      });
      setChallenge(result);
      setSeconds(result.resend_after);
    } catch (requestError: unknown) {
      setError(requestErrorMessage(requestError, 'Pendaftaran belum dapat diproses.'));
    } finally { setLoading(false); }
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(otp)) return setError('Masukkan enam digit kode verifikasi.');
    if (!challenge) return setError('Sesi verifikasi tidak ditemukan. Silakan mulai ulang pendaftaran.');
    setLoading(true); setError('');
    try {
      const result = await authService.verifyRegistration(challenge.challenge_id, otp);
      setSession(result.user, result.token);
      if (onSuccess) onSuccess();
      else navigate('/browse', { replace: true });
    } catch (requestError: unknown) {
      setError(requestErrorMessage(requestError, 'Kode verifikasi tidak valid.'));
    } finally { setLoading(false); }
  };

  if (challenge) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-accent-500/20 bg-warm-charcoal-100 p-4">
          <h2 className="font-bold text-cream-50">Verifikasi melalui {method === 'phone' ? 'WhatsApp' : 'Email'}</h2>
          <p className="mt-1 text-sm text-cream-200">Kode dikirim ke {challenge.destination_masked}.</p>
        </div>
        {error && <p role="alert" className="text-sm text-accent-400">{error}</p>}
        <Input
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          aria-label="Kode verifikasi enam digit"
          placeholder="000000"
          className="h-14 text-center text-2xl tracking-[0.5em] bg-warm-charcoal-100 text-cream-50"
        />
        <Button className="h-12 w-full rounded-full" disabled={loading} onClick={verify}>
          {loading ? 'Memverifikasi…' : 'Verifikasi dan Masuk'}
        </Button>
        <div className="flex justify-between text-sm">
          <button type="button" className="text-cream-200 underline" onClick={() => { setChallenge(null); setOtp(''); }}>
            Ubah {method === 'phone' ? 'nomor' : 'email'}
          </button>
          <button
            type="button"
            disabled={seconds > 0 || loading}
            className="text-accent-400 disabled:text-cream-200"
            onClick={async () => {
              const next = await authService.resendRegistration(challenge.challenge_id);
              setChallenge(next); setSeconds(next.resend_after);
            }}
          >
            {seconds ? `Kirim ulang (${seconds})` : 'Kirim ulang'}
          </button>
        </div>
      </div>
    );
  }

  const field = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 rounded-xl bg-warm-charcoal-100 p-1">
        {(['phone', 'email'] as Method[]).map((item) => (
          <button
            key={item}
            type="button"
            className={`rounded-lg px-3 py-2 text-sm ${method === item ? 'bg-accent-500 text-white' : 'text-cream-200'}`}
            onClick={() => { setMethod(item); field('destination', ''); }}
          >
            Daftar dengan {item === 'phone' ? 'Nomor HP' : 'Email'}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="rounded-lg bg-accent-500/15 p-3 text-sm text-accent-300">{error}</p>}
      <Input className="auth-register-input" value={form.full_name} onChange={(e) => field('full_name', e.target.value)} placeholder="Nama tampilan" autoComplete="name" />
      <Input className="auth-register-input" value={form.username} onChange={(e) => field('username', e.target.value)} placeholder="Username" autoCapitalize="none" autoComplete="username" />
      <Input
        className="auth-register-input"
        value={form.destination}
        onChange={(e) => field('destination', e.target.value)}
        type={method === 'email' ? 'email' : 'tel'}
        placeholder={method === 'email' ? 'email@contoh.com' : '0812 3456 7890'}
        autoComplete={method === 'email' ? 'email' : 'tel'}
      />
      <div className="relative">
        <Input value={form.password} onChange={(e) => field('password', e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Password minimal 10 karakter" autoComplete="new-password" className="auth-register-input pr-12" />
        <button type="button" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-cream-200">
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <Input className="auth-register-input" value={form.confirm} onChange={(e) => field('confirm', e.target.value)} type="password" placeholder="Konfirmasi password" autoComplete="new-password" />
      <label className="flex items-start gap-3 text-sm text-cream-100">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>Saya menyetujui <Link className="text-accent-400 underline" to="/terms">Syarat dan Ketentuan</Link> serta <Link className="text-accent-400 underline" to="/privacy">Kebijakan Privasi</Link>.</span>
      </label>
      <Button className="h-12 w-full rounded-full" disabled={loading} onClick={start}>{loading ? 'Mengirim kode…' : 'Lanjutkan'}</Button>
      <SocialAuthButtons />
    </div>
  );
}
