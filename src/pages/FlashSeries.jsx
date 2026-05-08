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
  const [hinted, setHinted] = useState(false)

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

  useEffect(() => {
    if (total < 2) return
    const t1 = setTimeout(() => setHinted(true), 1400)
    const t2 = setTimeout(() => setHinted(false), 2250)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [total])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'12px', letterSpacing:'4px' }}>loading</p>
    </div>
  )

  const activeItem = seriesItems[activeIdx]
  const isAvail    = activeItem?.status?.trim() === '可認領'

  /* ── Mobile layout: tarot card draw ── */
  if (isMobile) return (
    <div style={{ position:'fixed', inset:0, background:'#0c0c0e', overflow:'hidden' }}>
      <style>{`
        @keyframes swipeNudgeF {
          0%   { transform: translateY(-52%); }
          28%  { transform: translateY(-52%) translateX(-22px); }
          58%  { transform: translateY(-52%) translateX(10px); }
          80%  { transform: translateY(-52%) translateX(-4px); }
          100% { transform: translateY(-52%); }
        }
        @keyframes arrowLeftF {
          0%, 100% { opacity: 0.16; transform: translateY(-50%) translateX(0); }
          50%       { opacity: 0.50; transform: translateY(-50%) translateX(-6px); }
        }
        @keyframes arrowRightF {
          0%, 100% { opacity: 0.16; transform: translateY(-50%) translateX(0); }
          50%       { opacity: 0.50; transform: translateY(-50%) translateX(6px); }
        }
        @keyframes starFloat {
          0%   { transform: translate(0,0) scale(1); opacity:0; }
          10%  { opacity: 0.7; }
          50%  { transform: translate(6px,-12vh) scale(0.85); opacity:0.5; }
          90%  { opacity: 0.08; }
          100% { transform: translate(-4px,-22vh) scale(0.6); opacity:0; }
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{ position:'absolute', top:'38%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:'130vw', height:'90vw', borderRadius:'50%',
        background:'radial-gradient(ellipse, rgba(255,255,255,0.026) 0%, transparent 65%)',
        pointerEvents:'none', zIndex:0 }} />

      <MobileTopBar />

      <div style={{
        position:'absolute', top:'52px',
        bottom:'calc(62px + env(safe-area-inset-bottom, 0px))',
        left:0, right:0, display:'flex', flexDirection:'column', zIndex:1,
      }}>

        {/* Background image — behind cards + info, fades in from bottom */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'76%', zIndex:0, pointerEvents:'none' }}>
          <div style={{
            position:'absolute', inset:0,
            backgroundImage:`url("https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/%E8%A1%8C%E5%8B%95%E7%89%88%E8%83%8C%E6%99%AF%20(2).jpg")`,
            backgroundSize:'cover', backgroundPosition:'center 20%',
            opacity:0.32,
          }}/>
          {/* Top fade into card bg */}
          <div style={{
            position:'absolute', top:0, left:0, right:0, height:'68%', pointerEvents:'none',
            background:'linear-gradient(to bottom, #0c0c0e 0%, transparent 100%)',
          }}/>
          {/* Bottom fade */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0, height:'30%', pointerEvents:'none',
            background:'linear-gradient(to top, rgba(12,12,14,0.65) 0%, transparent 100%)',
          }}/>
        </div>

        {/* Breadcrumb */}
        <div style={{ padding:'10px 18px 4px', flexShrink:0,
          display:'flex', alignItems:'center', gap:'8px' }}>
          <Link to="/flash"
            style={{ fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase',
              color:'rgba(255,255,255,0.28)', textDecoration:'none' }}>
            ← {t('backFlash',lang)}
          </Link>
          <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.14)' }}>／</span>
          <span style={{ fontSize:'11px', letterSpacing:'1px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.42)' }}>
            {getSeriesName(flash, decoded, lang)}
          </span>
        </div>

        {/* Card spread */}
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}
          onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>

          {/* Floating star particles — below card, high z-index so visible */}
          {[
            {x:8,  y:86, sz:1.3, dur:'4.4s', d:'0s'},
            {x:22, y:90, sz:0.9, dur:'3.8s', d:'0.8s'},
            {x:38, y:94, sz:1.5, dur:'5.2s', d:'1.5s'},
            {x:52, y:88, sz:1.0, dur:'4.8s', d:'0.3s'},
            {x:66, y:92, sz:1.3, dur:'3.6s', d:'2.0s'},
            {x:80, y:87, sz:0.8, dur:'5.0s', d:'1.1s'},
            {x:33, y:96, sz:1.1, dur:'4.2s', d:'2.4s'},
            {x:62, y:97, sz:0.7, dur:'4.6s', d:'0.6s'},
            {x:16, y:98, sz:0.6, dur:'5.5s', d:'1.8s'},
            {x:76, y:95, sz:1.0, dur:'3.9s', d:'3.0s'},
            {x:90, y:91, sz:0.8, dur:'4.1s', d:'1.3s'},
          ].map((p, i) => (
            <div key={i} style={{
              position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
              width:`${p.sz}px`, height:`${p.sz}px`, borderRadius:'50%',
              background:`radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 60%, transparent 100%)`,
              boxShadow:`0 0 ${p.sz*4}px ${p.sz*2}px rgba(255,255,255,0.18)`,
              animation:`starFloat ${p.dur} ease-in-out infinite`,
              animationDelay: p.d,
              pointerEvents:'none', zIndex:8,
            }} />
          ))}

          {/* Left/Right swipe arrows — no frame, overlapping card edge */}
          {activeIdx > 0 && total > 1 && (
            <div style={{
              position:'absolute', left:'calc(14% - 18px)', top:'44%', zIndex:15, pointerEvents:'none',
              display:'flex', alignItems:'center', justifyContent:'center',
              animation:'arrowLeftF 2.2s ease-in-out infinite',
            }}>
              <span style={{ fontSize:'34px', color:'rgba(255,255,255,0.72)', lineHeight:1 }}>‹</span>
            </div>
          )}
          {activeIdx < total - 1 && total > 1 && (
            <div style={{
              position:'absolute', right:'calc(14% - 18px)', top:'44%', zIndex:15, pointerEvents:'none',
              display:'flex', alignItems:'center', justifyContent:'center',
              animation:'arrowRightF 2.2s ease-in-out 0.3s infinite',
            }}>
              <span style={{ fontSize:'34px', color:'rgba(255,255,255,0.72)', lineHeight:1 }}>›</span>
            </div>
          )}

          {seriesItems.map((item, i) => {
            const offset      = i - activeIdx
            if (Math.abs(offset) > 1) return null
            const isCenter    = offset === 0
            const isAvailCard = item.status?.trim() === '可認領'
            const leftPct     = 14 + offset * 58
            const rotation    = offset * 14

            return (
              <div key={item.id}
                onClick={() => {
                  if (offset === 0) navigate(`/flash/${encodeURIComponent(decoded)}/${item.id}`)
                  else setActiveIdx(i)
                }}
                style={{
                  position:'absolute', left:`${leftPct}%`, width:'72%',
                  height:'min(54vh, calc(72vw * 1.50))',
                  top:'50%',
                  transform: isCenter ? 'translateY(-52%)' : `translateY(-52%) scale(0.86) rotate(${rotation}deg)`,
                  transformOrigin:'50% 88%',
                  overflow:'hidden',
                  cursor:'pointer',
                  borderRadius:'14px',
                  border:`1px solid rgba(255,255,255,${isCenter ? 0.22 : 0.06})`,
                  boxShadow: isCenter
                    ? '0 8px 40px 4px rgba(0,0,0,0.70), 0 24px 80px rgba(0,0,0,0.90), 0 0 0 1px rgba(255,255,255,0.08)'
                    : '0 8px 30px rgba(0,0,0,0.55)',
                  opacity: isCenter ? 1 : 0.28,
                  zIndex: isCenter ? 2 : 1,
                  animation: isCenter && hinted ? 'swipeNudgeF 0.82s ease-out forwards' : 'none',
                  transition: isCenter && hinted ? 'none' : [
                    'left 0.65s cubic-bezier(0.25,0.1,0.25,1)',
                    'transform 0.65s cubic-bezier(0.25,0.1,0.25,1)',
                    'opacity 0.4s ease',
                  ].join(', '),
                }}>

                {item.image_url
                  ? <img src={item.image_url} alt={item.title}
                      style={{ width:'100%', height:'100%', objectFit:'cover',
                        filter:`brightness(${isCenter ? 0.80 : 0.18})`,
                        transition:'filter 0.55s ease' }} />
                  : <div style={{ width:'100%', height:'100%',
                      background:'rgba(255,255,255,0.02)',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:'18px', color:'rgba(255,255,255,0.08)' }}>✦</span>
                    </div>
                }

                {/* Side card: diamond back pattern */}
                {!isCenter && (
                  <div style={{ position:'absolute', inset:0, pointerEvents:'none',
                    background:`repeating-linear-gradient(45deg,
                      rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px,
                      transparent 1px, transparent 14px)`,
                  }} />
                )}

                {/* Side card: edge fade */}
                {!isCenter && <>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:'50%',
                    background:'linear-gradient(to bottom, #0c0c0e, transparent)',
                    pointerEvents:'none' }}/>
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'50%',
                    background:'linear-gradient(to top, #0c0c0e, transparent)',
                    pointerEvents:'none' }}/>
                </>}

                {/* Center card: corner marks */}
                {isCenter && <>
                  <div style={{ position:'absolute', top:'10px', left:'10px',
                    width:'16px', height:'16px', pointerEvents:'none',
                    borderTop:'1px solid rgba(255,255,255,0.30)',
                    borderLeft:'1px solid rgba(255,255,255,0.30)' }} />
                  <div style={{ position:'absolute', top:'10px', right:'10px',
                    width:'16px', height:'16px', pointerEvents:'none',
                    borderTop:'1px solid rgba(255,255,255,0.30)',
                    borderRight:'1px solid rgba(255,255,255,0.30)' }} />
                  <div style={{ position:'absolute', bottom:'10px', left:'10px',
                    width:'16px', height:'16px', pointerEvents:'none',
                    borderBottom:'1px solid rgba(255,255,255,0.30)',
                    borderLeft:'1px solid rgba(255,255,255,0.30)' }} />
                  <div style={{ position:'absolute', bottom:'10px', right:'10px',
                    width:'16px', height:'16px', pointerEvents:'none',
                    borderBottom:'1px solid rgba(255,255,255,0.30)',
                    borderRight:'1px solid rgba(255,255,255,0.30)' }} />

                  {/* Status badge */}
                  <div style={{ position:'absolute', top:'18px', left:0, right:0,
                    display:'flex', justifyContent:'center', pointerEvents:'none' }}>
                    <span style={{ fontSize:'9px', letterSpacing:'2.5px',
                      textTransform:'uppercase', padding:'2px 10px',
                      color: isAvailCard ? 'var(--ocean)' : 'rgba(255,255,255,0.28)',
                      border:`1px solid ${isAvailCard ? 'var(--ocean)' : 'rgba(255,255,255,0.14)'}`,
                      background:'rgba(12,12,14,0.65)' }}>
                      {isAvailCard ? t('available',lang) : t('taken',lang)}
                    </span>
                  </div>

                  {/* Card title at bottom */}
                  <div style={{ position:'absolute', bottom:0, left:0, right:0,
                    padding:'36px 16px 22px', pointerEvents:'none',
                    background:'linear-gradient(to top, rgba(12,12,14,0.96) 28%, rgba(12,12,14,0.55) 65%, transparent 100%)' }}>
                    <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
                      fontSize:'14px', color:'rgba(255,255,255,0.80)', letterSpacing:'0.5px',
                      textAlign:'center', margin:0 }}>
                      {item.title}
                    </p>
                  </div>
                </>}

              </div>
            )
          })}

          {activeIdx > 0 && (
            <div onClick={() => go(-1)} style={{
              position:'absolute', left:0, top:0, bottom:0, width:'14%',
              zIndex:10, cursor:'pointer',
            }} />
          )}
          {activeIdx < total - 1 && (
            <div onClick={() => go(1)} style={{
              position:'absolute', right:0, top:0, bottom:0, width:'14%',
              zIndex:10, cursor:'pointer',
            }} />
          )}
        </div>

        {/* Bottom: dots + counter + CTA */}
        {activeItem && (
          <div style={{ padding:'14px 20px 14px', flexShrink:0, position:'relative', zIndex:1,
            display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', textAlign:'center' }}>
            {total > 1 && (
              <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
                {seriesItems.map((_, i) => (
                  <div key={i} onClick={() => setActiveIdx(i)} style={{
                    width: i === activeIdx ? '20px' : '4px', height:'2px',
                    borderRadius:'1px', cursor:'pointer',
                    background: i === activeIdx ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.14)',
                    transition:'all 0.35s ease',
                  }} />
                ))}
              </div>
            )}
            <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.28)' }}>
              {String(activeIdx+1).padStart(2,'0')} / {String(total).padStart(2,'0')}
            </span>
            <button
              onClick={() => navigate(`/flash/${encodeURIComponent(decoded)}/${activeItem.id}`)}
              style={{ background:'none', border:'1px solid rgba(255,255,255,0.28)',
                color:'rgba(255,255,255,0.65)', fontSize:'11px', letterSpacing:'3px',
                textTransform:'uppercase', padding:'9px 28px', cursor:'pointer' }}>
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
                height:`${heightPct}%`, top:'50%',
                transform: isCenter ? 'translateY(-50%)' : `translateY(-50%) rotate(${offset < 0 ? 3 : -3}deg)`,
                transformOrigin:'center bottom',
                overflow:'hidden',
                cursor: isCenter ? 'pointer' : 'ew-resize',
                opacity: Math.abs(offset) > 2 ? 0 : claimedDim,
                zIndex: isCenter ? 2 : 1,
                transition:[
                  'left 0.65s cubic-bezier(0.25,0.1,0.25,1)',
                  'height 0.65s cubic-bezier(0.25,0.1,0.25,1)',
                  'transform 0.65s cubic-bezier(0.25,0.1,0.25,1)',
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
