import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { WIX_URL } from '../config'

const LOGO_URL = 'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/Sia_logo_%E6%96%87%E5%AD%97%EF%BC%88%E7%99%BD%EF%BC%89.png'

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

const LEFT_IMGS  = ALL_IMGS.filter((_, i) => i % 2 === 0)
const RIGHT_IMGS = ALL_IMGS.filter((_, i) => i % 2 === 1)

const BG = '#111'
const BREATH_CYCLE  = 4400
const SWAP_INTERVAL = 7000

// 粒子系統：bokeh 光點，以中心為核心往外分布
// x/y = 起始位置（vw/vh，相對螢幕中心）；sz = 直徑 px；dur = 飄升時長；d = delay
const PARTICLES = [
  { x: 50,  y: 72,  sz: 5,  dur: '7s',  d: '0s'   },
  { x: 44,  y: 68,  sz: 3,  dur: '8.5s',d: '1.2s' },
  { x: 56,  y: 74,  sz: 7,  dur: '6.5s',d: '0.5s' },
  { x: 38,  y: 65,  sz: 4,  dur: '9s',  d: '2.1s' },
  { x: 62,  y: 70,  sz: 3,  dur: '7.8s',d: '3.0s' },
  { x: 48,  y: 60,  sz: 6,  dur: '8s',  d: '1.7s' },
  { x: 54,  y: 62,  sz: 4,  dur: '7.2s',d: '0.8s' },
  { x: 40,  y: 75,  sz: 5,  dur: '9.5s',d: '2.5s' },
  { x: 60,  y: 58,  sz: 3,  dur: '6.8s',d: '1.4s' },
  { x: 52,  y: 78,  sz: 8,  dur: '8.2s',d: '3.5s' },
  { x: 34,  y: 60,  sz: 4,  dur: '7.5s',d: '0.3s' },
  { x: 66,  y: 65,  sz: 5,  dur: '8.8s',d: '2.8s' },
  { x: 46,  y: 55,  sz: 3,  dur: '7s',  d: '4.1s' },
  { x: 58,  y: 80,  sz: 6,  dur: '9.2s',d: '1.0s' },
  { x: 42,  y: 58,  sz: 4,  dur: '6.6s',d: '3.8s' },
  { x: 64,  y: 72,  sz: 3,  dur: '8.0s',d: '0.6s' },
  { x: 36,  y: 70,  sz: 5,  dur: '7.4s',d: '2.0s' },
  { x: 50,  y: 55,  sz: 7,  dur: '9.0s',d: '4.5s' },
  { x: 70,  y: 60,  sz: 3,  dur: '7.6s',d: '1.5s' },
  { x: 30,  y: 65,  sz: 4,  dur: '8.4s',d: '3.2s' },
  { x: 55,  y: 82,  sz: 5,  dur: '6.9s',d: '0.9s' },
  { x: 45,  y: 52,  sz: 3,  dur: '8.6s',d: '2.3s' },
  { x: 68,  y: 55,  sz: 6,  dur: '7.1s',d: '4.8s' },
  { x: 32,  y: 55,  sz: 4,  dur: '9.4s',d: '1.8s' },
  { x: 57,  y: 67,  sz: 3,  dur: '7.9s',d: '3.6s' },
  { x: 43,  y: 80,  sz: 5,  dur: '8.1s',d: '0.4s' },
  { x: 72,  y: 70,  sz: 4,  dur: '6.7s',d: '2.7s' },
  { x: 28,  y: 72,  sz: 3,  dur: '8.9s',d: '1.1s' },
]

// stagger 動態
function FadeUp({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.9s ease, transform 0.9s ease`,
    }}>
      {children}
    </div>
  )
}

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
      <img src={src} alt=""
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: objPos,
          filter: 'brightness(0.78)',
          animation: `breatheImg ${BREATH_CYCLE}ms ease-in-out infinite`,
          animationDelay: side === 'left' ? '0ms' : `${BREATH_CYCLE * 0.5}ms`,
        }}
      />
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'38%',
        background:`linear-gradient(to bottom, ${BG} 0%, transparent 100%)`, pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'38%',
        background:`linear-gradient(to top, ${BG} 0%, transparent 100%)`, pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:0, bottom:0, [side]:0, width:'20%',
        background: side==='left' ? `linear-gradient(to right, ${BG}, transparent)` : `linear-gradient(to left, ${BG}, transparent)`,
        pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:0, bottom:0, [side==='left'?'right':'left']:0, width:'35%',
        background: side==='left' ? `linear-gradient(to left, ${BG}, transparent)` : `linear-gradient(to right, ${BG}, transparent)`,
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
  const [navIn,    setNavIn]    = useState(false)

  const VERT = ['top', 'center', 'bottom']

  useEffect(() => {
    const t = setTimeout(() => setNavIn(true), 600)
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
        setRightVert(v => VERT[(VERT.indexOf(v) + 1) % VERT.length])
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
          50%      { transform:scale(1.045); opacity:0.85; }
        }
        @keyframes btnPulse {
          0%,100% { border-color: rgba(255,255,255,0.28); box-shadow: 0 0 0px rgba(255,255,255,0); }
          50%     { border-color: rgba(255,255,255,0.80); box-shadow: 0 0 18px rgba(255,255,255,0.12); }
        }
        @keyframes textGlow {
          0%,100% { text-shadow: 0 0 0px rgba(90,170,191,0); }
          50%     { text-shadow: 0 0 18px rgba(90,170,191,0.45); }
        }
        /* 粒子：從起點飄升，走 S 曲線像浪 */
        @keyframes particleDrift {
          0%   { transform: translate(0,   0vh)  scale(1);    opacity: 0;   }
          8%   { opacity: 0.85; }
          30%  { transform: translate(12px, -12vh) scale(0.92); opacity: 0.7; }
          55%  { transform: translate(-8px, -25vh) scale(0.80); opacity: 0.5; }
          80%  { transform: translate(6px,  -38vh) scale(0.65); opacity: 0.2; }
          100% { transform: translate(-4px, -50vh) scale(0.5);  opacity: 0;   }
        }
      `}</style>

      {/* 側邊圖片 */}
      <SideImage key={`L${leftKey}`}  src={LEFT_IMGS[leftIdx]}   side="left"  vertPos={leftVert} />
      <SideImage key={`R${rightKey}`} src={RIGHT_IMGS[rightIdx]} side="right" vertPos={rightVert} />

      {/* 粒子層 — 在圖片和 UI 之間 */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'fixed',
          left: `${p.x}vw`,
          top:  `${p.y}vh`,
          width:  `${p.sz}px`,
          height: `${p.sz}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 60%, transparent 100%)',
          boxShadow: `0 0 ${p.sz * 2}px ${p.sz}px rgba(255,255,255,0.25)`,
          animation: `particleDrift ${p.dur} ease-in-out infinite`,
          animationDelay: p.d,
          pointerEvents: 'none',
          zIndex: 9,
          filter: 'blur(0.5px)',
        }} />
      ))}

      {/* UI 層 */}
      <div style={{ position:'absolute', inset:0, zIndex:10, display:'flex', flexDirection:'column' }}>

        {/* 頂部導覽 */}
        <nav style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'30px 44px',
          opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease',
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
        }}>
          <FadeUp delay={800}>
            <img src={LOGO_URL} alt="SIA TATTOOIST"
              style={{ width:'100%', maxWidth:'240px', marginBottom:'28px',
                filter:'drop-shadow(0 2px 24px rgba(0,0,0,0.5))' }}
              onError={e => { e.currentTarget.style.display='none' }}
            />
          </FadeUp>

          <FadeUp delay={1100}>
            <p style={{
              fontSize:'13px', letterSpacing:'5px', textTransform:'uppercase',
              color:'var(--ocean)', marginBottom:'20px', opacity:0.95,
              animation:'textGlow 3.5s ease-in-out infinite',
              animationDelay:'2.5s',
            }}>
              Spiritual Tattoo Artist
            </p>
          </FadeUp>

          <FadeUp delay={1350}>
            <p style={{
              fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
              fontSize:'clamp(13px, 1.4vw, 18px)', lineHeight:1.8,
              color:'rgba(255,255,255,0.72)', marginBottom:'12px',
            }}>
              A tattoo,<br />composed from the voice of your soul.
            </p>
          </FadeUp>

          <FadeUp delay={1550}>
            <p style={{
              fontSize:'11px', letterSpacing:'2.5px',
              color:'rgba(255,255,255,0.5)', marginBottom:'44px',
            }}>
              以刺青為你譜下靈魂深處的聲音
            </p>
          </FadeUp>

          <FadeUp delay={1800}>
            <Link to="/works" style={{
              display:'inline-block', padding:'13px 40px',
              border:'1px solid rgba(255,255,255,0.28)',
              fontSize:'11px', letterSpacing:'5px', textTransform:'uppercase',
              color:'rgba(255,255,255,0.8)', transition:'background 0.3s ease, color 0.3s ease',
              animation: 'btnPulse 2.8s ease-in-out infinite',
              animationDelay: '2.2s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.animation = 'none'
                e.currentTarget.style.background='rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor='rgba(255,255,255,0.65)'
                e.currentTarget.style.color='#fff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.animation = 'btnPulse 2.8s ease-in-out infinite'
                e.currentTarget.style.background='transparent'
                e.currentTarget.style.borderColor='rgba(255,255,255,0.28)'
                e.currentTarget.style.color='rgba(255,255,255,0.8)'
              }}>
              瀏覽作品
            </Link>
          </FadeUp>
        </div>

        {/* 底部 */}
        <div style={{
          padding:'24px 44px', display:'flex', justifyContent:'flex-end',
          opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 1.2s',
        }}>
          <span style={{ fontSize:'11px', letterSpacing:'3px', color:'rgba(255,255,255,0.2)' }}>
            © SIA TATTOOIST
          </span>
        </div>
      </div>
    </div>
  )
}
