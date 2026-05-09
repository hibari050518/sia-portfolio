import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { getThemes } from '../utils/sheets'
import { WIX_URL } from '../config'
import { useLang, getThemeName, t } from '../context/LangContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { useTouchSwipe } from '../hooks/useTouchSwipe'
import { MobileTopBar, MobileTabBar } from '../components/MobileNav'

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

const BG = '#111'
const LOGO_URL = 'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/Sia_logo_%E6%96%87%E5%AD%97%EF%BC%88%E7%99%BD%EF%BC%89.png'

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
const KB_STYLE     = '@keyframes kenBurns{0%{transform:scale(1)}100%{transform:scale(1.065) translate(0,-0.4%)}}'

export default function WorksHome() {
  const { works, loading } = useWorks()
  const navigate           = useNavigate()
  const { lang }           = useLang()
  const [activeIdx, setActiveIdx] = useState(0)
  const [navIn,     setNavIn]     = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [bgImgIdx,  setBgImgIdx]  = useState(0)
  const prevImgRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const themeNames  = getThemes(works)
  const themeData   = themeNames.map(name => {
    const tw = works.filter(w => w.theme === name)
    const images = tw.flatMap(w =>
      [w.image_url, w.image_url_2, w.image_url_3].filter(Boolean)
    )
    return { name, count: tw.length, image: images[0] || '', images }
  })
  const total  = themeData.length
  const theme  = themeData[activeIdx]

  useEffect(() => {
    prevImgRef.current = null
    setBgImgIdx(0)
    setImgLoaded(false)
  }, [activeIdx])

  useEffect(() => {
    if (!theme || theme.images.length < 2) return
    const id = setInterval(() => {
      setBgImgIdx(prev => {
        prevImgRef.current = theme.images[prev]
        return (prev + 1) % theme.images.length
      })
      setImgLoaded(false)
    }, BG_CYCLE_MS)
    return () => clearInterval(id)
  }, [activeIdx, theme])

  const go = (delta) => {
    setActiveIdx(i => Math.max(0, Math.min(total - 1, i + delta)))
  }

  const isMobile = useIsMobile()
  const swipe    = useTouchSwipe(() => go(1), () => go(-1))

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft')  go(-1)
      if (e.key === 'Enter' && theme) navigate('/works/' + encodeURIComponent(theme.name))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIdx, theme])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG }} />
  )

  if (isMobile) return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}
      onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
      <style>{KB_STYLE}</style>
      <MobileTopBar />
      {prevImgRef.current && (
        <img src={prevImgRef.current} alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center', filter:'brightness(0.55)' }} />
      )}
      {theme && theme.images[bgImgIdx] && (
        <img key={activeIdx + '-' + bgImgIdx} src={theme.images[bgImgIdx]} alt={theme.name}
          onLoad={() => setImgLoaded(true)}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center', filter:'brightness(0.55)',
            opacity: imgLoaded ? 1 : 0, transition:'opacity 1s ease',
            animation: imgLoaded ? 'kenBurns ' + BG_CYCLE_MS + 'ms ease-out forwards' : 'none' }} />
      )}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:5,
        background:'linear-gradient(to bottom, rgba(17,17,17,0.60) 0%, rgba(17,17,17,0) 22%, rgba(17,17,17,0) 42%, rgba(17,17,17,0.82) 72%, rgba(17,17,17,0.97) 100%)' }} />
      {activeIdx > 0 && (
        <div onClick={() => go(-1)}
          style={{ position:'absolute', left:0, top:'52px', bottom:'calc(62px + env(safe-area-inset-bottom, 0px))', width:'52px', zIndex:20, cursor:'pointer' }} />
      )}
      {activeIdx < total - 1 && (
        <div onClick={() => go(1)}
          style={{ position:'absolute', right:'60px', top:'52px', bottom:'calc(62px + env(safe-area-inset-bottom, 0px))', width:'52px', zIndex:20, cursor:'pointer' }} />
      )}
      <div style={{
        position:'absolute', left:'72px',
        bottom:'calc(62px + env(safe-area-inset-bottom, 0px) - 102px)',
        zIndex:8, pointerEvents:'none', opacity:0.07,
      }}>
        <img src={LOGO_URL} alt="" style={{ height:'248px', width:'auto', maxWidth:'none', display:'block' }} />
      </div>
      {total > 1 && (
        <div style={{
          position:'absolute', right:'14px',
          top:'calc(52px + 20px)',
          bottom:'calc(62px + env(safe-area-inset-bottom, 0px) + 150px)',
          zIndex:20,
          display:'flex', flexDirection:'column', justifyContent:'center',
          alignItems:'center', gap:'6px',
        }}>
          {themeData.map((th, i) => {
            const isActive = i === activeIdx
            return (
              <div key={th.name}
                onClick={() => { setImgLoaded(false); setActiveIdx(i) }}
                style={{
                  width: isActive ? '40px' : '28px',
                  height: isActive ? '40px' : '28px',
                  overflow:'hidden', flexShrink:0, cursor:'pointer',
                  border: isActive ? '1.5px solid rgba(255,255,255,0.72)' : '1px solid rgba(255,255,255,0.18)',
                  opacity: isActive ? 1 : 0.42,
                  transition:'all 0.38s cubic-bezier(0.22,1,0.36,1)',
                }}>
                {th.image
                  ? <img src={th.image} alt={th.name}
                      style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
                  : <div style={{ width:'100%', height:'100%', background:'rgba(255,255,255,0.06)' }} />
                }
              </div>
            )
          })}
        </div>
      )}
      {theme && (
        <div style={{
          position:'absolute', zIndex:20,
          bottom:'calc(62px + env(safe-area-inset-bottom, 0px))',
          left:0, right:0,
          display:'flex', flexDirection:'column', alignItems:'center',
          gap:'7px', padding:'12px 48px 16px', textAlign:'center',
        }}>
          <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.30)' }}>
            {String(activeIdx+1).padStart(2,'0') + ' / ' + String(total).padStart(2,'0')}
          </span>
          <h2 style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
            fontSize:'28px', color:'rgba(255,255,255,0.92)', lineHeight:1.2, margin:'2px 0 0' }}>
            {getThemeName(works, theme.name, lang)}
          </h2>
          <p style={{ fontSize:'11px', letterSpacing:'3px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.35)', margin:0 }}>
            {theme.count + ' ' + t('pieces',lang)}
          </p>
          <button onClick={() => navigate('/works/' + encodeURIComponent(theme.name))}
            style={{ background:'none', border:'1px solid rgba(255,255,255,0.28)',
              color:'rgba(255,255,255,0.65)', fontSize:'11px', letterSpacing:'3px',
              textTransform:'uppercase', padding:'8px 22px', cursor:'pointer', marginTop:'4px' }}>
            {t('viewWorks',lang) + ' →'}
          </button>
        </div>
      )}
      <MobileTabBar />
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}>
      <style>{KB_STYLE}</style>
      {prevImgRef.current && (
        <img src={prevImgRef.current} alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center center', filter:'brightness(0.58)' }} />
      )}
      {theme && theme.images[bgImgIdx] && (
        <img key={activeIdx + '-' + bgImgIdx} src={theme.images[bgImgIdx]} alt={theme.name}
          onLoad={() => setImgLoaded(true)}
          style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center center',
            filter:'brightness(0.58)',
            opacity: imgLoaded ? 1 : 0, transition:'opacity 1s ease',
            animation: imgLoaded ? 'kenBurns ' + BG_CYCLE_MS + 'ms ease-out forwards' : 'none',
          }} />
      )}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:5,
        background:'linear-gradient(to bottom, rgba(17,17,17,0.65) 0%, rgba(17,17,17,0) 22%, rgba(17,17,17,0) 48%, rgba(17,17,17,0.72) 80%, rgba(17,17,17,0.94) 100%)',
      }} />
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
          <NavLink to="/works" zh={t('works',lang)} en={t('works',lang)} />
          <NavLink to="/flash" zh={t('flash',lang)} en={t('flash',lang)} />
          <a href={WIX_URL} target="_blank" rel="noreferrer"
            style={{ fontSize:'12px', letterSpacing:'2px', color:'var(--warm)', textDecoration:'none' }}>
            {t('appointments',lang)}
          </a>
          <LangSwitcher />
        </div>
      </nav>
      {theme && (
        <div style={{
          position:'absolute', inset:0, zIndex:15,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          textAlign:'center', pointerEvents:'none',
          opacity: navIn ? 1 : 0, transition:'opacity 0.9s ease 0.25s',
        }}>
          <p style={{ fontSize:'12px', letterSpacing:'5px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.38)', marginBottom:'18px' }}>
            {theme.count + ' ' + t('pieces',lang)}
          </p>
          <h1 style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
            fontSize:'clamp(30px, 4.5vw, 70px)', color:'rgba(255,255,255,0.92)',
            lineHeight:1.1, marginBottom:'32px' }}>
            {getThemeName(works, theme.name, lang)}
          </h1>
          <button
            onClick={() => navigate('/works/' + encodeURIComponent(theme.name))}
            style={{
              pointerEvents:'auto', background:'none',
              border:'1px solid rgba(255,255,255,0.28)',
              color:'rgba(255,255,255,0.65)', fontSize:'12px',
              letterSpacing:'3.5px', textTransform:'uppercase',
              padding:'10px 26px', cursor:'pointer',
              transition:'border-color 0.25s, color 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.72)'; e.currentTarget.style.color='rgba(255,255,255,1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.28)'; e.currentTarget.style.color='rgba(255,255,255,0.65)' }}>
            {t('viewWorks',lang) + ' →'}
          </button>
        </div>
      )}
      <ArrowBtn dir="left"  onClick={() => go(-1)} disabled={activeIdx === 0} />
      <ArrowBtn dir="right" onClick={() => go(1)}  disabled={activeIdx === total - 1} />
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, zIndex:30,
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'0 44px 28px',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.45s',
      }}>
        <span style={{ fontSize:'12px', letterSpacing:'2px', color:'rgba(255,255,255,0.32)', marginBottom:'16px' }}>
          {total > 0 ? String(activeIdx + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0') : ''}
        </span>
        {total > 1 && (
          <div style={{ display:'flex', gap:'6px', alignItems:'flex-end', marginBottom:'16px' }}>
            {themeData.map((th, i) => {
              const isActive = i === activeIdx
              return (
                <div key={th.name}
                  onClick={() => { setImgLoaded(false); setActiveIdx(i) }}
                  style={{
                    width:  isActive ? '54px' : '38px',
                    height: isActive ? '54px' : '38px',
                    overflow:'hidden', flexShrink:0, cursor:'pointer',
                    border: isActive ? '1.5px solid rgba(255,255,255,0.70)' : '1px solid rgba(255,255,255,0.18)',
                    opacity: isActive ? 1 : 0.45,
                    transition:'all 0.38s cubic-bezier(0.22,1,0.36,1)',
                  }}>
                  {th.image
                    ? <img src={th.image} alt={th.name}
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
