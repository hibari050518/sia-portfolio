import { Link } from 'react-router-dom'
import { useFlash } from '../hooks/useSheets'
import { getSeries } from '../utils/sheets'
import PageWrapper from '../components/PageWrapper'

function SeriesCard({ series, items, to }) {
  const preview = items.find(i => i.image_url)
  const availCnt = items.filter(i => i.status === '可認領').length
  return (
    <Link to={to}
      style={{
        display: 'block', position: 'relative', aspectRatio: '4/3',
        background: 'var(--bg-card)', border: '1px solid var(--border-light)',
        borderRadius: '2px', overflow: 'hidden', transition: 'border-color 0.3s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--ocean)'
        const img = e.currentTarget.querySelector('img')
        if (img) img.style.opacity = '0.5'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-light)'
        const img = e.currentTarget.querySelector('img')
        if (img) img.style.opacity = '0.3'
      }}
    >
      {preview?.image_url &&
        <img src={preview.image_url} alt={series}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.3, transition: 'opacity 0.4s' }}
          onError={e => e.currentTarget.remove()} />
      }
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(12,18,20,0.95) 0%, transparent 55%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 22px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px',
          color: availCnt > 0 ? 'var(--ocean)' : 'var(--text-dim)' }}>
          {availCnt > 0 ? `${availCnt} 件可認領` : '暫無可認領'}
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontStyle: 'italic',
          color: 'var(--text-primary)' }}>{series}</div>
      </div>
    </Link>
  )
}

export default function FlashHome() {
  const { flash, loading, error } = useFlash()
  const series = getSeries(flash)

  if (loading) return <PageWrapper><p style={{ padding: '80px 40px', color: 'var(--text-dim)', fontStyle: 'italic' }}>載入中⋯</p></PageWrapper>
  if (error)   return <PageWrapper><p style={{ padding: '80px 40px', color: 'var(--text-dim)' }}>讀取失敗：{error}</p></PageWrapper>

  return (
    <PageWrapper>
      <div style={{ padding: '48px 40px', maxWidth: '1100px', margin: '0 auto' }} className="page-pad">
        <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase',
          color: 'var(--ocean)', marginBottom: '12px' }}>認領圖</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 46px)', color: 'var(--text-primary)',
          marginBottom: '14px', lineHeight: 1.2 }}>
          有些圖在等待<br />它命定的人。
        </h1>
        <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic',
          marginBottom: '48px', lineHeight: 1.9 }}>
          認領前需先抽卡確認緣分，部分作品需神明同意，請透過 LINE 詢問。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {series.map(s => (
            <SeriesCard key={s} series={s}
              items={flash.filter(f => f.series === s)}
              to={`/flash/${encodeURIComponent(s)}`} />
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
