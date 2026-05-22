import { LINE_ID } from '../config'

export default function LineButton({ prefill, title }) {
  const msg = prefill?.trim() || `我想詢問「${title}」的認領`
  const url = `https://line.me/R/oaMessage/${LINE_ID}/?${encodeURIComponent(msg)}`

  return (
    <div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          padding: '12px 28px',
          border: '1px solid var(--warm)',
          color: 'var(--warm)',
          fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase',
          fontFamily: 'var(--serif)',
          transition: 'all 0.25s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--warm)'
          e.currentTarget.style.color = 'var(--bg)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--warm)'
        }}
      >
        LINE 詢問認領 →
      </a>
      <p style={{
        marginTop: '12px', fontSize: '10px',
        color: 'var(--text-dim)', fontStyle: 'italic', lineHeight: 1.8,
      }}>
        ⚠ 認領前需先抽卡確認緣分，部分作品需神明同意，請透過 LINE 詢問。
      </p>
    </div>
  )
}
