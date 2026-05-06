import { useParams, Link } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import PageWrapper from '../components/PageWrapper'

export default function WorkDetail() {
  const { theme, id } = useParams()
  const decoded = decodeURIComponent(theme)
  const { works, loading } = useWorks()

  const themeWorks = works.filter(w => w.theme === decoded)
  const work = works.find(w => w.id === id)
  const idx = themeWorks.findIndex(w => w.id === id)
  const prev = idx > 0 ? themeWorks[idx - 1] : null
  const next = idx < themeWorks.length - 1 ? themeWorks[idx + 1] : null

  if (loading) return <PageWrapper><p style={{ padding: '80px 40px', color: 'var(--text-dim)', fontStyle: 'italic' }}>載入中⋯</p></PageWrapper>
  if (!work)   return <PageWrapper><p style={{ padding: '80px 40px', color: 'var(--text-dim)' }}>找不到這件作品。</p></PageWrapper>

  return (
    <PageWrapper>
      <div style={{ padding: '48px 40px', maxWidth: '1160px', margin: '0 auto' }} className="page-pad">
        <Link to={`/works/${encodeURIComponent(decoded)}`}
          style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
            color: 'var(--text-dim)', marginBottom: '32px', display: 'inline-block' }}>
          ← {decoded}
        </Link>

        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}>
          {/* 圖片 */}
          <div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)',
              borderRadius: '2px', overflow: 'hidden', aspectRatio: '3/4' }}>
              {work.image_url
                ? <img src={work.image_url} alt={work.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'var(--text-dim)', fontStyle: 'italic' }}>暫無圖片</div>
              }
            </div>
            {work.image_url_2 &&
              <div style={{ marginTop: '8px', borderRadius: '2px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                <img src={work.image_url_2} alt={`${work.title} 細節`} style={{ width: '100%', display: 'block' }} />
              </div>
            }
          </div>

          {/* 內容 */}
          <div style={{ paddingTop: '8px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: '12px' }}>{decoded}</p>
            <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic',
              fontSize: 'clamp(26px, 3vw, 40px)', color: 'var(--text-primary)',
              lineHeight: 1.2, marginBottom: '32px' }}>{work.title}</h1>
            <div style={{ fontSize: '14px', lineHeight: 2.0, color: 'var(--text-secondary)',
              fontStyle: 'italic', marginBottom: '40px',
              borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
              {work.story}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px',
              fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>
              {work.body_part && <span>部位 — {work.body_part}</span>}
              {work.size_cm  && <span>尺寸 — {work.size_cm}</span>}
              {work.date     && <span>完成 — {work.date}</span>}
            </div>
          </div>
        </div>

        {/* 上一件 / 下一件 */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
          marginTop: '80px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
          {prev
            ? <Link to={`/works/${encodeURIComponent(decoded)}/${prev.id}`}
                style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>← {prev.title}</Link>
            : <span />}
          {next
            ? <Link to={`/works/${encodeURIComponent(decoded)}/${next.id}`}
                style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>{next.title} →</Link>
            : <span />}
        </div>
      </div>
    </PageWrapper>
  )
}
