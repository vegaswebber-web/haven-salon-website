import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './AdminWidget.css'

export default function AdminWidget({ onClose }) {
  const { siteStatus, setRemoteStatus, adminLogout, getUsers, deleteUser: ctxDelete } = useAuth()
  const [loading, setLoading] = useState(null)
  const [msg, setMsg] = useState(null)
  const [tab, setTab] = useState('status')
  const [users, setUsers] = useState(() => getUsers())

  async function handleSetStatus(status) {
    setLoading(status)
    setMsg(null)
    await setRemoteStatus(status)
    setLoading(null)
    setMsg(status === 'open' ? 'Website staat nu op OPEN!' : 'Website staat nu op BINNEN KORT.')
  }

  function deleteUser(email) {
    ctxDelete(email)
    setUsers(prev => prev.filter(u => u.email !== email))
  }

  return (
    <div className="aw-overlay" onClick={onClose}>
      <div className="aw-box" onClick={e => e.stopPropagation()}>
        <div className="aw-header">
          <span className="aw-title">⚙ Admin beheer</span>
          <button className="aw-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="aw-tabs">
          <button className={`aw-tab ${tab === 'status' ? 'active' : ''}`} onClick={() => setTab('status')}>
            Website
          </button>
          <button className={`aw-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            Gebruikers {users.length > 0 && <span className="aw-tab-count">{users.length}</span>}
          </button>
        </div>

        {/* ── Status tab ── */}
        {tab === 'status' && (
          <>
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
          </>
        )}

        {/* ── Users tab ── */}
        {tab === 'users' && (
          <div className="aw-users">
            {users.length === 0 ? (
              <p className="aw-users-empty">Nog geen geregistreerde gebruikers.</p>
            ) : (
              <div className="aw-users-list">
                {users.map(u => (
                  <div key={u.email} className="aw-user-row">
                    <div className="aw-user-avatar">{u.naam?.[0]?.toUpperCase()}</div>
                    <div className="aw-user-info">
                      <span className="aw-user-naam">{u.naam}</span>
                      <span className="aw-user-email">{u.email}</span>
                      {u.password && (
                        <span className="aw-user-pw">🔑 {u.password}</span>
                      )}
                    </div>
                    <button
                      className="aw-user-delete"
                      onClick={() => deleteUser(u.email)}
                      title="Gebruiker verwijderen"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button className="aw-logout" onClick={() => { adminLogout(); onClose() }}>
          Admin uitloggen
        </button>
      </div>
    </div>
  )
}
