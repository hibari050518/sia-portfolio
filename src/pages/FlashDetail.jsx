import { useParams, Link } from 'react-router-dom'
import { useFlash } from '../hooks/useSheets'
import StatusBadge from '../components/StatusBadge'
import LineButton from '../components/LineButton'
import PageWrapper from '../components/PageWrapper'

export default function FlashDetail() {
  const { series, id } = useParams()
  const decoded = decodeURIComponent(series)
  const { flash, loading } = useFlash()

  const seriesItems = flash.filter(f => f.series === decoded)
  const item = flash.find(f => f.id === id)
  const idx = seriesItems.findIndex(f => f.id === id)
  const prev = idx > 0 ? seriesItems[idx - 1] : null
  const next = idx < seriesItems.length - 1 ? seriesItems[idx + 1] : null

  if (loading) return <PageWrapper><p style={{ padding: '80px 40px', color: 'var(--text-dim)', fontStyle: 'italic' }}>載入中⋯</p></PageWrapper>
  if (!item)   return <PageWrapper><p style={{ padding: '80px 40px', color: 'var(--text-dim)' }}>找不到這張認領圖。</p></PageWrapper>

  const avail = item.status === '可認領'

  return (
    <PageWrapper>
      <div style={{ padding: '48px 40px', maxWidth: '1100px', margin: '0 auto' }} className="page-pad">
        <Link to={`/flash/${encodeURIComponent(decoded)}`}
          style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
            color: 'var(--text-dim)', marginBottom: '32px', display: 'inline-block' }}>
          ← {decoded}
        </Link>

        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}>
          {/* 圖片 */}
          <div style={{ opacity: avail ? 1 : 0.6, transition: 'opacity 0.3s' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)',
              borderRadius: '2px', overflow: 'hidden', aspectRatio: '1/1' }}>
              {item.image_url
                ? <img src={item.image_url} alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'var(--text-dim)', fontStyle: 'italic' }}>暫無圖片</div>
              }
            </div>
          </div>

          {/* 內容 */}
          <div style={{ paddingTop: '8px' }}>
            <div style={{ marginBottom: '16px' }}><StatusBadge status={item.status} /></div>
            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase',
              color: 'var(--ocean)', marginBottom: '10px' }}>{decoded}</p>
            <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic',
              fontSize: 'clamp(24px, 3vw, 38px)', color: 'var(--text-primary)',
              lineHeight: 1.2, marginBottom: '24px' }}>{item.title}</h1>
            {item.description &&
              <div style={{ fontSize: '13px', lineHeight: 1.95, color: 'var(--text-secondary)',
                fontStyle: 'italic', marginBottom: '32px',
                borderLeft: '1px solid var(--border)', paddingLeft: '18px' }}>
                {item.description}
              </div>
            }

            {/* 資訊格 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
              padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-light)',
              borderRadius: '2px', marginBottom: '32px' }}>
              {[
                { label: '建議部位', value: item.body_part, color: 'var(--text-primary)' },
                { label: '建議尺寸', value: item.size_suggestion, color: 'var(--text-primary)' },
                { label: '報價區間', value: item.price_range, color: 'var(--gold)', italic: true },
                { label: '狀態', value: null, badge: true },
              ].map(({ label, value, color, italic, badge }) => (
                <div key={label}>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase',
                    color: 'var(--text-dim)', marginBottom: '5px' }}>{label}</div>
                  {badge
                    ? <StatusBadge status={item.status} />
                    : <div style={{ fontSize: '13px', color, fontStyle: italic ? 'italic' : 'normal' }}>{value}</div>
                  }
                </div>
              ))}
            </div>

            {avail
              ? <LineButton prefill={item.line_prefill} title={item.title} />
              : <p style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic', lineHeight: 1.9 }}>
                  這張認領圖已被認領。如有興趣，歡迎透過 LINE 詢問是否有類似設計。
                </p>
            }
          </div>
        </div>

        {/* 上一張 / 下一張 */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
          marginTop: '80px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
          {prev
            ? <Link to={`/flash/${encodeURIComponent(decoded)}/${prev.id}`}
                style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>← {prev.title}</Link>
            : <span />}
          {next
            ? <Link to={`/flash/${encodeURIComponent(decoded)}/${next.id}`}
                style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>{next.title} →</Link>
            : <span />}
        </div>
      </div>
    </PageWrapper>
  )
}
