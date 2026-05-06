import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { getThemes } from '../utils/sheets'
import PageWrapper from '../components/PageWrapper'

export default function WorksHome() {
  const { works, loading, error } = useWorks()
  const themes = getThemes(works)

  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [activeTheme, setActiveTheme] = useState(null)
  const containerRef = useRef(null)

  const onMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setCursor({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

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
    <PageWrapper>
      <div
        ref={containerRef}
        onMouseMove={onMouseMove}
        style={{ padding: '64px 64px 80px', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}
        className="page-pad"
      >
        {/* 標題 */}
        <div style={{ marginBottom: '72px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '5px', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: '16px' }}>作品集</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic',
            fontSize: 'clamp(28px, 3.5vw, 44px)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            每一個故事，<br />都從一個念頭開始。
          </h1>
        </div>

        {/* 主題列表 */}
        <div style={{ borderTop: '1px solid var(--border-light)' }}>
          {themes.map((theme, i) => {
            const themeWorks = works.filter(w => w.theme === theme)
            const previewImg = themeWorks.find(w => w.image_url)?.image_url
            const isActive = activeTheme === theme

            return (
              <Link
                key={theme}
                to={`/works/${encodeURIComponent(theme)}`}
                style={{
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                  padding: '28px 0', borderBottom: '1px solid var(--border-light)',
                  textDecoration: 'none', transition: 'padding 0.35s ease',
                  paddingLeft: isActive ? '18px' : '0',
                }}
                onMouseEnter={() => setActiveTheme(theme)}
                onMouseLeave={() => setActiveTheme(null)}
              >
                {/* 左：序號 + 主題名 */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '28px' }}>
                  <span style={{
                    fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px',
                    minWidth: '28px', transition: 'color 0.3s',
                    color: isActive ? 'var(--ocean)' : 'var(--text-dim)',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontFamily: 'var(--serif)', fontStyle: 'italic',
                    fontSize: 'clamp(22px, 2.8vw, 36px)',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'color 0.3s, font-size 0.3s',
                    fontSize: isActive ? 'clamp(24px, 3vw, 40px)' : 'clamp(22px, 2.8vw, 36px)',
                  }}>
                    {theme}
                  </span>
                </div>

                {/* 右：件數 */}
                <span style={{
                  fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
                  color: isActive ? 'var(--gold)' : 'var(--text-dim)',
                  transition: 'color 0.3s',
                }}>
                  {themeWorks.length} 件
                </span>
              </Link>
            )
          })}
        </div>

        {/* 游標跟隨圖片 */}
        {themes.map(theme => {
          const previewImg = works.find(w => w.theme === theme && w.image_url)?.image_url
          if (!previewImg) return null
          const isActive = activeTheme === theme
          return (
            <div
              key={`img-${theme}`}
              style={{
                position: 'absolute',
                left: cursor.x + 28,
                top: cursor.y - 100,
                width: '220px',
                height: '280px',
                pointerEvents: 'none',
                zIndex: 50,
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(12px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
              }}
            >
              <img
                src={previewImg}
                alt={theme}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                }}
                onError={e => e.currentTarget.style.display = 'none'}
              />
            </div>
          )
        })}

      </div>
    </PageWrapper>
  )
}
