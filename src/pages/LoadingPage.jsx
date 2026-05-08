import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import OpeningAnimation from '../components/OpeningAnimation'

const DURATION = 5200   // ms — lets full TATTOOIST comet animation finish (~4.9s)
const HOLD_MS  = 300    // pause at 100% before fading
const FADE_MS  = 480    // fade-out duration

export default function LoadingPage() {
  const navigate  = useNavigate()
  const [params]  = useSearchParams()
  const target    = params.get('to') || '/works'
  const [pct,     setPct]     = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const start = performance.now()
    let raf

    function tick(now) {
      const progress = Math.min((now - start) / DURATION, 1)
      const eased    = 1 - Math.pow(1 - progress, 2)
      setPct(Math.floor(eased * 100))
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setPct(100)
        setTimeout(() => setLeaving(true),                        HOLD_MS)
        setTimeout(() => navigate(target, { replace: true }),     HOLD_MS + FADE_MS)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{
      position:'fixed', inset:0, background:'#111',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      gap:'18px',
      opacity: leaving ? 0 : 1,
      transition: leaving ? `opacity ${FADE_MS / 1000}s ease` : 'none',
      zIndex:999,
    }}>
      {/* Logo animation */}
      <OpeningAnimation style={{ width:'min(520px,88vw)' }} />

      {/* loading  OO%  — small text row, not overlapping */}
      <div style={{ display:'flex', alignItems:'baseline', gap:'7px' }}>
        <span style={{
          fontSize:'10px', letterSpacing:'4px', textTransform:'lowercase',
          color:'rgba(255,255,255,0.28)',
        }}>loading</span>
        <span style={{
          fontFamily:'var(--serif)', fontSize:'11px', fontStyle:'italic',
          color:'rgba(255,255,255,0.22)', letterSpacing:'0.05em',
        }}>{String(pct).padStart(2,'0')}%</span>
      </div>
    </div>
  )
}
