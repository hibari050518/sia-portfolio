import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export default function FlashCard({ item, to }) {
  const avail = item.status === '可認領'
  return (
    <Link to={to}
      style={{
        display: 'block', background: 'var(--bg-card)',
        border: '1px solid var(--border-light)', borderRadius: '2px',
        overflow: 'hidden', opacity: avail ? 1 : 0.5,
        transition: 'border-color 0.3s, transform 0.3s',
      }}
      onMouseEnter={e => {
        if (!avail) return
        e.currentTarget.style.borderColor = 'var(--ocean)'
        e.currentTarget.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-light)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ height: '200px', overflow: 'hidden', background: 'var(--bg-hover)', position: 'relative' }}>
        {item.image_url
          ? <img src={item.image_url} alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => e.currentTarget.style.display = 'none'} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--border)', fontStyle: 'italic', fontSize: '13px' }}>
              {item.title}
            </div>
        }
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <StatusBadge status={item.status} />
        </div>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase',
          color: 'var(--text-dim)', marginBottom: '5px' }}>
          {item.body_part} · {item.size_suggestion}
        </div>
        <div style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.title}</div>
        <div style={{ fontSize: '11px', color: 'var(--gold)', fontStyle: 'italic' }}>{item.price_range}</div>
      </div>
    </Link>
  )
}
