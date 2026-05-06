import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { getThemes } from '../utils/sheets'
import PageWrapper from '../components/PageWrapper'

// 每個位置的 grid span 模式（循環使用）
const SPANS = [
  { col: 'span 2', row: 'span 2' },  // 大圖
  { col: 'span 1', row: 'span 1' },
  { col: 'span 1', row: 'span 1' },
  { col: 'span 1', row: 'span 1' },
  { col: 'span 2', row: 'span 1' },
  { col: 'span 1', row: 'span 2' },
  { col: 'span 1', row: 'span 1' },
]

export default function WorksHome() {
  const { works, loading, error } = useWorks()
  const themes = getThemes(works)
  const [hovered, setHovered] = useState(null)

  if (loading) return (
    <PageWrapper>
      <p style={{ padding: '80px 40px', color: 'var(--text-dim)', fontStyle: 'italic' }}>載入中⋯</p>
    </PageWrapper>
  )
  if (error) return (
    <PageWrapper>
      <p style={{ padding: '80px 40px', color: 'var(--text-dim)' }}>讀取失敗：{error}</p>
    </PageWrapper>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#111', paddingTop: '64px' }}>
      {/* 標題列 */}
      <div style={{ padding: '48px 48px 32px' }}>
        <p style={{ fontSize: '9px', letterSpacing: '5px', textTransform: 'uppercase',
          color: 'var(--gold)', marginBottom: '10px' }}>作品集</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic',
          fontSize: 'clamp(26px, 3vw, 40px)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
          每一個故事，從一個念頭開始。
        </h1>
      </div>

      {/* 拼貼格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridAutoRows: '280px',
        gap: '6px',
        padding: '0 6px 6px',
      }}>
        {themes.map((theme, i) => {
          const themeWorks = works.filter(w => w.theme === theme)
          const img = themeWorks.find(w => w.image_url)?.image_url
          const span = SPANS[i % SPANS.length]
          const isHovered = hovered === theme

          return (
            <Link
              key={theme}
              to={`/works/${encodeURIComponent(theme)}`}
              style={{
                gridColumn: span.col,
                gridRow: span.row,
                position: 'relative',
                overflow: 'hidden',
                background: '#1a1a1a',
                display: 'block',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHovered(theme)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* 圖片 */}
              {img && (
                <img
                  src={img}
                  alt={theme}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1), filter 0.5s ease',
                    transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                    filter: isHovered ? 'brightness(0.5)' : 'brightness(0.72)',
                  }}
                  onError={e => e.currentTarget.style.display = 'none'}
                />
              )}

              {/* Hover overlay - 主題名 */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '24px',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.4s ease',
              }}>
                <p style={{
                  fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300,
                  fontSize: 'clamp(20px, 2.5vw, 32px)',
                  color: 'var(--text-primary)', textAlign: 'center',
                  marginBottom: '12px', lineHeight: 1.3,
                  transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'transform 0.4s ease',
                }}>
                  {theme}
                </p>
                <p style={{
                  fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
                  color: 'var(--gold)',
                  transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'transform 0.4s ease 0.05s',
                }}>
                  {themeWorks.length} 件作品
                </p>
              </div>

              {/* 靜態時的主題名（角落小字） */}
              <div style={{
                position: 'absolute', bottom: '18px', left: '20px',
                opacity: isHovered ? 0 : 0.7,
                transition: 'opacity 0.3s ease',
              }}>
                <span style={{
                  fontFamily: 'var(--serif)', fontStyle: 'italic',
                  fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'var(--text-primary)',
                }}>
                  {theme}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
