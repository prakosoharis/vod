import { useCallback, useEffect, useState } from 'react'
import AppRoutes from './routes/AppRoutes'
import { useAuthStore } from '@/stores/authStore'
import SmashIntro from './components/SmashIntro'
import CookieConsent from './components/legal/CookieConsent'

const INTRO_SESSION_KEY = 'smash_intro_played'
const INTRO_FREE_PATHS = new Set([
  '/verify-email',
  '/privacy',
  '/terms',
  '/refund-policy',
  '/contact',
  '/account-deletion',
])

function shouldPlayIntro() {
  const isEmbedded = new URLSearchParams(window.location.search).get('embed') === 'mobile'
  if (INTRO_FREE_PATHS.has(window.location.pathname) || isEmbedded) {
    try { sessionStorage.setItem(INTRO_SESSION_KEY, '1') } catch { /* storage may be unavailable */ }
    return false
  }
  try {
    const hasPlayed = sessionStorage.getItem(INTRO_SESSION_KEY) === '1'
    if (!hasPlayed) {
      // Mark it immediately so redirects/reloads in this tab do not replay
      // the intro even when navigation happens before the video completes.
      sessionStorage.setItem(INTRO_SESSION_KEY, '1')
    }
    return !hasPlayed
  } catch {
    // Storage can be unavailable in hardened/private browser contexts.
    return true
  }
}

function App() {
  const { checkAuth, token, hasHydrated } = useAuthStore()
  const [showIntro, setShowIntro] = useState(shouldPlayIntro)
  const finishIntro = useCallback(() => setShowIntro(false), [])

  useEffect(() => {
    // Check auth only after Zustand has hydrated
    if (hasHydrated) {
      checkAuth()
    }
  }, [checkAuth, token, hasHydrated])

  return (
    <>
      <AppRoutes />
      <CookieConsent />
      {showIntro && <SmashIntro onFinished={finishIntro} />}
    </>
  )
}

export default App
