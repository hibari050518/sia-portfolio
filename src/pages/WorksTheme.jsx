import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { WIX_URL } from '../config'

const BG = '#111'

function NavLink({ to, zh, en }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to}
      style={{ fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase',
        color: hov ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
        transition:'color 0.25s', textDecoration:'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {hov ? en : zh}
    </Link>
  )
}

function ArrowBtn({ dir, onClick, disabled }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position:'absolute', top:'50%', transform:'translateY(-50%)',
        [dir === 'left' ? 'left' : 'right']: '20px',
        zIndex:20, background:'none', border:'none',
        cursor: disabled ? 'default' : 'pointer',
        padding:'16px 12px',
        opacity: disabled ? 0.08 : hov ? 0.9 : 0.38,
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

export default function WorksTheme() {
  const { theme }  = useParams()
  const decoded    = decodeURIComponent(theme)
  const navigate   = useNavigate()
  const { works, loading } = useWorks()
  const [activeIdx, setActiveIdx] = useState(0)
  const [navIn,     setNavIn]     = useState(false)
  const hoverTimer                = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(t)
  }, [])

  const themeWorks = works.filter(w => w.theme === decoded)
  const total      = themeWorks.length

  const go = (delta) => setActiveIdx(i => Math.max(0, Math.min(total - 1, i + delta)))

  const handleHover = (i) => {
    if (i === activeIdx) return
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setActiveIdx(i), 80)
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft')  go(-1)
      if (e.key === 'Enter' && themeWorks[activeIdx])
        navigate(`/works/${encodeURIComponent(decoded)}/${themeWorks[activeIdx].id}`)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIdx, themeWorks, decoded, navigate])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'11px', letterSpacing:'4px' }}>loading</p>
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:BG,
      display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── Nav ── */}
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
            style={{ fontSize:'12px', letterSpacing:'2px', color:'var(--warm)', textDecoration:'none' }}>
            Appointments ↗
          </a>
        </div>
      </nav>

      {/* ── Breadcrumb ── */}
      <div style={{
        padding:'0 44px 12px', flexShrink:0, zIndex:10,
        display:'flex', alignItems:'center', gap:'10px',
        opacity: navIn ? 1 : 0, transition:'opacity 0.6s ease 0.12s',
      }}>
        <Link to="/works"
          style={{ fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.3)', textDecoration:'none', transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
          ← 作品集
        </Link>
        <span style={{ fontSize:'9px', letterSpacing:'3px', color:'rgba(255,255,255,0.22)' }}>／</span>
        <span style={{ fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase',
          color:'rgba(255,255,255,0.55)' }}>{decoded}</span>
      </div>

      {/* ── Carousel ── */}
      <div style={{
        flex:1, position:'relative', overflow:'hidden',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.2s',
      }}>
        <ArrowBtn dir="left"  onClick={() => go(-1)} disabled={activeIdx === 0} />
        <ArrowBtn dir="right" onClick={() => go(1)}  disabled={activeIdx === total - 1} />

        {themeWorks.map((work, i) => {
          const offset    = i - activeIdx
          if (Math.abs(offset) > 3) return null
          const isCenter  = offset === 0
          const absOff    = Math.abs(offset)
          const leftPct   = 40 + offset * 20
          const heightPct = isCenter ? 84 : absOff === 1 ? 62 : 50
          const brightness= isCenter ? 0.78 : absOff === 1 ? 0.38 : 0.22

          return (
            <div key={work.id}
              style={{
                position:'absolute', left:`${leftPct}%`, width:'20%',
                height:`${heightPct}%`, top:'50%', transform:'translateY(-50%)',
                overflow:'hidden',
                cursor: isCenter ? 'pointer' : 'ew-resize',
                opacity: Math.abs(offset) > 2 ? 0 : 1,
                zIndex: isCenter ? 2 : 1,
                transition:[
                  'left 0.52s cubic-bezier(0.22,1,0.36,1)',
                  'height 0.52s cubic-bezier(0.22,1,0.36,1)',
                  'opacity 0.35s ease',
                ].join(', '),
              }}
              onMouseEnter={() => handleHover(i)}
              onClick={() => {
                if (isCenter) navigate(`/works/${encodeURIComponent(decoded)}/${work.id}`)
                else setActiveIdx(i)
              }}
            >
              {isCenter && (
                <div style={{ position:'absolute', inset:'-10% 0',
                  background:'rgba(28,28,28,0.55)', zIndex:0, pointerEvents:'none' }}/>
              )}
              {work.image_url
                ? <img src={work.image_url} alt={work.title}
                    style={{ position:'relative', zIndex:1, width:'100%', height:'100%',
                      objectFit:'cover', objectPosition:'center top',
                      filter:`brightness(${brightness})`, transition:'filter 0.45s ease' }}
                  />
                : <div style={{ position:'relative', zIndex:1, width:'100%', height:'100%',
                    background:'rgba(255,255,255,0.04)' }} />
              }
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'30%', zIndex:2,
                background:`linear-gradient(to bottom,${BG},transparent)`, pointerEvents:'none' }}/>
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'30%', zIndex:2,
                background:`linear-gradient(to top,${BG},transparent)`, pointerEvents:'none' }}/>
              {!isCenter && (
                <div style={{ position:'absolute', inset:0, zIndex:2,
                  background: offset < 0
                    ? `linear-gradient(to right,${BG} 0%,transparent 60%)`
                    : `linear-gradient(to left,${BG} 0%,transparent 60%)`,
                  pointerEvents:'none' }}/>
              )}
              {isCenter && (
                <div style={{ position:'absolute', inset:0, zIndex:3,
                  display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', gap:'12px',
                  pointerEvents:'none' }}>
                  {work.body_part && (
                    <span style={{
                      fontSize:'9px', letterSpacing:'3px', textTransform:'uppercase',
                      color:'var(--ocean)', border:'1px solid var(--ocean)',
                      padding:'3px 10px', opacity:0.85,
                    }}>{work.body_part}</span>
                  )}
                  <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
                    fontSize:'clamp(14px,1.5vw,22px)', color:'rgba(255,255,255,0.92)',
                    letterSpacing:'1.5px', textAlign:'center', padding:'0 14px',
                    lineHeight:1.25 }}>
                    {work.title}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/works/${encodeURIComponent(decoded)}/${work.id}`)
                    }}
                    style={{
                      pointerEvents:'auto', background:'none',
                      border:'1px solid rgba(255,255,255,0.28)',
                      color:'rgba(255,255,255,0.65)', fontSize:'9px',
                      letterSpacing:'3px', textTransform:'uppercase',
                      padding:'8px 20px', cursor:'pointer', marginTop:'4px',
                      transition:'border-color 0.25s, color 0.25s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.72)'
                      e.currentTarget.style.color = 'rgba(255,255,255,1)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                    }}>
                    閱讀故事 →
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Bottom ── */}
      <div style={{
        padding:'18px 44px', display:'flex',
        justifyContent:'space-between', alignItems:'center',
        flexShrink:0, zIndex:10,
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.5s',
      }}>
        <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.35)' }}>
          {total > 0 ? `${String(activeIdx+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}` : '—'}
        </span>
        {total > 1 && (
          <div style={{ display:'flex', gap:'3px', alignItems:'center' }}>
            {themeWorks.map((_, i) => (
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
