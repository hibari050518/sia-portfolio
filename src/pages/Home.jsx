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

// 海面光點：全螢幕分布，delay 根據 x 位置計算讓「浪」由左向右傳遞
// x/y = vw/vh 位置；sz = 直徑；waveDur = 單個粒子閃爍週期；waveDelay = 浪傳遞 delay
const WAVE_PERIOD = 4.5  // 每道浪的週期（秒）
const mkd = (x) => `${(x / 100 * WAVE_PERIOD).toFixed(2)}s`  // 讓浪從左往右傳

const PARTICLES = [
  // 左區
  { x:  5, y: 30, sz: 4, waveDur: '4.5s', d: mkd(5)  },
  { x:  8, y: 55, sz: 3, waveDur: '4.8s', d: mkd(8)  },
  { x: 12, y: 40, sz: 6, waveDur: '4.2s', d: mkd(12) },
  { x: 16, y: 68, sz: 3, waveDur: '5.0s', d: mkd(16) },
  { x: 20, y: 25, sz: 5, waveDur: '4.6s', d: mkd(20) },
  { x: 22, y: 50, sz: 4, waveDur: '4.3s', d: mkd(22) },
  { x: 25, y: 75, sz: 3, waveDur: '4.9s', d: mkd(25) },
  // 中左區
  { x: 30, y: 35, sz: 7, waveDur: '4.4s', d: mkd(30) },
  { x: 33, y: 62, sz: 4, waveDur: '5.1s', d: mkd(33) },
  { x: 36, y: 20, sz: 3, waveDur: '4.7s', d: mkd(36) },
  { x: 38, y: 72, sz: 5, waveDur: '4.2s', d: mkd(38) },
  { x: 40, y: 45, sz: 3, waveDur: '4.8s', d: mkd(40) },
  { x: 42, y: 58, sz: 6, waveDur: '4.5s', d: mkd(42) },
  // 中央
  { x: 45, y: 30, sz: 4, waveDur: '4.6s', d: mkd(45) },
  { x: 48, y: 65, sz: 3, waveDur: '5.2s', d: mkd(48) },
  { x: 50, y: 40, sz: 8, waveDur: '4.3s', d: mkd(50) },
  { x: 52, y: 75, sz: 4, waveDur: '4.9s', d: mkd(52) },
  { x: 55, y: 22, sz: 3, waveDur: '4.4s', d: mkd(55) },
  { x: 57, y: 55, sz: 5, waveDur: '4.7s', d: mkd(57) },
  // 中右區
  { x: 60, y: 38, sz: 4, waveDur: '4.5s', d: mkd(60) },
  { x: 63, y: 68, sz: 3, waveDur: '4.1s', d: mkd(63) },
  { x: 65, y: 48, sz: 6, waveDur: '5.0s', d: mkd(65) },
  { x: 68, y: 28, sz: 3, waveDur: '4.6s', d: mkd(68) },
  { x: 70, y: 72, sz: 5, waveDur: '4.3s', d: mkd(70) },
  { x: 73, y: 42, sz: 4, waveDur: '4.8s', d: mkd(73) },
  // 右區
  { x: 76, y: 58, sz: 3, waveDur: '5.1s', d: mkd(76) },
  { x: 80, y: 32, sz: 5, waveDur: '4.4s', d: mkd(80) },
  { x: 83, y: 65, sz: 4, waveDur: '4.7s', d: mkd(83) },
  { x: 86, y: 48, sz: 3, waveDur: '4.9s', d: mkd(86) },
  { x: 90, y: 25, sz: 6, waveDur: '4.2s', d: mkd(90) },
  { x: 93, y: 70, sz: 3, waveDur: '5.0s', d: mkd(93) },
  { x: 96, y: 42, sz: 4, waveDur: '4.6s', d: mkd(96) },
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
        /* 海面光點：在原地做橢圓晃動，浪峰時最亮（模擬海面光反射） */
        @keyframes oceanSparkle {
          0%          { transform: translate(0, 0)     scale(0.6); opacity: 0.05; }
          20%         { transform: translate(5px, -6px) scale(1.1); opacity: 0.9;  }
          40%         { transform: translate(10px, 0)  scale(0.8); opacity: 0.3;  }
          60%         { transform: translate(5px,  6px) scale(1.0); opacity: 0.6;  }
          80%         { transform: translate(0,    3px) scale(0.7); opacity: 0.15; }
          100%        { transform: translate(0, 0)     scale(0.6); opacity: 0.05; }
        }
      `}</style>

      {/* 側邊圖片 */}
      <SideImage key={`L${leftKey}`}  src={LEFT_IMGS[leftIdx]}   side="left"  vertPos={leftVert} />
      <SideImage key={`R${rightKey}`} src={RIGHT_IMGS[rightIdx]} side="right" vertPos={rightVert} />

      {/* 海面光點層 */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'fixed',
          left: `${p.x}vw`,
          top:  `${p.y}vh`,
          width:  `${p.sz}px`,
          height: `${p.sz}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(200,230,255,0.5) 50%, transparent 100%)',
          boxShadow: `0 0 ${p.sz * 3}px ${p.sz * 1.5}px rgba(180,220,255,0.2)`,
          animation: `oceanSparkle ${p.waveDur} ease-in-out infinite`,
          animationDelay: p.d,
          pointerEvents: 'none',
          zIndex: 9,
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
