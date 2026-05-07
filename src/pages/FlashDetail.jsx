import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFlash } from '../hooks/useSheets'
import { WIX_URL, LINE_ID } from '../config'
import { useLang, t } from '../context/LangContext'

const BG    = '#111'
const PANEL = '#161616'

function LangSwitcher() {
  const { lang, setLang } = useLang()
  return (
    <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
      {[['zh','中'],['en','EN'],['ko','한']].map(([l, label]) => (
        <div key={l} onClick={() => setLang(l)}
          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', cursor:'pointer' }}>
          <span style={{ fontSize:'11px', letterSpacing:'2px',
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

export default function FlashDetail() {
  const { series, id } = useParams()
  const decoded        = decodeURIComponent(series)
  const navigate       = useNavigate()
  const { flash, loading } = useFlash()
  const { lang }       = useLang()

  const [navIn,     setNavIn]     = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [copied,    setCopied]    = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const seriesItems = flash.filter(f => f.series === decoded)
  const itemIdx     = seriesItems.findIndex(f => f.id === id)
  const item        = seriesItems[itemIdx]
  const total       = seriesItems.length
  const prev        = itemIdx > 0           ? seriesItems[itemIdx - 1] : null
  const next        = itemIdx < total - 1   ? seriesItems[itemIdx + 1] : null

  useEffect(() => {
    setImgLoaded(false)
    setCopied(false)
  }, [id])

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
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'11px', letterSpacing:'4px' }}>loading</p>
    </div>
  )
  if (!item) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <Link to={`/flash/${encodeURIComponent(decoded)}`}
        style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px', letterSpacing:'3px' }}>← Back</Link>
    </div>
  )

  const isAvail = item.status === '可認領'

  // Build inquiry text
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
      // fallback for older browsers
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

  return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}>

      {/* ── Left image panel ── */}
      <div style={{
        position:'absolute', top:0, left:0, bottom:0, right:'38%',
        overflow:'hidden',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.2s',
      }}>
        {item.image_url && (
          <img
            key={`${item.id}`}
            src={item.image_url}
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
      </div>

      {/* ── Back link (left panel, top left) ── */}
      <div style={{
        position:'absolute', top:'82px', left:'44px', zIndex:30,
        opacity: navIn ? 1 : 0, transition:'opacity 0.6s ease 0.12s',
      }}>
        <Link to={`/flash/${encodeURIComponent(decoded)}`}
          style={{ fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase',
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
        <div style={{ padding:'88px 44px 60px', display:'flex', flexDirection:'column', minHeight:'100%' }}>

          {/* Series tag */}
          <p style={{ fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase',
            color:'var(--ocean)', marginBottom:'10px', opacity:0.85 }}>
            {decoded}
          </p>

          {/* Status */}
          <div style={{ marginBottom:'16px' }}>
            <span style={{
              fontSize:'9px', letterSpacing:'3px', textTransform:'uppercase',
              padding:'3px 10px',
              color: isAvail ? 'var(--ocean)' : 'rgba(255,255,255,0.3)',
              border: `1px solid ${isAvail ? 'var(--ocean)' : 'rgba(255,255,255,0.18)'}`,
            }}>
              {isAvail ? t('available',lang) : t('taken',lang)}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily:'var(--serif)', fontWeight:300, fontStyle:'italic',
            fontSize:'clamp(22px, 2.2vw, 38px)', color:'rgba(255,255,255,0.92)',
            lineHeight:1.2, marginBottom:'28px' }}>
            {item.title}
          </h1>

          {/* Description / concept */}
          {item.description && (
            <p style={{ fontSize:'14px', lineHeight:2.0, color:'rgba(255,255,255,0.52)',
              fontStyle:'italic', marginBottom:'32px',
              borderLeft:'1px solid rgba(255,255,255,0.10)', paddingLeft:'20px' }}>
              {item.description}
            </p>
          )}

          {/* Details */}
          <div style={{ display:'flex', flexDirection:'column', marginBottom:'36px' }}>
            {[
              { label:'BODY',  value: item.body_part },
              { label:'SIZE',  value: item.size_suggestion },
              { label:'PRICE', value: item.price_range },
            ].filter(d => d.value).map(d => (
              <div key={d.label} style={{ display:'flex', alignItems:'baseline', gap:'16px',
                borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'12px 0' }}>
                <span style={{ fontSize:'9px', letterSpacing:'2.5px',
                  color:'rgba(255,255,255,0.22)', width:'44px', flexShrink:0 }}>{d.label}</span>
                <span style={{ fontSize:'12px', color: d.label === 'PRICE' ? 'var(--gold)' : 'rgba(255,255,255,0.58)',
                  letterSpacing:'0.5px', fontStyle: d.label === 'PRICE' ? 'italic' : 'normal' }}>{d.value}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          {isAvail ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {/* Copy inquiry */}
              <button
                onClick={handleCopyAndLine}
                style={{
                  background: copied ? 'rgba(74,143,160,0.15)' : 'none',
                  border: `1px solid ${copied ? 'var(--ocean)' : 'rgba(255,255,255,0.28)'}`,
                  color: copied ? 'var(--ocean)' : 'rgba(255,255,255,0.75)',
                  fontSize:'10px', letterSpacing:'2.5px', textTransform:'uppercase',
                  padding:'12px 20px', cursor:'pointer',
                  transition:'all 0.25s', textAlign:'center',
                }}>
                {copied ? t('copied',lang) : `${t('copyInquiry',lang)} ↗`}
              </button>

              {/* LINE link */}
              <a href={lineUrl} target="_blank" rel="noreferrer"
                style={{
                  display:'block', textAlign:'center',
                  background:'rgba(0,185,0,0.12)',
                  border:'1px solid rgba(0,185,0,0.4)',
                  color:'rgba(100,255,100,0.85)',
                  fontSize:'10px', letterSpacing:'2.5px', textTransform:'uppercase',
                  padding:'12px 20px', textDecoration:'none',
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
            <p style={{ fontSize:'13px', lineHeight:1.9, color:'rgba(255,255,255,0.35)',
              fontStyle:'italic' }}>
              {t('takenNote',lang)}
            </p>
          )}

          {/* Prev / Next */}
          {(prev || next) && (
            <div style={{ display:'flex', justifyContent:'space-between',
              marginTop:'auto', paddingTop:'40px',
              borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              {prev
                ? <Link to={`/flash/${encodeURIComponent(decoded)}/${prev.id}`}
                    style={{ fontSize:'10px', letterSpacing:'2px',
                      color:'rgba(255,255,255,0.28)', textDecoration:'none', transition:'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.28)'}>
                    {t('prev',lang)}
                  </Link>
                : <span />
              }
              {next
                ? <Link to={`/flash/${encodeURIComponent(decoded)}/${next.id}`}
                    style={{ fontSize:'10px', letterSpacing:'2px',
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
