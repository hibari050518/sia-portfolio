import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFlash } from '../hooks/useSheets'
import { getSeries } from '../utils/sheets'
import { WIX_URL } from '../config'
import { useLang, t, getSeriesName } from '../context/LangContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { useTouchSwipe } from '../hooks/useTouchSwipe'
import { MobileTopBar, MobileTabBar } from '../components/MobileNav'

const BG = '#111'
const LOGO_URL = 'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/Sia_logo_%E6%96%87%E5%AD%97%EF%BC%88%E7%99%BD%EF%BC%89.png'

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
        [dir === 'left' ? 'left' : 'right']: '24px',
        zIndex:20, background:'none', border:'none',
        cursor: disabled ? 'default' : 'pointer',
        padding:'16px 12px',
        opacity: disabled ? 0.08 : hov ? 0.9 : 0.38,
        transition:'opacity 0.25s',
      }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {dir === 'left'
          ? <path d="M20 4 L8 16 L20 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M12 4 L24 16 L12 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
    </button>
  )
}

const BG_CYCLE_MS  = 3000
const KB_STYLE     = `@keyframes kenBurns{0%{transform:scale(1)}100%{transform:scale(1.065) translate(0,-0.4%)}}`

export default function FlashHome() {
  const { flash, loading } = useFlash()
  const navigate           = useNavigate()
  const { lang }           = useLang()
  const [activeIdx, setActiveIdx] = useState(0)
  const [navIn,     setNavIn]     = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [bgImgIdx,  setBgImgIdx]  = useState(0)
  const prevImgRef = useRef(null)

  useEffect(() => {
    const t2 = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(t2)
  }, [])

  const seriesNames = getSeries(flash)
  const seriesData  = seriesNames.map(name => {
    const items = flash.filter(f => f.series === name)
    const availCount = items.filter(i => i.status?.trim() === '可認領').length
    const images = items.flatMap(i =>
      [i.image_url, i.image_url_2, i.image_url_3].filter(Boolean)
    )
    return { name, count: items.length, availCount, image: images[0] || '', images }
  })
  const total  = seriesData.length
  const series = seriesData[activeIdx]

  // Reset bg cycle when active series changes
  useEffect(() => {
    prevImgRef.current = null
    setBgImgIdx(0)
    setImgLoaded(false)
  }, [activeIdx])

  // Auto-cycle through the current series' images
  useEffect(() => {
    if (!series || series.images.length < 2) return
    const id = setInterval(() => {
      setBgImgIdx(prev => {
        prevImgRef.current = series.images[prev]
        return (prev + 1) % series.images.length
      })
      setImgLoaded(false)
    }, BG_CYCLE_MS)
    return () => clearInterval(id)
  }, [activeIdx, series])

  const go = (delta) => {
    setActiveIdx(i => Math.max(0, Math.min(total - 1, i + delta)))
  }

  const isMobile = useIsMobile()
  const swipe    = useTouchSwipe(() => go(1), () => go(-1))

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft')  go(-1)
      if (e.key === 'Enter' && series) navigate(`/flash/${encodeURIComponent(series.name)}`)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIdx, series])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'12px', letterSpacing:'4px' }}>loading</p>
    </div>
  )

  /* ── Mobile layout ── */
  if (isMobile) return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}
      onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
      <style>{KB_STYLE}</style>

      <MobileTopBar />

      {/* BG image — two-layer crossfade + Ken Burns */}
      {prevImgRef.current && (
        <img src={prevImgRef.current} alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center', filter:'brightness(0.52)' }} />
      )}
      {series?.images[bgImgIdx] && (
        <img key={`${activeIdx}-${bgImgIdx}`} src={series.images[bgImgIdx]} alt={series.name}
          onLoad={() => setImgLoaded(true)}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center', filter:'brightness(0.52)',
            opacity: imgLoaded ? 1 : 0, transition:'opacity 1s ease',
            animation: imgLoaded ? `kenBurns ${BG_CYCLE_MS}ms ease-out forwards` : 'none' }} />
      )}

      {/* Vignette — stronger at bottom */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:5,
        background:'linear-gradient(to bottom, rgba(17,17,17,0.60) 0%, rgba(17,17,17,0) 22%, rgba(17,17,17,0) 42%, rgba(17,17,17,0.82) 72%, rgba(17,17,17,0.97) 100%)' }} />

      {/* Swipe areas */}
      {activeIdx > 0 && (
        <div onClick={() => go(-1)}
          style={{ position:'absolute', left:0, top:'52px', bottom:'calc(62px + env(safe-area-inset-bottom, 0px))', width:'52px', zIndex:20, cursor:'pointer' }} />
      )}
      {activeIdx < total - 1 && (
        <div onClick={() => go(1)}
          style={{ position:'absolute', right:'60px', top:'52px', bottom:'calc(62px + env(safe-area-inset-bottom, 0px))', width:'52px', zIndex:20, cursor:'pointer' }} />
      )}

      {/* Logo watermark — left portion visible at bottom-right */}
      <div style={{
        position:'absolute', left:'30px',
        bottom:'-50px',
        zIndex:8, pointerEvents:'none', opacity:0.09,
      }}>
        <img src={LOGO_URL} alt="" style={{ height:'150px', width:'auto', maxWidth:'none', display:'block' }} />
      </div>

      {/* Right-side thumbnail strip */}
      {total > 1 && (
        <div style={{
          position:'absolute', right:'14px',
          top:'calc(52px + 20px)',
          bottom:'calc(62px + env(safe-area-inset-bottom, 0px) + 150px)',
          zIndex:20,
          display:'flex', flexDirection:'column', justifyContent:'center',
          alignItems:'center', gap:'6px',
        }}>
          {seriesData.map((s, i) => {
            const isActive = i === activeIdx
            return (
              <div key={s.name}
                onClick={() => { setImgLoaded(false); setActiveIdx(i) }}
                style={{
                  width: isActive ? '40px' : '28px',
                  height: isActive ? '40px' : '28px',
                  overflow:'hidden', flexShrink:0, cursor:'pointer',
                  border: isActive ? '1.5px solid rgba(255,255,255,0.72)' : '1px solid rgba(255,255,255,0.18)',
                  opacity: isActive ? 1 : 0.42,
                  transition:'all 0.38s cubic-bezier(0.22,1,0.36,1)',
                }}>
                {s.image
                  ? <img src={s.image} alt={s.name}
                      style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
                  : <div style={{ width:'100%', height:'100%', background:'rgba(255,255,255,0.06)' }} />
                }
              </div>
            )
          })}
        </div>
      )}

      {/* Bottom info — counter, title, counts, button */}
      {series && (
        <div style={{
          position:'absolute', zIndex:20,
          bottom:'calc(62px + env(safe-area-inset-bottom, 0px))',
          left:0, right:0,
          display:'flex', flexDirection:'column', alignItems:'center',
          gap:'7px', padding:'12px 48px 16px', textAlign:'center',
        }}>
          <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.30)' }}>
            {String(activeIdx+1).padStart(2,'0')} / {String(total).padStart(2,'0')}
          </span>
          <h2 style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
            fontSize:'28px', color:'rgba(255,255,255,0.92)', lineHeight:1.2, margin:'2px 0 0' }}>
            {getSeriesName(flash, series.name, lang)}
          </h2>
          <p style={{ fontSize:'11px', letterSpacing:'3px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.35)', margin:0 }}>
            {series.count} {t('flashCount',lang)}
            {series.availCount > 0 && (
              <span style={{ color:'var(--ocean)', marginLeft:'8px' }}>
                · {series.availCount} {t('available',lang)}
              </span>
            )}
          </p>
          <button onClick={() => navigate(`/flash/${encodeURIComponent(series.name)}`)}
            style={{ background:'none', border:'1px solid rgba(255,255,255,0.28)',
              color:'rgba(255,255,255,0.65)', fontSize:'11px', letterSpacing:'3px',
              textTransform:'uppercase', padding:'10px 28px', cursor:'pointer', marginTop:'4px' }}>
            {t('exploreFlash',lang)} →
          </button>
        </div>
      )}

      <MobileTabBar />
    </div>
  )

  /* ── Desktop layout ── */
  return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}>
      <style>{KB_STYLE}</style>

      {/* ── Full-bleed background image — two-layer crossfade + Ken Burns ── */}
      {prevImgRef.current && (
        <img src={prevImgRef.current} alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center center', filter:'brightness(0.52)' }} />
      )}
      {series?.images[bgImgIdx] && (
        <img
          key={`${activeIdx}-${bgImgIdx}`}
          src={series.images[bgImgIdx]}
          alt={series.name}
          onLoad={() => setImgLoaded(true)}
          style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center center',
            filter:'brightness(0.52)',
            opacity: imgLoaded ? 1 : 0,
            transition:'opacity 1s ease',
            animation: imgLoaded ? `kenBurns ${BG_CYCLE_MS}ms ease-out forwards` : 'none',
          }}
        />
      )}

      {/* ── Gradient vignette ── */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:5,
        background:'linear-gradient(to bottom, rgba(17,17,17,0.65) 0%, rgba(17,17,17,0) 22%, rgba(17,17,17,0) 48%, rgba(17,17,17,0.72) 80%, rgba(17,17,17,0.94) 100%)',
      }} />

      {/* ── Top nav ── */}
      <nav style={{
        position:'absolute', top:0, left:0, right:0, zIndex:30,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'28px 44px',
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

      {/* ── Center content ── */}
      {series && (
        <div style={{
          position:'absolute', inset:0, zIndex:15,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          textAlign:'center', pointerEvents:'none',
          opacity: navIn ? 1 : 0, transition:'opacity 0.9s ease 0.25s',
        }}>
          <p style={{
            fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.38)', marginBottom:'10px',
          }}>
            {series.count} {t('flashCount',lang)}
          </p>
          {series.availCount > 0 && (
            <p style={{
              fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
              color:'var(--ocean)', marginBottom:'16px', opacity:0.9,
            }}>
              {series.availCount} {t('available',lang)}
            </p>
          )}
          <h1 style={{
            fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
            fontSize:'clamp(30px, 4.5vw, 70px)', color:'rgba(255,255,255,0.92)',
            lineHeight:1.1, marginBottom:'32px',
          }}>
            {getSeriesName(flash, series.name, lang)}
          </h1>
          <button
            onClick={() => navigate(`/flash/${encodeURIComponent(series.name)}`)}
            style={{
              pointerEvents:'auto', background:'none',
              border:'1px solid rgba(255,255,255,0.28)',
              color:'rgba(255,255,255,0.65)', fontSize:'12px',
              letterSpacing:'2.5px', textTransform:'uppercase',
              padding:'10px 26px', cursor:'pointer',
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
            {t('exploreFlash',lang)} →
          </button>
        </div>
      )}

      {/* ── Arrows ── */}
      <ArrowBtn dir="left"  onClick={() => go(-1)} disabled={activeIdx === 0} />
      <ArrowBtn dir="right" onClick={() => go(1)}  disabled={activeIdx === total - 1} />

      {/* ── Bottom ── */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, zIndex:30,
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'0 44px 28px',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.45s',
      }}>
        <span style={{ fontSize:'12px', letterSpacing:'2px', color:'rgba(255,255,255,0.32)', marginBottom:'16px' }}>
          {total > 0 ? `${String(activeIdx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}` : ''}
        </span>

        {total > 1 && (
          <div style={{ display:'flex', gap:'6px', alignItems:'flex-end', marginBottom:'16px' }}>
            {seriesData.map((s, i) => {
              const isActive = i === activeIdx
              return (
                <div key={s.name}
                  onClick={() => { setImgLoaded(false); setActiveIdx(i) }}
                  style={{
                    width:  isActive ? '54px' : '38px',
                    height: isActive ? '54px' : '38px',
                    overflow:'hidden', flexShrink:0, cursor:'pointer',
                    border: isActive
                      ? '1.5px solid rgba(255,255,255,0.70)'
                      : '1px solid rgba(255,255,255,0.18)',
                    opacity: isActive ? 1 : 0.45,
                    transition:'all 0.38s cubic-bezier(0.22,1,0.36,1)',
                  }}>
                  {s.image
                    ? <img src={s.image} alt={s.name}
                        style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
                    : <div style={{ width:'100%', height:'100%', background:'rgba(255,255,255,0.06)' }} />
                  }
                </div>
              )
            })}
          </div>
        )}

        <span style={{ fontSize:'12px', letterSpacing:'2px', color:'rgba(255,255,255,0.14)' }}>
          © SIA TATTOOIST
        </span>
      </div>
    </div>
  )
}
