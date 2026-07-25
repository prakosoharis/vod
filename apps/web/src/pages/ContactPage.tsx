import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '@/services/api';
import { LegalPage } from '@/components/legal/LegalPage';

const categories = [
  ['ACCOUNT_LOGIN', 'Akun dan login'],
  ['PAYMENT', 'Pembayaran'],
  ['COIN', 'Coin'],
  ['RENTAL_VOD', 'Rental/VOD'],
  ['LIVE_STREAMING', 'Live streaming'],
  ['PLAYBACK', 'Masalah pemutaran'],
  ['REFUND', 'Refund'],
  ['PRIVACY_DATA', 'Privasi dan data'],
  ['CONTENT_REPORT', 'Pelaporan konten'],
  ['OTHER', 'Lainnya'],
];

type ApiError = {
  error?: string;
};

const ContactPage = () => {
  const [startedAt] = useState(Date.now());
  const [ticket, setTicket] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const form = new FormData(event.currentTarget);
    form.set('form_started_at', String(startedAt));
    form.set('privacy_consent', String(form.get('privacy_consent') === 'on'));
    try {
      const response = await api.post('/support/contact', form, {
        headers: { 'Content-Type': 'multipart/form-data', 'X-Platform': 'web' },
      });
      setTicket(response.data.ticket_number);
      event.currentTarget.reset();
    } catch (requestError: unknown) {
      const apiError = requestError as AxiosError<ApiError>;
      setError(apiError.response?.data?.error || 'Formulir belum dapat dikirim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LegalPage title="Kontak dan Bantuan" path="/contact" description="Kirim pertanyaan atau laporan kepada tim dukungan SMASHSTREAM.">
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_.8fr]">
        <form onSubmit={submit} className="legal-form space-y-4 rounded-2xl border border-cream-50/10 bg-warm-charcoal-50 p-5 md:p-7">
          <a className="text-accent-400" href="mailto:email@smashstream.id">email@smashstream.id</a>
          {ticket && <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">Permintaan diterima. Nomor tiket: <strong>{ticket}</strong></div>}
          {error && <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4">{error}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <label>Nama<input name="name" minLength={2} maxLength={120} required /></label>
            <label>Email<input name="email" type="email" maxLength={254} required /></label>
            <label>Nomor HP (opsional)<input name="phone" maxLength={30} /></label>
            <label>Kategori<select name="category" required>{categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          </div>
          <label>Nomor transaksi (opsional)<input name="transaction_number" maxLength={120} /></label>
          <label>Judul<input name="subject" minLength={3} maxLength={180} required /></label>
          <label>Pesan<textarea name="message" minLength={10} maxLength={5000} rows={7} required /></label>
          <label>Lampiran opsional (JPG, PNG, WebP, atau PDF)<input name="attachment" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" /></label>
          <input className="hidden" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
          <label className="flex flex-row items-start gap-3 text-sm"><input className="mt-1 !w-auto" type="checkbox" name="privacy_consent" required />Saya menyetujui pemrosesan data untuk penanganan tiket sesuai <Link className="text-accent-400" to="/privacy">Kebijakan Privasi</Link>.</label>
          <button disabled={submitting} className="rounded-full bg-accent-500 px-6 py-3 font-bold text-white disabled:opacity-50">{submitting ? 'Mengirim...' : 'Kirim permintaan'}</button>
        </form>
        <aside className="space-y-5">
          <div className="rounded-2xl border border-cream-50/10 p-5"><h2 className="font-bold">FAQ ringkas</h2><p className="mt-3 text-sm text-cream-200">Cantumkan nomor transaksi untuk masalah pembayaran. Jangan kirim password, OTP, PIN, atau nomor kartu lengkap.</p></div>
          <nav className="flex flex-col gap-3 text-accent-400">
            <Link to="/privacy">Kebijakan Privasi</Link><Link to="/terms">Syarat dan Ketentuan</Link><Link to="/refund-policy">Kebijakan Refund</Link><Link to="/account-deletion">Penghapusan Akun</Link>
          </nav>
        </aside>
      </div>
    </LegalPage>
  );
};

export default ContactPage;
