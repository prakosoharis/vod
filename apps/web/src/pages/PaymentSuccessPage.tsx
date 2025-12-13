import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { paymentService } from '@/services/payment.service';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [countdown, setCountdown] = useState(5);

  // Get transaction details
  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', orderId],
    queryFn: () => orderId ? paymentService.getTransactionStatus(orderId) : null,
    enabled: !!orderId,
    refetchInterval: (data) => {
      // Keep polling if status is still pending
      return data?.status === 'PENDING' ? 2000 : false;
    },
  });

  // Countdown and auto redirect
  useEffect(() => {
    if (transaction?.status === 'SETTLEMENT' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      // Redirect based on payment type
      if (transaction?.payment_type === 'RENTAL' && transaction.rental) {
        navigate(`/watch/${transaction.rental.content_id}`);
      } else {
        navigate('/');
      }
    }
  }, [countdown, transaction, navigate]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-warm-charcoal-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cream-50 mb-4">Order ID tidak ditemukan</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-cream-50 font-semibold rounded-xl transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-charcoal-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-accent-500 animate-spin mx-auto mb-4" />
          <p className="text-cream-100">Memverifikasi pembayaran...</p>
        </div>
      </div>
    );
  }

  if (transaction?.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-warm-charcoal-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-warm-charcoal-50 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-cream-50 mb-4">Pembayaran Pending</h1>
          <p className="text-cream-100 mb-6">
            Pembayaran Anda sedang diproses. Mohon tunggu beberapa saat.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-cream-50 font-semibold rounded-xl transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (transaction?.status !== 'SETTLEMENT') {
    return (
      <div className="min-h-screen bg-warm-charcoal-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-warm-charcoal-50 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-cream-50 mb-4">Pembayaran Gagal</h1>
          <p className="text-cream-100 mb-6">
            Pembayaran Anda tidak berhasil. Silakan coba lagi.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-cream-50 font-semibold rounded-xl transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Success!
  return (
    <div className="min-h-screen bg-warm-charcoal-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-warm-charcoal-50 rounded-2xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-cream-50 mb-4">Pembayaran Berhasil!</h1>

        {/* Message based on payment type */}
        {transaction.payment_type === 'SUBSCRIPTION' && (
          <p className="text-cream-100 mb-6">
            Selamat! Anda sekarang dapat menikmati semua konten tanpa batas.
          </p>
        )}

        {transaction.payment_type === 'RENTAL' && transaction.rental && (
          <p className="text-cream-100 mb-6">
            Film <span className="font-semibold text-accent-400">{transaction.rental.content.title}</span> sudah bisa ditonton!
          </p>
        )}

        {transaction.payment_type === 'EVENT_TICKET' && transaction.event_ticket && (
          <p className="text-cream-100 mb-6">
            Tiket untuk <span className="font-semibold text-accent-400">{transaction.event_ticket.event.title}</span> berhasil dibeli!
          </p>
        )}

        {/* Transaction Details */}
        <div className="bg-warm-charcoal-100 rounded-xl p-4 mb-6 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-cream-100">Order ID:</span>
            <span className="text-cream-50 font-mono text-sm">{transaction.order_id}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-cream-100">Jumlah:</span>
            <span className="text-cream-50 font-semibold">
              Rp {Number(transaction.amount).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-cream-100">Metode:</span>
            <span className="text-cream-50 capitalize">{transaction.payment_method || '-'}</span>
          </div>
        </div>

        {/* Auto redirect countdown */}
        <p className="text-cream-100 text-sm mb-4">
          Redirect otomatis dalam {countdown} detik...
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {transaction.payment_type === 'RENTAL' && transaction.rental && (
            <button
              onClick={() => navigate(`/watch/${transaction.rental!.content_id}`)}
              className="w-full py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-cream-50 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              Tonton Sekarang
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-warm-charcoal-100 hover:bg-warm-charcoal-100/80 text-cream-50 font-semibold rounded-xl transition-colors border border-cream-100/20"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
