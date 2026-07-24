import { useCallback, useEffect, useState } from 'react'
import AppRoutes from './routes/AppRoutes'
import { useAuthStore } from '@/stores/authStore'
import SmashIntro from './components/SmashIntro'

const INTRO_SESSION_KEY = 'smash_intro_played'

function shouldPlayIntro() {
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
      {showIntro && <SmashIntro onFinished={finishIntro} />}
    </>
  )
}

export default App
