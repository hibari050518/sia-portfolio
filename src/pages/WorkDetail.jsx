import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWorks } from '../hooks/useSheets'
import { WIX_URL } from '../config'

const BG = '#111'

function NavLink({ to, zh, en }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={to}
      style={{ fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase',
        color: hov ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
        transition:'color 0.25s' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      {hov ? en : zh}
    </Link>
  )
}

export default function WorkDetail() {
  const { theme, id } = useParams()
  const decoded = decodeURIComponent(theme)
  const { works, loading } = useWorks()
  const [navIn,  setNavIn]  = useState(false)
  const [bodyIn, setBodyIn] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setNavIn(true),  200)
    const t2 = setTimeout(() => setBodyIn(true), 450)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [id])

  const themeWorks = works.filter(w => w.theme === decoded)
  const work = works.find(w => w.id === id)
  const idx  = themeWorks.findIndex(w => w.id === id)
  const prev = idx > 0 ? themeWorks[idx - 1] : null
  const next = idx < themeWorks.length - 1 ? themeWorks[idx + 1] : null

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'11px', letterSpacing:'4px' }}>loading</p>
    </div>
  )

  if (!work) return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <Link to="/works" style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px', letterSpacing:'3px' }}>← Back</Link>
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── Nav ── */}
      <nav style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'28px 44px', flexShrink:0, position:'relative', zIndex:10,
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
            style={{ fontSize:'12px', letterSpacing:'2px', color:'var(--warm)' }}>
            預約 ↗
          </a>
        </div>
      </nav>

      {/* ── Body: left image | right info ── */}
      <div style={{
        flex:1, display:'flex', overflow:'hidden',
        opacity: bodyIn ? 1 : 0,
        transform: bodyIn ? 'translateY(0)' : 'translateY(12px)',
        transition:'opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* Left images */}
        <div style={{ flex:'0 0 60%', position:'relative', overflow:'hidden' }}>
          <div style={{ height:'100%', display:'flex', gap:'2px' }}>
            <div style={{ flex: work.image_url_2 ? '0 0 64%' : '1', height:'100%', overflow:'hidden' }}>
              {work.image_url
                ? <img src={work.image_url} alt={work.title}
                    style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
                : <div style={{ width:'100%', height:'100%', background:'rgba(255,255,255,0.04)' }} />
              }
            </div>
            {work.image_url_2 && (
              <div style={{ flex:1, height:'100%', overflow:'hidden' }}>
                <img src={work.image_url_2} alt={`${work.title} detail`}
                  style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }} />
              </div>
            )}
          </div>
          {/* Right-side fade into bg */}
          <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'35%',
            background:`linear-gradient(to right, transparent, ${BG})`, pointerEvents:'none' }} />
        </div>

        {/* Right info */}
        <div style={{
          flex:'0 0 40%', padding:'0 56px 0 32px',
          display:'flex', flexDirection:'column', justifyContent:'center',
          overflowY:'auto',
        }}>
          {/* Close / back */}
          <Link to={`/works/${encodeURIComponent(decoded)}`}
            style={{ fontSize:'10px', letterSpacing:'3px', textTransform:'uppercase',
              color:'rgba(255,255,255,0.28)', marginBottom:'40px', display:'inline-block',
              transition:'color 0.2s', alignSelf:'flex-start' }}
            onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.28)'}>
            ← Close
          </Link>

          {/* Theme */}
          <p style={{ fontSize:'10px', letterSpacing:'4px', textTransform:'uppercase',
            color:'var(--ocean)', marginBottom:'14px', opacity:0.85 }}>
            {decoded}
          </p>

          {/* Title */}
          <h1 style={{ fontFamily:'var(--serif)', fontWeight:300, fontStyle:'italic',
            fontSize:'clamp(26px, 3vw, 46px)', color:'rgba(255,255,255,0.92)',
            lineHeight:1.15, marginBottom:'36px' }}>
            {work.title}
          </h1>

          {/* Story */}
          {work.story && (
            <p style={{ fontSize:'14px', lineHeight:1.95, color:'rgba(255,255,255,0.52)',
              fontStyle:'italic', marginBottom:'44px',
              borderLeft:'1px solid rgba(255,255,255,0.10)', paddingLeft:'20px' }}>
              {work.story}
            </p>
          )}

          {/* Details */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
            {[
              { label:'Body',  value: work.body_part },
              { label:'Size',  value: work.size_cm },
              { label:'Date',  value: work.date },
            ].filter(d => d.value).map(d => (
              <div key={d.label} style={{ display:'flex', alignItems:'baseline', gap:'16px',
                borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'12px 0' }}>
                <span style={{ fontSize:'9px', letterSpacing:'2.5px', textTransform:'uppercase',
                  color:'rgba(255,255,255,0.22)', width:'48px', flexShrink:0 }}>{d.label}</span>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.58)',
                  letterSpacing:'0.5px' }}>{d.value}</span>
              </div>
            ))}
          </div>

          {/* Prev / Next */}
          {(prev || next) && (
            <div style={{ display:'flex', justifyContent:'space-between',
              marginTop:'48px', paddingTop:'20px',
              borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              {prev
                ? <Link to={`/works/${encodeURIComponent(decoded)}/${prev.id}`}
                    style={{ fontSize:'10px', letterSpacing:'2px',
                      color:'rgba(255,255,255,0.28)', transition:'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.28)'}>
                    ← Prev
                  </Link>
                : <span />}
              {next
                ? <Link to={`/works/${encodeURIComponent(decoded)}/${next.id}`}
                    style={{ fontSize:'10px', letterSpacing:'2px',
                      color:'rgba(255,255,255,0.28)', transition:'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.28)'}>
                    Next →
                  </Link>
                : <span />}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer counter ── */}
      <div style={{
        padding:'18px 44px', display:'flex', justifyContent:'space-between',
        flexShrink:0, position:'relative', zIndex:10,
        opacity: navIn ? 1 : 0, transition:'opacity 0.8s ease 0.5s',
      }}>
        <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.18)' }}>
          {idx >= 0
            ? `${String(idx + 1).padStart(2, '0')} / ${String(themeWorks.length).padStart(2, '0')}`
            : ''}
        </span>
        <span style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.18)' }}>
          © SIA TATTOOIST
        </span>
      </div>
    </div>
  )
}
