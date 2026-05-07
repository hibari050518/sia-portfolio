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
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
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
        [dir === 'left' ? 'left' : 'right']: '16px',
        zIndex:20, background:'none', border:'none',
        cursor: disabled ? 'default' : 'pointer',
        padding:'14px 10px',
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

export default function WorkDetail() {
  const { theme, id }  = useParams()
  const decoded        = decodeURIComponent(theme)
  const navigate       = useNavigate()
  const { works, loading } = useWorks()

  const [navIn,     setNavIn]     = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const hoverTimer                 = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(t)
  }, [])

  const themeWorks = works.filter(w => w.theme === decoded)
  const initIdx    = themeWorks.findIndex(w => w.id === id)
  const [activeIdx, setActiveIdx] = useState(initIdx >= 0 ? initIdx : 0)

  /* keep activeIdx in sync if data loads after mount */
  useEffect(() => {
    if (initIdx >= 0) setActiveIdx(initIdx)
  }, [initIdx])

  const total = themeWorks.length
  const work  = themeWorks[activeIdx]

  const go = (delta) => {
    setActiveIdx(i => {
      const next = Math.max(0, Math.min(total - 1, i + delta))
      if (themeWorks[next]) {
        navigate(`/works/${encodeURIComponent(decoded)}/${themeWorks[next].id}`, { replace: true })
      }
      return next
    })
    setDrawerOpen(false)
  }

  const handleHover = (i) => {
    if (i === activeIdx) return
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setActiveIdx(i), 80)
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft')  go(-1)
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIdx, themeWorks, decoded])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'11px', letterSpacing:'4px' }}>loading</p>
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:BG,
      display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── Top nav ── */}
      <nav style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'28px 44px', flexShrink:0, zIndex:30,
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
        padding:'0 44px 12px', flexShrink:0, zIndex:30,
        opacity: navIn ? 1 : 0, transition:'opacity 0.6s ease 0.12s',
        display:'flex', alignItems:'center', gap:'10px',
      }}>
        <Link to={`/works/${encodeURIComponent(decoded)}`}
          style={{ fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.3)', textDecoration:'none', transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
          ← {decoded}
        </Link>
        {work && (
          <>
            <span style={{ fontSize:'9px', letterSpacing:'3px', color:'rgba(255,255,255,0.22)' }}>／</span>
            <span style={{ fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase',
              color:'rgba(255,255,255,0.55)', fontStyle:'italic' }}>{work.title}</span>
          </>
        )}
      </div>

      {/* ── Carousel ── */}
      <div style={{
        flex:1, position:'relative', overflow:'hidden',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.2s',
      }}>
        <ArrowBtn dir="left"  onClick={() => go(-1)} disabled={activeIdx === 0} />
        <ArrowBtn dir="right" onClick={() => go(1)}  disabled={activeIdx === total - 1} />

        {themeWorks.map((w, i) => {
          const offset    = i - activeIdx
          if (Math.abs(offset) > 3) return null
          const isCenter  = offset === 0
          const absOff    = Math.abs(offset)
          const leftPct   = 40 + offset * 20
          const heightPct = isCenter ? 86 : absOff === 1 ? 64 : 50
          const brightness= isCenter ? 0.80 : absOff === 1 ? 0.38 : 0.20

          return (
            <div key={w.id}
              style={{
                position:'absolute', left:`${leftPct}%`, width:'20%',
                height:`${heightPct}%`, top:'50%', transform:'translateY(-50%)',
                overflow:'hidden',
                cursor: isCenter ? 'default' : 'ew-resize',
                opacity: Math.abs(offset) > 2 ? 0 : 1,
                zIndex: isCenter ? 5 : 1,
                transition:[
                  'left 0.52s cubic-bezier(0.22,1,0.36,1)',
                  'height 0.52s cubic-bezier(0.22,1,0.36,1)',
                  'opacity 0.35s ease',
                ].join(', '),
              }}
              onMouseEnter={() => handleHover(i)}
              onClick={() => {
                if (!isCenter) {
                  setActiveIdx(i)
                  setDrawerOpen(false)
                  if (themeWorks[i]) {
                    navigate(`/works/${encodeURIComponent(decoded)}/${themeWorks[i].id}`, { replace: true })
                  }
                }
              }}
            >
              {/* Dark bg overlay for center */}
              {isCenter && (
                <div style={{ position:'absolute', inset:'-10% 0',
                  background:'rgba(22,22,22,0.45)', zIndex:0, pointerEvents:'none' }}/>
              )}

              {/* Image */}
              {w.image_url && (
                <img src={w.image_url} alt={w.title}
                  style={{ position:'relative', zIndex:1, width:'100%', height:'100%',
                    objectFit:'cover', objectPosition:'center top',
                    filter:`brightness(${brightness})`, transition:'filter 0.45s ease' }}
                />
              )}
              {!w.image_url && (
                <div style={{ position:'relative', zIndex:1, width:'100%', height:'100%',
                  background:'rgba(255,255,255,0.04)' }} />
              )}

              {/* Top/bottom fade */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'28%', zIndex:2,
                background:`linear-gradient(to bottom,${BG},transparent)`, pointerEvents:'none' }}/>
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'28%', zIndex:2,
                background:`linear-gradient(to top,${BG},transparent)`, pointerEvents:'none' }}/>

              {/* Side fades for non-center */}
              {!isCenter && (
                <div style={{ position:'absolute', inset:0, zIndex:2,
                  background: offset < 0
                    ? `linear-gradient(to right,${BG} 0%,transparent 65%)`
                    : `linear-gradient(to left,${BG} 0%,transparent 65%)`,
                  pointerEvents:'none' }}/>
              )}

              {/* Center label */}
              {isCenter && (
                <div style={{ position:'absolute', inset:0, zIndex:4,
                  display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', gap:'10px',
                  pointerEvents:'none' }}>
                  {w.body_part && (
                    <span style={{ fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase',
                      color:'rgba(255,255,255,0.35)' }}>{w.body_part}</span>
                  )}
                  <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
                    fontSize:'clamp(14px,1.5vw,22px)', color:'rgba(255,255,255,0.92)',
                    letterSpacing:'1.5px', textAlign:'center', padding:'0 14px',
                    lineHeight:1.25 }}>
                    {w.title}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Story drawer (slides in from right) ── */}
      {work && (
        <>
          {/* Toggle button — bottom-right of center panel area */}
          <button
            onClick={() => setDrawerOpen(v => !v)}
            style={{
              position:'absolute',
              bottom: drawerOpen ? '90px' : '62px',
              right:'50%', transform:'translateX(50%)',
              zIndex:25,
              background:'none', border:'none',
              color:'rgba(255,255,255,0.55)',
              fontSize:'10px', letterSpacing:'3px', textTransform:'uppercase',
              cursor:'pointer', padding:'8px 16px',
              opacity: navIn ? 1 : 0,
              transition:'opacity 0.8s ease 0.5s, bottom 0.35s ease, color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.95)'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.55)'}>
            {drawerOpen ? '✕ 收起' : '閱讀故事 →'}
          </button>

          {/* Drawer panel */}
          <div style={{
            position:'absolute', top:0, right:0, bottom:0,
            width:'38%', maxWidth:'480px',
            background:'rgba(18,18,18,0.97)',
            borderLeft:'1px solid rgba(255,255,255,0.07)',
            zIndex:40, overflowY:'auto',
            transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
            transition:'transform 0.45s cubic-bezier(0.22,1,0.36,1)',
            padding:'80px 44px 60px',
            display:'flex', flexDirection:'column',
          }}>
            <button onClick={() => setDrawerOpen(false)}
              style={{ alignSelf:'flex-end', background:'none', border:'none',
                color:'rgba(255,255,255,0.3)', fontSize:'11px', letterSpacing:'2px',
                cursor:'pointer', marginBottom:'36px', transition:'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
              ✕ 收起
            </button>

            {/* Theme tag */}
            <p style={{ fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase',
              color:'var(--ocean)', marginBottom:'12px', opacity:0.8 }}>
              {decoded}
            </p>

            {/* Title */}
            <h2 style={{ fontFamily:'var(--serif)', fontWeight:300, fontStyle:'italic',
              fontSize:'clamp(22px,2.2vw,36px)', color:'rgba(255,255,255,0.92)',
              lineHeight:1.2, marginBottom:'28px' }}>
              {work.title}
            </h2>

            {/* Story */}
            {work.story && (
              <p style={{ fontSize:'14px', lineHeight:2.0, color:'rgba(255,255,255,0.52)',
                fontStyle:'italic', marginBottom:'40px',
                borderLeft:'1px solid rgba(255,255,255,0.10)', paddingLeft:'20px' }}>
                {work.story}
              </p>
            )}

            {/* Details */}
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {[
                { label:'Body',  value: work.body_part },
                { label:'Size',  value: work.size_cm },
                { label:'Date',  value: work.date },
              ].filter(d => d.value).map(d => (
                <div key={d.label} style={{ display:'flex', alignItems:'baseline', gap:'16px',
                  borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'12px 0' }}>
                  <span style={{ fontSize:'9px', letterSpacing:'2.5px', textTransform:'uppercase',
                    color:'rgba(255,255,255,0.22)', width:'44px', flexShrink:0 }}>{d.label}</span>
                  <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.58)',
                    letterSpacing:'0.5px' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Bottom bar ── */}
      <div style={{
        padding:'16px 44px', display:'flex',
        justifyContent:'space-between', alignItems:'center',
        flexShrink:0, zIndex:20,
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.5s',
      }}>
        <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.28)' }}>
          {total > 0
            ? `${String(activeIdx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
            : ''}
        </span>
        {total > 1 && (
          <div style={{ display:'flex', gap:'3px', alignItems:'center' }}>
            {themeWorks.map((_, i) => (
              <div key={i} onClick={() => {
                  setActiveIdx(i)
                  setDrawerOpen(false)
                  if (themeWorks[i]) navigate(`/works/${encodeURIComponent(decoded)}/${themeWorks[i].id}`, { replace:true })
                }}
                style={{
                  width: i === activeIdx ? '18px' : '4px',
                  height:'2px', borderRadius:'1px', cursor:'pointer',
                  background: i === activeIdx ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)',
                  transition:'all 0.35s ease',
                }}/>
            ))}
          </div>
        )}
        <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.14)' }}>
          © SIA TATTOOIST
        </span>
      </div>
    </div>
  )
}
