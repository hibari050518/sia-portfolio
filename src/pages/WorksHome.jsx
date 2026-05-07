import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { WIX_URL } from '../config'

const BG = '#111'

function NavLink({ to, zh, en }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to}
      style={{ fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase',
        color: hov ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
        transition:'color 0.25s' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      {hov ? en : zh}
    </Link>
  )
}

// 五格寬度比例
const WIDTHS  = [9, 16, 48, 16, 9]   // %
const HEIGHTS = [52, 66, 86, 66, 52] // % of container

export default function WorksHome() {
  const { works, loading } = useWorks()
  const navigate = useNavigate()
  const [activeIdx, setActiveIdx] = useState(0)
  const [navIn, setNavIn]         = useState(false)
  const [hovCenter, setHovCenter] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(t)
  }, [])

  // 鍵盤導覽
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
    <div style={{ position:'fixed', inset:0, background:BG,
      display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── Nav ── */}
      <nav style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'28px 44px', flexShrink:0, position:'relative', zIndex:10,
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
        flex:1, display:'flex', alignItems:'center',
        padding:'0 0', gap:'3px',
        opacity: navIn ? 1 : 0,
        transition:'opacity 0.8s ease 0.2s',
      }}>
        {[-2, -1, 0, 1, 2].map((offset, slotIdx) => {
          const idx = activeIdx + offset
          const isCenter  = offset === 0
          const absOffset = Math.abs(offset)
          const work      = (idx >= 0 && idx < total) ? works[idx] : null

          return (
            <div key={slotIdx} style={{
              flex: `0 0 ${WIDTHS[slotIdx]}%`,
              height: `${HEIGHTS[slotIdx]}%`,
              position: 'relative',
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.03)',
              cursor: work ? (isCenter ? 'pointer' : 'pointer') : 'default',
              transition: 'all 0.55s cubic-bezier(0.22,1,0.36,1)',
              flexShrink: 0,
            }}
              onClick={() => {
                if (!work) return
                if (isCenter) navigate(`/works/${encodeURIComponent(work.theme)}/${work.id}`)
                else setActiveIdx(idx)
              }}
              onMouseEnter={() => isCenter && setHovCenter(true)}
              onMouseLeave={() => isCenter && setHovCenter(false)}
            >
              {work?.image_url && (
                <img src={work.image_url} alt={work.title}
                  style={{
                    width:'100%', height:'100%', objectFit:'cover',
                    objectPosition:'center top',
                    filter: `brightness(${isCenter ? (hovCenter ? 0.55 : 0.78) : absOffset === 1 ? 0.42 : 0.28})`,
                    transition: 'filter 0.5s ease, transform 0.6s ease',
                    transform: isCenter && hovCenter ? 'scale(1.03)' : 'scale(1)',
                  }}
                />
              )}

              {/* Center item: gradients */}
              {isCenter && <>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'32%',
                  background:`linear-gradient(to bottom, ${BG}, transparent)`, pointerEvents:'none' }} />
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'32%',
                  background:`linear-gradient(to top, ${BG}, transparent)`, pointerEvents:'none' }} />
              </>}

              {/* Center item: hover title */}
              {isCenter && (
                <div style={{
                  position:'absolute', inset:0, display:'flex',
                  alignItems:'center', justifyContent:'center',
                  pointerEvents:'none',
                  opacity: hovCenter ? 1 : 0,
                  transition:'opacity 0.4s ease',
                }}>
                  <p style={{
                    fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
                    fontSize:'clamp(14px, 1.4vw, 20px)',
                    color:'rgba(255,255,255,0.95)', letterSpacing:'2px',
                    textAlign:'center', padding:'0 16px',
                    transform: hovCenter ? 'translateY(0)' : 'translateY(6px)',
                    transition:'transform 0.4s ease',
                  }}>
                    {work?.title}
                  </p>
                </div>
              )}

              {/* Non-center: side fade */}
              {!isCenter && (
                <>
                  <div style={{
                    position:'absolute', top:0, bottom:0,
                    [offset < 0 ? 'left' : 'right']: 0,
                    width:'40%',
                    background: offset < 0
                      ? `linear-gradient(to right, ${BG}, transparent)`
                      : `linear-gradient(to left, ${BG}, transparent)`,
                    pointerEvents:'none',
                  }} />
                  <div style={{
                    position:'absolute', top:0, left:0, right:0, height:'28%',
                    background:`linear-gradient(to bottom, ${BG}, transparent)`, pointerEvents:'none',
                  }} />
                  <div style={{
                    position:'absolute', bottom:0, left:0, right:0, height:'28%',
                    background:`linear-gradient(to top, ${BG}, transparent)`, pointerEvents:'none',
                  }} />
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        padding:'18px 44px', display:'flex',
        justifyContent:'space-between', alignItems:'center',
        flexShrink:0, zIndex:10,
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.5s',
      }}>
        {/* Counter + theme */}
        <div style={{ display:'flex', gap:'20px', alignItems:'baseline' }}>
          <span style={{ fontSize:'10px', letterSpacing:'2px',
            color:'rgba(255,255,255,0.35)', fontVariantNumeric:'tabular-nums' }}>
            {total > 0 ? `${String(activeIdx+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}` : '—'}
          </span>
          {works[activeIdx]?.theme && (
            <span style={{ fontSize:'9px', letterSpacing:'3px', textTransform:'uppercase',
              color:'rgba(255,255,255,0.18)' }}>
              {works[activeIdx].theme}
            </span>
          )}
        </div>

        {/* Scrubber */}
        {total > 0 && (
          <div style={{ display:'flex', gap:'3px', alignItems:'center' }}>
            {works.map((_, i) => (
              <div key={i} onClick={() => setActiveIdx(i)} style={{
                width:  i === activeIdx ? '18px' : '4px',
                height: '2px',
                background: i === activeIdx
                  ? 'rgba(255,255,255,0.65)'
                  : 'rgba(255,255,255,0.18)',
                transition: 'all 0.35s ease',
                cursor: 'pointer',
                borderRadius: '1px',
              }} />
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
