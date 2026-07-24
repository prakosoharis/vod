import { useCallback, useEffect, useRef } from 'react'

type SmashIntroProps = {
  onFinished: () => void
}

const INTRO_TIMEOUT_MS = 13000

export default function SmashIntro({ onFinished }: SmashIntroProps) {
  const finishedRef = useRef(false)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    onFinished()
  }, [onFinished])

  useEffect(() => {
    const timeout = window.setTimeout(finish, INTRO_TIMEOUT_MS)
    return () => window.clearTimeout(timeout)
  }, [finish])

  return (
    <div
      aria-label="SMASH intro"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
    >
      <video
        className="h-full w-full bg-black object-contain"
        src="/smash-intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
      />
    </div>
  )
}
