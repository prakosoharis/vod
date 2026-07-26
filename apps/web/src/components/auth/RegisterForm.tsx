import { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';
import { isAxiosError } from 'axios';
import { SocialAuthButtons } from './SocialAuthButtons';

const requestErrorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ error?: string }>(error) ? error.response?.data?.error || fallback : fallback;

export function RegisterForm({ onSuccess }: { onSuccess?: () => void; isModal?: boolean } = {}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', destination: '', password: '', confirm: '' });
  const [consent, setConsent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const start = async () => {
    setError('');
    if (!consent) return setError('Anda harus menyetujui Syarat dan Kebijakan Privasi.');
    if (form.password.length < 10) return setError('Password minimal 10 karakter.');
    if (form.password !== form.confirm) return setError('Konfirmasi password tidak cocok.');
    setLoading(true);
    try {
      await authService.register({
        method: 'email',
        full_name: form.full_name,
        email: form.destination,
        password: form.password,
        legal_consent: true,
        terms_version: '2026-07-25',
        privacy_version: '2026-07-25',
        source_platform: 'web',
      });
      setRegisteredEmail(form.destination);
    } catch (requestError: unknown) {
      setError(requestErrorMessage(requestError, 'Pendaftaran belum dapat diproses.'));
    } finally {
      setLoading(false);
    }
  };

  if (registeredEmail) {
    return <div className="space-y-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15"><Mail className="h-8 w-8 text-emerald-400"/></div>
      <div><h2 className="text-xl font-bold text-cream-50">Pendaftaran berhasil</h2><p className="mt-2 text-sm text-cream-200">Kami mengirim tombol verifikasi ke <b className="text-cream-50">{registeredEmail}</b>. Tautan berlaku selama 5 menit.</p></div>
      <div className="flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-left text-sm text-cream-100"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"/><p>Anda tetap dapat login tanpa verifikasi untuk melihat katalog, tetapi belum dapat membeli tiket atau menyewa konten.</p></div>
      <Button className="h-12 w-full rounded-full" onClick={() => { onSuccess?.(); navigate('/login'); }}>Masuk ke Akun</Button>
    </div>;
  }

  const field = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  return <div className="space-y-4">
    {error && <p role="alert" className="rounded-lg bg-accent-500/15 p-3 text-sm text-accent-300">{error}</p>}
    <Input className="auth-register-input" value={form.full_name} onChange={e => field('full_name', e.target.value)} placeholder="Nama tampilan" autoComplete="name" />
    <Input className="auth-register-input" value={form.destination} onChange={e => field('destination', e.target.value)} type="email" placeholder="email@contoh.com" autoComplete="email" />
    <div className="relative">
      <Input value={form.password} onChange={e => field('password', e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Password minimal 10 karakter" autoComplete="new-password" className="auth-register-input pr-12" />
      <button type="button" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-cream-200">{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
    </div>
    <Input className="auth-register-input" value={form.confirm} onChange={e => field('confirm', e.target.value)} type="password" placeholder="Konfirmasi password" autoComplete="new-password" />
    <label className="flex items-start gap-3 text-sm text-cream-100"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1"/><span>Saya menyetujui <Link className="text-accent-400 underline" to="/terms">Syarat dan Ketentuan</Link> serta <Link className="text-accent-400 underline" to="/privacy">Kebijakan Privasi</Link>.</span></label>
    <Button className="h-12 w-full rounded-full" disabled={loading} onClick={start}>{loading ? 'Mendaftarkan…' : 'Daftar'}</Button>
    <SocialAuthButtons/>
  </div>;
}
