import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { getThemes } from '../utils/sheets'
import { WIX_URL } from '../config'

const SLIDE_DURATION = 5000   // 每張停留時間 ms
const FADE_DURATION  = 1200   // crossfade ms

export default function Home() {
  const { works } = useWorks()
  const themes = getThemes(works)

  // 每個主題取第一張有圖的作品作為幻燈片
  const slides = themes
    .map(t => works.find(w => w.theme === t && w.image_url))
    .filter(Boolean)

  const [cur, setCur]       = useState(0)
  const [prev, setPrev]     = useState(null)
  const [fading, setFading] = useState(false)
  const [textIn, setTextIn] = useState(false)
  const timerRef = useRef(null)

  // 初始：文字淡入
  useEffect(() => {
    const t = setTimeout(() => setTextIn(true), 600)
    return () => clearTimeout(t)
  }, [])

  const goTo = (next) => {
    if (fading || next === cur) return
    setFading(true)
    setPrev(cur)
    setCur(next)
    setTimeout(() => { setPrev(null); setFading(false) }, FADE_DURATION)
  }

  // 自動輪播
  useEffect(() => {
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => {
      setCur(c => {
        const next = (c + 1) % slides.length
        setPrev(c)
        setFading(true)
        setTimeout(() => { setPrev(null); setFading(false) }, FADE_DURATION)
        return next
      })
    }, SLIDE_DURATION)
    return () => clearInterval(timerRef.current)
  }, [slides.length])

  const currentSlide = slides[cur]

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111', overflow: 'hidden' }}>

      {/* ── 幻燈片層 ── */}
      {slides.map((slide, i) => {
        const isActive = i === cur
        const isPrev   = i === prev
        if (!isActive && !isPrev) return null
        return (
          <div key={slide.id} style={{
            position: 'absolute', inset: 0,
            opacity: isActive ? 1 : 0,
            transition: `opacity ${FADE_DURATION}ms ease`,
            zIndex: isActive ? 2 : 1,
          }}>
            <img
              src={slide.image_url}
              alt=""
              style={{
                width: '100%', height: '100%',
                objectFit: 'contain',          // 直式照片自然呈現，兩側黑
                objectPosition: 'center',
                filter: 'brightness(0.68)',
                animation: isActive ? `kenBurns ${SLIDE_DURATION + FADE_DURATION}ms ease forwards` : 'none',
              }}
            />
            {/* 左右漸層（讓直式照片兩側更自然融入） */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to right, rgba(17,17,17,0.6) 0%, transparent 20%, transparent 80%, rgba(17,17,17,0.6) 100%)',
              pointerEvents: 'none',
            }} />
            {/* 上下漸層 */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(17,17,17,0.5) 0%, transparent 25%, transparent 65%, rgba(17,17,17,0.7) 100%)',
              pointerEvents: 'none',
            }} />
          </div>
        )
      })}

      {/* Ken Burns keyframe */}
      <style>{`
        @keyframes kenBurns {
          from { transform: scale(1.06); }
          to   { transform: scale(1.0);  }
        }
      `}</style>

      {/* ── UI 層 ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column' }}>

        {/* 頂部導覽 */}
        <nav style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '28px 40px',
          opacity: textIn ? 1 : 0, transition: 'opacity 0.8s ease',
        }}>
          <span style={{ fontSize: '11px', letterSpacing: '5px', color: 'rgba(255,255,255,0.85)' }}>
            S I A
          </span>
          <div style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
            <Link to="/works" style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
              作品
            </Link>
            <Link to="/flash" style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
              認領圖
            </Link>
            <a href={WIX_URL} target="_blank" rel="noreferrer"
              style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
                color: 'var(--warm)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--warm-hover)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--warm)'}>
              ↗ 主站
            </a>
          </div>
        </nav>

        {/* 中央文字 */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 40px',
          opacity: textIn ? 1 : 0,
          transform: textIn ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 1s ease 0.3s, transform 1s ease 0.3s',
        }}>
          <p style={{
            fontSize: '9px', letterSpacing: '6px', textTransform: 'uppercase',
            color: 'var(--ocean)', marginBottom: '24px', opacity: 0.9,
          }}>
            靈性刺青師 · Spiritual Tattoo Artist
          </p>
          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic',
            fontSize: 'clamp(32px, 5vw, 64px)', lineHeight: 1.2,
            color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.5px',
            marginBottom: '40px', textShadow: '0 2px 40px rgba(0,0,0,0.4)',
          }}>
            以針為筆，<br />在皮膚上刻下故事。
          </h1>
          <Link to="/works" style={{
            fontSize: '9px', letterSpacing: '5px', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '4px', transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)' }}>
            瀏覽作品
          </Link>
        </div>

        {/* 底部：幻燈片指示點 + 當前作品主題 */}
        <div style={{
          padding: '28px 40px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          opacity: textIn ? 1 : 0, transition: 'opacity 0.8s ease 0.6s',
        }}>
          {/* 主題名 */}
          <span style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: '13px', color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.5px',
          }}>
            {currentSlide?.theme || ''}
          </span>

          {/* 指示點 */}
          {slides.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === cur ? '24px' : '6px',
                    height: '2px', border: 'none', cursor: 'pointer',
                    background: i === cur ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
                    transition: 'all 0.4s ease', padding: 0, borderRadius: '1px',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
