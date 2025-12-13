import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, Film, LogOut, Check, X, Calendar, Clock, Crown } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { useAuthStore } from '@/stores/authStore';

type TabType = 'subscription' | 'rentals';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('subscription');

  // Get user subscription
  const { data: subscription, isLoading: loadingSubscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: () => paymentService.getUserSubscription(),
  });

  // Get user rentals
  const { data: rentals, isLoading: loadingRentals } = useQuery({
    queryKey: ['user-rentals'],
    queryFn: () => paymentService.getUserRentals(),
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan langganan? Anda masih bisa mengakses konten hingga periode berakhir.')) {
      try {
        await paymentService.cancelSubscription();
        alert('Langganan berhasil dibatalkan. Auto-renew dimatikan.');
        window.location.reload();
      } catch (error) {
        console.error('Cancel error:', error);
        alert('Gagal membatalkan langganan');
      }
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const isExpiringSoon = (date: string) => {
    const daysUntilExpiry = Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  return (
    <div className="min-h-screen bg-warm-charcoal-100 pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-warm-charcoal-50 to-warm-charcoal-100 rounded-2xl p-8 mb-8 border border-accent-500/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-accent-500/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-accent-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-cream-50 mb-1">
                  {user?.full_name || user?.email.split('@')[0] || 'User'}
                </h1>
                <p className="text-cream-100">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-warm-charcoal-100 hover:bg-warm-charcoal-50 text-cream-50 rounded-xl transition-colors flex items-center gap-2 border border-cream-100/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'subscription'
                ? 'bg-accent-500 text-cream-50 shadow-lg shadow-accent-500/30'
                : 'bg-warm-charcoal-50 text-cream-100 hover:bg-warm-charcoal-50/80'
            }`}
          >
            <Crown className="w-5 h-5" />
            Berlangganan
          </button>
          <button
            onClick={() => setActiveTab('rentals')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'rentals'
                ? 'bg-accent-500 text-cream-50 shadow-lg shadow-accent-500/30'
                : 'bg-warm-charcoal-50 text-cream-100 hover:bg-warm-charcoal-50/80'
            }`}
          >
            <Film className="w-5 h-5" />
            Film Disewa
          </button>
        </div>

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {loadingSubscription ? (
              <div className="bg-warm-charcoal-50 rounded-2xl p-8 text-center">
                <p className="text-cream-100">Loading...</p>
              </div>
            ) : subscription ? (
              <div className="bg-gradient-to-br from-warm-charcoal-50 to-warm-charcoal-100 rounded-2xl p-8 border-2 border-accent-500/30">
                {/* Status Badge */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-4 py-1.5 bg-green-500/20 rounded-full flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">Active</span>
                  </div>
                  {!subscription.auto_renew && (
                    <div className="px-4 py-1.5 bg-yellow-500/20 rounded-full flex items-center gap-2">
                      <X className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">Auto-renew OFF</span>
                    </div>
                  )}
                </div>

                {/* Plan Info */}
                <h2 className="text-2xl font-bold text-cream-50 mb-2">{subscription.plan.name}</h2>
                <p className="text-cream-100 mb-6">{subscription.plan.description}</p>

                {/* Details */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-warm-charcoal-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-accent-400" />
                      <span className="text-cream-100 text-sm">Mulai</span>
                    </div>
                    <p className="text-cream-50 font-semibold">
                      {new Date(subscription.started_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="bg-warm-charcoal-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-accent-400" />
                      <span className="text-cream-100 text-sm">Berakhir</span>
                    </div>
                    <p className={`font-semibold ${
                      isExpiringSoon(subscription.expired_at) ? 'text-yellow-400' : 'text-cream-50'
                    }`}>
                      {new Date(subscription.expired_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-warm-charcoal-100 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-accent-400" />
                    <span className="text-cream-100 text-sm">Harga</span>
                  </div>
                  <p className="text-cream-50 font-semibold text-xl">
                    Rp {Number(subscription.plan.price).toLocaleString('id-ID')} / bulan
                  </p>
                </div>

                {/* Actions */}
                {subscription.auto_renew && (
                  <button
                    onClick={handleCancelSubscription}
                    className="w-full py-3 bg-warm-charcoal-100 hover:bg-warm-charcoal-50 text-cream-50 font-semibold rounded-xl transition-colors border border-cream-100/20"
                  >
                    Batalkan Langganan
                  </button>
                )}

                {!subscription.auto_renew && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <p className="text-yellow-400 text-sm">
                      Langganan tidak akan diperpanjang otomatis. Anda masih bisa mengakses hingga{' '}
                      {new Date(subscription.expired_at).toLocaleDateString('id-ID')}.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-warm-charcoal-50 rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-warm-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-cream-100" />
                </div>
                <h3 className="text-2xl font-bold text-cream-50 mb-4">Belum Berlangganan</h3>
                <p className="text-cream-100 mb-6">
                  Berlangganan untuk akses unlimited ke semua film dan serial!
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-8 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-cream-50 font-bold rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/30"
                >
                  Lihat Paket Berlangganan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Rentals Tab */}
        {activeTab === 'rentals' && (
          <div className="space-y-4">
            {loadingRentals ? (
              <div className="bg-warm-charcoal-50 rounded-2xl p-8 text-center">
                <p className="text-cream-100">Loading...</p>
              </div>
            ) : rentals && rentals.length > 0 ? (
              rentals.map((rental) => (
                <div
                  key={rental.id}
                  className={`bg-warm-charcoal-50 rounded-2xl p-6 border-2 transition-all ${
                    isExpired(rental.expired_at)
                      ? 'border-warm-charcoal-100 opacity-60'
                      : 'border-accent-500/30 hover:border-accent-500/50'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Poster */}
                    <img
                      src={rental.content.thumbnail_url}
                      alt={rental.content.title}
                      className="w-24 h-36 object-cover rounded-xl flex-shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-cream-50">{rental.content.title}</h3>
                        {isExpired(rental.expired_at) ? (
                          <span className="px-3 py-1 bg-red-500/20 rounded-full text-red-400 text-sm font-semibold">
                            Expired
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-sm font-semibold">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-cream-100 text-sm">
                          <Calendar className="w-4 h-4" />
                          Disewa: {new Date(rental.rented_at).toLocaleDateString('id-ID')}
                        </div>
                        <div className="flex items-center gap-2 text-cream-100 text-sm">
                          <Clock className="w-4 h-4" />
                          Berakhir: {new Date(rental.expired_at).toLocaleDateString('id-ID')} {new Date(rental.expired_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-2 text-cream-100 text-sm">
                          <CreditCard className="w-4 h-4" />
                          Rp {Number(rental.rental_price.price).toLocaleString('id-ID')} • {rental.rental_price.duration_hours} jam
                        </div>
                      </div>

                      {!isExpired(rental.expired_at) && (
                        <button
                          onClick={() => navigate(`/watch/${rental.content_id}`)}
                          className="px-6 py-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-cream-50 font-semibold rounded-xl transition-all duration-300"
                        >
                          Tonton Sekarang
                        </button>
                      )}

                      {isExpired(rental.expired_at) && (
                        <button
                          onClick={() => navigate('/')}
                          className="px-6 py-2 bg-warm-charcoal-100 hover:bg-warm-charcoal-50 text-cream-100 font-semibold rounded-xl transition-colors border border-cream-100/20"
                        >
                          Sewa Lagi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-warm-charcoal-50 rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-warm-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Film className="w-10 h-10 text-cream-100" />
                </div>
                <h3 className="text-2xl font-bold text-cream-50 mb-4">Belum Ada Film Disewa</h3>
                <p className="text-cream-100 mb-6">
                  Mulai sewa film favorit Anda mulai dari Rp 10.000!
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-cream-50 font-bold rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/30"
                >
                  Jelajahi Film
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
