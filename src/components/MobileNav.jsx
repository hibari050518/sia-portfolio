import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { WIX_URL } from '../config'

const LOGO_URL =
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/Sia_logo_%E6%96%87%E5%AD%97%EF%BC%88%E7%99%BD%EF%BC%89.png'

const TEAL     = '#5aaabf'
const WARM     = '#c8916e'
const DIM      = 'rgba(255,255,255,0.30)'

// ── 小 2×2 grid icon ──────────────────────────────
function GridIcon({ active }) {
  const c = active ? TEAL : DIM
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2.5px', width:'13px', height:'13px' }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{ background: c, borderRadius:'1.5px' }} />
      ))}
    </div>
  )
}

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
    gap: '4px',
    textDecoration: 'none',
    borderTop: active ? `2px solid ${TEAL}` : '2px solid transparent',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  })

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'calc(62px + env(safe-area-inset-bottom, 0px))',
      background: '#0a0a0a',
      borderTop: '0.5px solid rgba(255,255,255,0.09)',
      display: 'flex',
      zIndex: 200,
    }}>
      <Link to="/works" style={tabStyle(isWorks)}>
        <GridIcon active={isWorks} />
        <span style={{ fontSize:'9px', letterSpacing:'0.5px', color: isWorks ? TEAL : DIM }}>作品</span>
      </Link>

      <Link to="/flash" style={tabStyle(isFlash)}>
        <GridIcon active={isFlash} />
        <span style={{ fontSize:'9px', letterSpacing:'0.5px', color: isFlash ? TEAL : DIM }}>認領圖</span>
      </Link>

      <a href={WIX_URL} target="_blank" rel="noreferrer" style={tabStyle(false)}>
        <span style={{ fontSize:'16px', color: WARM, lineHeight: 1 }}>↗</span>
        <span style={{ fontSize:'9px', color: WARM, letterSpacing:'0.5px' }}>預約</span>
      </a>
    </div>
  )
}
