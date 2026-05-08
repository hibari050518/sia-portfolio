import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { WIX_URL } from '../config'
import { useLang, gl, getThemeName, t } from '../context/LangContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { useTouchSwipe } from '../hooks/useTouchSwipe'
import { MobileTopBar, MobileTabBar } from '../components/MobileNav'

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

const BG = '#111'

function NavLink({ to, zh, en }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to}
      style={{ fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase',
        color: hov ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
        transition:'color 0.25s', textDecoration:'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {hov ? en : zh}
    </Link>
  )
}

function ArrowBtn({ dir, onClick, disabled }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position:'absolute', top:'50%', transform:'translateY(-50%)',
        [dir === 'left' ? 'left' : 'right']: '20px',
        zIndex:20, background:'none', border:'none',
        cursor: disabled ? 'default' : 'pointer',
        padding:'16px 12px',
        opacity: disabled ? 0.08 : hov ? 0.9 : 0.38,
        transition:'opacity 0.25s',
      }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {dir === 'left'
          ? <path d="M18 4 L8 14 L18 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M10 4 L20 14 L10 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
    </button>
  )
}

export default function WorksTheme() {
  const { theme }  = useParams()
  const decoded    = decodeURIComponent(theme)
  const navigate   = useNavigate()
  const { works, loading } = useWorks()
  const { lang }   = useLang()
  const [activeIdx, setActiveIdx] = useState(0)
  const [navIn,     setNavIn]     = useState(false)
  const hoverTimer                = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(t)
  }, [])

  const themeWorks        = works.filter(w => w.theme === decoded)
  const total             = themeWorks.length
  const themeDescription  = themeWorks[0]
    ? (lang === 'zh'
        ? themeWorks[0].theme_description || ''
        : themeWorks[0][`theme_description_${lang}`] || themeWorks[0].theme_description || '')
    : ''

  const go = (delta) => setActiveIdx(i => Math.max(0, Math.min(total - 1, i + delta)))

  const isMobile = useIsMobile()
  const swipe    = useTouchSwipe(() => go(1), () => go(-1))
  const [hinted, setHinted] = useState(false)

  const handleHover = (i) => {
    if (i === activeIdx) return
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setActiveIdx(i), 80)
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft')  go(-1)
      if (e.key === 'Enter' && themeWorks[activeIdx])
        navigate(`/works/${encodeURIComponent(decoded)}/${themeWorks[activeIdx].id}`)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIdx, themeWorks, decoded, navigate])

  useEffect(() => {
    if (total < 2) return
    const t1 = setTimeout(() => setHinted(true), 1400)
    const t2 = setTimeout(() => setHinted(false), 2250)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [total])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'12px', letterSpacing:'4px' }}>loading</p>
    </div>
  )

  /* ── Mobile layout: card swipe ── */
  if (isMobile) return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}>
      <style>{`
        @keyframes swipeNudgeW {
          0%   { transform: translateY(-52%); }
          28%  { transform: translateY(-52%) translateX(-22px); }
          58%  { transform: translateY(-52%) translateX(10px); }
          80%  { transform: translateY(-52%) translateX(-4px); }
          100% { transform: translateY(-52%); }
        }
        @keyframes arrowLeftW {
          0%, 100% { opacity: 0.16; transform: translateY(-50%) translateX(0); }
          50%       { opacity: 0.50; transform: translateY(-50%) translateX(-6px); }
        }
        @keyframes arrowRightW {
          0%, 100% { opacity: 0.16; transform: translateY(-50%) translateX(0); }
          50%       { opacity: 0.50; transform: translateY(-50%) translateX(6px); }
        }
      `}</style>

      {/* Nav bar 半透明黑色底 */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, zIndex:34,
        height:'calc(env(safe-area-inset-top, 0px) + 58px)',
        background:'linear-gradient(to bottom, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.18) 72%, transparent 100%)',
        pointerEvents:'none',
      }} />

      <MobileTopBar />

      <div style={{
        position:'absolute', top:'52px', bottom:'calc(62px + env(safe-area-inset-bottom, 0px))',
        left:0, right:0, display:'flex', flexDirection:'column',
      }}>
        {/* Breadcrumb */}
        <div style={{ padding:'10px 18px 6px', flexShrink:0,
          display:'flex', alignItems:'center', gap:'8px' }}>
          <Link to="/works"
            style={{ fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase',
              color:'rgba(255,255,255,0.32)', textDecoration:'none' }}>
            ← {t('backWorks',lang)}
          </Link>
          <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.18)' }}>／</span>
          <span style={{ fontSize:'11px', letterSpacing:'1px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.50)' }}>
            {getThemeName(works, decoded, lang)}
          </span>
        </div>

        {/* Card spread */}
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}
          onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>

          {/* Left/Right swipe arrows */}
          {activeIdx > 0 && total > 1 && (
            <div style={{
              position:'absolute', left:'3%', top:'50%', zIndex:15, pointerEvents:'none',
              fontSize:'26px', color:'rgba(255,255,255,0.22)', lineHeight:1,
              animation:'arrowLeftW 2.4s ease-in-out infinite',
            }}>‹</div>
          )}
          {activeIdx < total - 1 && total > 1 && (
            <div style={{
              position:'absolute', right:'3%', top:'50%', zIndex:15, pointerEvents:'none',
              fontSize:'26px', color:'rgba(255,255,255,0.22)', lineHeight:1,
              animation:'arrowRightW 2.4s ease-in-out 0.3s infinite',
            }}>›</div>
          )}

          {themeWorks.map((work, i) => {
            const offset   = i - activeIdx
            if (Math.abs(offset) > 1) return null
            const isCenter = offset === 0
            const leftPct  = 14 + offset * 58
            const rotation = offset * 14

            return (
              <div key={work.id}
                onClick={() => {
                  if (offset === 0) navigate(`/works/${encodeURIComponent(decoded)}/${work.id}`)
                  else setActiveIdx(i)
                }}
                style={{
                  position:'absolute', left:`${leftPct}%`, width:'72%',
                  height:'min(52vh, calc(72vw * 1.32))',
                  top:'50%',
                  transform: isCenter ? 'translateY(-52%)' : `translateY(-52%) scale(0.86) rotate(${rotation}deg)`,
                  transformOrigin:'50% 88%',
                  overflow:'hidden', cursor:'pointer',
                  borderRadius:'12px',
                  border:`1px solid rgba(255,255,255,${isCenter ? 0.18 : 0.06})`,
                  boxShadow: isCenter ? '0 20px 70px rgba(0,0,0,0.80)' : 'none',
                  opacity: isCenter ? 1 : 0.32,
                  zIndex: isCenter ? 2 : 1,
                  animation: isCenter && hinted ? 'swipeNudgeW 0.82s ease-out forwards' : 'none',
                  transition: isCenter && hinted ? 'none' : [
                    'left 0.65s cubic-bezier(0.25,0.1,0.25,1)',
                    'transform 0.65s cubic-bezier(0.25,0.1,0.25,1)',
                    'opacity 0.4s ease',
                  ].join(', '),
                }}>

                {work.image_url
                  ? <img src={work.image_url} alt={work.title}
                      style={{ width:'100%', height:'100%', objectFit:'cover',
                        filter:`brightness(${isCenter ? 0.82 : 0.20})`,
                        transition:'filter 0.55s ease' }} />
                  : <div style={{ width:'100%', height:'100%', background:'rgba(255,255,255,0.04)' }} />
                }

                {/* Side card: edge fade */}
                {!isCenter && <>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:'45%',
                    background:`linear-gradient(to bottom, ${BG}, transparent)`, pointerEvents:'none' }}/>
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'45%',
                    background:`linear-gradient(to top, ${BG}, transparent)`, pointerEvents:'none' }}/>
                </>}

                {/* Center card: subtle side fade */}
                {isCenter && <>
                  <div style={{ position:'absolute', top:0, left:0, bottom:0, width:'12%',
                    background:`linear-gradient(to right, rgba(17,17,17,0.40), transparent)`, pointerEvents:'none' }}/>
                  <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'12%',
                    background:`linear-gradient(to left, rgba(17,17,17,0.40), transparent)`, pointerEvents:'none' }}/>
                </>}
              </div>
            )
          })}

          {activeIdx > 0 && (
            <div onClick={() => go(-1)} style={{
              position:'absolute', left:0, top:0, bottom:0, width:'14%', zIndex:10, cursor:'pointer',
            }} />
          )}
          {activeIdx < total - 1 && (
            <div onClick={() => go(1)} style={{
              position:'absolute', right:0, top:0, bottom:0, width:'14%', zIndex:10, cursor:'pointer',
            }} />
          )}
        </div>

        {/* Info section */}
        {themeWorks[activeIdx] && (
          <div style={{ padding:'10px 18px 10px', flexShrink:0,
            display:'flex', flexDirection:'column', alignItems:'center', gap:'7px', textAlign:'center' }}>
            {total > 1 && (
              <div style={{ display:'flex', gap:'4px', alignItems:'center', marginBottom:'2px' }}>
                {themeWorks.map((_, i) => (
                  <div key={i} onClick={() => setActiveIdx(i)} style={{
                    width: i === activeIdx ? '18px' : '4px', height:'2px',
                    borderRadius:'1px', cursor:'pointer',
                    background: i === activeIdx ? 'rgba(255,255,255,0.60)' : 'rgba(255,255,255,0.18)',
                    transition:'all 0.35s ease',
                  }} />
                ))}
              </div>
            )}
            <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.25)' }}>
              {String(activeIdx+1).padStart(2,'0')} / {String(total).padStart(2,'0')}
            </span>
            {gl(themeWorks[activeIdx], 'body_part', lang) && (
              <span style={{ fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase',
                color:'var(--ocean)', border:'1px solid var(--ocean)', padding:'2px 8px', opacity:0.85 }}>
                {gl(themeWorks[activeIdx], 'body_part', lang)}
              </span>
            )}
            <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
              fontSize:'18px', color:'rgba(255,255,255,0.88)', letterSpacing:'0.5px', margin:0 }}>
              {gl(themeWorks[activeIdx], 'title', lang)}
            </p>
            <button
              onClick={() => navigate(`/works/${encodeURIComponent(decoded)}/${themeWorks[activeIdx].id}`)}
              style={{ background:'none', border:'1px solid rgba(255,255,255,0.25)',
                color:'rgba(255,255,255,0.60)', fontSize:'11px', letterSpacing:'2px',
                textTransform:'uppercase', padding:'8px 22px', cursor:'pointer' }}>
              {t('readStory',lang)} →
            </button>
          </div>
        )}
      </div>

      <MobileTabBar />
    </div>
  )

  /* ── Desktop layout ── */
  return (
    <div style={{ position:'fixed', inset:0, background:BG,
      display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── Nav ── */}
      <nav style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'28px 44px', flexShrink:0, zIndex:10,
        opacity: navIn ? 1 : 0, transition:'opacity 0.6s ease',
      }}>
        <Link to="/" style={{ fontSize:'13px', letterSpacing:'4px',
          color:'rgba(255,255,255,0.85)', fontFamily:'var(--serif)', textDecoration:'none' }}>
          SIA TATTOOIST
        </Link>
        <div style={{ display:'flex', gap:'36px', alignItems:'center' }}>
          <NavLink to="/works" zh={t('works',lang)} en={t('works',lang)} />
          <NavLink to="/flash" zh={t('flash',lang)} en={t('flash',lang)} />
          <a href={WIX_URL} target="_blank" rel="noreferrer"
            style={{ fontSize:'12px', letterSpacing:'2px', color:'var(--warm)', textDecoration:'none' }}>
            {t('appointments',lang)}
          </a>
          <LangSwitcher />
        </div>
      </nav>

      {/* ── Breadcrumb ── */}
      <div style={{
        padding:'0 44px 12px', flexShrink:0, zIndex:10,
        display:'flex', alignItems:'center', gap:'10px',
        opacity: navIn ? 1 : 0, transition:'opacity 0.6s ease 0.12s',
      }}>
        <Link to="/works"
          style={{ fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.3)', textDecoration:'none', transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
          ← {t('backWorks',lang)}
        </Link>
        <span style={{ fontSize:'12px', letterSpacing:'2px', color:'rgba(255,255,255,0.22)' }}>／</span>
        <span style={{ fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
          color:'rgba(255,255,255,0.55)' }}>{getThemeName(works, decoded, lang)}</span>
      </div>

      {/* ── Theme description ── */}
      {themeDescription && (
        <div style={{
          padding:'0 44px 16px', flexShrink:0, zIndex:10,
          opacity: navIn ? 1 : 0, transition:'opacity 0.6s ease 0.18s',
        }}>
          <p style={{ fontSize:'12px', lineHeight:1.8, color:'rgba(255,255,255,0.36)',
            fontStyle:'italic', maxWidth:'480px', letterSpacing:'0.3px' }}>
            {themeDescription}
          </p>
        </div>
      )}

      {/* ── Carousel ── */}
      <div style={{
        flex:1, position:'relative', overflow:'hidden',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.2s',
      }}>
        <ArrowBtn dir="left"  onClick={() => go(-1)} disabled={activeIdx === 0} />
        <ArrowBtn dir="right" onClick={() => go(1)}  disabled={activeIdx === total - 1} />

        {themeWorks.map((work, i) => {
          const offset    = i - activeIdx
          if (Math.abs(offset) > 3) return null
          const isCenter  = offset === 0
          const absOff    = Math.abs(offset)
          const leftPct   = 40 + offset * 20
          const heightPct = isCenter ? 84 : absOff === 1 ? 62 : 50
          const brightness= isCenter ? 0.78 : absOff === 1 ? 0.38 : 0.22

          return (
            <div key={work.id}
              style={{
                position:'absolute', left:`${leftPct}%`, width:'20%',
                height:`${heightPct}%`, top:'50%',
                transform: isCenter ? 'translateY(-50%)' : `translateY(-50%) rotate(${offset < 0 ? 3 : -3}deg)`,
                transformOrigin:'center bottom',
                overflow:'hidden',
                cursor: isCenter ? 'pointer' : 'ew-resize',
                opacity: Math.abs(offset) > 2 ? 0 : 1,
                zIndex: isCenter ? 2 : 1,
                transition:[
                  'left 0.65s cubic-bezier(0.25,0.1,0.25,1)',
                  'height 0.65s cubic-bezier(0.25,0.1,0.25,1)',
                  'transform 0.65s cubic-bezier(0.25,0.1,0.25,1)',
                  'opacity 0.35s ease',
                ].join(', '),
              }}
              onMouseEnter={() => handleHover(i)}
              onClick={() => {
                if (isCenter) navigate(`/works/${encodeURIComponent(decoded)}/${work.id}`)
                else setActiveIdx(i)
              }}
            >
              {isCenter && (
                <div style={{ position:'absolute', inset:'-10% 0',
                  background:'rgba(28,28,28,0.55)', zIndex:0, pointerEvents:'none' }}/>
              )}
              {work.image_url
                ? <img src={work.image_url} alt={work.title}
                    style={{ position:'relative', zIndex:1, width:'100%', height:'100%',
                      objectFit:'cover', objectPosition:'center center',
                      filter:`brightness(${brightness})`, transition:'filter 0.45s ease' }}
                  />
                : <div style={{ position:'relative', zIndex:1, width:'100%', height:'100%',
                    background:'rgba(255,255,255,0.04)' }} />
              }
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'30%', zIndex:2,
                background:`linear-gradient(to bottom,${BG},transparent)`, pointerEvents:'none' }}/>
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'30%', zIndex:2,
                background:`linear-gradient(to top,${BG},transparent)`, pointerEvents:'none' }}/>
              {!isCenter && (
                <div style={{ position:'absolute', inset:0, zIndex:2,
                  background: offset < 0
                    ? `linear-gradient(to right,${BG} 0%,transparent 60%)`
                    : `linear-gradient(to left,${BG} 0%,transparent 60%)`,
                  pointerEvents:'none' }}/>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Work label + button (below carousel, no overlap) ── */}
      {themeWorks[activeIdx] && (
        <div style={{
          padding:'14px 0 10px', flexShrink:0, zIndex:10,
          display:'flex', flexDirection:'column', alignItems:'center', gap:'10px',
          opacity: navIn ? 1 : 0, transition:'opacity 0.7s ease 0.3s',
        }}>
          {gl(themeWorks[activeIdx], 'body_part', lang) && (
            <span style={{
              fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
              color:'var(--ocean)', border:'1px solid var(--ocean)',
              padding:'3px 10px', opacity:0.85,
            }}>{gl(themeWorks[activeIdx], 'body_part', lang)}</span>
          )}
          <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
            fontSize:'clamp(14px,1.4vw,20px)', color:'rgba(255,255,255,0.88)',
            letterSpacing:'1.5px', textAlign:'center', margin:0 }}>
            {gl(themeWorks[activeIdx], 'title', lang)}
          </p>
          <button
            onClick={() => navigate(`/works/${encodeURIComponent(decoded)}/${themeWorks[activeIdx].id}`)}
            style={{
              background:'none', border:'1px solid rgba(255,255,255,0.25)',
              color:'rgba(255,255,255,0.60)', fontSize:'12px',
              letterSpacing:'2px', textTransform:'uppercase',
              padding:'7px 20px', cursor:'pointer',
              transition:'border-color 0.25s, color 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.70)'
              e.currentTarget.style.color = 'rgba(255,255,255,1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.60)'
            }}>
            {t('readStory',lang)} →
          </button>
        </div>
      )}

      {/* ── Bottom ── */}
      <div style={{
        padding:'12px 44px', display:'flex',
        justifyContent:'space-between', alignItems:'center',
        flexShrink:0, zIndex:10,
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.5s',
      }}>
        <span style={{ fontSize:'12px', letterSpacing:'2px', color:'rgba(255,255,255,0.35)' }}>
          {total > 0 ? `${String(activeIdx+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}` : '—'}
        </span>
        {total > 1 && (
          <div style={{ display:'flex', gap:'3px', alignItems:'center' }}>
            {themeWorks.map((_, i) => (
              <div key={i} onClick={() => setActiveIdx(i)} style={{
                width: i === activeIdx ? '18px' : '4px',
                height:'2px', borderRadius:'1px', cursor:'pointer',
                background: i === activeIdx ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)',
                transition:'all 0.35s ease',
              }}/>
            ))}
          </div>
        )}
        <span style={{ fontSize:'12px', letterSpacing:'2px', color:'rgba(255,255,255,0.18)' }}>
          © SIA TATTOOIST
        </span>
      </div>
    </div>
  )
}
