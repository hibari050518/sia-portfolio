import { Link } from 'react-router-dom'
import { WIX_URL } from '../config'

// 暫用 R2 示範圖，之後換成你選的作品
const HERO_IMAGE = 'https://pub-3710d2f605bf433c8902b146670ddf3d.r2.dev/IMG_0784.jpg'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>

      {/* 左側：文字區 */}
      <div style={{
        flex: '0 0 50%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '80px 60px 80px 64px',
        position: 'relative', zIndex: 1,
      }}>
        <p style={{
          fontSize: '9px', letterSpacing: '5px', textTransform: 'uppercase',
          color: 'var(--ocean)', marginBottom: '28px', opacity: 0.9,
        }}>
          靈性刺青師 · Spiritual Tattoo Artist
        </p>

        <h1 style={{
          fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic',
          fontSize: 'clamp(34px, 3.8vw, 58px)', lineHeight: 1.25,
          color: 'var(--text-primary)', marginBottom: '28px', letterSpacing: '-0.5px',
        }}>
          以針為筆，<br />在皮膚上<br />刻下故事。
        </h1>

        <p style={{
          fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 2.1,
          maxWidth: '320px', marginBottom: '64px', letterSpacing: '0.5px',
        }}>
          每一件作品都是一段對話，<br />
          和時間、和記憶、和你身體的對話。
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '200px' }}>
          <Link to="/works" style={linkStyle('var(--gold)')}
            onMouseEnter={e => hoverIn(e, 'var(--gold)')}
            onMouseLeave={e => hoverOut(e, 'var(--gold)')}>
            瀏覽作品 →
          </Link>
          <Link to="/flash" style={linkStyle('var(--ocean)')}
            onMouseEnter={e => hoverIn(e, 'var(--ocean)')}
            onMouseLeave={e => hoverOut(e, 'var(--ocean)')}>
            認領圖 →
          </Link>
        </div>

        {/* 底部署名 */}
        <div style={{
          position: 'absolute', bottom: '40px', left: '64px',
          fontSize: '9px', letterSpacing: '4px', color: 'var(--text-dim)',
          textTransform: 'uppercase',
        }}>
          S I A
        </div>
      </div>

      {/* 右側：作品大圖 */}
      <div style={{
        flex: '0 0 50%', position: 'relative', overflow: 'hidden',
      }}>
        {/* 左側漸層遮罩，讓圖片自然融入背景 */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to right, var(--bg) 0%, transparent 20%)',
        }} />
        {/* 底部漸層 */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to top, var(--bg) 0%, transparent 30%)',
        }} />
        <img
          src={HERO_IMAGE}
          alt="Sia Tattooist 作品"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            objectPosition: 'center',
            filter: 'brightness(0.75) contrast(1.05)',
            transform: 'scale(1.02)',
          }}
        />
      </div>

      {/* 右上導覽 */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 40px',
        background: 'linear-gradient(to bottom, rgba(14,26,30,0.9) 0%, transparent 100%)',
        backdropFilter: 'blur(8px)',
      }}>
        <Link to="/" style={{ fontSize: '11px', letterSpacing: '5px', color: 'var(--text-primary)' }}>
          S I A
        </Link>
        <div style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
          <Link to="/works" style={{ fontSize: '9px', letterSpacing: '4px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>作品</Link>
          <Link to="/flash" style={{ fontSize: '9px', letterSpacing: '4px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>認領圖</Link>
          <a href={WIX_URL} target="_blank" rel="noreferrer"
            style={{ fontSize: '9px', letterSpacing: '4px', color: 'var(--warm)', textTransform: 'uppercase' }}>
            ↗ 主站
          </a>
        </div>
      </nav>

    </div>
  )
}

function linkStyle(color) {
  return {
    display: 'block', padding: '11px 0',
    borderBottom: `1px solid ${color}`,
    color, fontFamily: 'var(--serif)',
    fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase',
    transition: 'all 0.3s', opacity: 0.85,
  }
}
function hoverIn(e, color) {
  e.currentTarget.style.opacity = '1'
  e.currentTarget.style.letterSpacing = '5px'
}
function hoverOut(e, color) {
  e.currentTarget.style.opacity = '0.85'
  e.currentTarget.style.letterSpacing = '4px'
}
