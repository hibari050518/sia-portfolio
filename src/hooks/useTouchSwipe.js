import { useRef, useCallback } from 'react'

/**
 * useTouchSwipe
 * onNext  — called when user swipes LEFT  (go to next item)
 * onPrev  — called when user swipes RIGHT (go to prev item)
 * threshold — minimum horizontal px to register as a swipe (default 45)
 */
export function useTouchSwipe(onNext, onPrev, threshold = 45) {
  const startX = useRef(null)
  const startY = useRef(null)

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    const dy = e.changedTouches[0].clientY - startY.current
    startX.current = null

    // Ignore if not enough movement, or vertical scroll is dominant
    if (Math.abs(dx) < threshold) return
    if (Math.abs(dy) > Math.abs(dx) * 0.9) return

    if (dx < 0) onNext?.()
    else        onPrev?.()
  }, [onNext, onPrev, threshold])

  return { onTouchStart, onTouchEnd }
}
