import { Link } from 'react-router-dom'
import PageWrapper from '../components/PageWrapper'
import { WIX_URL } from '../config'

const btn = (color) => ({
  display: 'inline-block', padding: '13px 30px', borderRadius: '2px',
  border: `1px solid ${color}`, color, fontFamily: 'var(--serif)',
  fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase',
  transition: 'all 0.25s',
})

export default function Home() {
  return (
    <PageWrapper>
      <section style={{
        minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 40px',
        maxWidth: '880px', margin: '0 auto',
      }} className="page-pad">
        <p style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase',
          color: 'var(--ocean)', marginBottom: '18px' }}>
          靈性刺青師 · Spiritual Tattoo Artist
        </p>
        <h1 style={{
          fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic',
          fontSize: 'clamp(38px, 6vw, 68px)', lineHeight: 1.2,
          color: 'var(--text-primary)', marginBottom: '24px',
        }}>
          以針為筆，<br />在皮膚上刻下故事。
        </h1>
        <p style={{
          fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.9,
          maxWidth: '440px', marginBottom: '56px', letterSpacing: '0.3px',
        }}>
          每一件作品都是一段對話，<br />和時間、和記憶、和你身體的對話。
        </p>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <Link to="/works"
            style={btn('var(--gold)')}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--bg)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gold)' }}
          >瀏覽作品 →</Link>
          <Link to="/flash"
            style={btn('var(--border)')}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ocean)'; e.currentTarget.style.color = 'var(--ocean)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >認領圖 →</Link>
        </div>
      </section>
    </PageWrapper>
  )
}
