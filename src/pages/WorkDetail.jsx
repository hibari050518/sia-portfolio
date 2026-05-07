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

export default function WorkDetail() {
  const { theme, id }  = useParams()
  const decoded        = decodeURIComponent(theme)
  const navigate       = useNavigate()
  const { works, loading } = useWorks()

  const [navIn,      setNavIn]      = useState(false)
  const [imgLoaded,  setImgLoaded]  = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setNavIn(true), 300)
    return () => clearTimeout(t)
  }, [])

  const themeWorks = works.filter(w => w.theme === decoded)
  const idx        = themeWorks.findIndex(w => w.id === id)
  const work       = themeWorks[idx]
  const total      = themeWorks.length

  const goWork = (delta) => {
    const next = idx + delta
    if (next < 0 || next >= total) return
    setImgLoaded(false)
    setDrawerOpen(false)
    navigate(`/works/${encodeURIComponent(decoded)}/${themeWorks[next].id}`)
  }

  useEffect(() => {
    setImgLoaded(false)
    setDrawerOpen(false)
  }, [id])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goWork(1)
      if (e.key === 'ArrowLeft')  goWork(-1)
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx, themeWorks, decoded])

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'11px', letterSpacing:'4px' }}>loading</p>
    </div>
  )

  if (!work) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <Link to={`/works/${encodeURIComponent(decoded)}`}
        style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px', letterSpacing:'3px' }}>← Back</Link>
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:BG, overflow:'hidden' }}>

      {/* ── Full-bleed background image ── */}
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

      {/* ── Gradient vignette ── */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:5,
        background:'linear-gradient(to bottom, rgba(17,17,17,0.62) 0%, rgba(17,17,17,0) 22%, rgba(17,17,17,0) 48%, rgba(17,17,17,0.72) 80%, rgba(17,17,17,0.94) 100%)',
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
        <Link to={`/works/${encodeURIComponent(decoded)}`}
          style={{ fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase',
            color:'rgba(255,255,255,0.3)', textDecoration:'none', transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
          ← {decoded}
        </Link>
      </div>

      {/* ── Center content ── */}
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
        {(work.story || work.size_cm || work.date) && (
          <button
            onClick={() => setDrawerOpen(v => !v)}
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
        )}
      </div>

      {/* ── Left / Right arrows (navigate between works) ── */}
      <ArrowBtn dir="left"  onClick={() => goWork(-1)} disabled={idx <= 0} />
      <ArrowBtn dir="right" onClick={() => goWork(1)}  disabled={idx >= total - 1} />

      {/* ── Bottom: counter + thumbnails + copyright ── */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, zIndex:30,
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'0 44px 28px',
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.45s',
      }}>
        <span style={{
          fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.32)',
          marginBottom:'16px',
        }}>
          {total > 0 ? `${String(idx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}` : ''}
        </span>

        {/* Thumbnail strip — center bottom */}
        {total > 1 && (
          <div style={{ display:'flex', gap:'6px', alignItems:'flex-end', marginBottom:'16px' }}>
            {themeWorks.map((w, i) => {
              const isActive = i === idx
              return (
                <div
                  key={w.id}
                  onClick={() => navigate(`/works/${encodeURIComponent(decoded)}/${w.id}`)}
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

      {/* ── Story drawer (slides from right) ── */}
      <div style={{
        position:'absolute', top:0, right:0, bottom:0,
        width:'38%', maxWidth:'480px',
        background:'rgba(17,17,17,0.97)',
        borderLeft:'1px solid rgba(255,255,255,0.07)',
        zIndex:40, overflowY:'auto',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform 0.45s cubic-bezier(0.22,1,0.36,1)',
        padding:'80px 44px 60px',
        display:'flex', flexDirection:'column',
      }}>
        <button onClick={() => setDrawerOpen(false)}
          style={{ alignSelf:'flex-end', background:'none', border:'none',
            color:'rgba(255,255,255,0.3)', fontSize:'11px', letterSpacing:'2px',
            cursor:'pointer', marginBottom:'36px', transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
          ✕ 收起
        </button>

        <p style={{ fontSize:'9px', letterSpacing:'4px', textTransform:'uppercase',
          color:'var(--ocean)', marginBottom:'12px', opacity:0.8 }}>
          {decoded}
        </p>

        <h2 style={{ fontFamily:'var(--serif)', fontWeight:300, fontStyle:'italic',
          fontSize:'clamp(22px,2.2vw,36px)', color:'rgba(255,255,255,0.92)',
          lineHeight:1.2, marginBottom:'28px' }}>
          {work.title}
        </h2>

        {work.story && (
          <p style={{ fontSize:'14px', lineHeight:2.0, color:'rgba(255,255,255,0.52)',
            fontStyle:'italic', marginBottom:'40px',
            borderLeft:'1px solid rgba(255,255,255,0.10)', paddingLeft:'20px' }}>
            {work.story}
          </p>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {[
            { label:'Body',  value: work.body_part },
            { label:'Size',  value: work.size_cm },
            { label:'Date',  value: work.date },
          ].filter(d => d.value).map(d => (
            <div key={d.label} style={{ display:'flex', alignItems:'baseline', gap:'16px',
              borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'12px 0' }}>
              <span style={{ fontSize:'9px', letterSpacing:'2.5px', textTransform:'uppercase',
                color:'rgba(255,255,255,0.22)', width:'44px', flexShrink:0 }}>{d.label}</span>
              <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.58)',
                letterSpacing:'0.5px' }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
