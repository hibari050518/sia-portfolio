import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { WIX_URL, LINE_ID } from '../config'

const LOGO_URL = 'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/Sia_logo_%E6%96%87%E5%AD%97%EF%BC%88%E7%99%BD%EF%BC%89.png'

const DEMO_IMGS = [
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_0138.jpg',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_0316.jpg',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_0784.jpg',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_0884.jpg',
]

const BREATH_CYCLE  = 4200
const SWAP_INTERVAL = 6500

// side: 'left' | 'right'
// vertPos: 'top' | 'center' | 'bottom' — 垂直錯位
function SideImage({ src, side, vertPos = 'center' }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const delay = side === 'left' ? 400 : 1600
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [side])

  const maskGradient = side === 'left'
    ? 'linear-gradient(to right, transparent 0%, black 22%, black 100%)'
    : 'linear-gradient(to left,  transparent 0%, black 22%, black 100%)'

  const vertMap = { top: '15%', center: '50%', bottom: '78%' }
  const objPos  = side === 'left'
    ? `right ${vertMap[vertPos]}`
    : `left ${vertMap[vertPos]}`

  return (
    <div style={{
      position: 'absolute',
      top: 0, bottom: 0,
      [side]: 0,
      width: '40%',
      overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transition: 'opacity 1.6s ease',
      WebkitMaskImage: maskGradient,
      maskImage: maskGradient,
    }}>
      <img
        src={src}
        alt=""
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: objPos,
          filter: 'brightness(0.58) contrast(1.06)',
          animation: `breatheImg ${BREATH_CYCLE}ms ease-in-out infinite`,
          animationDelay: side === 'left' ? '0ms' : `${BREATH_CYCLE * 0.4}ms`,
        }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(17,17,17,0.45) 0%, transparent 28%, transparent 68%, rgba(17,17,17,0.55) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

export default function Home() {
  const { works } = useWorks()

  const sheetImgs = works.filter(w => w.image_url).map(w => w.image_url)
  const allImgs   = sheetImgs.length >= 4 ? sheetImgs : [...sheetImgs, ...DEMO_IMGS].slice(0, Math.max(4, sheetImgs.length))

  const [leftIdx,  setLeftIdx]  = useState(0)
  const [rightIdx, setRightIdx] = useState(1)
  const [leftKey,  setLeftKey]  = useState(0)
  const [rightKey, setRightKey] = useState(0)
  // 垂直位置，每次換圖時輪換
  const [leftVert,  setLeftVert]  = useState('center')
  const [rightVert, setRightVert] = useState('top')
  const [textIn,   setTextIn]   = useState(false)

  const VERT_CYCLE = ['top', 'center', 'bottom']

  useEffect(() => {
    const t = setTimeout(() => setTextIn(true), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (allImgs.length < 2) return
    const t = setInterval(() => {
      setLeftIdx(i  => (i + 2) % allImgs.length)
      setLeftVert(v => VERT_CYCLE[(VERT_CYCLE.indexOf(v) + 1) % VERT_CYCLE.length])
      setLeftKey(k  => k + 1)
    }, SWAP_INTERVAL)
    return () => clearInterval(t)
  }, [allImgs.length])

  useEffect(() => {
    if (allImgs.length < 2) return
    const delay = setTimeout(() => {
      const t = setInterval(() => {
        setRightIdx(i  => (i + 2) % allImgs.length)
        setRightVert(v => VERT_CYCLE[(VERT_CYCLE.indexOf(v) + 2) % VERT_CYCLE.length])
        setRightKey(k  => k + 1)
      }, SWAP_INTERVAL)
      return () => clearInterval(t)
    }, SWAP_INTERVAL / 2)
    return () => clearTimeout(delay)
  }, [allImgs.length])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111', overflow: 'hidden' }}>

      <style>{`
        @keyframes breatheImg {
          0%, 100% { transform: scale(1.0);   opacity: 1; }
          50%       { transform: scale(1.04);  opacity: 0.82; }
        }
      `}</style>

      {/* ── 左右圖片 ── */}
      {allImgs.length > 0 && (
        <SideImage key={`L${leftKey}`}  src={allImgs[leftIdx  % allImgs.length]} side="left"  vertPos={leftVert} />
      )}
      {allImgs.length > 1 && (
        <SideImage key={`R${rightKey}`} src={allImgs[rightIdx % allImgs.length]} side="right" vertPos={rightVert} />
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
          <span style={{ fontSize: '14px', letterSpacing: '5px', color: 'rgba(255,255,255,0.85)' }}>
            S I A
          </span>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <Link to="/works" style={{
              fontSize: '14px', letterSpacing: '3px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
              作品
            </Link>
            <Link to="/flash" style={{
              fontSize: '14px', letterSpacing: '3px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
              認領圖
            </Link>
            <a href={WIX_URL} target="_blank" rel="noreferrer" style={{
              fontSize: '14px', letterSpacing: '2px',
              color: 'var(--warm)', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--warm-hover)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--warm)'}>
              預約請前往主站 ↗
            </a>
          </div>
        </nav>

        {/* 中央文字 */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          padding: '0 34%',
          opacity: textIn ? 1 : 0,
          transform: textIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 1s ease 0.4s, transform 1s ease 0.4s',
        }}>

          {/* Logo 圖片 */}
          <img
            src={LOGO_URL}
            alt="SIA TATTOOIST"
            style={{
              width: '100%', maxWidth: '280px',
              marginBottom: '32px',
              filter: 'drop-shadow(0 2px 20px rgba(0,0,0,0.4))',
            }}
            onError={e => {
              // fallback 文字
              e.currentTarget.style.display = 'none'
              document.getElementById('logo-fallback').style.display = 'block'
            }}
          />
          <h1 id="logo-fallback" style={{
            display: 'none',
            fontFamily: 'var(--serif)', fontWeight: 300,
            fontSize: 'clamp(24px, 3vw, 44px)',
            color: 'rgba(255,255,255,0.9)', letterSpacing: '4px',
            marginBottom: '32px',
          }}>
            SIA TATTOOIST
          </h1>

          <p style={{
            fontSize: '15px', letterSpacing: '6px', textTransform: 'uppercase',
            color: 'var(--ocean)', marginBottom: '18px',
          }}>
            Spiritual Tattoo Artist
          </p>

          <p style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300,
            fontSize: 'clamp(14px, 1.5vw, 20px)', lineHeight: 1.7,
            color: 'rgba(255,255,255,0.5)', marginBottom: '6px',
          }}>
            A tattoo,<br />composed from the voice of your soul.
          </p>

          <p style={{
            fontSize: '12px', letterSpacing: '2px',
            color: 'rgba(255,255,255,0.28)', marginBottom: '52px',
          }}>
            以刺青為你譜下靈魂深處的聲音
          </p>

          {/* 瀏覽作品按鈕 */}
          <Link
            to="/works"
            style={{
              display: 'inline-block',
              padding: '14px 44px',
              border: '1px solid rgba(255,255,255,0.3)',
              fontSize: '12px', letterSpacing: '5px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.75)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background    = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.65)'
              e.currentTarget.style.color         = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background    = 'transparent'
              e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.color         = 'rgba(255,255,255,0.75)'
            }}
          >
            瀏覽作品
          </Link>
        </div>

        {/* 底部 */}
        <div style={{
          padding: '28px 48px',
          display: 'flex', justifyContent: 'flex-end',
          opacity: textIn ? 1 : 0, transition: 'opacity 0.8s ease 0.8s',
        }}>
          <span style={{ fontSize: '11px', letterSpacing: '3px', color: 'rgba(255,255,255,0.18)' }}>
            © SIA TATTOOIST
          </span>
        </div>
      </div>
    </div>
  )
}
