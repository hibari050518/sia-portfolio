import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFlash } from '../hooks/useSheets'
import { getSeries } from '../utils/sheets'
import { WIX_URL } from '../config'
import { useLang, t } from '../context/LangContext'

const BG = '#111'

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

function ArrowBtn({ dir, onClick, disabled }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position:'absolute', top:'50%', transform:'translateY(-50%)',
        [dir === 'left' ? 'left' : 'right']: '24px',
        zIndex:20, background:'none', border:'none',
        cursor: disabled ? 'default' : 'pointer',
        padding:'16px 12px',
        opacity: disabled ? 0.08 : hov ? 0.9 : 0.38,
        transition:'opacity 0.25s',
      }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {dir === 'left'
          ? <path d="M20 4 L8 16 L20 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M12 4 L24 16 L12 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
    </button>
  )
}

export default function FlashHome() {
  const { flash, loading } = useFlash()
  const navigate           = useNavigate()
  const { lang }           = useLang()
  const [activeIdx, setActiveIdx] = useState(0)
  const [navIn,     setNavIn]     = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    const t2 = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(t2)
  }, [])

  const seriesNames = getSeries(flash)
  const seriesData  = seriesNames.map(name => {
    const items = flash.filter(f => f.series === name)
    const availCount = items.filter(i => i.status === '可認領').length
    return { name, count: items.length, availCount, image: items.find(i => i.image_url)?.image_url }
  })
  const total  = seriesData.length
  const series = seriesData[activeIdx]

  const go = (delta) => {
    setImgLoaded(false)
    setActiveIdx(i => Math.max(0, Math.min(total - 1, i + delta)))
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft')  go(-1)
      if (e.key === 'Enter' && series) navigate(`/flash/${encodeURIComponent(series.name)}`)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIdx, series])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'12px', letterSpacing:'4px' }}>loading</p>
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}>

      {/* ── Full-bleed background image ── */}
      {series?.image && (
        <img
          key={series.name}
          src={series.image}
          alt={series.name}
          onLoad={() => setImgLoaded(true)}
          style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center center',
            filter:'brightness(0.52)',
            opacity: imgLoaded ? 1 : 0,
            transition:'opacity 0.75s ease',
          }}
        />
      )}

      {/* ── Gradient vignette ── */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:5,
        background:'linear-gradient(to bottom, rgba(17,17,17,0.65) 0%, rgba(17,17,17,0) 22%, rgba(17,17,17,0) 48%, rgba(17,17,17,0.72) 80%, rgba(17,17,17,0.94) 100%)',
      }} />

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

      {/* ── Center content ── */}
      {series && (
        <div style={{
          position:'absolute', inset:0, zIndex:15,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          textAlign:'center', pointerEvents:'none',
          opacity: navIn ? 1 : 0, transition:'opacity 0.9s ease 0.25s',
        }}>
          <p style={{
            fontSize:'12px', letterSpacing:'5px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.38)', marginBottom:'10px',
          }}>
            {series.count} {t('flashCount',lang)}
          </p>
          {series.availCount > 0 && (
            <p style={{
              fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase',
              color:'var(--ocean)', marginBottom:'16px', opacity:0.9,
            }}>
              {series.availCount} {t('available',lang)}
            </p>
          )}
          <h1 style={{
            fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
            fontSize:'clamp(30px, 4.5vw, 70px)', color:'rgba(255,255,255,0.92)',
            lineHeight:1.1, marginBottom:'32px',
          }}>
            {series.name}
          </h1>
          <button
            onClick={() => navigate(`/flash/${encodeURIComponent(series.name)}`)}
            style={{
              pointerEvents:'auto', background:'none',
              border:'1px solid rgba(255,255,255,0.28)',
              color:'rgba(255,255,255,0.65)', fontSize:'12px',
              letterSpacing:'3.5px', textTransform:'uppercase',
              padding:'10px 26px', cursor:'pointer',
              transition:'border-color 0.25s, color 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.72)'
              e.currentTarget.style.color = 'rgba(255,255,255,1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
            }}>
            {t('exploreFlash',lang)} →
          </button>
        </div>
      )}

      {/* ── Arrows ── */}
      <ArrowBtn dir="left"  onClick={() => go(-1)} disabled={activeIdx === 0} />
      <ArrowBtn dir="right" onClick={() => go(1)}  disabled={activeIdx === total - 1} />

      {/* ── Bottom ── */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, zIndex:30,
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'0 44px 28px',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.45s',
      }}>
        <span style={{ fontSize:'12px', letterSpacing:'2px', color:'rgba(255,255,255,0.32)', marginBottom:'16px' }}>
          {total > 0 ? `${String(activeIdx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}` : ''}
        </span>

        {total > 1 && (
          <div style={{ display:'flex', gap:'6px', alignItems:'flex-end', marginBottom:'16px' }}>
            {seriesData.map((s, i) => {
              const isActive = i === activeIdx
              return (
                <div key={s.name}
                  onClick={() => { setImgLoaded(false); setActiveIdx(i) }}
                  style={{
                    width:  isActive ? '54px' : '38px',
                    height: isActive ? '54px' : '38px',
                    overflow:'hidden', flexShrink:0, cursor:'pointer',
                    border: isActive
                      ? '1.5px solid rgba(255,255,255,0.70)'
                      : '1px solid rgba(255,255,255,0.18)',
                    opacity: isActive ? 1 : 0.45,
                    transition:'all 0.38s cubic-bezier(0.22,1,0.36,1)',
                  }}>
                  {s.image
                    ? <img src={s.image} alt={s.name}
                        style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
                    : <div style={{ width:'100%', height:'100%', background:'rgba(255,255,255,0.06)' }} />
                  }
                </div>
              )
            })}
          </div>
        )}

        <span style={{ fontSize:'12px', letterSpacing:'2px', color:'rgba(255,255,255,0.14)' }}>
          © SIA TATTOOIST
        </span>
      </div>
    </div>
  )
}
