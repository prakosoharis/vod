import { useEffect, useState } from 'react';

type Preferences = {
  necessary: true;
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
  updated_at: string;
};

const STORAGE_KEY = 'smash_cookie_preferences_v1';

function savePreferences(preferences: Omit<Preferences, 'necessary' | 'updated_at'>) {
  const value: Preferences = {
    necessary: true,
    ...preferences,
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('smash-cookie-consent', { detail: value }));
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const open = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        setAnalytics(Boolean(saved.analytics));
        setPreferences(Boolean(saved.preferences));
        setMarketing(Boolean(saved.marketing));
      } catch {
        setAnalytics(false);
        setPreferences(false);
        setMarketing(false);
      }
      setManage(true);
      setVisible(true);
    };
    window.addEventListener('smash-open-cookie-preferences', open);
    return () => window.removeEventListener('smash-open-cookie-preferences', open);
  }, []);

  if (!visible) return null;
  const finish = (value: Omit<Preferences, 'necessary' | 'updated_at'>) => {
    savePreferences(value);
    setVisible(false);
  };

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[10000] mx-auto max-w-3xl rounded-2xl border border-cream-50/15 bg-warm-charcoal-50 p-5 shadow-2xl" role="dialog" aria-label="Preferensi cookie">
      <h2 className="font-bold text-cream-50">Preferensi Cookie</h2>
      <p className="mt-2 text-sm text-cream-200">Cookie penting digunakan untuk autentikasi dan keamanan. Analytics, preferensi, dan marketing tidak diaktifkan sebelum Anda memilihnya.</p>
      {manage && <div className="mt-4 grid gap-3 text-sm text-cream-100 md:grid-cols-2">
        <label><input type="checkbox" checked disabled /> Necessary (selalu aktif)</label>
        <label><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Analytics</label>
        <label><input type="checkbox" checked={preferences} onChange={(e) => setPreferences(e.target.checked)} /> Preferences</label>
        <label><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Marketing</label>
      </div>}
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="rounded-full bg-accent-500 px-4 py-2 text-sm font-bold text-white" onClick={() => finish({ analytics: true, preferences: true, marketing: true })}>Accept All</button>
        <button className="rounded-full border border-cream-50/20 px-4 py-2 text-sm text-cream-50" onClick={() => finish({ analytics: false, preferences: false, marketing: false })}>Reject Non-Essential</button>
        {manage
          ? <button className="rounded-full border border-accent-400 px-4 py-2 text-sm text-accent-300" onClick={() => finish({ analytics, preferences, marketing })}>Simpan Preferensi</button>
          : <button className="rounded-full border border-cream-50/20 px-4 py-2 text-sm text-cream-50" onClick={() => setManage(true)}>Manage Preferences</button>}
      </div>
    </aside>
  );
};

export default CookieConsent;
