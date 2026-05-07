import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { WIX_URL } from '../config'

const BG = '#111'

// slot 配置：offset -2,-1,0,+1,+2 對應的 left%, width%, height%
const SLOTS = [
  { l: 0,    w: 9,  h: 52, br: 0.28 },
  { l: 9.3,  w: 16, h: 66, br: 0.42 },
  { l: 25.6, w: 48, h: 86, br: 0.78 },
  { l: 73.9, w: 16, h: 66, br: 0.42 },
  { l: 90.2, w: 9,  h: 52, br: 0.28 },
]

function getSlot(offset) {
  const i = offset + 2
  if (i < 0) return { l: -13, w: 9, h: 52, br: 0.1, vis: false }
  if (i > 4) return { l: 103, w: 9, h: 52, br: 0.1, vis: false }
  return { ...SLOTS[i], vis: true }
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
  const { works, loading } = useWorks()
  const navigate           = useNavigate()
  const [activeIdx, setActiveIdx] = useState(0)
  const [hovCenter, setHovCenter] = useState(false)
  const [navIn, setNavIn]         = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(t)
  }, [])

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

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'11px', letterSpacing:'4px' }}>loading</p>
    </div>
  )

  const total = works.length

  return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      flexDirection:'column', overflow:'hidden' }}>

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
            style={{ fontSize:'12px', letterSpacing:'2px', color:'var(--warm)' }}>
            Appointments ↗
          </a>
        </div>
      </nav>

      {/* ── Carousel ── */}
      <div style={{
        flex:1, position:'relative', overflow:'hidden',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.2s',
      }}>
        {works.map((work, i) => {
          const offset   = i - activeIdx
          if (Math.abs(offset) > 3) return null
          const slot     = getSlot(offset)
          const isCenter = offset === 0

          return (
            <div key={work.id} style={{
              position: 'absolute',
              left:   `${slot.l}%`,
              width:  `${slot.w}%`,
              top:    '50%',
              height: `${slot.h}%`,
              transform: 'translateY(-50%)',
              overflow: 'hidden',
              opacity: slot.vis ? 1 : 0,
              cursor: 'pointer',
              transition: [
                'left 0.55s cubic-bezier(0.22,1,0.36,1)',
                'width 0.55s cubic-bezier(0.22,1,0.36,1)',
                'height 0.55s cubic-bezier(0.22,1,0.36,1)',
                'opacity 0.4s ease',
              ].join(', '),
            }}
              onClick={() => isCenter
                ? navigate(`/works/${encodeURIComponent(work.theme)}/${work.id}`)
                : setActiveIdx(i)
              }
              onMouseEnter={() => isCenter && setHovCenter(true)}
              onMouseLeave={() => isCenter && setHovCenter(false)}
            >
              {work.image_url && (
                <img src={work.image_url} alt={work.title}
                  style={{
                    width:'100%', height:'100%', objectFit:'cover',
                    objectPosition:'center top',
                    filter: `brightness(${isCenter && hovCenter ? 0.55 : slot.br})`,
                    transform: isCenter && hovCenter ? 'scale(1.03)' : 'scale(1)',
                    transition: 'filter 0.5s ease, transform 0.6s ease',
                  }}
                />
              )}

              {/* 中間 gradients */}
              {isCenter && <>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'30%',
                  background:`linear-gradient(to bottom,${BG},transparent)`, pointerEvents:'none' }}/>
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'30%',
                  background:`linear-gradient(to top,${BG},transparent)`, pointerEvents:'none' }}/>
              </>}

              {/* 側邊 fade */}
              {!isCenter && <>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'30%',
                  background:`linear-gradient(to bottom,${BG},transparent)`, pointerEvents:'none' }}/>
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'30%',
                  background:`linear-gradient(to top,${BG},transparent)`, pointerEvents:'none' }}/>
                <div style={{ position:'absolute', inset:0,
                  background: offset < 0
                    ? `linear-gradient(to right,${BG} 0%,transparent 60%)`
                    : `linear-gradient(to left,${BG} 0%,transparent 60%)`,
                  pointerEvents:'none' }}/>
              </>}

              {/* Hover title (center only) */}
              {isCenter && (
                <div style={{
                  position:'absolute', inset:0, display:'flex',
                  alignItems:'center', justifyContent:'center',
                  opacity: hovCenter ? 1 : 0, transition:'opacity 0.4s ease',
                  pointerEvents:'none',
                }}>
                  <p style={{
                    fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
                    fontSize:'clamp(14px,1.4vw,20px)', color:'rgba(255,255,255,0.95)',
                    letterSpacing:'2px', textAlign:'center', padding:'0 20px',
                    transform: hovCenter ? 'translateY(0)' : 'translateY(6px)',
                    transition:'transform 0.4s ease',
                  }}>
                    {work.title}
                  </p>
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
        <div style={{ display:'flex', gap:'20px', alignItems:'baseline' }}>
          <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.35)' }}>
            {total > 0 ? `${String(activeIdx+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}` : '—'}
          </span>
          {works[activeIdx]?.theme && (
            <span style={{ fontSize:'9px', letterSpacing:'3px', textTransform:'uppercase',
              color:'rgba(255,255,255,0.18)' }}>
              {works[activeIdx].theme}
            </span>
          )}
        </div>

        {total > 0 && (
          <div style={{ display:'flex', gap:'3px', alignItems:'center' }}>
            {works.map((_, i) => (
              <div key={i} onClick={() => setActiveIdx(i)} style={{
                width:  i === activeIdx ? '18px' : '4px',
                height: '2px', borderRadius:'1px', cursor:'pointer',
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
