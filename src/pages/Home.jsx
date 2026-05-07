import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { WIX_URL } from '../config'

const LOGO_URL = 'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/Sia_logo_%E6%96%87%E5%AD%97%EF%BC%88%E7%99%BD%EF%BC%89.png'

// 全部可用圖片，左右交替確保不同時顯示同一張
const ALL_IMGS = [
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_0138.jpg',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_0316.jpg',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_0784.jpg',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_0884.jpg',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_1252.jpg',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_1433.jpg',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_1478.jpg',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_1699.JPG',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_1727.JPG',
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/t23051264.jpg',
]

// 左邊用偶數 index，右邊用奇數 index → 永遠不同張
const LEFT_IMGS  = ALL_IMGS.filter((_, i) => i % 2 === 0)
const RIGHT_IMGS = ALL_IMGS.filter((_, i) => i % 2 === 1)

const BG = '#111'
const BREATH_CYCLE  = 4400
const SWAP_INTERVAL = 7000

function SideImage({ src, side, vertPos = 'center' }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), side === 'left' ? 500 : 1800)
    return () => clearTimeout(t)
  }, [side])

  const vertMap = { top: '20%', center: '50%', bottom: '80%' }
  const objPos  = `center ${vertMap[vertPos]}`

  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0, [side]: 0,
      width: '42%', overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transition: 'opacity 1.8s ease',
    }}>
      {/* 圖片 */}
      <img src={src} alt=""
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: objPos,
          filter: 'brightness(0.55) contrast(1.05)',
          animation: `breatheImg ${BREATH_CYCLE}ms ease-in-out infinite`,
          animationDelay: side === 'left' ? '0ms' : `${BREATH_CYCLE * 0.45}ms`,
        }}
      />

      {/* ── 四邊遮罩，用背景色蓋住照片邊界 ── */}
      {/* 上 */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'38%',
        background:`linear-gradient(to bottom, ${BG} 0%, transparent 100%)`,
        pointerEvents:'none' }} />
      {/* 下 */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'38%',
        background:`linear-gradient(to top, ${BG} 0%, transparent 100%)`,
        pointerEvents:'none' }} />
      {/* 外側（左圖的左邊 / 右圖的右邊） */}
      <div style={{ position:'absolute', top:0, bottom:0,
        [side]:0, width:'20%',
        background: side==='left'
          ? `linear-gradient(to right, ${BG}, transparent)`
          : `linear-gradient(to left,  ${BG}, transparent)`,
        pointerEvents:'none' }} />
      {/* 內側（左圖的右邊 / 右圖的左邊，融入中央） */}
      <div style={{ position:'absolute', top:0, bottom:0,
        [side==='left'?'right':'left']:0, width:'35%',
        background: side==='left'
          ? `linear-gradient(to left,  ${BG}, transparent)`
          : `linear-gradient(to right, ${BG}, transparent)`,
        pointerEvents:'none' }} />
    </div>
  )
}

export default function Home() {
  const { works } = useWorks()

  const [leftIdx,  setLeftIdx]  = useState(0)
  const [rightIdx, setRightIdx] = useState(0)
  const [leftKey,  setLeftKey]  = useState(0)
  const [rightKey, setRightKey] = useState(0)
  const [leftVert,  setLeftVert]  = useState('center')
  const [rightVert, setRightVert] = useState('bottom')
  const [textIn,   setTextIn]   = useState(false)

  const VERT = ['top', 'center', 'bottom']

  useEffect(() => {
    const t = setTimeout(() => setTextIn(true), 700)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (LEFT_IMGS.length < 2) return
    const t = setInterval(() => {
      setLeftIdx(i  => (i + 1) % LEFT_IMGS.length)
      setLeftVert(v => VERT[(VERT.indexOf(v) + 1) % VERT.length])
      setLeftKey(k  => k + 1)
    }, SWAP_INTERVAL)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (RIGHT_IMGS.length < 2) return
    const delay = setTimeout(() => {
      const t = setInterval(() => {
        setRightIdx(i  => (i + 1) % RIGHT_IMGS.length)
        setRightVert(v => VERT[(VERT.indexOf(v) + 2) % VERT.length])
        setRightKey(k  => k + 1)
      }, SWAP_INTERVAL)
      return () => clearInterval(t)
    }, SWAP_INTERVAL / 2)
    return () => clearTimeout(delay)
  }, [])

  return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}>

      <style>{`
        @keyframes breatheImg {
          0%,100% { transform:scale(1.0);   opacity:1;    }
          50%      { transform:scale(1.045); opacity:0.80; }
        }
      `}</style>

      {/* 側邊圖片 */}
      <SideImage key={`L${leftKey}`}  src={LEFT_IMGS[leftIdx]}   side="left"  vertPos={leftVert} />
      <SideImage key={`R${rightKey}`} src={RIGHT_IMGS[rightIdx]} side="right" vertPos={rightVert} />

      {/* UI 層 */}
      <div style={{ position:'absolute', inset:0, zIndex:10, display:'flex', flexDirection:'column' }}>

        {/* 頂部導覽 */}
        <nav style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'30px 44px',
          opacity: textIn ? 1 : 0, transition:'opacity 0.8s ease',
        }}>
          <span style={{ fontSize:'13px', letterSpacing:'4px', color:'rgba(255,255,255,0.85)', fontFamily:'var(--serif)' }}>
            SIA TATTOOIST
          </span>
          <div style={{ display:'flex', gap:'36px', alignItems:'center' }}>
            {[{label:'作品', to:'/works'}, {label:'認領圖', to:'/flash'}].map(({ label, to }) => (
              <Link key={label} to={to} style={{
                fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase',
                color:'rgba(255,255,255,0.5)', transition:'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.9)'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>
                {label}
              </Link>
            ))}
            <a href={WIX_URL} target="_blank" rel="noreferrer" style={{
              fontSize:'12px', letterSpacing:'2px',
              color:'var(--warm)', transition:'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color='var(--warm-hover)'}
              onMouseLeave={e => e.currentTarget.style.color='var(--warm)'}>
              預約請前往主站 ↗
            </a>
          </div>
        </nav>

        {/* 中央文字 */}
        <div style={{
          flex:1, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', textAlign:'center',
          padding:'0 36%',
          opacity: textIn ? 1 : 0,
          transform: textIn ? 'translateY(0)' : 'translateY(22px)',
          transition:'opacity 1s ease 0.5s, transform 1s ease 0.5s',
        }}>

          {/* Logo */}
          <img src={LOGO_URL} alt="SIA TATTOOIST"
            style={{ width:'100%', maxWidth:'240px', marginBottom:'28px',
              filter:'drop-shadow(0 2px 24px rgba(0,0,0,0.5))' }}
            onError={e => { e.currentTarget.style.display='none' }}
          />

          {/* Spiritual Tattoo Artist */}
          <p style={{
            fontSize:'13px', letterSpacing:'5px', textTransform:'uppercase',
            color:'var(--ocean)', marginBottom:'20px', opacity:0.95,
          }}>
            Spiritual Tattoo Artist
          </p>

          {/* 英文標語 */}
          <p style={{
            fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
            fontSize:'clamp(13px, 1.4vw, 18px)', lineHeight:1.8,
            color:'rgba(255,255,255,0.72)', marginBottom:'12px',
          }}>
            A tattoo,<br />composed from the voice of your soul.
          </p>

          {/* 中文標語 */}
          <p style={{
            fontSize:'11px', letterSpacing:'2.5px',
            color:'rgba(255,255,255,0.5)', marginBottom:'44px',
          }}>
            以刺青為你譜下靈魂深處的聲音
          </p>

          {/* 瀏覽作品按鈕 */}
          <Link to="/works" style={{
            display:'inline-block', padding:'13px 40px',
            border:'1px solid rgba(255,255,255,0.35)',
            fontSize:'11px', letterSpacing:'5px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.8)', transition:'all 0.3s ease',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background='rgba(255,255,255,0.08)'
              e.currentTarget.style.borderColor='rgba(255,255,255,0.65)'
              e.currentTarget.style.color='#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background='transparent'
              e.currentTarget.style.borderColor='rgba(255,255,255,0.35)'
              e.currentTarget.style.color='rgba(255,255,255,0.8)'
            }}>
            瀏覽作品
          </Link>
        </div>

        {/* 底部 */}
        <div style={{
          padding:'24px 44px', display:'flex', justifyContent:'flex-end',
          opacity: textIn ? 1 : 0, transition:'opacity 0.8s ease 0.9s',
        }}>
          <span style={{ fontSize:'11px', letterSpacing:'3px', color:'rgba(255,255,255,0.2)' }}>
            © SIA TATTOOIST
          </span>
        </div>
      </div>
    </div>
  )
}
