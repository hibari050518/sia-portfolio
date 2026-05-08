import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const DURATION = 1400  // ms to count 0→100

export default function LoadingPage() {
  const navigate = useNavigate()
  const [params]  = useSearchParams()
  const target    = params.get('to') || '/works'
  const [pct,     setPct]     = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const start = performance.now()
    let raf

    function tick(now) {
      const progress = Math.min((now - start) / DURATION, 1)
      // ease-out curve so it slows near 100
      const eased = 1 - Math.pow(1 - progress, 2)
      setPct(Math.floor(eased * 100))
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setPct(100)
        setLeaving(true)
        setTimeout(() => navigate(target, { replace: true }), 480)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{
      position:'fixed', inset:0, background:'#111',
      display:'flex', alignItems:'center', justifyContent:'center',
      opacity: leaving ? 0 : 1,
      transition: leaving ? 'opacity 0.48s ease' : 'none',
      zIndex:999,
    }}>
      <span style={{
        fontFamily:'var(--serif)', fontSize:'clamp(48px, 8vw, 96px)',
        fontWeight:300, fontStyle:'italic',
        color:'rgba(255,255,255,0.18)',
        letterSpacing:'0.04em',
        userSelect:'none',
      }}>
        {pct}
      </span>
    </div>
  )
}
