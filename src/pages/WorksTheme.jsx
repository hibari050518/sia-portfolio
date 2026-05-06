import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { getBodyParts } from '../utils/sheets'
import FilterBar from '../components/FilterBar'
import WorkCard from '../components/WorkCard'
import PageWrapper from '../components/PageWrapper'

export default function WorksTheme() {
  const { theme } = useParams()
  const decoded = decodeURIComponent(theme)
  const { works, loading, error } = useWorks()
  const [filter, setFilter] = useState(null)

  const themeWorks = works.filter(w => w.theme === decoded)
  const parts = getBodyParts(themeWorks)
  const filtered = filter
    ? themeWorks.filter(w => w.body_part.split(/[、,，]/).map(p => p.trim()).includes(filter))
    : themeWorks

  if (loading) return <PageWrapper><p style={{ padding: '80px 40px', color: 'var(--text-dim)', fontStyle: 'italic' }}>載入中⋯</p></PageWrapper>
  if (error)   return <PageWrapper><p style={{ padding: '80px 40px', color: 'var(--text-dim)' }}>讀取失敗：{error}</p></PageWrapper>

  return (
    <PageWrapper>
      <div style={{ padding: '48px 40px', maxWidth: '1100px', margin: '0 auto' }} className="page-pad">
        <Link to="/works" style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
          color: 'var(--text-dim)', marginBottom: '20px', display: 'inline-block' }}>← 回作品集</Link>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 46px)', color: 'var(--text-primary)',
          marginBottom: '36px', lineHeight: 1.2 }}>{decoded}</h1>
        {parts.length > 1 && <FilterBar parts={parts} active={filter} onChange={setFilter} />}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '14px' }}>
          {filtered.map(work => (
            <WorkCard key={work.id} work={work}
              to={`/works/${encodeURIComponent(decoded)}/${work.id}`} />
          ))}
        </div>
        {filtered.length === 0 && <p style={{ color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '24px' }}>這個部位目前沒有作品。</p>}
      </div>
    </PageWrapper>
  )
}
