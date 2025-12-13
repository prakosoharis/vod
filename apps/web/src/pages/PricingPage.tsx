import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { paymentService, type SubscriptionPlan } from '@/services/payment.service';
import { useAuthStore } from '@/stores/authStore';
import { Check, Loader2 } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Get subscription plans
  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: () => paymentService.getSubscriptionPlans(),
  });

  // Get user's current subscription
  const { data: currentSubscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: () => paymentService.getUserSubscription(),
    enabled: isAuthenticated,
  });

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    try {
      setLoading(true);
      const response = await paymentService.subscribe(planId);

      // Open Midtrans Snap
      paymentService.openMidtransSnap(
        response.data.token,
        () => {
          // Success
          navigate('/payment/success?order_id=' + response.data.order_id);
        },
        (error) => {
          // Error
          console.error('Payment error:', error);
          navigate('/payment/error');
        }
      );
    } catch (error: any) {
      console.error('Subscribe error:', error);
      alert(error.response?.data?.error || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-charcoal-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-charcoal-100 pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-cream-50 mb-4">
            Pilih Paket Berlangganan
          </h1>
          <p className="text-lg md:text-xl text-cream-100">
            Batalkan kapan saja. Tanpa biaya tersembunyi.
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="mb-12 p-6 bg-accent-500/20 border-2 border-accent-500 rounded-2xl">
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 text-accent-400" />
              <div>
                <p className="text-cream-50 font-semibold">Anda sudah berlangganan</p>
                <p className="text-cream-100 text-sm">
                  Paket: {currentSubscription.plan.name} • Berlaku hingga:{' '}
                  {new Date(currentSubscription.expired_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          {plans && plans.length > 0 && (
            <div className="bg-gradient-to-br from-warm-charcoal-50 to-warm-charcoal-100 rounded-3xl p-8 md:p-12 border-2 border-accent-500/30 shadow-2xl shadow-accent-500/20 hover:shadow-accent-500/40 transition-all duration-300 hover:scale-105">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="inline-block px-4 py-1.5 bg-accent-500 rounded-full mb-4">
                  <span className="text-sm font-bold text-cream-50">UNLIMITED</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-cream-50 mb-2">
                  {plans[0].name}
                </h2>
                <p className="text-cream-100">{plans[0].description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-2xl text-cream-100">Rp</span>
                  <span className="text-5xl md:text-6xl font-bold text-cream-50">
                    {plans[0].price.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-cream-100 mt-2">per bulan</p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-accent-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-cream-50 font-semibold">Unlimited VOD</p>
                    <p className="text-cream-100 text-sm">Akses semua film dan serial tanpa batas</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-accent-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-cream-50 font-semibold">Kualitas HD</p>
                    <p className="text-cream-100 text-sm">Streaming dengan kualitas terbaik</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-accent-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-cream-50 font-semibold">Tanpa Iklan</p>
                    <p className="text-cream-100 text-sm">Nikmati konten tanpa gangguan iklan</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-accent-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-cream-50 font-semibold">Cancel Anytime</p>
                    <p className="text-cream-100 text-sm">Batalkan kapan saja tanpa penalti</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              {currentSubscription ? (
                <button
                  disabled
                  className="w-full py-4 bg-warm-charcoal-50 text-cream-100 font-bold text-lg rounded-xl cursor-not-allowed"
                >
                  Sudah Berlangganan
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plans[0].id)}
                  disabled={loading}
                  className="w-full group py-4 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-cream-50 font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/30 hover:shadow-2xl hover:shadow-accent-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Berlangganan Sekarang'
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center space-y-6">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-cream-50 mb-4">
              💡 Tips: Hemat dengan Berlangganan!
            </h3>
            <p className="text-cream-100 text-lg">
              Jika nonton lebih dari <span className="font-bold text-accent-400">5 film/bulan</span>,
              berlangganan jauh lebih hemat daripada sewa per film.
            </p>
          </div>

          <div className="pt-8">
            <p className="text-cream-100 mb-4">Cuma mau nonton 1 film?</p>
            <button
              onClick={() => navigate('/')}
              className="inline-block px-8 py-3 bg-warm-charcoal-50 hover:bg-warm-charcoal-50/80 text-cream-50 font-semibold rounded-xl transition-all duration-300 border border-cream-100/20"
            >
              Sewa Film Mulai Rp 10.000
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
