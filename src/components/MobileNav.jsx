import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { WIX_URL } from '../config'

const LOGO_URL =
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/Sia_logo_%E6%96%87%E5%AD%97%EF%BC%88%E7%99%BD%EF%BC%89.png'

const WARM     = '#c8916e'
const DIM      = 'rgba(255,255,255,0.32)'
const ACTIVE   = 'rgba(255,255,255,0.88)'

// ── 頂部 bar：Logo + 語系切換 ─────────────────────
export function MobileTopBar() {
  const { lang, setLang } = useLang()

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: '52px',
      background: 'rgba(14,14,14,0.96)',
      borderBottom: '0.5px solid rgba(255,255,255,0.07)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 18px',
      zIndex: 200,
    }}>
      <Link to="/" style={{ display:'flex', alignItems:'center' }}>
        <img
          src={LOGO_URL}
          alt="SIA TATTOOIST"
          style={{ height: '20px', objectFit: 'contain', display: 'block' }}
          onError={e => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextElementSibling.style.display = 'block'
          }}
        />
        <span style={{
          display: 'none',
          fontSize: '11px', letterSpacing: '4px',
          color: 'rgba(255,255,255,0.88)', fontFamily: 'var(--serif)',
        }}>SIA</span>
      </Link>

      <div style={{ display:'flex', gap:'14px', alignItems:'center' }}>
        {[['zh','中'],['en','EN'],['ko','한']].map(([l, label]) => (
          <span
            key={l}
            onClick={() => setLang(l)}
            style={{
              fontSize: '11px', letterSpacing: '1.5px', cursor: 'pointer',
              color: lang === l ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.30)',
              transition: 'color 0.2s',
              padding: '6px 2px',  // 加大點擊區域
            }}
          >{label}</span>
        ))}
      </div>
    </div>
  )
}

// ── 底部 Tab Bar ──────────────────────────────────
export function MobileTabBar() {
  const { pathname } = useLocation()
  const isWorks = pathname.startsWith('/works')
  const isFlash = pathname.startsWith('/flash')

  const tabStyle = (active) => ({
    flex: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '5px',
    textDecoration: 'none',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    position: 'relative',
  })

  const labelStyle = (active) => ({
    fontSize: '10px',
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    color: active ? ACTIVE : DIM,
    fontFamily: active ? 'var(--serif)' : 'inherit',
    fontStyle: active ? 'italic' : 'normal',
    fontWeight: active ? 300 : 400,
    transition: 'color 0.25s, font-style 0.25s',
  })

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'calc(62px + env(safe-area-inset-bottom, 0px))',
      background: 'rgba(10,10,10,0.88)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '0.5px solid rgba(255,255,255,0.07)',
      display: 'flex',
      zIndex: 200,
    }}>
      <Link to="/works" style={tabStyle(isWorks)}>
        <span style={labelStyle(isWorks)}>作品</span>
        {isWorks && (
          <div style={{ width:'3px', height:'3px', borderRadius:'50%',
            background:'rgba(255,255,255,0.55)', position:'absolute',
            bottom:'calc(env(safe-area-inset-bottom, 0px) + 8px)' }} />
        )}
      </Link>

      <Link to="/flash" style={tabStyle(isFlash)}>
        <span style={labelStyle(isFlash)}>認領圖</span>
        {isFlash && (
          <div style={{ width:'3px', height:'3px', borderRadius:'50%',
            background:'rgba(255,255,255,0.55)', position:'absolute',
            bottom:'calc(env(safe-area-inset-bottom, 0px) + 8px)' }} />
        )}
      </Link>

      <a href={WIX_URL} target="_blank" rel="noreferrer" style={tabStyle(false)}>
        <span style={{ fontSize:'10px', letterSpacing:'2.5px', textTransform:'uppercase',
          color: WARM, fontFamily:'inherit' }}>預約 ↗</span>
      </a>
    </div>
  )
}
