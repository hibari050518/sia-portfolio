import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { WIX_URL } from '../config'

const BG = '#111'

function NavLink({ to, zh, en }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to}
      style={{ fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase',
        color: hov ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
        transition:'color 0.25s', textDecoration:'none' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
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

export default function WorksTheme() {
  const { theme }  = useParams()
  const decoded    = decodeURIComponent(theme)
  const navigate   = useNavigate()
  const { works, loading } = useWorks()

  const [activeIdx, setActiveIdx] = useState(0)
  const [navIn,     setNavIn]     = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(t)
  }, [])

  const themeWorks = works.filter(w => w.theme === decoded)
  const total      = themeWorks.length
  const work       = themeWorks[activeIdx]

  const go = (delta) => {
    setImgLoaded(false)
    setActiveIdx(i => Math.max(0, Math.min(total - 1, i + delta)))
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft')  go(-1)
      if (e.key === 'Enter' && work)
        navigate(`/works/${encodeURIComponent(decoded)}/${work.id}`)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIdx, work, decoded, navigate])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'11px', letterSpacing:'4px' }}>loading</p>
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}>

      {/* ── Full-bleed background image ── */}
      {work?.image_url && (
        <img
          key={work.id}
          src={work.image_url}
          alt={work.title}
          onLoad={() => setImgLoaded(true)}
          style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center top',
            filter:'brightness(0.60)',
            opacity: imgLoaded ? 1 : 0,
            transition:'opacity 0.75s ease',
          }}
        />
      )}

      {/* ── Gradient vignette ── */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:5,
        background:'linear-gradient(to bottom, rgba(17,17,17,0.60) 0%, rgba(17,17,17,0) 22%, rgba(17,17,17,0) 48%, rgba(17,17,17,0.70) 80%, rgba(17,17,17,0.92) 100%)',
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
          <NavLink to="/works" zh="作品" en="Works" />
          <NavLink to="/flash" zh="認領圖" en="Flash" />
          <a href={WIX_URL} target="_blank" rel="noreferrer"
            style={{ fontSize:'12px', letterSpacing:'2px', color:'var(--warm)', textDecoration:'none' }}>
            Appointments ↗
          </a>
        </div>
      </nav>

      {/* ── Breadcrumb ── */}
      <div style={{
        position:'absolute', top:'82px', left:'44px', zIndex:30,
        display:'flex', alignItems:'center', gap:'10px',
        opacity: navIn ? 1 : 0, transition:'opacity 0.6s ease 0.12s',
      }}>
        <Link to="/works"
          style={{ fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.3)', textDecoration:'none', transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
          ← 作品集
        </Link>
        <span style={{ fontSize:'9px', letterSpacing:'3px', color:'rgba(255,255,255,0.22)' }}>／</span>
        <span style={{ fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase',
          color:'rgba(255,255,255,0.55)' }}>{decoded}</span>
      </div>

      {/* ── Center content ── */}
      {work && (
        <div style={{
          position:'absolute', inset:0, zIndex:15,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          textAlign:'center', pointerEvents:'none',
          opacity: navIn ? 1 : 0, transition:'opacity 0.9s ease 0.25s',
        }}>
          {work.body_part && (
            <p style={{
              fontSize:'9px', letterSpacing:'5px', textTransform:'uppercase',
              color:'rgba(255,255,255,0.38)', marginBottom:'18px',
            }}>
              {work.body_part}
            </p>
          )}
          <h1 style={{
            fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300,
            fontSize:'clamp(30px, 4.5vw, 70px)', color:'rgba(255,255,255,0.92)',
            lineHeight:1.1, marginBottom:'32px',
          }}>
            {work.title}
          </h1>
          <button
            onClick={() => navigate(`/works/${encodeURIComponent(decoded)}/${work.id}`)}
            style={{
              pointerEvents:'auto', background:'none',
              border:'1px solid rgba(255,255,255,0.28)',
              color:'rgba(255,255,255,0.65)', fontSize:'10px',
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
            閱讀故事 →
          </button>
        </div>
      )}

      {/* ── Left / Right arrows ── */}
      <ArrowBtn dir="left"  onClick={() => go(-1)} disabled={activeIdx === 0} />
      <ArrowBtn dir="right" onClick={() => go(1)}  disabled={activeIdx === total - 1} />

      {/* ── Bottom: counter + thumbnails + copyright ── */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, zIndex:30,
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'0 44px 28px',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.45s',
      }}>
        {/* Counter */}
        <span style={{
          fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.32)',
          marginBottom:'16px',
        }}>
          {total > 0 ? `${String(activeIdx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}` : ''}
        </span>

        {/* Thumbnail strip — center bottom */}
        {total > 1 && (
          <div style={{ display:'flex', gap:'6px', alignItems:'flex-end', marginBottom:'16px' }}>
            {themeWorks.map((w, i) => {
              const isActive = i === activeIdx
              return (
                <div
                  key={w.id}
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
                  {w.image_url
                    ? <img src={w.image_url} alt={w.title}
                        style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
                    : <div style={{ width:'100%', height:'100%', background:'rgba(255,255,255,0.06)' }} />
                  }
                </div>
              )
            })}
          </div>
        )}

        <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.14)' }}>
          © SIA TATTOOIST
        </span>
      </div>
    </div>
  )
}
