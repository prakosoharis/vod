import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../services';
import type { SubscriptionPlan } from '../../types';
import { cn, formatPrice } from '../../utils';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Icon from '../../components/ui/Icon';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => paymentService.getSubscriptionPlans(),
  });

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setIsProcessing(plan.id);
    try {
      const response = await paymentService.subscribe(plan.id);

      if (window.snap) {
        window.snap.pay(response.snap_token, {
          onSuccess: async () => {
            await paymentService.verifyPaymentStatus(response.transaction_id);
            navigate('/payment/success', {
              state: {
                transactionId: response.transaction_id,
                amount: response.gross_amount,
                type: 'subscription',
              },
            });
          },
          onPending: () => {
            navigate('/payment/pending');
          },
          onClose: () => {
            setIsProcessing(null);
          },
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !plans) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center">
          <Icon name="AlertCircle" size={64} className="text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-xl">Gagal memuat paket langganan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />

      <div className="pt-24 px-8 pb-16">
        <h1 className="text-5xl font-bold text-primary-50 mb-4">Pilih Paket Langganan</h1>
        <p className="text-secondary text-xl mb-12">
          Nikmati akses unlimited ke semua konten
        </p>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'bg-surface rounded-2xl p-8 border-2 transition-all duration-200',
                'hover:scale-105'
              )}
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-accent-500 mb-4">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-gray-400">/{plan.duration_days} hari</span>
                </div>
                {plan.description && (
                  <p className="text-secondary mt-4">{plan.description}</p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-text-secondary">
                    <Icon name="CheckCircle" size={20} className="text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                onClick={() => handleSubscribe(plan)}
                disabled={isProcessing === plan.id}
                className="w-full"
              >
                {isProcessing === plan.id ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  'Berlangganan'
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
