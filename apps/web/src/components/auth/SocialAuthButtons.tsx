import { useState } from 'react';
import { authService } from '@/services/auth.service';

type Provider = 'google' | 'facebook';

function ProviderLogo({ provider }: { provider: Provider }) {
  if (provider === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#1877F2" />
        <path fill="#fff" d="M13.6 20v-7h2.35l.35-2.73h-2.7V8.53c0-.79.22-1.33 1.35-1.33h1.44V4.76a19.4 19.4 0 0 0-2.1-.11c-2.08 0-3.5 1.27-3.5 3.6v2.02H8.44V13h2.35v7h2.81Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.77-5.61-4.14H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.92A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.46H3.04A10 10 0 0 0 2 12c0 1.62.39 3.15 1.04 4.54l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.46l3.35 2.62C7.18 7.71 9.39 5.94 12 5.94Z" />
    </svg>
  );
}

export function SocialAuthButtons({ compact = false }: { compact?: boolean }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<Provider | null>(null);

  const authenticate = async (provider: Provider) => {
    setError('');
    setLoading(provider);
    try {
      const result = await authService.social(provider);
      if (result?.authorization_url) window.location.assign(result.authorization_url);
      else setError(`Login ${provider === 'google' ? 'Google' : 'Facebook'} belum tersedia.`);
    } catch {
      setError(`Login ${provider === 'google' ? 'Google' : 'Facebook'} belum dikonfigurasi.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={compact ? 'social-auth social-auth--compact' : 'social-auth'}>
      <div className="social-auth__divider"><span />atau lanjutkan dengan<span /></div>
      <div className="social-auth__buttons">
        {(['google', 'facebook'] as Provider[]).map((provider) => (
          <button
            key={provider}
            type="button"
            className="social-auth__button"
            disabled={loading !== null}
            onClick={() => authenticate(provider)}
            aria-label={`Masuk dengan ${provider === 'google' ? 'Google' : 'Facebook'}`}
          >
            <ProviderLogo provider={provider} />
            <span>{provider === 'google' ? 'Google' : 'Facebook'}</span>
          </button>
        ))}
      </div>
      {error && <p role="alert" className="social-auth__error">{error}</p>}
    </div>
  );
}
