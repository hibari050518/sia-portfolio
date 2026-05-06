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
      background: '#111', color: 'var(--text-dim)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
      載入中⋯
    </div>
  )
  if (!current) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#111', color: 'var(--text-dim)', fontFamily: 'var(--serif)' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '16px' }}>暫無作品</p>
        <Link to="/works" style={{ color: 'var(--ocean)', fontSize: '12px' }}>← 回作品集</Link>
      </div>
    </div>
  )

  return (
    <div style={{ height: '100vh', background: '#111', display: 'flex', overflow: 'hidden', position: 'relative' }}>

      {/* ── 圖片全螢幕 ── */}
      <div style={{
        flex: storyOpen ? '0 0 58%' : '0 0 100%',
        transition: 'flex 0.55s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* 背景圖 */}
        {current?.image_url && (
          <img
            key={current.id}
            src={current.image_url}
            alt={current.title || decoded}
            onLoad={() => setImgLoaded(true)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.7s ease',
              filter: 'brightness(0.7)',
            }}
          />
        )}

        {/* 四周漸層遮罩（讓文字更好讀） */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(17,17,17,0.55) 100%)',
          pointerEvents: 'none',
        }} />

        {/* ── 頂部導覽 ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          padding: '28px 36px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Link to="/works" style={{
            fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
            ← 作品集
          </Link>
          <Link to="/" style={{ fontSize: '10px', letterSpacing: '5px', color: 'rgba(255,255,255,0.7)' }}>
            S I A
          </Link>
        </div>

        {/* ── 標題：正中央 ── */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', textAlign: 'center', padding: '0 60px',
        }}>
          <p style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300,
            fontSize: 'clamp(28px, 4vw, 54px)',
            color: 'rgba(255,255,255,0.95)', lineHeight: 1.2,
            textShadow: '0 2px 40px rgba(0,0,0,0.5)',
            letterSpacing: '-0.5px',
          }}>
            {current?.title || decoded}
          </p>
          {current?.body_part && (
            <p style={{
              fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
              color: 'var(--gold)', marginTop: '16px',
            }}>
              {current.body_part}
            </p>
          )}

          {/* 故事入口提示 */}
          {current?.story && !storyOpen && (
            <button
              onClick={() => setStoryOpen(true)}
              style={{
                marginTop: '36px', pointerEvents: 'all',
                fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none',
                cursor: 'pointer', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
              閱讀故事 →
            </button>
          )}
        </div>

        {/* ── 左右切換（+號風格）── */}
        {total > 1 && (
          <>
            <button onClick={prev} style={{
              position: 'absolute', left: '32px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '28px', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none',
              cursor: 'pointer', transition: 'color 0.2s', lineHeight: 1, padding: '12px',
              fontWeight: 300,
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
              +
            </button>
            <button onClick={next} style={{
              position: 'absolute', right: '32px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '28px', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none',
              cursor: 'pointer', transition: 'color 0.2s', lineHeight: 1, padding: '12px',
              fontWeight: 300,
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
              +
            </button>
          </>
        )}

        {/* ── 底部左：計數 + 主題 ── */}
        <div style={{
          position: 'absolute', bottom: '32px', left: '36px',
          display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          <span style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--gold)', textTransform: 'uppercase' }}>
            {decoded}
          </span>
          <span style={{ fontSize: '11px', letterSpacing: '2px', color: 'rgba(255,255,255,0.35)' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{String(index + 1).padStart(2, '0')}</span>
            {' — '}
            {String(total).padStart(2, '0')}
          </span>
        </div>

        {/* ── 底部右：縮圖列 ── */}
        {total > 1 && (
          <div style={{
            position: 'absolute', bottom: '28px', right: '32px',
            display: 'flex', gap: '5px', alignItems: 'center',
          }}>
            {themeWorks.map((w, i) => (
              <button
                key={w.id}
                onClick={() => { setIndex(i); setImgLoaded(false); setStoryOpen(false) }}
                style={{
                  width: i === index ? '40px' : '32px',
                  height: i === index ? '52px' : '40px',
                  padding: 0, border: 'none', cursor: 'pointer',
                  overflow: 'hidden', flexShrink: 0,
                  opacity: i === index ? 1 : 0.4,
                  outline: i === index ? '1px solid var(--ocean)' : 'none',
                  outlineOffset: '2px',
                  transition: 'all 0.3s ease',
                  background: '#222',
                }}
                onMouseEnter={e => { if (i !== index) e.currentTarget.style.opacity = '0.75' }}
                onMouseLeave={e => { if (i !== index) e.currentTarget.style.opacity = '0.4' }}
              >
                {w.image_url && (
                  <img src={w.image_url} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 故事抽屜（右側滑入）── */}
      <div style={{
        flex: storyOpen ? '0 0 42%' : '0 0 0%',
        overflow: 'hidden',
        transition: 'flex 0.55s cubic-bezier(0.4,0,0.2,1)',
        background: '#161616',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '80px 48px 48px', overflowY: 'auto', flex: 1 }}>
          <button onClick={() => setStoryOpen(false)} style={{
            fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', marginBottom: '48px', display: 'block',
            cursor: 'pointer', background: 'none', border: 'none', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
            ✕ 關閉
          </button>

          <p style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
            color: 'var(--ocean)', marginBottom: '14px' }}>
            {decoded}
          </p>
          <h2 style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300,
            fontSize: 'clamp(20px, 2vw, 28px)', color: 'var(--text-primary)',
            marginBottom: '36px', lineHeight: 1.3,
          }}>
            {current?.title}
          </h2>

          <p style={{
            fontSize: '13px', lineHeight: 2.1, color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.3px', whiteSpace: 'pre-line',
          }}>
            {current?.story}
          </p>

          {(current?.size_cm || current?.body_part || current?.date) && (
            <div style={{
              marginTop: '52px', paddingTop: '24px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', gap: '36px', flexWrap: 'wrap',
            }}>
              {[
                { label: '部位', value: current?.body_part },
                { label: '尺寸', value: current?.size_cm },
                { label: '日期', value: current?.date },
              ].filter(f => f.value).map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: '9px', letterSpacing: '3px', color: 'rgba(255,255,255,0.25)',
                    textTransform: 'uppercase', marginBottom: '6px' }}>{f.label}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{f.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
