import { useCallback, useEffect, useState } from 'react'
import AppRoutes from './routes/AppRoutes'
import { useAuthStore } from '@/stores/authStore'
import SmashIntro from './components/SmashIntro'

function App() {
  const { checkAuth, token, hasHydrated } = useAuthStore()
  const [showIntro, setShowIntro] = useState(true)
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
