import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFlash } from '../hooks/useSheets'
import { WIX_URL } from '../config'
import { useLang, t, gl, getSeriesName } from '../context/LangContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { useTouchSwipe } from '../hooks/useTouchSwipe'
import { MobileTopBar, MobileTabBar } from '../components/MobileNav'

const BG = '#111'

function LangSwitcher() {
  const { lang, setLang } = useLang()
  return (
    <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
      {[['zh','中'],['en','EN'],['ko','한']].map(([l, label]) => (
        <div key={l} onClick={() => setLang(l)}
          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', cursor:'pointer' }}>
          <span style={{ fontSize:'12px', letterSpacing:'2px',
            color: lang===l ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.32)',
            transition:'color 0.2s' }}>{label}</span>
          <div style={{ width:'4px', height:'4px', borderRadius:'50%',
            background: lang===l ? 'rgba(255,255,255,0.7)' : 'transparent',
            transition:'background 0.2s' }} />
        </div>
      ))}
    </div>
  )
}

function NavLink({ to, label }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to}
      style={{ fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase',
        color: hov ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
        transition:'color 0.25s', textDecoration:'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {label}
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

export default function FlashSeries() {
  const { series }  = useParams()
  const decoded     = decodeURIComponent(series)
  const navigate    = useNavigate()
  const { flash, loading } = useFlash()
  const { lang }    = useLang()
  const [activeIdx, setActiveIdx] = useState(0)

  const [navIn,     setNavIn]     = useState(false)
  const hoverTimer  = useRef(null)

  useEffect(() => {
    const t2 = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(t2)
  }, [])

  const seriesItems     = flash.filter(f => f.series === decoded)
  const total           = seriesItems.length
  const seriesDesc      = seriesItems[0]?.series_description || ''

  const go = (delta) => setActiveIdx(i => Math.max(0, Math.min(total - 1, i + delta)))

  const isMobile = useIsMobile()
  const swipe    = useTouchSwipe(() => go(1), () => go(-1))

  const handleHover = (i) => {
    if (i === activeIdx) return
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setActiveIdx(i), 80)
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft')  go(-1)
      if (e.key === 'Enter' && seriesItems[activeIdx])
        navigate(`/flash/${encodeURIComponent(decoded)}/${seriesItems[activeIdx].id}`)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIdx, seriesItems, decoded, navigate])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'12px', letterSpacing:'4px' }}>loading</p>
    </div>
  )

  const activeItem = seriesItems[activeIdx]
  const isAvail    = activeItem?.status?.trim() === '可認領'

  /* ── Mobile layout: peek carousel ── */
  if (isMobile) return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}>
      <MobileTopBar />

      {/* Content area between nav bars */}
      <div style={{
        position:'absolute', top:'52px', bottom:'calc(62px + env(safe-area-inset-bottom, 0px))',
        left:0, right:0, display:'flex', flexDirection:'column',
      }}>
        {/* Breadcrumb */}
        <div style={{ padding:'10px 18px 6px', flexShrink:0,
          display:'flex', alignItems:'center', gap:'8px' }}>
          <Link to="/flash"
            style={{ fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase',
              color:'rgba(255,255,255,0.32)', textDecoration:'none' }}>
            ← {t('backFlash',lang)}
          </Link>
          <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.18)' }}>／</span>
          <span style={{ fontSize:'11px', letterSpacing:'1px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.50)' }}>
            {getSeriesName(flash, decoded, lang)}
          </span>
        </div>

        {/* Peek carousel */}
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}
          onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>

          {seriesItems.map((item, i) => {
            const offset = i - activeIdx
            if (Math.abs(offset) > 1) return null
            const leftPct = 10 + offset * 80
            const claimedDim = offset === 0 && item.status?.trim() !== '可認領' ? 0.55 : 1

            return (
              <div key={item.id}
                onClick={() => {
                  if (offset === 0) navigate(`/flash/${encodeURIComponent(decoded)}/${item.id}`)
                  else setActiveIdx(i)
                }}
                style={{
                  position:'absolute', left:`${leftPct}%`, width:'80%',
                  top:'8px', bottom:'8px', overflow:'hidden', cursor:'pointer',
                  opacity: claimedDim,
                  transition:'left 0.42s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease',
                }}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.title}
                      style={{ width:'100%', height:'100%', objectFit:'cover',
                        filter:`brightness(${offset === 0 ? 0.82 : 0.50})`,
                        transition:'filter 0.4s ease' }} />
                  : <div style={{ width:'100%', height:'100%', background:'rgba(255,255,255,0.04)' }} />
                }
                {/* Top/bottom fades */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'18%',
                  background:`linear-gradient(to bottom,${BG},transparent)`, pointerEvents:'none' }}/>
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'18%',
                  background:`linear-gradient(to top,${BG},transparent)`, pointerEvents:'none' }}/>
              </div>
            )
          })}

          {/* Edge fade overlays — narrower so peek cards are visible */}
          <div style={{ position:'absolute', top:0, left:0, bottom:0, width:'7%', zIndex:5,
            background:`linear-gradient(to right, ${BG}, transparent)`, pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'7%', zIndex:5,
            background:`linear-gradient(to left, ${BG}, transparent)`, pointerEvents:'none' }} />
        </div>

        {/* Info section */}
        {activeItem && (
          <div style={{ padding:'10px 18px 10px', flexShrink:0,
            display:'flex', flexDirection:'column', alignItems:'center', gap:'7px', textAlign:'center' }}>
            {/* Progress dot bar */}
            {total > 1 && (
              <div style={{ display:'flex', gap:'4px', alignItems:'center', marginBottom:'2px' }}>
                {seriesItems.map((_, i) => (
                  <div key={i} onClick={() => setActiveIdx(i)} style={{
                    width: i === activeIdx ? '18px' : '4px', height:'2px',
                    borderRadius:'1px', cursor:'pointer',
                    background: i === activeIdx ? 'rgba(255,255,255,0.60)' : 'rgba(255,255,255,0.18)',
                    transition:'all 0.35s ease',
                  }} />
                ))}
              </div>
            )}
            <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.25)' }}>
              {String(activeIdx+1).padStart(2,'0')} / {String(total).padStart(2,'0')}
            </span>
            {/* Status badge */}
            <span style={{ fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase',
              padding:'2px 8px', opacity:0.85,
              color: isAvail ? 'var(--ocean)' : 'rgba(255,255,255,0.3)',
              border: `1px solid ${isAvail ? 'var(--ocean)' : 'rgba(255,255,255,0.2)'}` }}>
              {isAvail ? t('available',lang) : t('taken',lang)}
            </span>
            <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
              fontSize:'18px', color:'rgba(255,255,255,0.88)', letterSpacing:'0.5px', margin:0 }}>
              {activeItem.title}
            </p>
            <button
              onClick={() => navigate(`/flash/${encodeURIComponent(decoded)}/${activeItem.id}`)}
              style={{ background:'none', border:'1px solid rgba(255,255,255,0.25)',
                color:'rgba(255,255,255,0.60)', fontSize:'11px', letterSpacing:'2px',
                textTransform:'uppercase', padding:'8px 22px', cursor:'pointer' }}>
              {t('viewDesign',lang)} →
            </button>
          </div>
        )}
      </div>

      <MobileTabBar />
    </div>
  )

  /* ── Desktop layout ── */
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
          <NavLink to="/works" label={t('works',lang)} />
          <NavLink to="/flash" label={t('flash',lang)} />
          <a href={WIX_URL} target="_blank" rel="noreferrer"
            style={{ fontSize:'12px', letterSpacing:'2px', color:'var(--warm)', textDecoration:'none' }}>
            {t('appointments',lang)}
          </a>
          <LangSwitcher />
        </div>
      </nav>

      {/* ── Breadcrumb ── */}
      <div style={{
        padding:'0 44px 12px', flexShrink:0, zIndex:10,
        display:'flex', alignItems:'center', gap:'10px',
        opacity: navIn ? 1 : 0, transition:'opacity 0.6s ease 0.12s',
      }}>
        <Link to="/flash"
          style={{ fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.3)', textDecoration:'none', transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
          ← {t('backFlash',lang)}
        </Link>
        <span style={{ fontSize:'12px', letterSpacing:'2px', color:'rgba(255,255,255,0.22)' }}>／</span>
        <span style={{ fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
          color:'rgba(255,255,255,0.55)' }}>{getSeriesName(flash, decoded, lang)}</span>
      </div>

      {/* ── Series description ── */}
      {seriesDesc && (
        <div style={{
          padding:'0 44px 16px', flexShrink:0, zIndex:10,
          opacity: navIn ? 1 : 0, transition:'opacity 0.6s ease 0.18s',
        }}>
          <p style={{ fontSize:'12px', lineHeight:1.8, color:'rgba(255,255,255,0.36)',
            fontStyle:'italic', maxWidth:'480px', letterSpacing:'0.3px' }}>
            {seriesDesc}
          </p>
        </div>
      )}

      {/* ── Carousel ── */}
      <div style={{
        flex:1, position:'relative', overflow:'hidden',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.2s',
      }}>
        <ArrowBtn dir="left"  onClick={() => go(-1)} disabled={activeIdx === 0} />
        <ArrowBtn dir="right" onClick={() => go(1)}  disabled={activeIdx === total - 1} />

        {seriesItems.map((item, i) => {
          const offset     = i - activeIdx
          if (Math.abs(offset) > 3) return null
          const isCenter   = offset === 0
          const absOff     = Math.abs(offset)
          const leftPct    = 40 + offset * 20
          const heightPct  = isCenter ? 84 : absOff === 1 ? 62 : 50
          const brightness = isCenter ? 0.78 : absOff === 1 ? 0.38 : 0.22
          const claimedDim = isCenter && item.status?.trim() !== '可認領' ? 0.55 : 1

          return (
            <div key={item.id}
              style={{
                position:'absolute', left:`${leftPct}%`, width:'20%',
                height:`${heightPct}%`, top:'50%', transform:'translateY(-50%)',
                overflow:'hidden',
                cursor: isCenter ? 'pointer' : 'ew-resize',
                opacity: Math.abs(offset) > 2 ? 0 : claimedDim,
                zIndex: isCenter ? 2 : 1,
                transition:[
                  'left 0.52s cubic-bezier(0.22,1,0.36,1)',
                  'height 0.52s cubic-bezier(0.22,1,0.36,1)',
                  'opacity 0.35s ease',
                ].join(', '),
              }}
              onMouseEnter={() => handleHover(i)}
              onClick={() => {
                if (isCenter) navigate(`/flash/${encodeURIComponent(decoded)}/${item.id}`)
                else setActiveIdx(i)
              }}
            >
              {isCenter && (
                <div style={{ position:'absolute', inset:'-10% 0',
                  background:'rgba(28,28,28,0.55)', zIndex:0, pointerEvents:'none' }}/>
              )}
              {item.image_url
                ? <img src={item.image_url} alt={item.title}
                    style={{ position:'relative', zIndex:1, width:'100%', height:'100%',
                      objectFit:'cover', objectPosition:'center center',
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
            </div>
          )
        })}
      </div>

      {/* ── Label + status + button below carousel ── */}
      {activeItem && (
        <div style={{
          padding:'14px 0 10px', flexShrink:0, zIndex:10,
          display:'flex', flexDirection:'column', alignItems:'center', gap:'10px',
          opacity: navIn ? 1 : 0, transition:'opacity 0.7s ease 0.3s',
        }}>
          {/* Status badge */}
          <span style={{
            fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
            padding:'3px 10px', opacity:0.85,
            color: isAvail ? 'var(--ocean)' : 'rgba(255,255,255,0.3)',
            border: `1px solid ${isAvail ? 'var(--ocean)' : 'rgba(255,255,255,0.2)'}`,
          }}>
            {isAvail ? t('available',lang) : t('taken',lang)}
          </span>

          {activeItem.body_part && (
            <span style={{
              fontSize:'12px', letterSpacing:'2px',
              color:'rgba(255,255,255,0.38)',
            }}>{activeItem.body_part}</span>
          )}

          <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
            fontSize:'clamp(14px,1.4vw,20px)', color:'rgba(255,255,255,0.88)',
            letterSpacing:'1.5px', textAlign:'center', margin:0 }}>
            {activeItem.title}
          </p>

          <button
            onClick={() => navigate(`/flash/${encodeURIComponent(decoded)}/${activeItem.id}`)}
            style={{
              background:'none', border:'1px solid rgba(255,255,255,0.25)',
              color:'rgba(255,255,255,0.60)', fontSize:'12px',
              letterSpacing:'2px', textTransform:'uppercase',
              padding:'7px 20px', cursor:'pointer',
              transition:'border-color 0.25s, color 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.70)'
              e.currentTarget.style.color = 'rgba(255,255,255,1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.60)'
            }}>
            {t('viewDesign',lang)} →
          </button>
        </div>
      )}

      {/* ── Bottom ── */}
      <div style={{
        padding:'12px 44px', display:'flex',
        justifyContent:'space-between', alignItems:'center',
        flexShrink:0, zIndex:10,
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.5s',
      }}>
        <span style={{ fontSize:'12px', letterSpacing:'2px', color:'rgba(255,255,255,0.35)' }}>
          {total > 0 ? `${String(activeIdx+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}` : '—'}
        </span>
        {total > 1 && (
          <div style={{ display:'flex', gap:'3px', alignItems:'center' }}>
            {seriesItems.map((_, i) => (
              <div key={i} onClick={() => setActiveIdx(i)} style={{
                width: i === activeIdx ? '18px' : '4px',
                height:'2px', borderRadius:'1px', cursor:'pointer',
                background: i === activeIdx ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)',
                transition:'all 0.35s ease',
              }}/>
            ))}
          </div>
        )}
        <span style={{ fontSize:'12px', letterSpacing:'2px', color:'rgba(255,255,255,0.18)' }}>
          © SIA TATTOOIST
        </span>
      </div>
    </div>
  )
}
