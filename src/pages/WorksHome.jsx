import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { getThemes } from '../utils/sheets'
import { WIX_URL } from '../config'

const BG = '#111'

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

function ArrowBtn({ dir, onClick, disabled }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:'absolute', top:'50%', transform:'translateY(-50%)',
        [dir === 'left' ? 'left' : 'right']: '20px',
        zIndex:20, background:'none', border:'none', cursor: disabled ? 'default' : 'pointer',
        padding:'16px 12px',
        opacity: disabled ? 0.1 : hov ? 0.9 : 0.45,
        transition:'opacity 0.25s',
      }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {dir === 'left'
          ? <path d="M18 4 L8 14 L18 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M10 4 L20 14 L10 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
    </button>
  )
}

export default function WorksHome() {
  const { works, loading }        = useWorks()
  const navigate                  = useNavigate()
  const [activeIdx, setActiveIdx] = useState(0)
  const [navIn, setNavIn]         = useState(false)
  const hoverTimer                = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(t)
  }, [])

  // 鍵盤
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft')  go(-1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIdx, works])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'11px', letterSpacing:'4px' }}>loading</p>
    </div>
  )

  // 以主題為單位
  const themes = getThemes(works)
  const total  = themes.length

  const go = (delta) => setActiveIdx(i => Math.max(0, Math.min(total - 1, i + delta)))

  const handleHover = (i) => {
    if (i === activeIdx) return
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setActiveIdx(i), 80)
  }

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

        {/* Arrow buttons */}
        <ArrowBtn dir="left"  onClick={() => go(-1)} disabled={activeIdx === 0} />
        <ArrowBtn dir="right" onClick={() => go(1)}  disabled={activeIdx === total - 1} />

        {themes.map((theme, i) => {
          const offset    = i - activeIdx
          if (Math.abs(offset) > 3) return null
          const isCenter  = offset === 0
          const absOff    = Math.abs(offset)
          const themeWorks = works.filter(w => w.theme === theme)
          const img       = themeWorks.find(w => w.image_url)?.image_url

          // position: each slot = 20vw, center at 40vw
          const leftPct   = 40 + offset * 20
          const heightPct = isCenter ? 84 : absOff === 1 ? 62 : 50
          const brightness= isCenter ? 0.78 : absOff === 1 ? 0.38 : 0.22

          return (
            <div key={theme}
              style={{
                position:'absolute',
                left:`${leftPct}%`,
                width:'20%',
                height:`${heightPct}%`,
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
                if (isCenter) navigate(`/works/${encodeURIComponent(theme)}`)
                else setActiveIdx(i)
              }}
            >
              {/* Center dark bg panel */}
              {isCenter && (
                <div style={{ position:'absolute', inset:'-10% 0',
                  background:'rgba(28,28,28,0.6)', zIndex:0, pointerEvents:'none' }}/>
              )}

              {img && (
                <img src={img} alt={theme}
                  style={{
                    position:'relative', zIndex:1,
                    width:'100%', height:'100%',
                    objectFit:'cover', objectPosition:'center top',
                    filter:`brightness(${brightness})`,
                    transform: isCenter ? 'scale(1.0)' : 'scale(1.0)',
                    transition:'filter 0.45s ease',
                  }}
                />
              )}

              {/* Top/bottom gradient */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'30%', zIndex:2,
                background:`linear-gradient(to bottom,${BG},transparent)`, pointerEvents:'none' }}/>
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'30%', zIndex:2,
                background:`linear-gradient(to top,${BG},transparent)`, pointerEvents:'none' }}/>

              {/* Side fade */}
              {!isCenter && (
                <div style={{ position:'absolute', inset:0, zIndex:2,
                  background: offset < 0
                    ? `linear-gradient(to right,${BG} 0%,transparent 60%)`
                    : `linear-gradient(to left,${BG} 0%,transparent 60%)`,
                  pointerEvents:'none' }}/>
              )}

              {/* Center label */}
              {isCenter && (
                <div style={{
                  position:'absolute', inset:0, zIndex:3,
                  display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', gap:'10px',
                  pointerEvents:'none',
                }}>
                  <p style={{
                    fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
                    fontSize:'clamp(15px,1.5vw,22px)', color:'rgba(255,255,255,0.92)',
                    letterSpacing:'2px', textAlign:'center', padding:'0 16px',
                  }}>
                    {theme}
                  </p>
                  <span style={{ fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase',
                    color:'rgba(255,255,255,0.35)' }}>
                    {themeWorks.length} 件作品
                  </span>
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
        <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.35)' }}>
          {total > 0 ? `${String(activeIdx+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}` : '—'}
        </span>

        {total > 0 && (
          <div style={{ display:'flex', gap:'3px', alignItems:'center' }}>
            {themes.map((_, i) => (
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
