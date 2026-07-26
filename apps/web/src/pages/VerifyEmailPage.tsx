import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAuthStore(state => state.setSession);
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Memverifikasi email Anda…');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const challenge = params.get('challenge');
    const token = params.get('token');
    if (!challenge || !token) {
      setStatus('error');
      setMessage('Tautan verifikasi tidak lengkap.');
      return;
    }
    authService.verifyRegistration(challenge, token)
      .then(result => {
        setSession(result.user, result.token);
        setStatus('success');
        setMessage('Email berhasil diverifikasi. Anda akan diarahkan ke dashboard.');
        window.setTimeout(() => navigate('/', { replace: true }), 1200);
      })
      .catch((error: any) => {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Tautan verifikasi tidak valid atau sudah kedaluwarsa.');
      });
  }, [navigate, params, setSession]);

  return <main className="flex min-h-screen items-center justify-center bg-warm-charcoal-100 p-4 text-cream-50">
    <div className="w-full max-w-md rounded-2xl border border-accent-500/20 bg-warm-charcoal-50 p-8 text-center">
      <img src="/smash-logo-transparent.png" alt="SMASH" className="mx-auto mb-7 h-20 object-contain"/>
      {status === 'loading' && <Loader2 className="mx-auto h-14 w-14 animate-spin text-accent-400"/>}
      {status === 'success' && <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400"/>}
      {status === 'error' && <XCircle className="mx-auto h-14 w-14 text-red-400"/>}
      <h1 className="mt-5 text-2xl font-bold">{status === 'success' ? 'Email Terverifikasi' : status === 'error' ? 'Verifikasi Gagal' : 'Verifikasi Email'}</h1>
      <p className="mt-3 text-cream-200">{message}</p>
      {status === 'error' && <Link to="/login" className="mt-6 inline-block rounded-full bg-accent-500 px-7 py-3 font-semibold">Masuk dan Kirim Ulang</Link>}
    </div>
  </main>;
}
