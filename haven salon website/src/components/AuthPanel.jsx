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

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginStep, setLoginStep]   = useState('email')   // 'email' | 'otp'
  const [loginOtp, setLoginOtp]     = useState('')

  // Register
  const [naam, setNaam]           = useState('')
  const [regEmail, setRegEmail]   = useState('')
  const [regStep, setRegStep]     = useState('form')   // 'form' | 'otp'
  const [regOtp, setRegOtp]       = useState('')

  // Admin
  const [adminPw, setAdminPw] = useState('')

  const [msg, setMsg]         = useState(null)    // { type: 'error'|'success', text }
  const [loading, setLoading] = useState(false)

  const { user, isAdmin, requestLoginOtp, requestRegisterOtp, verifyOtp, adminLogin, logout, adminLogout } = useAuth()
  const { openBooking } = useBooking()

  function switchTab(t) {
    setTab(t)
    setMsg(null)
    setLoginStep('email')
    setRegStep('form')
    setLoginOtp('')
    setRegOtp('')
  }

  // ── LOGIN: stap 1 — e-mailadres invullen ──────────────────────────────────
  async function handleLoginRequest(e) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const res = await requestLoginOtp(loginEmail)
    setLoading(false)
    if (res.error) {
      setMsg({ type: 'error', text: res.error })
    } else {
      setLoginStep('otp')
      setMsg({ type: 'success', text: `Code verstuurd naar ${loginEmail}. Controleer uw inbox.` })
    }
  }

  // ── LOGIN: stap 2 — code invoeren ─────────────────────────────────────────
  function handleLoginVerify(e) {
    e.preventDefault()
    const res = verifyOtp(loginEmail, loginOtp)
    if (res.error) {
      setMsg({ type: 'error', text: res.error })
    } else {
      setMsg({ type: 'success', text: 'Ingelogd! Welkom terug.' })
      setTimeout(onClose, 900)
    }
  }

  // ── REGISTER: stap 1 — naam + e-mail ─────────────────────────────────────
  async function handleRegisterRequest(e) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const res = await requestRegisterOtp(naam, regEmail)
    setLoading(false)
    if (res.error) {
      setMsg({ type: 'error', text: res.error })
    } else {
      setRegStep('otp')
      setMsg({ type: 'success', text: `Code verstuurd naar ${regEmail}. Controleer uw inbox.` })
    }
  }

  // ── REGISTER: stap 2 — code invoeren ─────────────────────────────────────
  function handleRegisterVerify(e) {
    e.preventDefault()
    const res = verifyOtp(regEmail, regOtp)
    if (res.error) {
      setMsg({ type: 'error', text: res.error })
    } else {
      setMsg({ type: 'success', text: 'Account aangemaakt! Welkom bij Haven Salon.' })
      setTimeout(onClose, 1200)
    }
  }

  // ── ADMIN ─────────────────────────────────────────────────────────────────
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

        <div className="ap-accent" />
        <button className="ap-close" onClick={onClose} aria-label="Sluiten">✕</button>

        <div className="ap-brand">
          <span className="ap-brand-name">Haven Salon</span>
          <span className="ap-brand-sub">Volendam</span>
        </div>

        {/* ─── Ingelogd als gewone gebruiker ─────────────────────────────── */}
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

        {/* ─── Admin ingelogd ─────────────────────────────────────────────── */}
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

        {/* ─── Niet ingelogd ──────────────────────────────────────────────── */}
        {(!user || tab === 'admin') && !(isAdmin && tab === 'admin') && (
          <>
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
            {tab === 'login' && loginStep === 'email' && (
              <form className="ap-form" onSubmit={handleLoginRequest}>
                <div className="ap-field">
                  <label>E-mailadres</label>
                  <input
                    type="email"
                    placeholder="jouw@email.nl"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="ap-submit" disabled={loading}>
                  {loading ? 'Versturen…' : 'Stuur inlogcode'}
                </button>
                <p className="ap-switch">
                  Nog geen account?{' '}
                  <span onClick={() => switchTab('register')}>Registreren</span>
                </p>
                <p className="ap-forgot" onClick={() => setMsg({ type: 'success', text: 'Geen wachtwoord nodig! Vul uw e-mailadres in en u ontvangt een inlogcode per e-mail.' })}>
                  Wachtwoord vergeten?
                </p>
              </form>
            )}

            {tab === 'login' && loginStep === 'otp' && (
              <form className="ap-form" onSubmit={handleLoginVerify}>
                <div className="ap-field">
                  <label>Inlogcode (6 cijfers)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    value={loginOtp}
                    onChange={e => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="ap-submit">Bevestigen</button>
                <p className="ap-switch">
                  Geen code ontvangen?{' '}
                  <span onClick={() => { setLoginStep('email'); setMsg(null) }}>Opnieuw versturen</span>
                </p>
              </form>
            )}

            {/* ── Registreren ── */}
            {tab === 'register' && regStep === 'form' && (
              <form className="ap-form" onSubmit={handleRegisterRequest}>
                <div className="ap-field">
                  <label>Volledige naam</label>
                  <input
                    type="text"
                    placeholder="Jan de Vries"
                    value={naam}
                    onChange={e => setNaam(e.target.value)}
                    required
                  />
                </div>
                <div className="ap-field">
                  <label>E-mailadres</label>
                  <input
                    type="email"
                    placeholder="jouw@email.nl"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="ap-submit" disabled={loading}>
                  {loading ? 'Versturen…' : 'Stuur bevestigingscode'}
                </button>
                <p className="ap-switch">
                  Al een account?{' '}
                  <span onClick={() => switchTab('login')}>Inloggen</span>
                </p>
              </form>
            )}

            {tab === 'register' && regStep === 'otp' && (
              <form className="ap-form" onSubmit={handleRegisterVerify}>
                <div className="ap-field">
                  <label>Bevestigingscode (6 cijfers)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    value={regOtp}
                    onChange={e => setRegOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="ap-submit">Account aanmaken</button>
                <p className="ap-switch">
                  Geen code ontvangen?{' '}
                  <span onClick={() => { setRegStep('form'); setMsg(null) }}>Opnieuw proberen</span>
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
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminPw}
                    onChange={e => setAdminPw(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="ap-submit" disabled={loading}>
                  {loading ? 'Controleren…' : 'Inloggen als admin'}
                </button>
              </form>
            )}
          </>
        )}

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
