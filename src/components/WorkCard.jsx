import { Link } from 'react-router-dom'

export default function WorkCard({ work, to }) {
  return (
    <Link to={to}
      style={{
        display: 'block', background: 'var(--bg-card)',
        border: '1px solid var(--border-light)', borderRadius: '2px',
        overflow: 'hidden', transition: 'border-color 0.3s, transform 0.3s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--gold)'
        e.currentTarget.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-light)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ height: '220px', overflow: 'hidden', background: 'var(--bg-hover)', position: 'relative' }}>
        {work.video_url && !work.image_url
          ? <video src={work.video_url} autoPlay muted loop playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : work.image_url
            ? <img src={work.image_url} alt={work.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                onError={e => e.currentTarget.style.display = 'none'} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'var(--border)', fontStyle: 'italic', fontSize: '13px' }}>
                {work.title}
              </div>
        }
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase',
          color: 'var(--text-dim)', marginBottom: '6px' }}>{work.body_part}</div>
        <div style={{ fontSize: '16px', color: 'var(--tex