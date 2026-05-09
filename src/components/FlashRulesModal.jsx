import { useEffect } from 'react'

const SECTION_STYLE = {
  fontSize: '10px',
  letterSpacing: '3px',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.28)',
  marginTop: '32px',
  marginBottom: '14px',
}

const BODY_STYLE = {
  fontSize: '13px',
  lineHeight: 2.0,
  color: 'rgba(255,255,255,0.55)',
  margin: 0,
}

export default function FlashRulesModal({ onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.70)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#161616',
          border: '1px solid rgba(255,255,255,0.08)',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '84vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '52px 40px 48px',
          WebkitOverflowScrolling: 'touch',
        }}>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '18px', right: '18px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.30)', fontSize: '16px',
            lineHeight: 1, padding: '6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.30)'}>
          ✕
        </button>

        {/* Title */}
        <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase',
          color: 'var(--ocean)', opacity: 0.75, marginBottom: '12px' }}>
          認領圖
        </p>
        <h2 style={{
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300,
          fontSize: '22px', color: 'rgba(255,255,255,0.88)',
          lineHeight: 1.4, marginBottom: '6px',
        }}>
          認領規則
        </h2>
        <div style={{ width: '28px', height: '1px', background: 'rgba(255,255,255,0.12)', marginBottom: '4px' }} />

        {/* 關於認領圖 */}
        <p style={SECTION_STYLE}>關於認領圖</p>
        <p style={BODY_STYLE}>
          每一幅認領圖，都是我根據靈感自由創作的刺青設計。每一幅只會有一位主人，不會重複販售。
        </p>

        {/* 收費方式 */}
        <p style={SECTION_STYLE}>收費方式</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            '每張認領圖的報價與建議尺寸不同，請截圖想要的作品私訊官方 LINE 詢問',
            '報價為區間價格，實際金額依現場印製尺寸與細節討論後確認',
            '認領成功後，需支付報價的 50% 作為訂金',
            '付款起三天內可免費取消；超過三天取消將酌收【最低報價的 10%】手續費；預約當日取消，訂金不退',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.18)', flexShrink: 0, paddingTop: '1px' }}>—</span>
              <span style={BODY_STYLE}>{item}</span>
            </div>
          ))}
        </div>

        {/* 認領流程 */}
        <p style={SECTION_STYLE}>認領流程</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            '私訊後確認認領，會請你填寫認領圖表單',
            '完成匯款，夏子會與你確認預約時間與地點',
            '收到【預約時間 & 地點確認】才算預約完成',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '13px', color: 'var(--ocean)', opacity: 0.75, flexShrink: 0, paddingTop: '2px' }}>
                {['①', '②', '③'][i]}
              </span>
              <span style={BODY_STYLE}>{item}</span>
            </div>
          ))}
        </div>

        {/* 時間須知 */}
        <p style={SECTION_STYLE}>時間須知</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            '認領後尚未確定刺青時間，可付訂保留半年；逾期圖案將自動釋出（不另行通知）',
            '每筆預約僅限改期一次，請於一週前提出',
            '臨時取消者，改期第二次將酌收全額為時間訂金',
            '無故未到店，將暫停提供後續服務',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.18)', flexShrink: 0, paddingTop: '1px' }}>—</span>
              <span style={BODY_STYLE}>{item}</span>
            </div>
          ))}
        </div>

        {/* Q&A */}
        <p style={SECTION_STYLE}>Q&A</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {[
            {
              q: '認領圖可以調整尺寸嗎？',
              a: '每個設計都有最適合的尺寸。若需調整可在私訊時告知，尺寸變動可能影響報價。',
            },
            {
              q: '我想微調局部設計可以嗎？',
              a: '可以，會在私訊時初步確認想法。若修改幅度超出微調範圍，將轉為客製設計服務，報價也會隨之調整。',
            },
          ].map((qa, i) => (
            <div key={i}>
              <p style={{ ...BODY_STYLE, color: 'rgba(255,255,255,0.70)', marginBottom: '6px' }}>
                <span style={{ color: 'var(--ocean)', opacity: 0.80, marginRight: '10px', fontStyle: 'italic',
                  fontFamily: 'var(--serif)' }}>Q</span>
                {qa.q}
              </p>
              <p style={{ ...BODY_STYLE, paddingLeft: '22px' }}>
                <span style={{ color: 'rgba(255,255,255,0.20)', marginRight: '10px' }}>A</span>
                {qa.a}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
