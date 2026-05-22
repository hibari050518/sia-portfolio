import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { WIX_URL } from '../config'

function NavLink({ to, zh, en, active }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to}
      style={{ fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase',
        color: active ? 'rgba(255,255,255,0.9)' : hov ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
        transition:'color 0.25s' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      {hov ? en : zh}
    </Link>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:100,
      display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'28px 44px',
      background:'transparent',
    }}>
      <Link to="/" style={{ fontSize:'13px', letterSpacing:'4px',
        color:'rgba(255,255,255,0.85)', fontFamily:'var(--serif)', textDecoration:'none' }}>
        SIA TATTOOIST
      </Link>
      <div style={{ display:'flex', gap:'36px', alignItems:'center' }}>
        <NavLink to="/works"  zh="作品"  en="Works" active={pathname.startsWith('/works')} />
        <NavLink to="/flash"  zh="認領圖" en="Flash" active={pathname.startsWith('/flash')} />
        <a href={WIX_URL} target="_blank" rel="noreferrer"
          style={{ fontSize:'12px', letterSpacing:'2px', color:'var(--warm)' }}>
          Appointments ↗
        </a>
      </div>
    </nav>
  )
}
