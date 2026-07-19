/**
 * Profile Screen - user info + subscription status + menu
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/Sidebar';
import { Focusable } from '@/components/Focusable';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { UserIcon, LogoutIcon, SettingsIcon, ClockIcon, PlayIcon, StarIcon } from '@/components/icons';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { userService } from '@/services';
import { setFocus } from '@/lib/spatialNavigation';
import { COLORS, THEME, WEB_APP_URL } from '@/constants';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { info, refresh: refreshSub, isLoading: subLoading } = useSubscriptionStore();

  const { data: profile } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userService.getProfile(),
    enabled: !!user,
  });

  useEffect(() => {
    refreshSub();
    setTimeout(() => setFocus('profile-menu-1'), 300);
  }, [refreshSub]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const isActive = info?.status === 'active' || info?.status === 'trial';

  return (
    <div style={{ position: 'absolute', top: 0,
          right: 0,
          bottom: 0,
          left: 0, background: COLORS.warmCharcoal[100] }}>
      <Sidebar activeKey="profile" />

      <div
        style={{
          position: 'absolute',
          left: 320,
          top: 0,
          right: 0,
          bottom: 0,
          overflowY: 'auto',
          padding: `${THEME.spacing.xxl}px ${THEME.spacing.xxxl}px`,
        }}
      >
        <h1
          style={{
            color: COLORS.cream[50],
            fontSize: THEME.typography.fontSize.xxxl,
            fontWeight: THEME.typography.fontWeight.bold,
            margin: 0,
            marginBottom: THEME.spacing.xxl,
          }}
        >
          Profil Saya
        </h1>

        {/* User Info Card */}
        <div
          style={{
            display: 'flex',
            gap: THEME.spacing.xl,
            alignItems: 'center',
            background: COLORS.warmCharcoal[200],
            padding: THEME.spacing.xxl,
            borderRadius: THEME.borderRadius.xl,
            marginBottom: THEME.spacing.xxl,
            border: `1px solid ${COLORS.warmCharcoal[50]}`,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.accent[400]} 0%, ${COLORS.accent[600]} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              fontWeight: 'bold',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {(user?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                color: COLORS.cream[50],
                fontSize: 36,
                fontWeight: THEME.typography.fontWeight.bold,
                marginBottom: 8,
              }}
            >
              {user?.full_name || 'Pengguna'}
            </div>
            <div style={{ color: COLORS.cream[100], fontSize: 22, marginBottom: 16 }}>
              {user?.email}
            </div>

            {/* Subscription Status Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 20px',
                background: isActive ? COLORS.success + '20' : COLORS.warning + '20',
                border: `2px solid ${isActive ? COLORS.success : COLORS.warning}`,
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: isActive ? COLORS.success : COLORS.warning,
                  animation: subLoading ? 'live-pulse 1.5s infinite' : 'none',
                }}
              />
              <span
                style={{
                  color: isActive ? COLORS.success : COLORS.warning,
                  fontSize: 20,
                  fontWeight: 'bold',
                }}
              >
                {isActive
                  ? `AKTIF${info?.expires_at ? ` • Berakhir ${new Date(info.expires_at).toLocaleDateString('id-ID')}` : ''}`
                  : 'BELUM BERLANGGANAN'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: THEME.spacing.lg,
            maxWidth: 1200,
          }}
        >
          {/* Manage Subscription */}
          {!isActive && (
            <Focusable
              focusKey="profile-subscribe"
              onEnter={() => navigate('/paygate')}
              focusScale={1.03}
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${COLORS.accent[500]} 0%, ${COLORS.accent[600]} 100%)`,
                  padding: THEME.spacing.xl,
                  borderRadius: THEME.borderRadius.lg,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <StarIcon size={36} color="#fff" />
                <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 12 }}>
                  Berlangganan Sekarang
                </div>
                <div style={{ fontSize: 16, opacity: 0.9, marginTop: 4 }}>
                  Aktifkan subscription untuk akses semua konten
                </div>
              </div>
            </Focusable>
          )}

          {/* Continue Watching */}
          <Focusable
            focusKey="profile-menu-1"
            onEnter={() => navigate('/home')}
            focusScale={1.03}
          >
            <div
              style={{
                background: COLORS.warmCharcoal[200],
                padding: THEME.spacing.xl,
                borderRadius: THEME.borderRadius.lg,
                cursor: 'pointer',
                border: `1px solid ${COLORS.warmCharcoal[50]}`,
              }}
            >
              <PlayIcon size={36} color={COLORS.accent[400]} />
              <div style={{ color: COLORS.cream[50], fontSize: 24, fontWeight: 'bold', marginTop: 12 }}>
                Lanjut Menonton
              </div>
              <div style={{ color: COLORS.cream[200], fontSize: 16, marginTop: 4 }}>
                Lihat history tontonan
              </div>
            </div>
          </Focusable>

          {/* My List */}
          <Focusable
            focusKey="profile-menu-2"
            onEnter={() => navigate('/home')}
            focusScale={1.03}
          >
            <div
              style={{
                background: COLORS.warmCharcoal[200],
                padding: THEME.spacing.xl,
                borderRadius: THEME.borderRadius.lg,
                cursor: 'pointer',
                border: `1px solid ${COLORS.warmCharcoal[50]}`,
              }}
            >
              <StarIcon size={36} color={COLORS.accent[400]} />
              <div style={{ color: COLORS.cream[50], fontSize: 24, fontWeight: 'bold', marginTop: 12 }}>
                Daftar Saya
              </div>
              <div style={{ color: COLORS.cream[200], fontSize: 16, marginTop: 4 }}>
                Konten yang disimpan
              </div>
            </div>
          </Focusable>

          {/* Watch History */}
          <Focusable
            focusKey="profile-menu-3"
            onEnter={() => navigate('/home')}
            focusScale={1.03}
          >
            <div
              style={{
                background: COLORS.warmCharcoal[200],
                padding: THEME.spacing.xl,
                borderRadius: THEME.borderRadius.lg,
                cursor: 'pointer',
                border: `1px solid ${COLORS.warmCharcoal[50]}`,
              }}
            >
              <ClockIcon size={36} color={COLORS.accent[400]} />
              <div style={{ color: COLORS.cream[50], fontSize: 24, fontWeight: 'bold', marginTop: 12 }}>
                Riwayat Tontonan
              </div>
              <div style={{ color: COLORS.cream[200], fontSize: 16, marginTop: 4 }}>
                Semua yang pernah ditonton
              </div>
            </div>
          </Focusable>

          {/* Refresh Status */}
          <Focusable
            focusKey="profile-menu-4"
            onEnter={() => refreshSub()}
            focusScale={1.03}
          >
            <div
              style={{
                background: COLORS.warmCharcoal[200],
                padding: THEME.spacing.xl,
                borderRadius: THEME.borderRadius.lg,
                cursor: 'pointer',
                border: `1px solid ${COLORS.warmCharcoal[50]}`,
              }}
            >
              <SettingsIcon size={36} color={COLORS.accent[400]} />
              <div style={{ color: COLORS.cream[50], fontSize: 24, fontWeight: 'bold', marginTop: 12 }}>
                Refresh Status
              </div>
              <div style={{ color: COLORS.cream[200], fontSize: 16, marginTop: 4 }}>
                Cek ulang subscription
              </div>
            </div>
          </Focusable>

          {/* Logout */}
          <Focusable
            focusKey="profile-logout"
            onEnter={handleLogout}
            focusScale={1.03}
          >
            <div
              style={{
                background: COLORS.warmCharcoal[200],
                padding: THEME.spacing.xl,
                borderRadius: THEME.borderRadius.lg,
                cursor: 'pointer',
                border: `1px solid ${COLORS.error}40`,
              }}
            >
              <LogoutIcon size={36} color={COLORS.error} />
              <div style={{ color: COLORS.cream[50], fontSize: 24, fontWeight: 'bold', marginTop: 12 }}>
                Keluar
              </div>
              <div style={{ color: COLORS.cream[200], fontSize: 16, marginTop: 4 }}>
                Logout dari akun ini
              </div>
            </div>
          </Focusable>
        </div>

        {/* Help info */}
        <div
          style={{
            marginTop: THEME.spacing.xxl,
            padding: THEME.spacing.xl,
            background: COLORS.warmCharcoal[200],
            borderRadius: THEME.borderRadius.lg,
            border: `1px solid ${COLORS.warmCharcoal[50]}`,
          }}
        >
          <div style={{ color: COLORS.cream[100], fontSize: 20, marginBottom: 12, fontWeight: 'bold' }}>
            Butuh Bantuan?
          </div>
          <div style={{ color: COLORS.cream[200], fontSize: 18, lineHeight: 1.6 }}>
            Untuk mengelola langganan, pembayaran, atau pertanyaan lain, kunjungi{' '}
            <a
              href={WEB_APP_URL}
              target="_blank"
              rel="noreferrer"
              style={{ color: COLORS.accent[400], fontWeight: 'bold' }}
            >
              {WEB_APP_URL}
            </a>{' '}
            atau email support@smashstream.id
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;
