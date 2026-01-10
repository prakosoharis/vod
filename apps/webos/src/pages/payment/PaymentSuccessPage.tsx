import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../utils';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactionId, amount, type } = location.state || {};

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-lg w-full bg-surface rounded-2xl p-12 shadow-2xl text-center">
        <div className="w-24 h-24 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <Icon name="Check" size={48} className="text-green-600" />
        </div>

        <h1 className="text-4xl font-bold text-primary-50 mb-4">Pembayaran Berhasil!</h1>
        <p className="text-secondary text-lg mb-8">
          Langganan Anda sudah aktif. Nikmati akses unlimited ke semua konten.
        </p>

        {transactionId && (
          <div className="bg-primary-900/30 rounded-xl p-6 mb-8 text-left">
            <div className="flex justify-between mb-4">
              <span className="text-secondary">ID Transaksi</span>
              <span className="text-primary-50 font-semibold">{transactionId}</span>
            </div>
            {amount && (
              <div className="flex justify-between mb-4">
                <span className="text-secondary">Jumlah</span>
                <span className="text-primary-50 font-semibold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(amount)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-secondary">Tipe</span>
              <span className="text-primary-50 font-semibold">
                {type === 'subscription' ? 'Langganan' : 'Sekali Bayar'}
              </span>
            </div>
          </div>
        )}

        <Button size="lg" onClick={() => navigate('/')} className="w-full">
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
