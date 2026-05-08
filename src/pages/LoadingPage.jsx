import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import OpeningAnimation from '../components/OpeningAnimation'

export default function LoadingPage() {
  const navigate = useNavigate()
  const [params]  = useSearchParams()
  const target    = params.get('to') || '/works'
  const [opacity, setOpacity]   = useState(0)
  const [leaving, setLeaving]   = useState(false)

  useEffect(() => {
    const t0 = setTimeout(() => setOpacity(1),    60)   // fade in
    const t1 = setTimeout(() => setLeaving(true), 3800) // start fade out
    const t2 = setTimeout(() => navigate(target, { replace: true }), 4400) // navigate
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div style={{
      position:'fixed', inset:0, background:'#111',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      opacity: leaving ? 0 : opacity,
      transition: leaving ? 'opacity 0.6s ease' : 'opacity 0.5s ease',
      zIndex:999,
    }}>
      <div style={{ width:'90vw', maxWidth:'520px' }}>
        <OpeningAnimation />
      </div>
    </div>
  )
}
