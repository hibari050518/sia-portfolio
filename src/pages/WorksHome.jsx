import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { WIX_URL } from '../config'

const BG = '#111'
const PANEL_W = 20        // each panel = 20vw, 5 panels = 100vw
const CENTER_H = 84       // center panel height %
const SIDE_H   = 62       // side panels height %
const OUTER_H  = 50       // outermost panels height %

function getHeight(offset) {
  const a = Math.abs(offset)
  if (a === 0) return CENTER_H
  if (a === 1) return SIDE_H
  return OUTER_H
}
function getBrightness(offset) {
  const a = Math.abs(offset)
  if (a === 0) return 0.80
  if (a === 1) return 0.38
  return 0.22
}

function NavLink({ to, zh, en }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to}
      style={{ fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase',
        color: hov ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)', transition:'color 0.25s' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {hov ? en : zh}
    </Link>
  )
}

export default function WorksHome() {
  const { works, loading }        = useWorks()
  const navigate                  = useNavigate()
  const [activeIdx, setActiveIdx] = useState(0)
  const [navIn, setNavIn]         = useState(false)
  const hoverTimerRef             = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(t)
  }, [])

  // keyboard
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') setActiveIdx(i => Math.min(i + 1, works.length - 1))
      if (e.key === 'ArrowLeft')  setActiveIdx(i => Math.max(i - 1, 0))
      if (e.key === 'Enter' && works[activeIdx]) {
        const w = works[activeIdx]
        navigate(`/works/${encodeURIComponent(w.theme)}/${w.id}`)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [works, activeIdx, navigate])

  const handleHover = (i) => {
    if (i === activeIdx) return
    clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = setTimeout(() => setActiveIdx(i), 60)
  }

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'11px', letterSpacing:'4px' }}>loading</p>
    </div>
  )

  const total = works.length

  return (
    <div style={{ position:'fixed', inset:0, background:BG,
      display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Nav */}
      <nav style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'28px 44px', flexShrink:0, zIndex:10,
        opacity: navIn ? 1 : 0, transition:'opacity 0.6s ease',
      }}>
        <Link to="/" style={{ fontSize:'13px', letterSpacing:'4px',
          color:'rgba(255,255,255,0.85)', fontFamily:'var(--serif)', textDecoration:'none' }}>
          SIA TATTOOIST
        </Link>
        <div style={{ display:'flex', gap:'36px', alignItems:'center' }}>
          <NavLink to="/works" zh="作品" en="Works" />
          <NavLink to="/flash" zh="認領圖" en="Flash" />
          <a href={WIX_URL} target="_blank" rel="noreferrer"
            style={{ fontSize:'12px', letterSpacing:'2px', color:'var(--warm)' }}>
            Appointments ↗
          </a>
        </div>
      </nav>

      {/* Carousel */}
      <div style={{
        flex:1, position:'relative', overflow:'hidden',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.2s',
      }}>
        {works.map((work, i) => {
          const offset   = i - activeIdx
          if (Math.abs(offset) > 3) return null
          const isCenter = offset === 0
          const h        = getHeight(offset)
          const br       = getBrightness(offset)
          // left: each panel is 20vw, centered on 50vw
          // center slot: left = 40vw; offset ±1: 20vw / 60vw; offset ±2: 0 / 80vw
          const leftPct  = 40 + offset * PANEL_W

          return (
            <div key={work.id}
              style={{
                position:'absolute',
                left: `${leftPct}%`,
                width: `${PANEL_W}%`,
                height: `${h}%`,
                top:'50%',
                transform:'translateY(-50%)',
                overflow:'hidden',
                cursor: isCenter ? 'pointer' : 'ew-resize',
                opacity: Math.abs(offset) > 2 ? 0 : 1,
                transition:[
                  'left 0.52s cubic-bezier(0.22,1,0.36,1)',
                  'height 0.52s cubic-bezier(0.22,1,0.36,1)',
                  'opacity 0.35s ease',
                ].join(', '),
                zIndex: isCenter ? 2 : 1,
              }}
              onMouseEnter={() => handleHover(i)}
              onClick={() => {
                if (isCenter) navigate(`/works/${encodeURIComponent(work.theme)}/${work.id}`)
                else setActiveIdx(i)
              }}
            >
              {/* Center dark bg panel (M.Fisher style) */}
              {isCenter && (
                <div style={{
                  position:'absolute', inset:'-8% 0',
                  background:'rgba(30,30,30,0.55)',
                  zIndex:0, pointerEvents:'none',
                }}/>
              )}

              {/* Image */}
              {work.image_url && (
                <img src={work.image_url} alt={work.title}
                  style={{
                    position:'relative', zIndex:1,
                    width:'100%', height:'100%',
                    objectFit:'cover', objectPosition:'center top',
                    filter:`brightness(${br})`,
                    transition:'filter 0.45s ease, transform 0.5s ease',
                  }}
                />
              )}

              {/* Top/bottom fades */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'28%', zIndex:2,
                background:`linear-gradient(to bottom,${BG},transparent)`, pointerEvents:'none' }}/>
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'28%', zIndex:2,
                background:`linear-gradient(to top,${BG},transparent)`, pointerEvents:'none' }}/>

              {/* Side fades (non-center) */}
              {!isCenter && (
                <div style={{ position:'absolute', inset:0, zIndex:2,
                  background: offset < 0
                    ? `linear-gradient(to right,${BG} 0%,transparent 55%)`
                    : `linear-gradient(to left,${BG} 0%,transparent 55%)`,
                  pointerEvents:'none' }}/>
              )}

              {/* Center: title on hover handled by CSS */}
              {isCenter && (
                <div className="carousel-title" style={{
                  position:'absolute', inset:0, zIndex:3,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  pointerEvents:'none',
                }}>
                  <p style={{
                    fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
                    fontSize:'clamp(13px,1.3vw,18px)', color:'rgba(255,255,255,0.92)',
                    letterSpacing:'2px', textAlign:'center', padding:'0 16px',
                  }}>
                    {work.title}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom */}
      <div style={{
        padding:'18px 44px', display:'flex',
        justifyContent:'space-between', alignItems:'center',
        flexShrink:0, zIndex:10,
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.5s',
      }}>
        <div style={{ display:'flex', gap:'20px', alignItems:'baseline' }}>
          <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.35)' }}>
            {total > 0 ? `${String(activeIdx+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}` : '—'}
          </span>
          {works[activeIdx]?.theme && (
            <span style={{ fontSize:'9px', letterSpacing:'3px', textTransform:'uppercase',
              color:'rgba(255,255,255,0.2)' }}>
              {works[activeIdx].theme}
            </span>
          )}
        </div>

        {total > 0 && (
          <div style={{ display:'flex', gap:'3px', alignItems:'center' }}>
            {works.map((_, i) => (
              <div key={i} onClick={() => setActiveIdx(i)} style={{
                width: i === activeIdx ? '18px' : '4px',
                height:'2px', borderRadius:'1px', cursor:'pointer',
                background: i === activeIdx ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)',
                transition:'all 0.35s ease',
              }}/>
            ))}
          </div>
        )}

        <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.18)' }}>
          © SIA TATTOOIST
        </span>
      </div>
    </div>
  )
}
