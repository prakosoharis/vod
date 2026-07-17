import React, { useState } from 'react';
import { X, Loader2, CreditCard, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '@/services/payment.service';
import type { Content } from '@/types';

interface Props {
  content: Content;
  isOpen: boolean;
  onClose: () => void;
  rentalPrice?: number;
  rentalDuration?: number;
}

const PaymentOptionsModal: React.FC<Props> = ({ content, isOpen, onClose, rentalPrice, rentalDuration }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const price = rentalPrice ?? Number(content.rental_price?.price || 0);
  const duration = rentalDuration ?? content.rental_price?.duration_hours ?? 0;
  const available = content.rental_price?.is_active !== false && price > 0 && duration > 0;

  const handleRent = async () => {
    try {
      setLoading(true);
      const response = await paymentService.rentContent(content.id);
      paymentService.openMidtransSnap(response.data.token, () => {
        onClose();
        navigate(`/payment/success?order_id=${response.data.order_id}`);
      }, () => navigate(`/payment/error?order_id=${response.data.order_id}`));
    } catch (error: any) {
      alert(error.response?.data?.error || 'Gagal membuat transaksi sewa');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onClick={onClose}>
    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-warm-charcoal-50 shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-warm-charcoal-100/80 p-2 text-cream-50"><X size={20}/></button>
      <div className="border-b border-cream-100/10 p-6">
        <h2 className="mb-2 text-2xl font-bold text-cream-50">Sewa {content.type === 'SERIES' ? 'Series' : 'Film'}</h2>
        <p className="text-sm text-cream-100">{content.title}</p>
      </div>
      <div className="p-6">
        {available ? <div className="rounded-xl border-2 border-accent-500 bg-accent-500/10 p-5">
          <div className="mb-2 flex items-center gap-2 text-cream-50"><CreditCard className="text-accent-400"/><b>Akses rental sekali bayar</b></div>
          <p className="text-3xl font-bold text-accent-400">Rp {price.toLocaleString('id-ID')}</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-cream-100"><Clock size={16}/> Aktif selama {duration} jam sejak pembayaran berhasil.</p>
          <p className="mt-2 text-xs text-cream-100/70">Setelah masa sewa berakhir, film perlu disewa kembali untuk ditonton.</p>
        </div> : <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-yellow-100">Film ini sedang tidak tersedia untuk disewa.</div>}
      </div>
      <div className="border-t border-cream-100/10 p-6">
        <button onClick={handleRent} disabled={loading || !available} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-4 text-lg font-bold text-cream-50 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? <><Loader2 className="animate-spin"/>Memproses...</> : <><CreditCard/>Sewa Rp {price.toLocaleString('id-ID')}</>}
        </button>
      </div>
    </div>
  </div>;
};

export default PaymentOptionsModal;
