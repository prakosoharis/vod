/**
 * Subscription Gate (Paywall) - Modal version without QR code
 *
 * Replaces Midtrans payment flow on TV.
 * Shows a simple modal asking user to subscribe via mobile app or website.
 * Auto-polls subscription status; on success calls onSuccess callback.
 */
import { useEffect, useState } from 'react';
import { Button } from './Button';
import { Focusable } from './Focusable';
import {
  LockIcon,
  RefreshIcon,
  SmartphoneIcon,
  LanguageIcon,
  InfoIcon,
  CloseIcon,
} from './icons';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { COLORS, THEME, WEB_APP_URL, SUBSCRIPTION_POLL_INTERVAL } from '@/constants';

interface SubscriptionGateProps {
  contentTitle?: string;
  onSuccess: () => void;
  onBack?: () => void;
  mode?: 'play' | 'general';
}

export function SubscriptionGate({
  contentTitle,
  onSuccess,
  onBack,
  mode = 'play',
}: SubscriptionGateProps) {
  const { user } = useAuthStore();
  const { info, refresh, isLoading } = useSubscriptionStore();
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastCheckedDisplay, setLastCheckedDisplay] = useState<string>('');

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-poll subscription status
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const interval = setInterval(async () => {
      const newInfo = await refresh();
      if (newInfo?.status === 'active' || newInfo?.status === 'trial') {
        onSuccess();
      }
    }, SUBSCRIPTION_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refresh, onSuccess]);

  // Update "last checked" display
  useEffect(() => {
    const update = () => {
      const last = useSubscriptionStore.getState().lastChecked;
      if (last) {
        const d = new Date(last);
        setLastCheckedDisplay(
          d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      }
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [info, isLoading]);

  // Fire onSuccess when subscription becomes active
  useEffect(() => {
    if (info?.status === 'active' || info?.status === 'trial') {
      onSuccess();
    }
  }, [info?.status, onSuccess]);

  const handleManualRefresh = async () => {
    setAutoRefreshEnabled(false);
    await refresh();
    setTimeout(() => setAutoRefreshEnabled(true), 5000);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        background: COLORS.overlay.heavy,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: THEME.spacing.xxxl,
        zIndex: THEME.zIndex.modal,
      }}
    >
      {/* Modal container */}
      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          background: `linear-gradient(135deg, ${COLORS.warmCharcoal[200]} 0%, ${COLORS.warmCharcoal[100]} 100%)`,
          borderRadius: THEME.borderRadius.xxl,
          border: `2px solid ${COLORS.warmCharcoal[50]}`,
          padding: THEME.spacing.xxxl,
          boxShadow: THEME.shadows.xl,
          position: 'relative',
        }}
      >
        {/* Close button (top-right) */}
        {onBack && (
          <Focusable
            focusKey="paygate-close"
            onEnter={onBack}
            focusScale={1.1}
            focusGlow={false}
          >
            <button
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: COLORS.warmCharcoal[300] + '80',
                border: 'none',
                color: COLORS.cream[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Tutup"
            >
              <CloseIcon size={28} />
            </button>
          </Focusable>
        )}

        {/* Lock icon (centered) */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${COLORS.accent[500]}30 0%, ${COLORS.accent[600]}10 100%)`,
            border: `2px solid ${COLORS.accent[500]}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <LockIcon size={64} color={COLORS.accent[400]} />
        </div>

        <h1
          style={{
            color: COLORS.cream[50],
            fontSize: 56,
            fontWeight: THEME.typography.fontWeight.bold,
            margin: 0,
            marginBottom: THEME.spacing.md,
            textAlign: 'center',
          }}
        >
          {mode === 'play' ? 'Aktifkan Langganan' : 'Langganan Diperlukan'}
        </h1>

        <p
          style={{
            color: COLORS.cream[100],
            fontSize: 24,
            maxWidth: 800,
            textAlign: 'center',
            margin: '0 auto 40px',
            lineHeight: 1.5,
          }}
        >
          {contentTitle
            ? `Untuk menonton "${contentTitle}", silakan aktifkan langganan Anda terlebih dahulu melalui aplikasi mobile atau website kami.`
            : 'Silakan selesaikan pembayaran langganan melalui aplikasi mobile atau website untuk menikmati semua konten.'}
        </p>

        {/* Two ways to subscribe */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: THEME.spacing.xl,
            marginBottom: 32,
          }}
        >
          {/* Option 1: Mobile App */}
          <div
            style={{
              background: COLORS.warmCharcoal[300] + '60',
              borderRadius: THEME.borderRadius.xl,
              padding: THEME.spacing.xl,
              border: `1px solid ${COLORS.warmCharcoal[50]}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: COLORS.accent[500] + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <SmartphoneIcon size={44} color={COLORS.accent[400]} />
            </div>
            <h2
              style={{
                color: COLORS.cream[50],
                fontSize: 28,
                fontWeight: THEME.typography.fontWeight.bold,
                margin: 0,
                marginBottom: 8,
              }}
            >
              Lewat Aplikasi Mobile
            </h2>
            <p
              style={{
                color: COLORS.cream[200],
                fontSize: 18,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Buka aplikasi SMASH di HP Anda, login dengan akun yang sama,
              lalu pilih paket berlangganan.
            </p>
          </div>

          {/* Option 2: Website */}
          <div
            style={{
              background: COLORS.warmCharcoal[300] + '60',
              borderRadius: THEME.borderRadius.xl,
              padding: THEME.spacing.xl,
              border: `1px solid ${COLORS.warmCharcoal[50]}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: COLORS.accent[500] + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <LanguageIcon size={44} color={COLORS.accent[400]} />
            </div>
            <h2
              style={{
                color: COLORS.cream[50],
                fontSize: 28,
                fontWeight: THEME.typography.fontWeight.bold,
                margin: 0,
                marginBottom: 8,
              }}
            >
              Lewat Website
            </h2>
            <p
              style={{
                color: COLORS.cream[200],
                fontSize: 18,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Buka browser di laptop/HP, kunjungi{' '}
              <strong style={{ color: COLORS.accent[400] }}>{WEB_APP_URL}</strong>{' '}
              dan login dengan akun yang sama.
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div
          style={{
            padding: '16px 24px',
            background: COLORS.warmCharcoal[300] + '40',
            borderRadius: THEME.borderRadius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 24,
            border: `1px solid ${COLORS.warmCharcoal[50]}`,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: isLoading ? COLORS.warning : COLORS.success,
              animation: isLoading ? 'live-pulse 1.5s infinite' : 'none',
            }}
          />
          <span style={{ color: COLORS.cream[100], fontSize: 18 }}>
            {isLoading
              ? 'Memeriksa status pembayaran...'
              : 'Menunggu pembayaran. TV akan otomatis lanjut setelah pembayaran berhasil.'}
            {lastCheckedDisplay && (
              <span style={{ color: COLORS.cream[200] }}> (terakhir cek: {lastCheckedDisplay})</span>
            )}
          </span>
        </div>

        {/* Info note */}
        <div
          style={{
            padding: '14px 20px',
            background: COLORS.info + '15',
            borderRadius: THEME.borderRadius.md,
            border: `1px solid ${COLORS.info}30`,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <InfoIcon size={24} color={COLORS.info} />
          <span style={{ color: COLORS.cream[100], fontSize: 16 }}>
            Pastikan login dengan akun yang sama: <strong style={{ color: COLORS.accent[400] }}>{user?.email}</strong>
          </span>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: THEME.spacing.lg,
            justifyContent: 'center',
          }}
        >
          <Button
            focusKey="paygate-refresh"
            onPress={handleManualRefresh}
            variant="secondary"
            icon={<RefreshIcon size={28} />}
          >
            Cek Ulang Status
          </Button>

          {onBack && (
            <Button
              focusKey="paygate-back"
              onPress={onBack}
              variant="ghost"
            >
              Kembali
            </Button>
          )}
        </div>

        {/* Help text at bottom */}
        <p
          style={{
            color: COLORS.cream[300],
            fontSize: 14,
            marginTop: 24,
            textAlign: 'center',
            margin: '24px auto 0',
          }}
        >
          Butuh bantuan? Email support@smashstream.id
        </p>
      </div>
    </div>
  );
}

export default SubscriptionGate;
