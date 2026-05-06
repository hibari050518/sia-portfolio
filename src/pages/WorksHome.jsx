import { Link } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { getThemes } from '../utils/sheets'
import PageWrapper from '../components/PageWrapper'

function ThemeCard({ theme, works, to }) {
  const preview = works.find(w => w.image_url)
  return (
    <Link to={to}
      style={{
        display: 'block', position: 'relative', aspectRatio: '4/3',
        background: 'var(--bg-card)', border: '1px solid var(--border-light)',
        borderRadius: '2px', overflow: 'hidden', transition: 'border-color 0.3s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--gold)'
        const img = e.currentTarget.querySelector('img')
        if (img) img.style.opacity = '0.55'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-light)'
        const img = e.currentTarget.querySelector('img')
        if (img) img.style.opacity = '0.35'
      }}
    >
      {preview?.image_url &&
        <img src={preview.image_url} alt={theme}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.35, transition: 'opacity 0.4s' }}
          onError={e => e.currentTarget.remove()} />
      }
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(12,18,20,0.95) 0%, transparent 55%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 22px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
          color: 'var(--gold)', marginBottom: '6px' }}>{works.length} 件作品</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontStyle: 'italic',
          color: 'var(--text-primary)' }}>{theme}</div>
      </div>
    </Link>
  )
}

export default function WorksHome() {
  const { works, loading, error } = useWorks()
  const themes = getThemes(works)

  if (loading) return <PageWrapper><p style={{ padding: '80px 40px', color: 'var(--text-dim)', fontStyle: 'italic' }}>載入中⋯</p></PageWrapper>
  if (error)   return <PageWrapper><p style={{ padding: '80px 40px', color: 'var(--text-dim)' }}>讀取失敗：{error}</p></PageWrapper>

  return (
    <PageWrapper>
      <div style={{ padding: '48px 40px', maxWidth: '1100px', margin: '0 auto' }} className="page-pad">
        <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase',
          color: 'var(--gold)', marginBottom: '12px' }}>作品集</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 46px)', color: 'var(--text-primary)',
          marginBottom: '48px', lineHeight: 1.2 }}>
          每一個故事，<br />都從一個念頭開始。
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {themes.map(theme => (
            <ThemeCard key={theme} theme={theme}
              works={works.filter(w => w.theme === theme)}
              to={`/works/${encodeURIComponent(theme)}`} />
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
