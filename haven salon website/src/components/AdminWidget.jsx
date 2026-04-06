import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './AdminWidget.css'

export default function AdminWidget({ onClose }) {
  const { siteStatus, setRemoteStatus, adminLogout } = useAuth()
  const [loading, setLoading] = useState(null) // 'open' | 'coming_soon' | null
  const [msg, setMsg] = useState(null)

  async function handleSetStatus(status) {
    setLoading(status)
    setMsg(null)
    await setRemoteStatus(status)
    setLoading(null)
    setMsg(status === 'open' ? 'Website staat nu op OPEN!' : 'Website staat nu op BINNEN KORT.')
  }

  return (
    <div className="aw-overlay" onClick={onClose}>
      <div className="aw-box" onClick={e => e.stopPropagation()}>
        <div className="aw-header">
          <span className="aw-title">⚙ Admin beheer</span>
          <button className="aw-close" onClick={onClose}>✕</button>
        </div>

        {/* Status row */}
        <div className="aw-status-row">
          <span className="aw-label">Website status</span>
          {siteStatus ? (
            <span className={`aw-badge ${siteStatus}`}>
              {siteStatus === 'open' ? '🟢 Open' : '🟡 Binnen Kort'}
            </span>
          ) : (
            <span className="aw-badge loading">⏳ Laden…</span>
          )}
        </div>

        {msg && (
          <div className={`aw-msg ${msg.includes('OPEN') ? 'success' : 'warning'}`}>
            {msg}
          </div>
        )}

        {/* Thema Veranderen */}
        <div className="aw-section">
          <span className="aw-section-label">Thema Veranderen</span>
          <div className="aw-theme-btns">
            <button
              className={`aw-theme-btn success ${siteStatus === 'open' ? 'active' : ''}`}
              onClick={() => handleSetStatus('open')}
              disabled={loading !== null || siteStatus === 'open'}
            >
              {loading === 'open' ? 'Bezig…' : '🟢 Open'}
            </button>
            <button
              className={`aw-theme-btn warning ${siteStatus === 'coming_soon' ? 'active' : ''}`}
              onClick={() => handleSetStatus('coming_soon')}
              disabled={loading !== null || siteStatus === 'coming_soon'}
            >
              {loading === 'coming_soon' ? 'Bezig…' : '🟡 Binnen Kort'}
            </button>
          </div>
          <p className="aw-theme-note">
            {siteStatus === 'open'
              ? 'Website is zichtbaar voor bezoekers.'
              : 'Alleen de "Binnen Kort" pagina is zichtbaar.'}
          </p>
        </div>

        <div className="aw-info">
          <a href="/?preview=1" target="_blank" className="aw-preview">
            Website voorvertonen ↗
          </a>
        </div>

        <button className="aw-logout" onClick={() => { adminLogout(); onClose() }}>
          Admin uitloggen
        </button>
      </div>
    </div>
  )
}
