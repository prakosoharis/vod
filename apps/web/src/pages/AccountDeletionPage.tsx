import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '@/services/api';
import { LegalPage } from '@/components/legal/LegalPage';
import { useAuthStore } from '@/stores/authStore';

type DeletionRequest = {
  id: string;
  scheduled_for: string;
};

type ApiError = {
  error?: string;
};

const AccountDeletionPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [active, setActive] = useState<DeletionRequest | null>(null);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    const response = await api.get('/account-deletion');
    setActive(response.data.request);
  }, [isAuthenticated]);
  useEffect(() => { refresh().catch(() => undefined); }, [refresh]);

  const requestDeletion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const response = await api.post('/account-deletion', {
        password: data.get('password'),
        source_platform: 'web',
      });
      setActive(response.data.request);
      setMessage('Permintaan penghapusan akun telah dicatat.');
      event.currentTarget.reset();
    } catch (error: unknown) {
      const requestError = error as AxiosError<ApiError>;
      setMessage(requestError.response?.data?.error || 'Permintaan gagal.');
    }
  };

  const cancel = async () => {
    const response = await api.post('/account-deletion/cancel', {});
    setActive(null);
    setMessage(`Permintaan ${response.data.request.id} dibatalkan.`);
  };

  return (
    <LegalPage title="Penghapusan Akun dan Data" path="/account-deletion" description="Informasi dan mekanisme pengajuan penghapusan akun SMASHSTREAM.">
      <div className="legal-copy mt-10 space-y-5 leading-7 text-cream-100">
        <p>Penghapusan akun mengakhiri akses ke coin, rental aktif, watchlist, riwayat, dan konten terkait akun. Coin atau hak akses yang tersisa dapat hilang setelah penghapusan selesai.</p>
        <p>Data tertentu mungkin tetap dipertahankan untuk transaksi, antifraud, sengketa, audit, dan kewajiban hukum selama <strong>[MASA RETENSI YANG DISETUJUI LEGAL]</strong>.</p>
        <p>Cooling-off: <strong>[MASA TUNGGU DIKONFIGURASI MELALUI ACCOUNT_DELETION_COOLING_OFF_DAYS]</strong>. Selama periode ini, pengguna dapat membatalkan permintaan.</p>
        <p>Pengguna Facebook Login dapat mengajukan dari halaman ini setelah masuk, atau memakai instruction URL <code>https://smashstream.id/account-deletion</code> untuk konfigurasi Meta. Data Deletion Callback API: <strong>[CALLBACK META BELUM DIIMPLEMENTASIKAN/DIKONFIGURASI]</strong>.</p>
      </div>
      <div className="mt-8 rounded-2xl border border-cream-50/10 bg-warm-charcoal-50 p-6">
        {message && <p className="mb-4 text-accent-300">{message}</p>}
        {!isAuthenticated ? (
          <p>Silakan <Link className="text-accent-400" to="/login">masuk</Link> untuk mengajukan penghapusan, atau hubungi <a href="mailto:email@smashstream.id">email@smashstream.id</a>.</p>
        ) : active ? (
          <div><p>Permintaan aktif. Dijadwalkan: <strong>{new Date(active.scheduled_for).toLocaleString('id-ID')}</strong></p><button onClick={cancel} className="mt-4 rounded-full border border-accent-400 px-5 py-2">Batalkan permintaan</button></div>
        ) : (
          <form onSubmit={requestDeletion} className="legal-form max-w-md space-y-4">
            <label>Masukkan kembali password<input name="password" type="password" required /></label>
            <button className="rounded-full bg-red-600 px-5 py-3 font-bold text-white">Ajukan penghapusan akun</button>
          </form>
        )}
      </div>
    </LegalPage>
  );
};

export default AccountDeletionPage;
