import React, { useState } from 'react';
import { X, Loader2, Play, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '@/services/payment.service';
import type { Content } from '@/types';

interface PaymentOptionsModalProps {
  content: Content;
  isOpen: boolean;
  onClose: () => void;
  rentalPrice?: number;
  rentalDuration?: number;
}

const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({
  content,
  isOpen,
  onClose,
  rentalPrice = 10000,
  rentalDuration = 24,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'rental' | 'subscription'>('rental');

  const handleRent = async () => {
    try {
      setLoading(true);
      const response = await paymentService.rentContent(content.id);

      // Open Midtrans Snap
      paymentService.openMidtransSnap(
        response.data.token,
        () => {
          // Success - redirect to payment success page for verification
          onClose();
          navigate(`/payment/success?order_id=${response.data.order_id}`);
        },
        (error) => {
          // Error
          console.error('Payment error:', error);
          navigate(`/payment/error?order_id=${response.data.order_id}`);
        }
      );
    } catch (error: any) {
      console.error('Rent error:', error);
      alert(error.response?.data?.error || 'Gagal membuat transaksi');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSubscription = () => {
    onClose();
    navigate('/pricing');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-warm-charcoal-50 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-warm-charcoal-100/80 rounded-full hover:bg-warm-charcoal-100 text-cream-50 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-cream-100/10">
          <h2 className="text-2xl font-bold text-cream-50 mb-2">Pilih Cara Menonton</h2>
          <p className="text-cream-100 text-sm">{content.title}</p>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          {/* Rental Option */}
          <div
            onClick={() => setSelectedOption('rental')}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedOption === 'rental'
                ? 'border-accent-500 bg-accent-500/10'
                : 'border-cream-100/20 hover:border-cream-100/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                selectedOption === 'rental'
                  ? 'border-accent-500 bg-accent-500'
                  : 'border-cream-100/40'
              }`}>
                {selectedOption === 'rental' && (
                  <div className="w-full h-full rounded-full bg-cream-50 scale-50"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <CreditCard className="w-5 h-5 text-accent-400" />
                  <h3 className="text-lg font-bold text-cream-50">Sewa Film Ini</h3>
                </div>
                <p className="text-2xl font-bold text-accent-400 mb-1">
                  Rp {rentalPrice.toLocaleString('id-ID')}
                </p>
                <p className="text-cream-100 text-sm">
                  Akses {rentalDuration} jam • Nonton kapan saja dalam periode ini
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Option */}
          <div
            onClick={() => setSelectedOption('subscription')}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedOption === 'subscription'
                ? 'border-accent-500 bg-accent-500/10'
                : 'border-cream-100/20 hover:border-cream-100/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                selectedOption === 'subscription'
                  ? 'border-accent-500 bg-accent-500'
                  : 'border-cream-100/40'
              }`}>
                {selectedOption === 'subscription' && (
                  <div className="w-full h-full rounded-full bg-cream-50 scale-50"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <Play className="w-5 h-5 text-accent-400" />
                  <h3 className="text-lg font-bold text-cream-50">Berlangganan</h3>
                </div>
                <p className="text-2xl font-bold text-accent-400 mb-1">
                  Rp 50.000/bulan
                </p>
                <p className="text-cream-100 text-sm">
                  Unlimited akses • Semua film & serial • Tanpa batas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 border-t border-cream-100/10">
          {selectedOption === 'rental' ? (
            <button
              onClick={handleRent}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-cream-50 font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/30 hover:shadow-2xl hover:shadow-accent-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Sewa Rp {rentalPrice.toLocaleString('id-ID')}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleGoToSubscription}
              className="w-full py-4 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-cream-50 font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/30 hover:shadow-2xl hover:shadow-accent-500/50 active:scale-95 flex items-center justify-center gap-2"
            >
              Lihat Paket Berlangganan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentOptionsModal;
