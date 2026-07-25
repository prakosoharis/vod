import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen bg-warm-charcoal-100 px-4 py-12 text-cream-50">
      <div className="mx-auto max-w-md rounded-2xl border border-accent-500/20 bg-warm-charcoal-50 p-8">
        <img src="/smash-logo-transparent.png" alt="SMASH" className="mx-auto mb-6 h-20 object-contain" />
        <h1 className="text-2xl font-bold">Lupa password</h1>
        <p className="mt-2 text-sm text-cream-200">Masukkan nomor HP atau email. Kami menggunakan kanal terverifikasi akun Anda.</p>
        {message && <p role="status" className="mt-5 rounded-lg bg-accent-500/15 p-4 text-sm">{message}</p>}
        <form className="mt-6 space-y-4" onSubmit={async (event) => {
          event.preventDefault(); setLoading(true);
          try {
            const result = await authService.forgotPassword(identifier);
            setMessage(result.message);
          } catch {
            setMessage('Jika akun ditemukan, instruksi pemulihan akan dikirim melalui kanal yang terdaftar.');
          } finally { setLoading(false); }
        }}>
          <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Nomor HP atau Email" autoComplete="email" required />
          <Button className="h-12 w-full rounded-full" disabled={loading}>{loading ? 'Memproses…' : 'Kirim instruksi'}</Button>
        </form>
        <Link className="mt-6 block text-center text-sm text-accent-400" to="/login">Kembali ke halaman masuk</Link>
      </div>
    </main>
  );
}
