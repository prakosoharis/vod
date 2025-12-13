import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Home, RotateCcw } from 'lucide-react';

export const PaymentErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-warm-charcoal-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-warm-charcoal-50 rounded-2xl p-8 text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="w-10 h-10 text-red-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-cream-50 mb-4">Pembayaran Gagal</h1>

        {/* Message */}
        <p className="text-cream-100 mb-6">
          Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi atau gunakan metode pembayaran lain.
        </p>

        {/* Order ID if available */}
        {orderId && (
          <div className="bg-warm-charcoal-100 rounded-xl p-4 mb-6">
            <p className="text-cream-100 text-sm mb-1">Order ID:</p>
            <p className="text-cream-50 font-mono text-sm">{orderId}</p>
          </div>
        )}

        {/* Common Error Reasons */}
        <div className="bg-warm-charcoal-100 rounded-xl p-4 mb-6 text-left">
          <p className="text-cream-50 font-semibold mb-2">Kemungkinan penyebab:</p>
          <ul className="text-cream-100 text-sm space-y-1">
            <li>• Saldo tidak mencukupi</li>
            <li>• Pembayaran dibatalkan</li>
            <li>• Koneksi internet terputus</li>
            <li>• Batas waktu pembayaran habis</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-cream-50 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Coba Lagi
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-warm-charcoal-100 hover:bg-warm-charcoal-100/80 text-cream-50 font-semibold rounded-xl transition-colors border border-cream-100/20 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-cream-100/10">
          <p className="text-cream-100 text-sm">
            Butuh bantuan?{' '}
            <a href="mailto:support@mostara.id" className="text-accent-400 hover:text-accent-300 underline">
              Hubungi kami
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorPage;
