/**
 * App Root - sets up providers and router
 */
import { HashRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { AppNavigator } from '@/navigation/AppNavigator';

declare global {
  interface Window {
    playSplashIntroSound?: () => void;
  }
}

export default function App() {
  // Remove splash screen once React mounts
  useEffect(() => {
    window.playSplashIntroSound?.();

    const retrySound = window.setTimeout(() => {
      window.playSplashIntroSound?.();
    }, 350);

    const splash = document.getElementById('splash');
    if (splash) {
      const timer = window.setTimeout(() => {
        splash.style.opacity = '0';
        splash.style.transition = 'opacity 0.5s';
        window.setTimeout(() => splash.remove(), 600);
      }, 5000);

      return () => {
        window.clearTimeout(retrySound);
        window.clearTimeout(timer);
      };
    }

    return () => window.clearTimeout(retrySound);
  }, []);

  return (
    <div className="tv-scale-root">
      <QueryProvider>
        <HashRouter>
          <AppNavigator />
        </HashRouter>
      </QueryProvider>
    </div>
  );
}
