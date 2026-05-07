import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './AdminPage.css'

// ── Admin Login ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [key, setKey] = useState('')
  const [err, setErr] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const res = onLogin(key)
    if (res.error) setErr(res.error)
  }

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-card">
        <div className="adm-login-brand">
          <span className="adm-login-name">Haven Salon</span>
          <span className="adm-login-sub">Beheer</span>
        </div>
        {err && <div className="adm-msg adm-msg--error">{err}</div>}
        <form className="adm-login-form" onSubmit={handleSubmit}>
          <div className="adm-field">
            <label>Toegangscode</label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="••••••••••••"
              required autoFocus
            />
          </div>
          <button type="submit" className="adm-btn-primary">Toegang</button>
        </form>
      </div>
    </div>
  )
}

// ── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const { adminGetUsers, adminResetPassword, adminToggleUser, adminUpdateUser, deleteUser } = useAuth()
  const [users, setUsers] = useState(() => adminGetUsers())
  const [resetTarget, setResetTarget] = useState(null)
  const [newPw, setNewPw] = useState('')
  const [editTarget, setEditTarget] = useState(null)
  const [editNaam, setEditNaam] = useState('')
  const [msg, setMsg] = useState(null)

  function refresh() { setUsers(adminGetUsers()) }

  function setOk(t) { setMsg({ type: 'success', text: t }); setTimeout(() => setMsg(null), 3000) }
  function setErr(t) { setMsg({ type: 'error', text: t }) }

  async function handleReset(e) {
    e.preventDefault()
    if (!newPw) return
    const res = await adminResetPassword(resetTarget.email, newPw)
    if (res.error) setErr(res.error)
    else { setOk(`Wachtwoord van ${resetTarget.naam || resetTarget.email} opnieuw ingesteld.`); setResetTarget(null); setNewPw('') }
  }

  function handleToggle(email) {
    adminToggleUser(email)
    refresh()
  }

  function handleDelete(email) {
    if (!window.confirm(`Account van ${email} permanent verwijderen?`)) return
    deleteUser(email); refresh()
    setOk('Account verwijderd.')
  }

  function handleEditSave(e) {
    e.preventDefault()
    adminUpdateUser(editTarget.email, { naam: editNaam })
    refresh(); setEditTarget(null)
    setOk('Naam bijgewerkt.')
  }

  return (
    <div className="adm-tab-content">
      <div className="adm-section-head">
        <span className="adm-section-title">Gebruikers ({users.length})</span>
      </div>

      {msg && <div className={`adm-msg adm-msg--${msg.type}`}>{msg.text}</div>}

      {/* Reset modal */}
      {resetTarget && (
        <div className="adm-inline-modal">
          <p className="adm-inline-title">Wachtwoord resetten voor <strong>{resetTarget.naam || resetTarget.email}</strong></p>
          <form className="adm-inline-form" onSubmit={handleReset}>
            <input
              type="text"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="Nieuw wachtwoord"
              required autoFocus
            />
            <button type="submit" className="adm-btn-sm adm-btn-gold">Opslaan</button>
            <button type="button" className="adm-btn-sm" onClick={() => setResetTarget(null)}>Annuleren</button>
          </form>
        </div>
      )}

      {/* Edit naam modal */}
      {editTarget && (
        <div className="adm-inline-modal">
          <p className="adm-inline-title">Naam wijzigen voor <strong>{editTarget.email}</strong></p>
          <form className="adm-inline-form" onSubmit={handleEditSave}>
            <input
              type="text"
              value={editNaam}
              onChange={e => setEditNaam(e.target.value)}
              placeholder="Volledige naam"
              required autoFocus
            />
            <button type="submit" className="adm-btn-sm adm-btn-gold">Opslaan</button>
            <button type="button" className="adm-btn-sm" onClick={() => setEditTarget(null)}>Annuleren</button>
          </form>
        </div>
      )}

      {users.length === 0 ? (
        <p className="adm-empty">Geen gebruikers gevonden.</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Naam</th>
                <th>E-mail</th>
                <th>Telefoon</th>
                <th>Status</th>
                <th>Nieuwsbrief</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email} className={u.disabled ? 'adm-row-disabled' : ''}>
                  <td>
                    <span className="adm-user-naam">{u.naam || '—'}</span>
                  </td>
                  <td className="adm-cell-muted">{u.email}</td>
                  <td className="adm-cell-muted">{u.telefoon || '—'}</td>
                  <td>
                    <span className={`adm-badge ${u.disabled ? 'adm-badge--off' : 'adm-badge--on'}`}>
                      {u.disabled ? 'Uitgeschakeld' : 'Actief'}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-badge ${u.nieuwsbrief ? 'adm-badge--on' : ''}`} style={!u.nieuwsbrief ? {color:'var(--text-muted)',border:'none',background:'none',padding:0} : {}}>
                      {u.nieuwsbrief ? 'Ja' : '—'}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-btn-sm" onClick={() => {
                        setEditTarget(u); setEditNaam(u.naam || '')
                      }}>Naam</button>
                      <button className="adm-btn-sm" onClick={() => setResetTarget(u)}>Ww reset</button>
                      <button className="adm-btn-sm" onClick={() => handleToggle(u.email)}>
                        {u.disabled ? 'Activeer' : 'Blokkeer'}
                      </button>
                      <button className="adm-btn-sm adm-btn-danger" onClick={() => handleDelete(u.email)}>
                        Verwijder
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Messages Tab ─────────────────────────────────────────────────────────────
function MessagesTab() {
  const { getContacts, deleteContact } = useAuth()
  const [contacts, setContacts] = useState(() => getContacts())

  function handleDelete(id) {
    deleteContact(id)
    setContacts(getContacts())
  }

  return (
    <div className="adm-tab-content">
      <div className="adm-section-head">
        <span className="adm-section-title">Berichten ({contacts.length})</span>
      </div>
      {contacts.length === 0 ? (
        <p className="adm-empty">Geen berichten.</p>
      ) : (
        <div className="adm-messages">
          {contacts.map(c => (
            <div key={c.id} className="adm-message-card">
              <div className="adm-message-head">
                <span className="adm-message-naam">{c.naam}</span>
                <span className="adm-message-datum">{c.datum}</span>
                <button className="adm-btn-sm adm-btn-danger" onClick={() => handleDelete(c.id)}>
                  Verwijder
                </button>
              </div>
              <div className="adm-message-meta">
                <span>{c.email}</span>
                {c.telefoon && <span>· {c.telefoon}</span>}
              </div>
              <p className="adm-message-body">{c.bericht}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Site Tab ─────────────────────────────────────────────────────────────────
function SiteTab() {
  const { siteStatus, toggleSiteStatus } = useAuth()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    await toggleSiteStatus()
    setLoading(false)
  }

  return (
    <div className="adm-tab-content">
      <div className="adm-section-head">
        <span className="adm-section-title">Site beheer</span>
      </div>
      <div className="adm-site-card">
        <div className="adm-site-row">
          <div>
            <p className="adm-site-label">Huidige status</p>
            <span className={`adm-badge ${siteStatus === 'open' ? 'adm-badge--on' : 'adm-badge--off'}`}>
              {siteStatus === 'open' ? 'Site open' : 'Coming Soon'}
            </span>
          </div>
          <button
            className={`adm-btn-primary ${loading ? 'loading' : ''}`}
            onClick={handleToggle}
            disabled={loading}
          >
            {siteStatus === 'open' ? 'Zet op Coming Soon' : 'Open de site'}
          </button>
        </div>
        <p className="adm-site-note">
          Bij "Coming Soon" zien bezoekers de coming soon pagina. Admins kunnen de site altijd bekijken via <code>?preview=1</code>.
        </p>
      </div>
    </div>
  )
}

// ── Newsletter Tab ───────────────────────────────────────────────────────────
function NieuwsbriefTab() {
  const { adminGetUsers } = useAuth()
  const opted = adminGetUsers().filter(u => u.nieuwsbrief)
  const emails = opted.map(u => u.email).join(', ')

  function copyEmails() {
    navigator.clipboard.writeText(emails).catch(() => {})
  }

  return (
    <div className="adm-tab-content">
      <div className="adm-section-head">
        <span className="adm-section-title">Nieuwsbrief abonnees ({opted.length})</span>
      </div>
      {opted.length === 0 ? (
        <p className="adm-empty">Nog geen abonnees.</p>
      ) : (
        <>
          <div className="adm-nl-actions">
            <button className="adm-btn-sm adm-btn-gold" onClick={copyEmails}>
              Kopieer alle e-mailadressen
            </button>
          </div>
          <div className="adm-table-wrap" style={{ marginTop: 16 }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>E-mail</th>
                </tr>
              </thead>
              <tbody>
                {opted.map(u => (
                  <tr key={u.email}>
                    <td><span className="adm-user-naam">{u.naam || '—'}</span></td>
                    <td className="adm-cell-muted">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main AdminPage ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { isAdmin, adminLogin, adminLogout } = useAuth()
  const [tab, setTab] = useState('gebruikers')

  if (!isAdmin) {
    return <AdminLogin onLogin={adminLogin} />
  }

  return (
    <div className="adm-wrap">
      <header className="adm-header">
        <div className="adm-header-brand">
          <span className="adm-header-name">Haven Salon</span>
          <span className="adm-header-sub">Beheerpaneel</span>
        </div>
        <button className="adm-logout" onClick={adminLogout}>Uitloggen</button>
      </header>

      <div className="adm-nav">
        {[
          { id: 'gebruikers',  label: 'Gebruikers' },
          { id: 'berichten',   label: 'Berichten' },
          { id: 'nieuwsbrief', label: 'Nieuwsbrief' },
          { id: 'site',        label: 'Site' },
        ].map(t => (
          <button
            key={t.id}
            className={`adm-nav-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="adm-main">
        {tab === 'gebruikers'  && <UsersTab />}
        {tab === 'berichten'   && <MessagesTab />}
        {tab === 'nieuwsbrief' && <NieuwsbriefTab />}
        {tab === 'site'        && <SiteTab />}
      </main>
    </div>
  )
}
