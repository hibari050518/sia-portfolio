export default function StatusBadge({ status }) {
  const avail = status === '可認領'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '2px',
      fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase',
      fontFamily: 'var(--serif)',
      background: avail ? 'var(--avail-bg)' : 'rgba(20,30,34,0.7)',
      border: `1px solid ${avail ? 'var(--avail-border)' : 'var(--border-light)'}`,
      color: avail ? 'var(--avail-text)' : 'var(--text-dim)',
    }}>
      {avail && '⟡ '}
      {status}
    </span>
  )
}
