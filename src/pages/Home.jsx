import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { WIX_URL, LINE_ID } from '../config'

// 示範圖片（之後從 sheet 抓，或手動補充）
const DEMO_IMGS = [
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_0138.jpg',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_0316.jpg',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_0784.jpg',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_0884.jpg',
]

// 每次呼吸週期（ms）
const BREATH_CYCLE = 4000
// 左右換圖間隔（左右錯開 2 秒）
const SWAP_INTERVAL = 6000

function SideImage({ src, side }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 進場延遲：左側先出現
    const delay = side === 'left' ? 300 : 1400
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [side])

  // 邊緣漸層方向
  const maskGradient = side === 'left'
    ? 'linear-gradient(to right, transparent 0%, black 18%, black 100%)'
    : 'linear-gradient(to left, transparent 0%, black 18%, black 100%)'

  return (
    <div style={{
      position: 'absolute',
      top: 0, bottom: 0,
      [side]: 0,
      width: '38%',
      overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transition: 'opacity 1.4s ease',
      WebkitMaskImage: maskGradient,
      maskImage: maskGradient,
    }}>
      <img
        src={src}
        alt=""
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: side === 'left' ? 'right center' : 'left center',
          filter: 'brightness(0.6) contrast(1.05)',
          animation: `breatheImg ${BREATH_CYCLE}ms ease-in-out infinite`,
          animationDelay: side === 'left' ? '0ms' : `${BREATH_CYCLE / 2}ms`,
        }}
      />
      {/* 暗角補強 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: side === 'left'
          ? 'linear-gradient(to bottom, rgba(17,17,17,0.4) 0%, transparent 30%, transparent 70%, rgba(17,17,17,0.5) 100%)'
          : 'linear-gradient(to bottom, rgba(17,17,17,0.4) 0%, transparent 30%, transparent 70%, rgba(17,17,17,0.5) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

export default function Home() {
  const { works } = useWorks()

  // 從 sheet 取圖，不夠就補 demo 圖
  const sheetImgs = works.filter(w => w.image_url).map(w => w.image_url)
  const allImgs = sheetImgs.length >= 4 ? sheetImgs : [...sheetImgs, ...DEMO_IMGS].slice(0, Math.max(4, sheetImgs.length))

  // 左右各自的圖片 index，錯開
  const [leftIdx,  setLeftIdx]  = useState(0)
  const [rightIdx, setRightIdx] = useState(1)
  const [leftKey,  setLeftKey]  = useState(0)
  const [rightKey, setRightKey] = useState(0)
  const [textIn,   setTextIn]   = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setTextIn(true), 500)
    return () => clearTimeout(t)
  }, [])

  // 左側換圖
  useEffect(() => {
    if (allImgs.length < 2) return
    const t = setInterval(() => {
      setLeftIdx(i => (i + 2) % allImgs.length)
      setLeftKey(k => k + 1)
    }, SWAP_INTERVAL)
    return () => clearInterval(t)
  }, [allImgs.length])

  // 右側換圖（延遲 2 秒）
  useEffect(() => {
    if (allImgs.length < 2) return
    const delay = setTimeout(() => {
      const t = setInterval(() => {
        setRightIdx(i => (i + 2) % allImgs.length)
        setRightKey(k => k + 1)
      }, SWAP_INTERVAL)
      return () => clearInterval(t)
    }, SWAP_INTERVAL / 2)
    return () => clearTimeout(delay)
  }, [allImgs.length])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111', overflow: 'hidden' }}>

      <style>{`
        @keyframes breatheImg {
          0%, 100% { transform: scale(1.0);   opacity: 1;    }
          50%       { transform: scale(1.035); opacity: 0.85; }
        }
      `}</style>

      {/* ── 左右圖片 ── */}
      {allImgs.length > 0 && (
        <SideImage key={`L${leftKey}`}  src={allImgs[leftIdx  % allImgs.length]} side="left"  />
      )}
      {allImgs.length > 1 && (
        <SideImage key={`R${rightKey}`} src={allImgs[rightIdx % allImgs.length]} side="right" />
      )}

      {/* ── 中央 UI ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* 頂部導覽 */}
        <nav style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '32px 48px',
          opacity: textIn ? 1 : 0, transition: 'opacity 0.8s ease',
        }}>
          <span style={{ fontSize: '13px', letterSpacing: '5px', color: 'rgba(255,255,255,0.85)' }}>
            S I A
          </span>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            {[
              { label: '作品', to: '/works', isLink: true },
              { label: '認領圖', to: '/flash', isLink: true },
            ].map(({ label, to }) => (
              <Link key={label} to={to} style={{
                fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                {label}
              </Link>
            ))}
            <a href={WIX_URL} target="_blank" rel="noreferrer" style={{
              fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase',
              color: 'var(--warm)', transition: 'color 0.2s',
            }}
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
          textAlign: 'center',
          padding: '0 32%',   // 保留兩側給圖片
          opacity: textIn ? 1 : 0,
          transform: textIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 1s ease 0.4s, transform 1s ease 0.4s',
        }}>

          <p style={{
            fontSize: '11px', letterSpacing: '6px', textTransform: 'uppercase',
            color: 'var(--ocean)', marginBottom: '28px',
          }}>
            Spiritual Tattoo Artist
          </p>

          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 300,
            fontSize: 'clamp(28px, 3.5vw, 52px)', lineHeight: 1.15,
            color: 'rgba(255,255,255,0.92)', letterSpacing: '0.5px',
            marginBottom: '8px',
          }}>
            SIA TATTOOIST
          </h1>

          <p style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300,
            fontSize: 'clamp(14px, 1.6vw, 22px)', lineHeight: 1.6,
            color: 'rgba(255,255,255,0.55)', marginBottom: '6px',
          }}>
            A tattoo,<br />composed from the voice of your soul.
          </p>

          <p style={{
            fontSize: '12px', letterSpacing: '2px',
            color: 'rgba(255,255,255,0.35)', marginBottom: '48px',
          }}>
            以刺青為你譜下靈魂深處的聲音
          </p>

          {/* Book 按鈕 */}
          <a
            href={`https://line.me/R/ti/p/${LINE_ID}`}
            target="_blank" rel="noreferrer"
            style={{
              display: 'inline-block',
              padding: '14px 40px',
              border: '1px solid rgba(255,255,255,0.35)',
              fontSize: '11px', letterSpacing: '5px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.8)',
              transition: 'all 0.3s ease',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
            }}
          >
            Book
          </a>
        </div>

        {/* 底部 */}
        <div style={{
          padding: '28px 48px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          opacity: textIn ? 1 : 0, transition: 'opacity 0.8s ease 0.8s',
        }}>
          <Link to="/works" style={{
            fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.15)',
            paddingBottom: '3px', transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)' }}>
            瀏覽作品 →
          </Link>
          <span style={{ fontSize: '10px', letterSpacing: '3px', color: 'rgba(255,255,255,0.2)' }}>
            © SIA TATTOOIST
          </span>
        </div>
      </div>
    </div>
  )
}
