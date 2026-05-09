import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { WIX_URL } from '../config'
import { useLang, gl, getThemeName, t, formatSize } from '../context/LangContext'
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

const BG    = '#111'
const PANEL = '#161616'

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

function ImgArrow({ dir, onClick, disabled }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position:'absolute', top:'50%', transform:'translateY(-50%)',
        [dir === 'left' ? 'left' : 'right']: '16px',
        zIndex:10, background:'none', border:'none',
        cursor: disabled ? 'default' : 'pointer', padding:'14px 10px',
        opacity: disabled ? 0.08 : hov ? 0.9 : 0.38,
        transition:'opacity 0.25s',
      }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {dir === 'left'
          ? <path d="M15 4 L7 12 L15 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M9 4 L17 12 L9 20"  stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
    </button>
  )
}

export default function WorkDetail() {
  const { theme, id }  = useParams()
  const decoded        = decodeURIComponent(theme)
  const navigate       = useNavigate()
  const { works, loading } = useWorks()
  const { lang }       = useLang()

  const [navIn,        setNavIn]        = useState(false)
  const [imgLoaded,    setImgLoaded]    = useState(false)
  const [activeImgIdx, setActiveImgIdx] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const themeWorks = works.filter(w => w.theme === decoded)
  const workIdx    = themeWorks.findIndex(w => w.id === id)
  const work       = themeWorks[workIdx]
  const total      = themeWorks.length
  const prev       = workIdx > 0         ? themeWorks[workIdx - 1] : null
  const next       = workIdx < total - 1 ? themeWorks[workIdx + 1] : null

  const images = work
    ? [work.image_url, work.image_url_2, work.image_url_3].filter(Boolean)
    : []

  useEffect(() => {
    setImgLoaded(false)
    setActiveImgIdx(0)
  }, [id])

  const goImg = (delta) => {
    setImgLoaded(false)
    setActiveImgIdx(i => Math.max(0, Math.min(images.length - 1, i + delta)))
  }

  const isMobile = useIsMobile()
  const imgSwipe = useTouchSwipe(() => goImg(1), () => goImg(-1))

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') navigate('/works/' + encodeURIComponent(decoded))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [decoded])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'12px', letterSpacing:'4px' }}>loading</p>
    </div>
  )
  if (!work) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <Link to={'/works/' + encodeURIComponent(decoded)}
        style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px', letterSpacing:'3px' }}>back</Link>
    </div>
  )

  const activeImg = images[activeImgIdx]

  if (isMobile) return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}>
      <MobileTopBar />
      <div style={{
        position:'absolute', top:'52px',
        bottom:'calc(62px + env(safe-area-inset-bottom, 0px))',
        left:0, right:0, overflowY:'auto', WebkitOverflowScrolling:'touch',
      }}>
        <div style={{ position:'relative', height:'52vh', overflow:'hidden', flexShrink:0 }}
          onTouchStart={imgSwipe.onTouchStart} onTouchEnd={imgSwipe.onTouchEnd}>
          {activeImg && (
            <img key={work.id + '-' + activeImgIdx} src={activeImg} alt={work.title}
              onLoad={() => setImgLoaded(true)}
              style={{
                position:'absolute', inset:0, width:'100%', height:'100%',
                objectFit:'cover', objectPosition:'center center',
                filter:'brightness(0.72)',
                opacity: imgLoaded ? 1 : 0, transition:'opacity 0.65s ease',
              }} />
          )}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'35%',
            background:'linear-gradient(to top, ' + BG + ', transparent)', pointerEvents:'none', zIndex:2 }} />
          {images.length > 1 && (
            <div style={{ position:'absolute', bottom:'16px', left:'50%', transform:'translateX(-50%)',
              display:'flex', gap:'5px', zIndex:5 }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => { setImgLoaded(false); setActiveImgIdx(i) }}
                  style={{ width: i === activeImgIdx ? '18px' : '5px', height:'2px',
                    borderRadius:'1px', border:'none', padding:0, cursor:'pointer',
                    background: i === activeImgIdx ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.25)',
                    transition:'all 0.35s ease' }}/>
              ))}
            </div>
          )}
          <div style={{ position:'absolute', top:'14px', left:'18px', zIndex:10 }}>
            <Link to={'/works/' + encodeURIComponent(decoded)}
              style={{ fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase',
                color:'rgba(255,255,255,0.55)', textDecoration:'none' }}>
              {'← ' + getThemeName(works, decoded, lang)}
            </Link>
          </div>
        </div>
        <div style={{ padding:'36px 28px 56px', background:BG }}>
          <p style={{ fontSize:'11px', letterSpacing:'3px', textTransform:'uppercase',
            color:'var(--ocean)', marginBottom:'20px', opacity:0.85 }}>
            {getThemeName(works, decoded, lang)}
          </p>
          <h1 style={{ fontFamily:'var(--serif)', fontWeight:300, fontStyle:'italic',
            fontSize:'clamp(24px, 7vw, 40px)', color:'rgba(255,255,255,0.92)',
            lineHeight:1.3, marginBottom:'32px' }}>
            {gl(work, 'title', lang)}
          </h1>
          {gl(work, 'story', lang) && (
            <p style={{ fontSize:'14px', lineHeight:2.2, color:'rgba(255,255,255,0.50)',
              fontStyle:'italic', marginBottom:'40px',
              borderLeft:'1px solid rgba(255,255,255,0.10)', paddingLeft:'18px' }}>
              {gl(work, 'story', lang)}
            </p>
          )}
          <div style={{ display:'flex', flexDirection:'column', marginBottom:'40px' }}>
            {[
              { label:'BODY', value: gl(work, 'body_part', lang) },
              { label:'SIZE', value: formatSize(work.size_cm, lang) },
              { label:'DATE', value: work.date },
            ].filter(d => d.value).map(d => (
              <div key={d.label} style={{ display:'flex', alignItems:'baseline', gap:'16px',
                borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'17px 0' }}>
                <span style={{ fontSize:'11px', letterSpacing:'1.5px',
                  color:'rgba(255,255,255,0.22)', width:'52px', flexShrink:0 }}>{d.label}</span>
                <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.62)',
                  letterSpacing:'0.5px' }}>{d.value}</span>
              </div>
            ))}
          </div>
          {(prev || next) && (
            <div style={{ display:'flex', justifyContent:'space-between',
              paddingTop:'28px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              {prev
                ? <Link to={'/works/' + encodeURIComponent(decoded) + '/' + prev.id}
                    style={{ fontSize:'12px', letterSpacing:'2px',
                      color:'rgba(255,255,255,0.35)', textDecoration:'none' }}>
                    {t('prev',lang)}
                  </Link>
                : <span />
              }
              {next
                ? <Link to={'/works/' + encodeURIComponent(decoded) + '/' + next.id}
                    style={{ fontSize:'12px', letterSpacing:'2px',
                      color:'rgba(255,255,255,0.35)', textDecoration:'none' }}>
                    {t('next',lang)}
                  </Link>
                : <span />
              }
            </div>
          )}
        </div>
      </div>
      <MobileTabBar />
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}>
      <div style={{
        position:'absolute', top:0, left:0, bottom:0, right:'38%',
        overflow:'hidden',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.2s',
      }}>
        {activeImg && (
          <img key={work.id + '-' + activeImgIdx} src={activeImg} alt={work.title}
            onLoad={() => setImgLoaded(true)}
            style={{
              position:'absolute', inset:0, width:'100%', height:'100%',
              objectFit:'cover', objectPosition:'center center',
              filter:'brightness(0.68)',
              opacity: imgLoaded ? 1 : 0, transition:'opacity 0.65s ease',
            }} />
        )}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none', zIndex:2,
          background:'linear-gradient(to bottom, rgba(17,17,17,0.55) 0%, rgba(17,17,17,0) 18%, rgba(17,17,17,0) 75%, rgba(17,17,17,0.75) 100%)',
        }} />
        <div style={{
          position:'absolute', top:0, right:0, bottom:0, width:'12%', zIndex:2,
          background:'linear-gradient(to right, transparent, ' + PANEL + ')', pointerEvents:'none',
        }} />
        {images.length > 1 && (
          <>
            <ImgArrow dir="left"  onClick={() => goImg(-1)} disabled={activeImgIdx === 0} />
            <ImgArrow dir="right" onClick={() => goImg(1)}  disabled={activeImgIdx === images.length - 1} />
          </>
        )}
        {images.length > 1 && (
          <div style={{
            position:'absolute', bottom:'28px', left:'50%', transform:'translateX(-50%)',
            display:'flex', gap:'5px', zIndex:5,
          }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => { setImgLoaded(false); setActiveImgIdx(i) }}
                style={{
                  width: i === activeImgIdx ? '18px' : '5px',
                  height:'2px', borderRadius:'1px', border:'none', padding:0, cursor:'pointer',
                  background: i === activeImgIdx ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.25)',
                  transition:'all 0.35s ease',
                }}/>
            ))}
          </div>
        )}
      </div>
      <div style={{
        position:'absolute', top:'82px', left:'44px', zIndex:30,
        opacity: navIn ? 1 : 0, transition:'opacity 0.6s ease 0.12s',
      }}>
        <Link to={'/works/' + encodeURIComponent(decoded)}
          style={{ fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.38)', textDecoration:'none', transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.38)'}>
          {'← ' + getThemeName(works, decoded, lang)}
        </Link>
      </div>
      <nav style={{
        position:'absolute', top:0, left:0, right:0, zIndex:30,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'28px 44px',
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
      <div style={{
        position:'absolute', top:0, right:0, bottom:0, width:'38%',
        background: PANEL, borderLeft:'1px solid rgba(255,255,255,0.07)',
        overflowY:'auto', zIndex:20,
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.3s',
      }}>
        <div style={{ padding:'92px 48px 64px', display:'flex', flexDirection:'column', minHeight:'100%' }}>
          <p style={{ fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
            color:'var(--ocean)', marginBottom:'32px', opacity:0.85 }}>
            {getThemeName(works, decoded, lang)}
          </p>
          <h1 style={{ fontFamily:'var(--serif)', fontWeight:300, fontStyle:'italic',
            fontSize:'clamp(24px, 2.4vw, 42px)', color:'rgba(255,255,255,0.92)',
            lineHeight:1.2, marginBottom:'36px' }}>
            {gl(work, 'title', lang)}
          </h1>
          {gl(work, 'story', lang) && (
            <p style={{ fontSize:'14px', lineHeight:2.1, color:'rgba(255,255,255,0.52)',
              fontStyle:'italic', marginBottom:'48px',
              borderLeft:'1px solid rgba(255,255,255,0.10)', paddingLeft:'20px' }}>
              {gl(work, 'story', lang)}
            </p>
          )}
          <div style={{ display:'flex', flexDirection:'column' }}>
            {[
              { label:'BODY', value: gl(work, 'body_part', lang) },
              { label:'SIZE', value: formatSize(work.size_cm, lang) },
              { label:'DATE', value: work.date },
            ].filter(d => d.value).map(d => (
              <div key={d.label} style={{ display:'flex', alignItems:'baseline', gap:'16px',
                borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px 0' }}>
                <span style={{ fontSize:'12px', letterSpacing:'1.5px',
                  color:'rgba(255,255,255,0.22)', width:'60px', flexShrink:0 }}>{d.label}</span>
                <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.62)',
                  letterSpacing:'0.5px' }}>{d.value}</span>
              </div>
            ))}
          </div>
          {(prev || next) && (
            <div style={{ display:'flex', justifyContent:'space-between',
              marginTop:'auto', paddingTop:'40px',
              borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              {prev
                ? <Link to={'/works/' + encodeURIComponent(decoded) + '/' + prev.id}
                    style={{ fontSize:'12px', letterSpacing:'2px',
                      color:'rgba(255,255,255,0.28)', textDecoration:'none', transition:'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.28)'}>
                    {t('prev',lang)}
                  </Link>
                : <span />
              }
              {next
                ? <Link to={'/works/' + encodeURIComponent(decoded) + '/' + next.id}
                    style={{ fontSize:'12px', letterSpacing:'2px',
                      color:'rgba(255,255,255,0.28)', textDecoration:'none', transition:'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.28)'}>
                    {t('next',lang)}
                  </Link>
                : <span />
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
