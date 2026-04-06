import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useBooking } from '../contexts/BookingContext'
import './AuthPanel.css'

const TABS = [
  { id: 'login',    label: 'Inloggen' },
  { id: 'register', label: 'Registreren' },
  { id: 'admin',    label: 'Admin' },
]

export default function AuthPanel({ onClose }) {
  const [tab, setTab] = useState('login')
  // Login fields
  const [loginEmail, setLoginEmail]       = useState('')
  const [loginPw, setLoginPw]             = useState('')
  // Register fields
  const [naam, setNaam]                   = useState('')
  const [regEmail, setRegEmail]           = useState('')
  const [regEmail2, setRegEmail2]         = useState('')
  const [regPw, setRegPw]                 = useState('')
  const [regPw2, setRegPw2]               = useState('')
  // Admin
  const [adminPw, setAdminPw]             = useState('')

  const [msg, setMsg]     = useState(null)   // { type: 'error'|'success', text }
  const [loading, setLoading] = useState(false)

  const { user, isAdmin, login, register, adminLogin, logout, adminLogout } = useAuth()
  const { openBooking } = useBooking()

  function switchTab(t) { setTab(t); setMsg(null) }

  function handleLogin(e) {
    e.preventDefault()
    const res = login(loginEmail, loginPw)
    if (res.error) setMsg({ type: 'error', text: res.error })
    else setTimeout(onClose, 700)
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (regEmail !== regEmail2) return setMsg({ type: 'error', text: 'E-mailadressen komen niet overeen.' })
    if (regPw !== regPw2)       return setMsg({ type: 'error', text: 'Wachtwoorden komen niet overeen.' })
    const res = await register(naam, regEmail, regPw)
    if (res.error) setMsg({ type: 'error', text: res.error })
    else { setMsg({ type: 'success', text: 'Account aangemaakt! Welkom bij Haven Salon.' }); setTimeout(onClose, 1400) }
  }

  async function handleAdminLogin(e) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const res = await adminLogin(adminPw)
    setLoading(false)
    if (res.error) setMsg({ type: 'error', text: res.error })
    else { setMsg({ type: 'success', text: 'Welkom, admin!' }); setTimeout(onClose, 900) }
  }

  function bookAndClose() { onClose(); openBooking() }

  return (
    <div className="ap-overlay" onClick={onClose}>
      <div className="ap-modal" onClick={e => e.stopPropagation()}>

        {/* Gold accent bar */}
        <div className="ap-accent" />

        <button className="ap-close" onClick={onClose} aria-label="Sluiten">✕</button>

        {/* Brand */}
        <div className="ap-brand">
          <span className="ap-brand-name">Haven Salon</span>
          <span className="ap-brand-sub">Volendam</span>
        </div>

        {/* ─── Logged in as regular user ─────────────────────────── */}
        {user && tab !== 'admin' && (
          <div className="ap-logged">
            <div className="ap-avatar">{user.naam?.[0]?.toUpperCase()}</div>
            <p className="ap-welcome-name">{user.naam}</p>
            <p className="ap-welcome-email">{user.email}</p>

            <button className="ap-book-btn" onClick={bookAndClose}>
              <span className="ap-book-icon">✂</span>
              Afspraak maken
            </button>

            <div className="ap-actions-row">
              <button className="ap-link-btn" onClick={() => { logout(); onClose() }}>Uitloggen</button>
              {!isAdmin && (
                <button className="ap-link-btn" onClick={() => switchTab('admin')}>Admin →</button>
              )}
            </div>
          </div>
        )}

        {/* ─── Admin logged in ────────────────────────────────────── */}
        {isAdmin && tab === 'admin' && (
          <div className="ap-logged">
            <div className="ap-avatar ap-avatar--admin">⚙</div>
            <p className="ap-welcome-name">Admin</p>
            <p className="ap-welcome-email">
              Gebruik het ⚙-icoon in de navigatiebalk om de website te beheren.
            </p>
            <button className="ap-book-btn" onClick={bookAndClose}>
              <span className="ap-book-icon">✂</span>
              Afspraak maken
            </button>
            <button className="ap-link-btn" onClick={() => { adminLogout(); onClose() }}>
              Admin uitloggen
            </button>
          </div>
        )}

        {/* ─── Not logged in / Admin login tab ───────────────────── */}
        {(!user || tab === 'admin') && !(isAdmin && tab === 'admin') && (
          <>
            {/* Tab bar */}
            <div className="ap-tabs">
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`ap-tab ${tab === t.id ? 'active' : ''}`}
                  onClick={() => switchTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {msg && <div className={`ap-msg ap-msg--${msg.type}`}>{msg.text}</div>}

            {/* ── Inloggen ── */}
            {tab === 'login' && (
              <form className="ap-form" onSubmit={handleLogin}>
                <div className="ap-field">
                  <label>E-mailadres</label>
                  <input type="email" placeholder="jouw@email.nl"
                    value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                </div>
                <div className="ap-field">
                  <label>Wachtwoord</label>
                  <input type="password" placeholder="••••••••"
                    value={loginPw} onChange={e => setLoginPw(e.target.value)} required />
                </div>
                <button type="submit" className="ap-submit">Inloggen</button>
                <p className="ap-switch">
                  Nog geen account?{' '}
                  <span onClick={() => switchTab('register')}>Registreren</span>
                </p>
              </form>
            )}

            {/* ── Registreren ── */}
            {tab === 'register' && (
              <form className="ap-form" onSubmit={handleRegister}>
                <div className="ap-field">
                  <label>Volledige naam</label>
                  <input type="text" placeholder="Jan de Vries"
                    value={naam} onChange={e => setNaam(e.target.value)} required />
                </div>
                <div className="ap-field-row">
                  <div className="ap-field">
                    <label>E-mailadres</label>
                    <input type="email" placeholder="jouw@email.nl"
                      value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                  </div>
                  <div className="ap-field">
                    <label>Bevestig e-mail</label>
                    <input type="email" placeholder="jouw@email.nl"
                      value={regEmail2} onChange={e => setRegEmail2(e.target.value)} required />
                  </div>
                </div>
                <div className="ap-field-row">
                  <div className="ap-field">
                    <label>Wachtwoord</label>
                    <input type="password" placeholder="Min. 6 tekens"
                      value={regPw} onChange={e => setRegPw(e.target.value)} minLength={6} required />
                  </div>
                  <div className="ap-field">
                    <label>Bevestig wachtwoord</label>
                    <input type="password" placeholder="Min. 6 tekens"
                      value={regPw2} onChange={e => setRegPw2(e.target.value)} minLength={6} required />
                  </div>
                </div>
                <button type="submit" className="ap-submit">Account aanmaken</button>
                <p className="ap-switch">
                  Al een account?{' '}
                  <span onClick={() => switchTab('login')}>Inloggen</span>
                </p>
              </form>
            )}

            {/* ── Admin ── */}
            {tab === 'admin' && (
              <form className="ap-form" onSubmit={handleAdminLogin}>
                <p className="ap-admin-note">
                  Alleen voor de beheerder van Haven Salon.
                </p>
                <div className="ap-field">
                  <label>Admin wachtwoord</label>
                  <input type="password" placeholder="••••••••"
                    value={adminPw} onChange={e => setAdminPw(e.target.value)} required />
                </div>
                <button type="submit" className="ap-submit" disabled={loading}>
                  {loading ? 'Controleren…' : 'Inloggen als admin'}
                </button>
              </form>
            )}
          </>
        )}

        {/* Bottom booking strip (not shown when already logged in) */}
        {!user && tab !== 'admin' && (
          <div className="ap-booking-strip">
            <span>Of boek direct zonder account</span>
            <button className="ap-strip-btn" onClick={bookAndClose}>Afspraak maken →</button>
          </div>
        )}
      </div>
    </div>
  )
}
