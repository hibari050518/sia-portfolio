import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { WIX_URL } from '../config'
import { useLang, t } from '../context/LangContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { MobileTabBar } from '../components/MobileNav'

function LangSwitcher() {
  const { lang, setLang } = useLang()
  return (
    <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
      {[['zh','中'],['en','EN'],['ko','한']].map(([l, label]) => (
        <div key={l} onClick={() => setLang(l)}
          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', cursor:'pointer' }}>
          <span style={{ fontSize:'12px', letterSpacing:'2px',
            color: lang===l ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.32)',
            transition:'color 0.2s' }}>{label}</span>
          <div style={{ width:'4px', height:'4px', borderRadius:'50%',
            background: lang===l ? 'rgba(255,255,255,0.7)' : 'transparent',
            transition:'background 0.2s' }} />
        </div>
      ))}
    </div>
  )
}

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
  'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/f23051264.jpg',
]

const LEFT_IMGS  = ALL_IMGS.filter((_, i) => i % 2 === 0)
const RIGHT_IMGS = ALL_IMGS.filter((_, i) => i % 2 === 1)

const BG = '#111'
const BREATH_CYCLE  = 4400
const SWAP_INTERVAL = 4000

// 海面透視：從文字中心以下鋪開，越往下越寬越密（近大遠小的反向透視）
// y 從 55vh 往下；x 靠近中心收窄、往下漸寬
// op 亮度分三層：1.0 亮星 / 0.5 中等 / 0.22 暗淡遠星
const PARTICLES = [
  // logo 周圍（y:2-18）稀疏散佈
  { x: 15, y:  4, sz: 2, dur: '18s',   d: '1.2s',  op: 0.40 },
  { x: 38, y:  8, sz: 2, dur: '20s',   d: '3.5s',  op: 0.45 },
  { x: 62, y:  5, sz: 2, dur: '17s',   d: '0.8s',  op: 0.38 },
  { x: 84, y: 12, sz: 2, dur: '21s',   d: '2.6s',  op: 0.42 },
  { x: 22, y: 16, sz: 3, dur: '16s',   d: '4.0s',  op: 0.50 },
  { x: 72, y: 20, sz: 2, dur: '19s',   d: '1.8s',  op: 0.44 },
  // 文字區（y:25-50）
  { x:  8, y: 28, sz: 2, dur: '17s',   d: '0.4s',  op: 0.48 },
  { x: 48, y: 32, sz: 3, dur: '15.5s', d: '2.0s',  op: 0.55 },
  { x: 90, y: 36, sz: 2, dur: '18s',   d: '5.2s',  op: 0.40 },
  { x: 32, y: 42, sz: 2, dur: '20s',   d: '1.5s',  op: 0.52 },
  { x: 68, y: 46, sz: 3, dur: '16s',   d: '3.2s',  op: 0.58 },
  { x: 14, y: 50, sz: 2, dur: '19s',   d: '0.6s',  op: 0.45 },
  // 中下段（y:55-75）漸密
  { x: 46, y: 55, sz: 3, dur: '16.5s', d: '0.0s',  op: 0.5  },
  { x: 50, y: 60, sz: 4, dur: '18.0s', d: '3.2s',  op: 1.0  },
  { x: 57, y: 63, sz: 3, dur: '15.5s', d: '1.8s',  op: 0.22 },
  { x: 36, y: 65, sz: 4, dur: '19.2s', d: '0.8s',  op: 0.22 },
  { x: 52, y: 68, sz: 3, dur: '16.8s', d: '4.5s',  op: 1.0  },
  { x: 60, y: 67, sz: 4, dur: '17.6s', d: '2.0s',  op: 0.5  },
  { x: 40, y: 72, sz: 3, dur: '20.0s', d: '1.2s',  op: 0.22 },
  { x: 56, y: 74, sz: 4, dur: '15.8s', d: '5.0s',  op: 0.5  },
  { x: 68, y: 72, sz: 3, dur: '18.4s', d: '0.4s',  op: 1.0  },
  // 下段（y:76-93）
  { x: 24, y: 77, sz: 4, dur: '17.2s', d: '3.6s',  op: 0.22 },
  { x: 42, y: 79, sz: 5, dur: '19.5s', d: '1.5s',  op: 0.5  },
  { x: 58, y: 78, sz: 4, dur: '16.2s', d: '0.6s',  op: 1.0  },
  { x: 74, y: 77, sz: 3, dur: '18.8s', d: '2.8s',  op: 0.22 },
  { x: 34, y: 84, sz: 3, dur: '17.8s', d: '4.2s',  op: 0.5  },
  { x: 62, y: 83, sz: 4, dur: '16.6s', d: '1.0s',  op: 0.22 },
  { x: 18, y: 88, sz: 3, dur: '19.0s', d: '2.2s',  op: 0.22 },
  { x: 44, y: 91, sz: 3, dur: '17.4s', d: '0.3s',  op: 1.0  },
  { x: 56, y: 90, sz: 4, dur: '15.8s', d: '3.8s',  op: 0.5  },
  { x: 72, y: 89, sz: 3, dur: '20.4s', d: '5.2s',  op: 0.22 },
  { x: 80, y: 89, sz: 3, dur: '18.2s', d: '1.4s',  op: 0.5  },
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

function NavLink({ to, label }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to} style={{
      fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase',
      color: hov ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
      transition:'color 0.25s', textDecoration:'none',
    }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      {label}
    </Link>
  )
}

// Section 1 星點：上半稀疏、下半密集往底部堆積
const S1_PARTICLES = [
  // 上半（y 0-40）稀疏
  { x: 12, y:  8, sz: 2, dur: '19s', d: '0.5s',  op: 0.50 },
  { x: 30, y: 12, sz: 3, dur: '17s', d: '2.1s',  op: 0.45 },
  { x: 52, y:  6, sz: 2, dur: '21s', d: '0.9s',  op: 0.55 },
  { x: 72, y: 18, sz: 2, dur: '16s', d: '3.4s',  op: 0.48 },
  { x: 88, y: 30, sz: 3, dur: '18s', d: '1.2s',  op: 0.42 },
  { x: 18, y: 35, sz: 2, dur: '20s', d: '4.0s',  op: 0.52 },
  // 中段（y 40-60）漸密
  { x: 42, y: 42, sz: 3, dur: '15s', d: '0.3s',  op: 0.65 },
  { x: 62, y: 46, sz: 2, dur: '22s', d: '2.6s',  op: 0.55 },
  { x: 80, y: 50, sz: 2, dur: '17s', d: '1.7s',  op: 0.58 },
  { x: 25, y: 54, sz: 3, dur: '19s', d: '3.8s',  op: 0.60 },
  { x: 55, y: 58, sz: 2, dur: '16s', d: '0.6s',  op: 0.62 },
  { x: 90, y: 56, sz: 3, dur: '18s', d: '5.0s',  op: 0.50 },
  // 下半（y 60-85）密集
  { x:  8, y: 63, sz: 2, dur: '20s', d: '1.4s',  op: 0.55 },
  { x: 35, y: 67, sz: 3, dur: '15s', d: '2.8s',  op: 0.70 },
  { x: 58, y: 65, sz: 2, dur: '18s', d: '0.2s',  op: 0.65 },
  { x: 74, y: 70, sz: 3, dur: '17s', d: '4.2s',  op: 0.60 },
  { x: 20, y: 74, sz: 2, dur: '21s', d: '1.0s',  op: 0.68 },
  { x: 46, y: 77, sz: 3, dur: '16s', d: '3.0s',  op: 0.72 },
  { x: 82, y: 75, sz: 2, dur: '19s', d: '0.7s',  op: 0.58 },
  { x: 12, y: 82, sz: 3, dur: '17s', d: '2.4s',  op: 0.65 },
  { x: 38, y: 85, sz: 2, dur: '20s', d: '1.6s',  op: 0.70 },
  { x: 65, y: 82, sz: 3, dur: '15s', d: '4.8s',  op: 0.62 },
  { x: 88, y: 86, sz: 2, dur: '18s', d: '0.9s',  op: 0.55 },
]

function HomeMobile() {
  const { lang, setLang } = useLang()
  const [bgIdx,    setBgIdx]    = useState(0)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [scrollY,  setScrollY]  = useState(0)
  const prevImgRef  = useRef(null)
  const scrollRef   = useRef(null)

  useEffect(() => {
    if (ALL_IMGS.length < 2) return
    const timer = setInterval(() => {
      setBgIdx(prev => {
        prevImgRef.current = ALL_IMGS[prev]
        return (prev + 1) % ALL_IMGS.length
      })
      setImgLoaded(false)
    }, SWAP_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => setScrollY(el.scrollTop)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // scroll-based sequential reveal for section 2
  const r0 = scrollY > 80    // logo — fires as photo tail comes into view
  const r1 = scrollY > 280   // spiritual tattoo artist
  const r2 = scrollY > 450   // quote
  const r3 = scrollY > 600   // tagline
  const r4 = scrollY > 730   // CTA

  const langOpacity = scrollY < 150
    ? 1
    : Math.max(0, 1 - (scrollY - 150) / 70)

  return (
    <div style={{ position:'fixed', inset:0, background:'#111' }}>
      <style>{`
        @keyframes mLogoReveal {
          0%   { opacity: 0; transform: translateY(14px); }
          100% { opacity: 0.50; transform: translateY(0); }
        }
        @keyframes mParticleDrift {
          0%   { transform:translate(0,0) scale(1); opacity:0; }
          8%   { opacity:0.75; }
          35%  { transform:translate(9px,-8vh) scale(0.92); opacity:0.65; }
          65%  { transform:translate(-6px,-18vh) scale(0.78); opacity:0.35; }
          90%  { opacity:0.08; }
          100% { transform:translate(4px,-26vh) scale(0.6); opacity:0; }
        }
        @keyframes scrollFlow {
          0%   { top: -28px; }
          100% { top: 56px;  }
        }
        @keyframes mKenBurns {
          0%   { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.07) translate(0, -0.4%); }
        }
        .m-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* 語言切換器：接近第二屏時淡出 */}
      <div style={{
        position:'absolute', top:0, right:0, zIndex:35,
        paddingTop:'calc(env(safe-area-inset-top, 0px) + 18px)',
        paddingRight:'22px',
        display:'flex', gap:'14px', alignItems:'center',
        opacity: langOpacity, transition:'opacity 0.3s ease',
        pointerEvents: langOpacity < 0.05 ? 'none' : 'auto',
      }}>
        {[['zh','中'],['en','EN'],['ko','한']].map(([l, label]) => (
          <span key={l} onClick={() => setLang(l)} style={{
            fontSize:'11px', letterSpacing:'1.5px', cursor:'pointer',
            color: lang===l ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.28)',
            transition:'color 0.2s', padding:'6px 2px',
          }}>{label}</span>
        ))}
      </div>

      <div ref={scrollRef}
        className="m-scroll"
        style={{ position:'absolute', inset:0, overflowY:'scroll', zIndex:20,
          WebkitOverflowScrolling:'touch', scrollbarWidth:'none', msOverflowStyle:'none',
          overscrollBehaviorY:'contain' }}>

        {/* ── Section 1：作品幻燈片 ── */}
        <div style={{ height:'100vh', position:'relative', overflow:'hidden' }}>
          {prevImgRef.current && (
            <img src={prevImgRef.current} alt=""
              style={{ position:'absolute', inset:0, width:'100%', height:'100%',
                objectFit:'cover', objectPosition:'center 30%', filter:'brightness(0.48)' }} />
          )}
          <img key={bgIdx} src={ALL_IMGS[bgIdx]} alt=""
            onLoad={() => setImgLoaded(true)}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%',
              objectFit:'cover', objectPosition:'center 30%', filter:'brightness(0.48)',
              opacity: imgLoaded ? 1 : 0, transition:'opacity 1.4s ease',
              animation: imgLoaded ? `mKenBurns ${SWAP_INTERVAL}ms ease-out forwards` : 'none',
              transformOrigin:'center center',
            }} />

          {/* Section 1 星點 */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:2 }}>
            {S1_PARTICLES.map((p, i) => (
              <div key={i} style={{
                position:'absolute', left:`${p.x}vw`, top:`${p.y}vh`,
                width:`${p.sz}px`, height:`${p.sz}px`, borderRadius:'50%',
                background:`radial-gradient(circle, rgba(255,255,255,${(0.85*p.op).toFixed(2)}) 0%, rgba(255,255,255,${(0.2*p.op).toFixed(2)}) 60%, transparent 100%)`,
                boxShadow:`0 0 ${p.sz*2}px ${p.sz}px rgba(255,255,255,${(0.12*p.op).toFixed(2)})`,
                animation:`mParticleDrift ${p.dur} ease-in-out infinite`,
                animationDelay:p.d,
              }} />
            ))}
          </div>

          {/* LOGO — 置中偏上，壓在照片上的品牌感 */}
          <div style={{ position:'absolute', left:0, right:0, zIndex:3,
            display:'flex', justifyContent:'center',
            top:'20%', transform:'translateY(-50%)' }}>
            <img src={LOGO_URL} alt="SIA TATTOOIST"
              style={{ width:'54vw', maxWidth:'220px',
                opacity:0,
                filter:'drop-shadow(0 2px 16px rgba(0,0,0,0.4))',
                animation:'mLogoReveal 2.2s ease-out 0.4s forwards',
              }}
              onError={e => { e.currentTarget.style.display='none' }} />
          </div>

          {/* 底部漸層 */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'58%', zIndex:2,
            background:'linear-gradient(to bottom, transparent 0%, rgba(17,17,17,0.6) 45%, #111 100%)',
            pointerEvents:'none' }} />

          {/* 滾動指示器：SCROLL DOWN 在線上方 */}
          <div style={{
            position:'absolute', zIndex:3,
            bottom:'calc(62px + env(safe-area-inset-bottom, 0px) + 90px)',
            left:'50%', transform:'translateX(-50%)',
            display:'flex', flexDirection:'column', alignItems:'center', gap:'10px',
            opacity: scrollY < 18 ? 1 : 0, transition:'opacity 0.4s ease',
            pointerEvents:'none',
          }}>
            <span style={{
              fontSize:'10px', letterSpacing:'4px', textTransform:'uppercase',
              color:'rgba(255,255,255,0.38)', marginBottom:'2px',
            }}>scroll down</span>
            <div style={{ width:'1px', height:'110px', position:'relative', overflow:'hidden',
              background:'rgba(255,255,255,0.10)' }}>
              <div style={{
                position:'absolute', left:0, right:0, height:'32px',
                background:'linear-gradient(to bottom, transparent, rgba(255,255,255,0.60), transparent)',
                animation:'scrollFlow 1.65s ease-in-out infinite',
              }} />
            </div>
          </div>
        </div>

        {/* ── Section 2：深色 + 星點 + LOGO 帶出文字 ── */}
        <div style={{ background:'#111', position:'relative', overflow:'hidden',
          minHeight:'80vh',
          paddingTop:'1vh', paddingLeft:'40px', paddingRight:'40px',
          paddingBottom:'calc(62px + env(safe-area-inset-bottom, 0px) + 48px)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', textAlign:'center',
        }}>
          {/* 底部質感背景 */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none',
            backgroundImage:"url('https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/%E8%A1%8C%E5%8B%95%E7%89%88%E8%83%8C%E6%99%AF.jpg')",
            backgroundSize:'cover', backgroundPosition:'center bottom',
            opacity:0.18,
            maskImage:'linear-gradient(to bottom, transparent 0%, black 40%, black 100%)',
            WebkitMaskImage:'linear-gradient(to bottom, transparent 0%, black 40%, black 100%)',
          }} />
          {/* 星點 */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
            {PARTICLES.map((p, i) => (
              <div key={i} style={{
                position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
                width:`${p.sz}px`, height:`${p.sz}px`, borderRadius:'50%',
                background:`radial-gradient(circle, rgba(255,255,255,${(0.9*p.op).toFixed(2)}) 0%, rgba(255,255,255,${(0.25*p.op).toFixed(2)}) 60%, transparent 100%)`,
                boxShadow:`0 0 ${p.sz*2}px ${p.sz}px rgba(255,255,255,${(0.15*p.op).toFixed(2)})`,
                animation:`mParticleDrift ${p.dur} ease-in-out infinite`,
                animationDelay:p.d,
              }} />
            ))}
          </div>

          {/* LOGO 再次出現，帶出文字序列 */}
          <img src={LOGO_URL} alt="SIA TATTOOIST"
            style={{
              width:'54vw', maxWidth:'220px', marginBottom:'5vh',
              opacity: r0 ? 0.88 : 0,
              transform: r0 ? 'translateY(0)' : 'translateY(22px)',
              transition:'opacity 1.3s ease, transform 1.3s ease',
              filter:'drop-shadow(0 2px 20px rgba(0,0,0,0.45))',
            }}
            onError={e => { e.currentTarget.style.display='none' }}
          />

          {/* 標語 */}
          <p style={{
            fontSize:'11px', letterSpacing:'4.5px', textTransform:'uppercase',
            color:'var(--ocean)', marginBottom:'4vh',
            opacity: r1 ? 1 : 0,
            transform: r1 ? 'translateY(0)' : 'translateY(18px)',
            transition:'opacity 0.95s ease, transform 0.95s ease',
          }}>Spiritual Tattoo Artist</p>

          {/* 引言 */}
          <p style={{
            fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
            fontSize:'19px', lineHeight:2.4, letterSpacing:'0.3px',
            color:'rgba(255,255,255,0.58)', marginBottom:'4vh',
            opacity: r2 ? 1 : 0,
            transform: r2 ? 'translateY(0)' : 'translateY(18px)',
            transition:'opacity 0.95s ease, transform 0.95s ease',
          }}>
            A tattoo,<br />composed from the voice of your soul.
          </p>

          {/* 中/韓語副標 */}
          {lang !== 'en' && (
            <p style={{
              fontSize:'11px', letterSpacing: lang === 'ko' ? '1px' : '2px',
              color:'rgba(255,255,255,0.30)', marginBottom:'5vh',
              opacity: r3 ? 1 : 0,
              transform: r3 ? 'translateY(0)' : 'translateY(14px)',
              transition:'opacity 0.95s ease, transform 0.95s ease',
            }}>
              {t('tagline', lang)}
            </p>
          )}
          {lang === 'en' && <div style={{ marginBottom:'5vh' }} />}

          {/* CTA */}
          <Link to="/works" style={{
            display:'inline-block', padding:'16px 52px',
            border:'1px solid rgba(255,255,255,0.22)',
            fontSize:'11px', letterSpacing:'4.5px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.65)', textDecoration:'none',
            opacity: r4 ? 1 : 0,
            transform: r4 ? 'translateY(0)' : 'translateY(14px)',
            transition:'opacity 0.95s ease, transform 0.95s ease',
          }}>
            {t('browseWorks', lang)}
          </Link>
        </div>
      </div>

      <MobileTabBar />
    </div>
  )
}


export default function Home() {
  const { works } = useWorks()
  const { lang }  = useLang()
  const isMobile  = useIsMobile()

  // ── 行動版直接渲染 ──
  if (isMobile) return <HomeMobile />

  const [leftIdx,  setLeftIdx]  = useState(0)
  const [rightIdx, setRightIdx] = useState(0)
  const [leftKey,  setLeftKey]  = useState(0)
  const [rightKey, setRightKey] = useState(0)
  const [leftVert,  setLeftVert]  = useState('center')
  const [rightVert, setRightVert] = useState('bottom')
  const [navIn,    setNavIn]    = useState(false)
  const [btnHov,    setBtnHov]   = useState(false)

  const cursorContainerRef = useRef(null)
  const lastSpawnRef = useRef(0)
  const prevPosRef   = useRef({ x: 0, y: 0 })
  const onMouseMove = useCallback((e) => {
    const now = Date.now()
    if (now - lastSpawnRef.current < 130) return
    lastSpawnRef.current = now
    const container = cursorContainerRef.current
    if (!container) return
    const dx = e.clientX - prevPosRef.current.x
    const dy = e.clientY - prevPosRef.current.y
    const speed = Math.sqrt(dx * dx + dy * dy)
    prevPosRef.current = { x: e.clientX, y: e.clientY }
    if (speed < 3) return
    const nx = dx / speed
    const ny = dy / speed
    const offset = 18 + Math.random() * 28
    const spawnX = e.clientX - nx * offset + (Math.random() - 0.5) * 18
    const spawnY = e.clientY - ny * offset + (Math.random() - 0.5) * 18
    const sz  = 2.5 + Math.random() * 4
    const dur = 3.5 + Math.random() * 3
    const el  = document.createElement('div')
    el.style.cssText = [
      `position:fixed`,
      `left:${spawnX - sz / 2}px`,
      `top:${spawnY - sz / 2}px`,
      `width:${sz}px`,
      `height:${sz}px`,
      `border-radius:50%`,
      `background:radial-gradient(circle,rgba(255,255,255,0.60) 0%,rgba(200,235,245,0.20) 55%,transparent 100%)`,
      `box-shadow:0 0 ${sz*2}px ${sz*0.8}px rgba(200,235,245,0.18)`,
      `animation:trailDrift ${dur}s ease-out forwards`,
      `pointer-events:none`,
      `z-index:55`,
    ].join(';')
    container.appendChild(el)
    setTimeout(() => el.remove(), dur * 1000)
  }, [])

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
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}
      onMouseMove={onMouseMove}>

      <style>{`
        @keyframes breatheImg {
          0%,100% { transform:scale(1.0);   opacity:1;    }
          50%      { transform:scale(1.045); opacity:0.85; }
        }
        @keyframes btnPulse {
          0%,100% { opacity:0.40; border-color:rgba(255,255,255,0.28); box-shadow:0 0 0px rgba(255,255,255,0); background:transparent; }
          50%     { opacity:1.00; border-color:rgba(255,255,255,0.95); box-shadow:0 0 32px rgba(255,255,255,0.22), inset 0 0 14px rgba(255,255,255,0.07); background:rgba(255,255,255,0.05); }
        }
        @keyframes trailDrift {
          0%   { opacity: 0.50; transform: translate(0,    0)     scale(1);    }
          15%  { opacity: 0.60; }
          50%  { opacity: 0.35; transform: translate(0,   -8px)   scale(0.82); }
          85%  { opacity: 0.10; transform: translate(0,  -16px)   scale(0.65); }
          100% { opacity: 0;    transform: translate(0,  -22px)   scale(0.5);  }
        }
        @keyframes textBreathe {
          0%,100% { opacity: 0.40; }
          50%     { opacity: 1.00; }
        }
        @keyframes textGlow {
          0%,100% { text-shadow: 0 0 0px rgba(90,170,191,0); }
          50%     { text-shadow: 0 0 18px rgba(90,170,191,0.45); }
        }
        /* 海面光點：輕柔漂浮帶 S 曲線，像浪讓光點緩緩上移後消散 */
        @keyframes particleDrift {
          0%   { transform: translate(0, 0)         scale(1);    opacity: 0;    }
          8%   { opacity: 0.75; }
          35%  { transform: translate(9px,  -8vh)   scale(0.92); opacity: 0.65; }
          65%  { transform: translate(-6px, -18vh)  scale(0.78); opacity: 0.35; }
          90%  { opacity: 0.08; }
          100% { transform: translate(4px,  -26vh)  scale(0.6);  opacity: 0;    }
        }
      `}</style>

      {/* 側邊圖片 */}
      <SideImage key={`L${leftKey}`}  src={LEFT_IMGS[leftIdx]}   side="left"  vertPos={leftVert} />
      <SideImage key={`R${rightKey}`} src={RIGHT_IMGS[rightIdx]} side="right" vertPos={rightVert} />

      {/* 海面光點層 — 包在 fade-in 容器裡，延遲漸入避免進場太亮 */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9,
        opacity: navIn ? 1 : 0,
        transition: 'opacity 3s ease 1.2s',
      }}>
        {PARTICLES.map((p, i) => (
          <div key={i} style={{
            position: 'fixed',
            left: `${p.x}vw`,
            top:  `${p.y}vh`,
            width:  `${p.sz}px`,
            height: `${p.sz}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,255,255,${(0.95 * p.op).toFixed(2)}) 0%, rgba(255,255,255,${(0.3 * p.op).toFixed(2)}) 60%, transparent 100%)`,
            boxShadow: `0 0 ${p.sz * 2}px ${p.sz}px rgba(255,255,255,${(0.18 * p.op).toFixed(2)})`,
            animation: `particleDrift ${p.dur} ease-in-out infinite`,
            animationDelay: p.d,
            pointerEvents: 'none',
          }} />
        ))}
      </div>

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
            <NavLink to="/works" label={t('works',lang)} />
            <NavLink to="/flash" label={t('flash',lang)} />
            <a href={WIX_URL} target="_blank" rel="noreferrer" style={{
              fontSize:'12px', letterSpacing:'2px',
              color:'var(--warm)', textDecoration:'none',
            }}>
              {t('appointments',lang)}
            </a>
            <LangSwitcher />
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
              style={{ width:'100%', maxWidth:'260px', marginBottom:'28px',
                filter:'drop-shadow(0 2px 24px rgba(0,0,0,0.5))' }}
              onError={e => { e.currentTarget.style.display='none' }}
            />
          </FadeUp>

          <FadeUp delay={1100}>
            <p style={{
              fontSize:'14px', letterSpacing:'5px', textTransform:'uppercase',
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
              fontSize:'clamp(15px, 1.6vw, 20px)', lineHeight:1.8,
              color:'rgba(255,255,255,0.72)',
              marginBottom:'12px',
            }}>
              A tattoo,<br />composed from the voice of your soul.
            </p>
          </FadeUp>

          <FadeUp delay={1550}>
            {lang !== 'en'
              ? <p style={{
                  fontSize:'12px', letterSpacing: lang === 'ko' ? '1px' : '2.5px',
                  marginBottom:'44px', color:'rgba(255,255,255,0.55)',
                }}>
                  {t('tagline', lang)}
                </p>
              : <div style={{ marginBottom:'44px' }} />
            }
          </FadeUp>

          <FadeUp delay={1800}>
            <Link to="/works" style={{
              display:'inline-block', padding:'13px 40px',
              border:'1px solid rgba(255,255,255,0.28)',
              fontSize:'12px', letterSpacing:'5px', textTransform:'uppercase',
              color:'rgba(255,255,255,0.8)', transition:'background 0.3s ease, color 0.3s ease',
              animation: 'btnPulse 3.5s ease-in-out infinite',
              animationDelay: '-2.5s',
            }}
              onMouseEnter={e => {
                setBtnHov(true)
                e.currentTarget.style.animation = 'none'
                e.currentTarget.style.background='rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor='rgba(255,255,255,0.65)'
                e.currentTarget.style.color='#fff'
              }}
              onMouseLeave={e => {
                setBtnHov(false)
                e.currentTarget.style.animation = 'btnPulse 3.5s ease-in-out infinite'
                e.currentTarget.style.background='transparent'
                e.currentTarget.style.borderColor='rgba(255,255,255,0.28)'
                e.currentTarget.style.color='rgba(255,255,255,0.8)'
              }}>
              {t('browseWorks', lang)}
            </Link>
          </FadeUp>
        </div>

        {/* 底部 */}
        <div style={{
          padding:'24px 44px', display:'flex', justifyContent:'flex-end',
          opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 1.2s',
        }}>
          <span style={{ fontSize:'12px', letterSpacing:'3px', color:'rgba(255,255,255,0.2)' }}>
            © SIA TATTOOIST
          </span>
        </div>
      </div>

      {/* 游標漂浮粒子容器 */}
      <div ref={cursorContainerRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:50 }} />
    </div>
  )
}
