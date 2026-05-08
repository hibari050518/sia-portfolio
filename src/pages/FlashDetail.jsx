import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFlash } from '../hooks/useSheets'
import { WIX_URL, LINE_ID } from '../config'
import { useLang, t, formatSize } from '../context/LangContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { useTouchSwipe } from '../hooks/useTouchSwipe'
import { MobileTopBar, MobileTabBar } from '../components/MobileNav'

const BG    = '#111'
const PANEL = '#161616'

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

function NavLink({ to, label }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to}
      style={{ fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase',
        color: hov ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
        transition:'color 0.25s', textDecoration:'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {label}
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

export default function FlashDetail() {
  const { series, id } = useParams()
  const decoded        = decodeURIComponent(series)
  const navigate       = useNavigate()
  const { flash, loading } = useFlash()
  const { lang }       = useLang()

  const [navIn,        setNavIn]        = useState(false)
  const [imgLoaded,    setImgLoaded]    = useState(false)
  const [copied,       setCopied]       = useState(false)
  const [activeImgIdx, setActiveImgIdx] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const seriesItems = flash.filter(f => f.series === decoded)
  const itemIdx     = seriesItems.findIndex(f => f.id === id)
  const item        = seriesItems[itemIdx]
  const total       = seriesItems.length
  const prev        = itemIdx > 0         ? seriesItems[itemIdx - 1] : null
  const next        = itemIdx < total - 1 ? seriesItems[itemIdx + 1] : null

  const images = item
    ? [item.image_url, item.image_url_2, item.image_url_3].filter(Boolean)
    : []

  useEffect(() => {
    setImgLoaded(false)
    setCopied(false)
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
      if (e.key === 'Escape') navigate(`/flash/${encodeURIComponent(decoded)}`)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [decoded, navigate])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'12px', letterSpacing:'4px' }}>loading</p>
    </div>
  )
  if (!item) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <Link to={`/flash/${encodeURIComponent(decoded)}`}
        style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px', letterSpacing:'3px' }}>← Back</Link>
    </div>
  )

  const isAvail   = item.status?.trim() === '可認領'
  const activeImg = images[activeImgIdx]

  const buildInquiryText = () => {
    const lines = {
      zh: `嗨！我想詢問「${item.title}」的預約時間 🌿\n設計尺寸：${item.size_suggestion || '待確認'}\n預計部位：${item.body_part || '待確認'}\n請問目前可以預約什麼時候呢？`,
      en: `Hi! I'd like to inquire about booking "${item.title}" 🌿\nSize: ${item.size_suggestion || 'TBD'}\nPlacement: ${item.body_part || 'TBD'}\nWhen would be available to book?`,
      ko: `안녕하세요! "${item.title}" 예약 문의드립니다 🌿\n사이즈: ${item.size_suggestion || '미정'}\n부위: ${item.body_part || '미정'}\n예약 가능한 날짜가 언제인가요?`,
    }
    return item.line_prefill || lines[lang] || lines.zh
  }

  const handleCopyAndLine = () => {
    const text = buildInquiryText()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const lineUrl = `https://line.me/R/ti/p/${encodeURIComponent(LINE_ID)}`

  /* ── Mobile layout: image top, content below, scrollable ── */
  if (isMobile) return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}>
      <MobileTopBar />

      {/* Scrollable content area */}
      <div style={{
        position:'absolute',
        top:'52px',
        bottom:'calc(62px + env(safe-area-inset-bottom, 0px))',
        left:0, right:0,
        overflowY:'auto',
        WebkitOverflowScrolling:'touch',
      }}>
        {/* Image section — 52vh */}
        <div style={{ position:'relative', height:'52vh', overflow:'hidden', flexShrink:0 }}
          onTouchStart={imgSwipe.onTouchStart} onTouchEnd={imgSwipe.onTouchEnd}>
          {activeImg && (
            <img
              key={`${item.id}-${activeImgIdx}`}
              src={activeImg}
              alt={item.title}
              onLoad={() => setImgLoaded(true)}
              style={{
                position:'absolute', inset:0, width:'100%', height:'100%',
                objectFit:'cover', objectPosition:'center center',
                filter:`brightness(${isAvail ? 0.75 : 0.45})`,
                opacity: imgLoaded ? 1 : 0,
                transition:'opacity 0.65s ease',
              }}
            />
          )}
          {/* Bottom fade */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'35%',
            background:`linear-gradient(to top, ${BG}, transparent)`, pointerEvents:'none', zIndex:2 }} />

          {/* Image dots */}
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

          {/* Back link */}
          <div style={{ position:'absolute', top:'14px', left:'18px', zIndex:10 }}>
            <Link to={`/flash/${encodeURIComponent(decoded)}`}
              style={{ fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase',
                color:'rgba(255,255,255,0.55)', textDecoration:'none' }}>
              ← {decoded}
            </Link>
          </div>
        </div>

        {/* Content section */}
        <div style={{ padding:'36px 28px 56px', background:BG }}>

          {/* Series + status row */}
          <div style={{ display:'flex', alignItems:'center', marginBottom:'24px', gap:'12px' }}>
            <span style={{ fontSize:'11px', letterSpacing:'3px', textTransform:'uppercase',
              color:'var(--ocean)', opacity:0.85, flexShrink:0 }}>
              {decoded}
            </span>
            <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.10)' }} />
            <span style={{ fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase',
              padding:'3px 10px', flexShrink:0,
              color: isAvail ? 'var(--ocean)' : 'rgba(255,255,255,0.3)',
              border: `1px solid ${isAvail ? 'rgba(74,143,160,0.6)' : 'rgba(255,255,255,0.15)'}` }}>
              {isAvail ? t('available',lang) : t('taken',lang)}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily:'var(--serif)', fontWeight:300, fontStyle:'italic',
            fontSize:'clamp(24px, 7vw, 40px)', color:'rgba(255,255,255,0.92)',
            lineHeight:1.3, marginBottom:'32px' }}>
            {item.title}
          </h1>

          {/* Description */}
          {item.description && (
            <p style={{ fontSize:'14px', lineHeight:2.2, color:'rgba(255,255,255,0.50)',
              fontStyle:'italic', marginBottom:'40px',
              borderLeft:'1px solid rgba(255,255,255,0.10)', paddingLeft:'18px' }}>
              {item.description}
            </p>
          )}

          {/* Details */}
          <div style={{ display:'flex', flexDirection:'column', marginBottom:'40px' }}>
            {[
              { label:'BODY',  value: item.body_part },
              { label:'SIZE',  value: formatSize(item.size_suggestion, lang) },
              { label:'PRICE', value: item.price_range },
            ].filter(d => d.value).map(d => (
              <div key={d.label} style={{ display:'flex', alignItems:'baseline', gap:'16px',
                borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'17px 0' }}>
                <span style={{ fontSize:'11px', letterSpacing:'1.5px',
                  color:'rgba(255,255,255,0.22)', width:'52px', flexShrink:0 }}>{d.label}</span>
                <span style={{ fontSize:'13px',
                  color: d.label === 'PRICE' ? 'var(--gold)' : 'rgba(255,255,255,0.62)',
                  letterSpacing:'0.5px',
                  fontStyle: d.label === 'PRICE' ? 'italic' : 'normal' }}>{d.value}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {isAvail ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'32px' }}>
              <button
                onClick={handleCopyAndLine}
                style={{
                  background: copied ? 'rgba(74,143,160,0.15)' : 'none',
                  border: `1px solid ${copied ? 'var(--ocean)' : 'rgba(255,255,255,0.28)'}`,
                  color: copied ? 'var(--ocean)' : 'rgba(255,255,255,0.75)',
                  fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
                  padding:'15px 20px', cursor:'pointer',
                  transition:'all 0.25s', textAlign:'center',
                }}>
                {copied ? t('copied',lang) : `${t('copyInquiry',lang)} ↗`}
              </button>
              <a href={lineUrl} target="_blank" rel="noreferrer"
                style={{
                  display:'block', textAlign:'center',
                  background:'rgba(0,185,0,0.12)',
                  border:'1px solid rgba(0,185,0,0.4)',
                  color:'rgba(100,255,100,0.85)',
                  fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
                  padding:'15px 20px', textDecoration:'none',
                }}>
                {t('goLine',lang)} →
              </a>
            </div>
          ) : (
            <p style={{ fontSize:'13px', lineHeight:2.0, color:'rgba(255,255,255,0.35)',
              fontStyle:'italic', marginBottom:'32px' }}>
              {t('takenNote',lang)}
            </p>
          )}

          {/* Prev / Next */}
          {(prev || next) && (
            <div style={{ display:'flex', justifyContent:'space-between',
              paddingTop:'28px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              {prev
                ? <Link to={`/flash/${encodeURIComponent(decoded)}/${prev.id}`}
                    style={{ fontSize:'12px', letterSpacing:'2px',
                      color:'rgba(255,255,255,0.35)', textDecoration:'none' }}>
                    {t('prev',lang)}
                  </Link>
                : <span />
              }
              {next
                ? <Link to={`/flash/${encodeURIComponent(decoded)}/${next.id}`}
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

  /* ── Desktop layout ── */
  return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}>

      {/* ── Left image panel ── */}
      <div style={{
        position:'absolute', top:0, left:0, bottom:0, right:'38%',
        overflow:'hidden',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.2s',
      }}>
        {activeImg && (
          <img
            key={`${item.id}-${activeImgIdx}`}
            src={activeImg}
            alt={item.title}
            onLoad={() => setImgLoaded(true)}
            style={{
              position:'absolute', inset:0, width:'100%', height:'100%',
              objectFit:'cover', objectPosition:'center center',
              filter:`brightness(${isAvail ? 0.72 : 0.45})`,
              opacity: imgLoaded ? 1 : 0,
              transition:'opacity 0.65s ease',
            }}
          />
        )}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none', zIndex:2,
          background:'linear-gradient(to bottom, rgba(17,17,17,0.55) 0%, rgba(17,17,17,0) 18%, rgba(17,17,17,0) 75%, rgba(17,17,17,0.75) 100%)',
        }} />
        <div style={{
          position:'absolute', top:0, right:0, bottom:0, width:'12%', zIndex:2,
          background:`linear-gradient(to right, transparent, ${PANEL})`, pointerEvents:'none',
        }} />

        {/* 多圖切換箭頭 */}
        {images.length > 1 && (
          <>
            <ImgArrow dir="left"  onClick={() => goImg(-1)} disabled={activeImgIdx === 0} />
            <ImgArrow dir="right" onClick={() => goImg(1)}  disabled={activeImgIdx === images.length - 1} />
          </>
        )}

        {/* 圓點指示器 */}
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

      {/* ── Back link ── */}
      <div style={{
        position:'absolute', top:'82px', left:'44px', zIndex:30,
        opacity: navIn ? 1 : 0, transition:'opacity 0.6s ease 0.12s',
      }}>
        <Link to={`/flash/${encodeURIComponent(decoded)}`}
          style={{ fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.38)', textDecoration:'none', transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.38)'}>
          ← {decoded}
        </Link>
      </div>

      {/* ── Top nav ── */}
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
          <NavLink to="/works" label={t('works',lang)} />
          <NavLink to="/flash" label={t('flash',lang)} />
          <a href={WIX_URL} target="_blank" rel="noreferrer"
            style={{ fontSize:'12px', letterSpacing:'2px', color:'var(--warm)', textDecoration:'none' }}>
            {t('appointments',lang)}
          </a>
          <LangSwitcher />
        </div>
      </nav>

      {/* ── Right story panel ── */}
      <div style={{
        position:'absolute', top:0, right:0, bottom:0, width:'38%',
        background: PANEL,
        borderLeft:'1px solid rgba(255,255,255,0.07)',
        overflowY:'auto', zIndex:20,
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.3s',
      }}>
        <div style={{ padding:'108px 48px 64px', display:'flex', flexDirection:'column', minHeight:'100%' }}>

          {/* Series tag ─────── Status — 同一行，中間連線 */}
          <div style={{
            display:'flex', alignItems:'center',
            marginBottom:'40px',
          }}>
            <span style={{
              fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
              color:'var(--ocean)', opacity:0.85, flexShrink:0,
              padding:'4px 0',
            }}>
              {decoded}
            </span>
            <div style={{
              flex:1, height:'1px',
              background:'rgba(255,255,255,0.12)',
              margin:'0 16px',
            }} />
            <span style={{
              fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
              padding:'4px 12px', flexShrink:0,
              color: isAvail ? 'var(--ocean)' : 'rgba(255,255,255,0.3)',
              border: `1px solid ${isAvail ? 'rgba(74,143,160,0.6)' : 'rgba(255,255,255,0.15)'}`,
            }}>
              {isAvail ? t('available',lang) : t('taken',lang)}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily:'var(--serif)', fontWeight:300, fontStyle:'italic',
            fontSize:'clamp(24px, 2.4vw, 42px)', color:'rgba(255,255,255,0.92)',
            lineHeight:1.2, marginBottom:'36px' }}>
            {item.title}
          </h1>

          {/* Description */}
          {item.description && (
            <p style={{ fontSize:'14px', lineHeight:2.1, color:'rgba(255,255,255,0.52)',
              fontStyle:'italic', marginBottom:'48px',
              borderLeft:'1px solid rgba(255,255,255,0.10)', paddingLeft:'20px' }}>
              {item.description}
            </p>
          )}

          {/* Details */}
          <div style={{ display:'flex', flexDirection:'column', marginBottom:'52px' }}>
            {[
              { label:'BODY',  value: item.body_part },
              { label:'SIZE',  value: formatSize(item.size_suggestion, lang) },
              { label:'PRICE', value: item.price_range },
            ].filter(d => d.value).map(d => (
              <div key={d.label} style={{ display:'flex', alignItems:'baseline', gap:'16px',
                borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px 0' }}>
                <span style={{ fontSize:'12px', letterSpacing:'1.5px',
                  color:'rgba(255,255,255,0.22)', width:'60px', flexShrink:0 }}>{d.label}</span>
                <span style={{ fontSize:'13px', color: d.label === 'PRICE' ? 'var(--gold)' : 'rgba(255,255,255,0.62)',
                  letterSpacing:'0.5px', fontStyle: d.label === 'PRICE' ? 'italic' : 'normal' }}>{d.value}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {isAvail ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <button
                onClick={handleCopyAndLine}
                style={{
                  background: copied ? 'rgba(74,143,160,0.15)' : 'none',
                  border: `1px solid ${copied ? 'var(--ocean)' : 'rgba(255,255,255,0.28)'}`,
                  color: copied ? 'var(--ocean)' : 'rgba(255,255,255,0.75)',
                  fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
                  padding:'15px 20px', cursor:'pointer',
                  transition:'all 0.25s', textAlign:'center',
                }}>
                {copied ? t('copied',lang) : `${t('copyInquiry',lang)} ↗`}
              </button>
              <a href={lineUrl} target="_blank" rel="noreferrer"
                style={{
                  display:'block', textAlign:'center',
                  background:'rgba(0,185,0,0.12)',
                  border:'1px solid rgba(0,185,0,0.4)',
                  color:'rgba(100,255,100,0.85)',
                  fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase',
                  padding:'15px 20px', textDecoration:'none',
                  transition:'all 0.25s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0,185,0,0.22)'
                  e.currentTarget.style.borderColor = 'rgba(0,185,0,0.7)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0,185,0,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(0,185,0,0.4)'
                }}>
                {t('goLine',lang)} →
              </a>
            </div>
          ) : (
            <p style={{ fontSize:'13px', lineHeight:2.0, color:'rgba(255,255,255,0.35)',
              fontStyle:'italic' }}>
              {t('takenNote',lang)}
            </p>
          )}

          {/* Prev / Next */}
          {(prev || next) && (
            <div style={{ display:'flex', justifyContent:'space-between',
              marginTop:'auto', paddingTop:'44px',
              borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              {prev
                ? <Link to={`/flash/${encodeURIComponent(decoded)}/${prev.id}`}
                    style={{ fontSize:'12px', letterSpacing:'2px',
                      color:'rgba(255,255,255,0.28)', textDecoration:'none', transition:'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.28)'}>
                    {t('prev',lang)}
                  </Link>
                : <span />
              }
              {next
                ? <Link to={`/flash/${encodeURIComponent(decoded)}/${next.id}`}
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
