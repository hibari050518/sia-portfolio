export default function FilterBar({ parts, active, onChange }) {
  const all = ['全部', ...parts]
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
      {all.map(part => {
        const on = (active === null && part === '全部') || active === part
        return (
          <button key={part}
            onClick={() => onChange(part === '全部' ? null : part)}
            style={{
              padding: '6px 14px', borderRadius: '2px',
              border: `1px solid ${on ? 'var(--ocean)' : 'var(--border)'}`,
              background: on ? 'rgba(74,143,160,0.1)' : 'transparent',
              color: on ? 'var(--ocean)' : 'var(--text-dim)',
              fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
              fontFamily: 'var(--serif)', cursor: 'pointer', transition: 'all 0.2s',
            }}>
            {part}
          </button>
        )
      })}
    </div>
  )
}
