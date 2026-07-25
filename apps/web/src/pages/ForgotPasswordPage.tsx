import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';

type Step = 'email' | 'otp' | 'password';

const errorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ error?: string }>(error) ? error.response?.data?.error || fallback : fallback;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [otp, setOtp] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitEmail = async () => {
    const result = await authService.forgotPassword(email.trim());
    setChallengeId(result.challenge_id);
    setMessage('Jika email terdaftar, kode OTP telah dikirim. Periksa inbox dan folder spam.');
    setStep('otp');
  };

  const submitOtp = async () => {
    if (!/^\d{6}$/.test(otp)) throw new Error('OTP_INVALID');
    const result = await authService.verifyRecovery(challengeId, otp);
    setRecoveryToken(result.recovery_token);
    setMessage('Kode berhasil diverifikasi. Silakan buat password baru.');
    setStep('password');
  };

  const submitPassword = async () => {
    if (password.length < 10) throw new Error('PASSWORD_SHORT');
    if (password !== confirmPassword) throw new Error('PASSWORD_MISMATCH');
    const result = await authService.resetPassword(recoveryToken, password);
    setMessage(result.message);
    window.setTimeout(() => navigate('/login', { replace: true }), 1200);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (step === 'email') await submitEmail();
      else if (step === 'otp') await submitOtp();
      else await submitPassword();
    } catch (requestError) {
      const local = requestError instanceof Error ? requestError.message : '';
      if (local === 'OTP_INVALID') setError('Masukkan enam digit kode OTP.');
      else if (local === 'PASSWORD_SHORT') setError('Password minimal 10 karakter.');
      else if (local === 'PASSWORD_MISMATCH') setError('Konfirmasi password tidak cocok.');
      else setError(errorMessage(requestError, step === 'otp'
        ? 'Kode OTP salah atau kedaluwarsa.'
        : 'Permintaan belum dapat diproses.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-warm-charcoal-100 px-4 py-12 text-cream-50">
      <div className="mx-auto max-w-md rounded-2xl border border-accent-500/20 bg-warm-charcoal-50 p-8">
        <img src="/smash-logo-transparent.png" alt="SMASH" className="mx-auto mb-6 h-20 object-contain" />
        <h1 className="text-2xl font-bold">
          {step === 'email' ? 'Lupa password' : step === 'otp' ? 'Masukkan kode OTP' : 'Buat password baru'}
        </h1>
        <p className="mt-2 text-sm text-cream-200">
          {step === 'email' && 'Masukkan email akun Anda. Kode pemulihan akan dikirim melalui email.'}
          {step === 'otp' && `Masukkan enam digit kode yang dikirim ke ${email}.`}
          {step === 'password' && 'Gunakan password baru minimal 10 karakter.'}
        </p>
        {message && <p role="status" className="mt-5 rounded-lg bg-accent-500/15 p-4 text-sm">{message}</p>}
        {error && <p role="alert" className="mt-5 rounded-lg bg-red-500/15 p-4 text-sm text-red-300">{error}</p>}
        <form className="mt-6 space-y-4" onSubmit={submit}>
          {step === 'email' && (
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" autoComplete="email" required />
          )}
          {step === 'otp' && (
            <Input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} required />
          )}
          {step === 'password' && (
            <>
              <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password baru" autoComplete="new-password" required />
              <Input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" placeholder="Konfirmasi password baru" autoComplete="new-password" required />
            </>
          )}
          <Button className="h-12 w-full rounded-full" disabled={loading}>
            {loading ? 'Memproses…' : step === 'email' ? 'Kirim kode OTP' : step === 'otp' ? 'Verifikasi OTP' : 'Simpan password baru'}
          </Button>
        </form>
        {step === 'otp' && (
          <button type="button" className="mt-4 block w-full text-center text-sm text-accent-400" onClick={() => { setStep('email'); setOtp(''); setError(''); }}>
            Ubah email
          </button>
        )}
        <Link className="mt-6 block text-center text-sm text-accent-400" to="/login">Kembali ke halaman masuk</Link>
      </div>
    </main>
  );
}
