import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useFlash } from '../hooks/useSheets'
import { getBodyParts } from '../utils/sheets'
import FilterBar from '../components/FilterBar'
import FlashCard from '../components/FlashCard'
import PageWrapper from '../components/PageWrapper'

export default function FlashSeries() {
  const { series } = useParams()
  const decoded = decodeURIComponent(series)
  const { flash, loading, error } = useFlash()
  const [filter, setFilter] = useState(null)
  const [availOnly, setAvailOnly] = useState(false)

  const seriesItems = flash.filter(f => f.series === decoded)
  const parts = getBodyParts(seriesItems)
  let filtered = filter
    ? seriesItems.filter(f => f.body_part.split(/[、,，]/).map(p => p.trim()).includes(filter))
    : seriesItems
  if (availOnly) filtered = filtered.filter(f => f.status === '可認領')

  if (loading) return <PageWrapper><p style={{ padding: '80px 40px', color: 'var(--text-dim)', fontStyle: 'italic' }}>載入中⋯</p></PageWrapper>
  if (error)   return <PageWrapper><p style={{ padding: '80px 40px', color: 'var(--text-dim)' }}>讀取失敗：{error}</p></PageWrapper>

  return (
    <PageWrapper>
      <div style={{ padding: '48px 40px', maxWidth: '1100px', margin: '0 auto' }} className="page-pad">
        <Link to="/flash" style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
          color: 'var(--text-dim)', marginBottom: '20px', display: 'inline-block' }}>← 回認領圖</Link>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 46px)', color: 'var(--text-primary)',
          marginBottom: '36px', lineHeight: 1.2 }}>{decoded}</h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          {parts.length > 1 && <FilterBar parts={parts} active={filter} onChange={setFilter} />}
          <button
            onClick={() => setAvailOnly(!availOnly)}
            style={{
              padding: '6px 14px', borderRadius: '2px', cursor: 'pointer', transition: 'all 0.2s',
              border: `1px solid ${availOnly ? 'var(--ocean)' : 'var(--border)'}`,
              background: availOnly ? 'rgba(74,143,160,0.1)' : 'transparent',
              color: availOnly ? 'var(--ocean)' : 'var(--text-dim)',
              fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
              fontFamily: 'var(--serif)', flexShrink: 0,
            }}>
            僅看可認領
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '14px' }}>
          {filtered.map(item => (
            <FlashCard key={item.id} item={item}
              to={`/flash/${encodeURIComponent(decoded)}/${item.id}`} />
          ))}
        </div>
        {filtered.length === 0 && <p style={{ color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '24px' }}>目前沒有符合條件的認領圖。</p>}
      </div>
    </PageWrapper>
  )
}
