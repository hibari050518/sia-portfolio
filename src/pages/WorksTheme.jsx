import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'

export default function WorksTheme() {
  const { theme } = useParams()
  const decoded = decodeURIComponent(theme)
  const { works, loading, error } = useWorks()

  const themeWorks = works.filter(w => w.theme === decoded && w.visible !== 'FALSE')
  const [index, setIndex] = useState(0)
  const [storyOpen, setStoryOpen] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const current = themeWorks[index]
  const total = themeWorks.length

  const prev = useCallback(() => {
    setImgLoaded(false)
    setIndex(i => (i - 1 + total) % total)
    setStoryOpen(false)
  }, [total])

  const next = useCallback(() => {
    setImgLoaded(false)
    setIndex(i => (i + 1) % total)
    setStoryOpen(false)
  }, [total])

  // 鍵盤左右
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setStoryOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', color: 'var(--text-dim)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
      載入中⋯
    </div>
  )
  if (error || !current) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', color: 'var(--text-dim)', fontFamily: 'var(--serif)' }}>
      <div>
        <p>暫無作品</p>
        <Link to="/works" style={{ color: 'var(--ocean)', fontSize: '12px' }}>← 回作品集</Link>
      </div>
    </div>
  )

  return (
    <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative' }}>

      {/* ── 頂部導覽 ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(14,26,30,0.85) 0%, transparent 100%)',
      }}>
        <Link to="/works" style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
          color: 'var(--text-secondary)', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          ← 作品集
        </Link>
        <Link to="/" style={{ fontSize: '11px', letterSpacing: '5px', color: 'var(--text-primary)' }}>
          S I A
        </Link>
      </div>

      {/* ── 主體：圖片 + 故事抽屜 ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* 圖片區 */}
        <div style={{
          flex: storyOpen ? '0 0 58%' : '0 0 100%',
          transition: 'flex 0.5s cubic-bezier(0.4,0,0.2,1)',
          position: 'relative', overflow: 'hidden', cursor: 'pointer',
        }} onClick={() => { if (!storyOpen && current?.story) setStoryOpen(true) }}>
          {current?.image_url && (
            <img
              key={current.id}
              src={current.image_url}
              alt={current.title || decoded}
              onLoad={() => setImgLoaded(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                opacity: imgLoaded ? 1 : 0,
                transition: 'opacity 0.6s ease',
                filter: 'brightness(0.82)',
              }}
            />
          )}

          {/* 底部漸層 */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
            background: 'linear-gradient(to top, rgba(14,26,30,0.92) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* 作品標題（圖片左下角） */}
          <div style={{
            position: 'absolute', bottom: '88px', left: '40px',
            fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 'clamp(20px, 2.5vw, 32px)', color: 'var(--text-primary)',
            lineHeight: 1.2, pointerEvents: 'none',
          }}>
            {current?.title || ''}
            {current?.body_part && (
              <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase',
                color: 'var(--gold)', marginTop: '8px', fontStyle: 'normal' }}>
                {current.body_part}
              </div>
            )}
          </div>

          {/* 左右切換箭頭 */}
          {total > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev() }} style={{
                position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(14,26,30,0.5)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', width: '44px', height: '44px',
                borderRadius: '50%', fontSize: '16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', backdropFilter: 'blur(8px)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ocean)'; e.currentTarget.style.color = 'var(--ocean)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                ‹
              </button>
              <button onClick={e => { e.stopPropagation(); next() }} style={{
                position: 'absolute', right: storyOpen ? '24px' : '24px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(14,26,30,0.5)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', width: '44px', height: '44px',
                borderRadius: '50%', fontSize: '16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', backdropFilter: 'blur(8px)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ocean)'; e.currentTarget.style.color = 'var(--ocean)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                ›
              </button>
            </>
          )}

          {/* 故事提示（沒開啟時） */}
          {!storyOpen && current?.story && (
            <div style={{
              position: 'absolute', bottom: '88px', right: '32px',
              fontSize: '9px', letterSpacing: '3px', color: 'var(--text-dim)',
              textTransform: 'uppercase', pointerEvents: 'none',
            }}>
              點擊閱讀故事
            </div>
          )}
        </div>

        {/* 故事抽屜 */}
        <div style={{
          flex: storyOpen ? '0 0 42%' : '0 0 0%',
          overflow: 'hidden',
          transition: 'flex 0.5s cubic-bezier(0.4,0,0.2,1)',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '80px 44px 44px', overflowY: 'auto', flex: 1 }}>
            <button onClick={() => setStoryOpen(false)} style={{
              fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
              color: 'var(--text-dim)', marginBottom: '40px', display: 'block',
              cursor: 'pointer', background: 'none', border: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
              ✕ 關閉
            </button>

            <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
              color: 'var(--ocean)', marginBottom: '16px' }}>
              {decoded}
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300,
              fontSize: 'clamp(22px, 2vw, 30px)', color: 'var(--text-primary)',
              marginBottom: '32px', lineHeight: 1.3 }}>
              {current?.title}
            </h2>

            <p style={{ fontSize: '13px', lineHeight: 2.0, color: 'var(--text-secondary)',
              letterSpacing: '0.3px', whiteSpace: 'pre-line' }}>
              {current?.story}
            </p>

            {(current?.size_cm || current?.date) && (
              <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)',
                display: 'flex', gap: '32px' }}>
                {current?.size_cm && (
                  <div>
                    <div style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--text-dim)',
                      textTransform: 'uppercase', marginBottom: '6px' }}>尺寸</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{current.size_cm}</div>
                  </div>
                )}
                {current?.body_part && (
                  <div>
                    <div style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--text-dim)',
                      textTransform: 'uppercase', marginBottom: '6px' }}>部位</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{current.body_part}</div>
                  </div>
                )}
                {current?.date && (
                  <div>
                    <div style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--text-dim)',
                      textTransform: 'uppercase', marginBottom: '6px' }}>日期</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{current.date}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 底部：主題名 + 縮圖列 + 頁碼 ── */}
      <div style={{
        height: '72px', background: 'rgba(14,26,30,0.95)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border-light)',
        display: 'flex', alignItems: 'center', padding: '0 32px', gap: '24px',
        flexShrink: 0,
      }}>
        {/* 主題名 */}
        <div style={{
          fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
          color: 'var(--gold)', whiteSpace: 'nowrap', minWidth: '80px',
        }}>
          {decoded}
        </div>

        {/* 分隔線 */}
        <div style={{ width: '1px', height: '28px', background: 'var(--border)', flexShrink: 0 }} />

        {/* 縮圖列 */}
        <div style={{ display: 'flex', gap: '8px', flex: 1, overflowX: 'auto',
          scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {themeWorks.map((w, i) => (
            <button
              key={w.id}
              onClick={() => { setIndex(i); setImgLoaded(false); setStoryOpen(false) }}
              style={{
                width: '44px', height: '44px', flexShrink: 0, padding: 0,
                border: i === index ? '2px solid var(--ocean)' : '2px solid transparent',
                borderRadius: '2px', overflow: 'hidden', cursor: 'pointer',
                background: 'var(--bg-hover)', transition: 'border-color 0.2s',
                opacity: i === index ? 1 : 0.55,
              }}
              onMouseEnter={e => { if (i !== index) e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={e => { if (i !== index) e.currentTarget.style.opacity = '0.55' }}
            >
              {w.image_url && (
                <img src={w.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </button>
          ))}
        </div>

        {/* 分隔線 */}
        <div style={{ width: '1px', height: '28px', background: 'var(--border)', flexShrink: 0 }} />

        {/* 頁碼 */}
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap', letterSpacing: '2px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{String(index + 1).padStart(2, '0')}</span>
          <span style={{ margin: '0 6px' }}>—</span>
          {String(total).padStart(2, '0')}
        </div>
      </div>

    </div>
  )
}
