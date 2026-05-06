import { Link, useLocation } from 'react-router-dom'
import { WIX_URL } from '../config'

const nav = { fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', transition: 'color 0.2s' }

export default function Navbar() {
  const { pathname } = useLocation()

  const links = [
    { to: '/works', label: '作品' },
    { to: '/flash', label: '認領圖' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 36px',
      borderBottom: '1px solid var(--border-light)',
      background: 'rgba(12,18,20,0.93)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }}>
      <Link to="/" style={{
        fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 300,
        letterSpacing: '5px', textTransform: 'uppercase', color: 'var(--text-primary)',
      }}>
        Sia
      </Link>

      <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
        {links.map(({ to, label }) => {
          const active = pathname.startsWith(to)
          return (
            <Link key={to} to={to} style={{
              ...nav,
              color: active ? 'var(--ocean)' : 'var(--text-secondary)',
              borderBottom: active ? '1px solid var(--ocean)' : '1px solid transparent',
              paddingBottom: '2px',
            }}>
              {label}
            </Link>
          )
        })}
        <a href={WIX_URL} target="_blank" rel="noopener noreferrer"
          style={{ ...nav, color: 'var(--text-dim)' }}>
          ↗ 主站
        </a>
      </div>
    </nav>
  )
}
