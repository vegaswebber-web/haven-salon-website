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
  const [loginEmail, setLoginEmail]   = useState('')
  const [loginPw, setLoginPw]         = useState('')
  const [loginMode, setLoginMode]     = useState('password')  // 'password' | 'otp'
  const [loginStep, setLoginStep]     = useState('email')     // 'email' | 'otp'
  const [loginOtp, setLoginOtp]       = useState('')

  // Register
  const [naam, setNaam]               = useState('')
  const [regEmail, setRegEmail]       = useState('')
  const [regPw, setRegPw]             = useState('')
  const [regPw2, setRegPw2]           = useState('')

  // Admin
  const [adminPw, setAdminPw]         = useState('')

  const [msg, setMsg]       = useState(null)
  const [loading, setLoading] = useState(false)

  const {
    user, isAdmin,
    login, register,
    requestLoginOtp, verifyOtp,
    adminLogin, logout, adminLogout,
  } = useAuth()
  const { openBooking } = useBooking()

  function switchTab(t) {
    setTab(t); setMsg(null)
    setLoginMode('password'); setLoginStep('email')
    setLoginOtp(''); setLoginPw('')
  }

  // ── LOGIN: wachtwoord ─────────────────────────────────────────────────────
  function handleLoginPw(e) {
    e.preventDefault()
    const res = login(loginEmail, loginPw)
    if (res.error) setMsg({ type: 'error', text: res.error })
    else setTimeout(onClose, 700)
  }

  // ── LOGIN: OTP stap 1 ─────────────────────────────────────────────────────
  async function handleLoginOtpRequest(e) {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const res = await requestLoginOtp(loginEmail)
    setLoading(false)
    if (res.error) setMsg({ type: 'error', text: res.error })
    else { setLoginStep('otp'); setMsg({ type: 'success', text: `Code verstuurd naar ${loginEmail}.` }) }
  }

  // ── LOGIN: OTP stap 2 ─────────────────────────────────────────────────────
  function handleLoginOtpVerify(e) {
    e.preventDefault()
    const res = verifyOtp(loginEmail, loginOtp)
    if (res.error) setMsg({ type: 'error', text: res.error })
    else { setMsg({ type: 'success', text: 'Ingelogd!' }); setTimeout(onClose, 700) }
  }

  // ── REGISTER ──────────────────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault()
    if (regPw !== regPw2) return setMsg({ type: 'error', text: 'Wachtwoorden komen niet overeen.' })
    const res = await register(naam, regEmail, regPw)
    if (res.error) setMsg({ type: 'error', text: res.error })
    else { setMsg({ type: 'success', text: 'Account aangemaakt! Welkom bij Haven Salon.' }); setTimeout(onClose, 1200) }
  }

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  async function handleAdminLogin(e) {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const res = await adminLogin(adminPw)
    setLoading(false)
    if (res.error) setMsg({ type: 'error', text: res.error })
    else { setMsg({ type: 'success', text: 'Welkom, admin!' }); setTimeout(onClose, 900) }
  }

  function bookAndClose() { onClose(); openBooking() }

  return (
    <div className="ap-overlay">
      <div className="ap-modal">

        <div className="ap-accent" />

        <div className="ap-brand">
          <span className="ap-brand-name">Haven Salon</span>
          <span className="ap-brand-sub">Volendam</span>
        </div>

        {/* ─── Ingelogd als gebruiker ──────────────────────────────────────── */}
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

        {/* ─── Admin ingelogd ──────────────────────────────────────────────── */}
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

        {/* ─── Niet ingelogd ───────────────────────────────────────────────── */}
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

            {/* ── Inloggen: wachtwoord ── */}
            {tab === 'login' && loginMode === 'password' && (
              <form className="ap-form" onSubmit={handleLoginPw}>
                <div className="ap-field">
                  <label>E-mailadres</label>
                  <input
                    type="email"
                    placeholder="jouw@email.nl"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    required autoFocus
                  />
                </div>
                <div className="ap-field">
                  <label>Wachtwoord</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPw}
                    onChange={e => setLoginPw(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="ap-submit">Inloggen</button>
                <p className="ap-forgot" onClick={() => { setLoginMode('otp'); setLoginStep('email'); setMsg(null) }}>
                  Wachtwoord vergeten? Inloggen met code →
                </p>
                <p className="ap-switch">
                  Nog geen account?{' '}
                  <span onClick={() => switchTab('register')}>Registreren</span>
                </p>
              </form>
            )}

            {/* ── Inloggen: OTP e-mail stap ── */}
            {tab === 'login' && loginMode === 'otp' && loginStep === 'email' && (
              <form className="ap-form" onSubmit={handleLoginOtpRequest}>
                <p className="ap-otp-note">Vul uw e-mailadres in en ontvang een inlogcode.</p>
                <div className="ap-field">
                  <label>E-mailadres</label>
                  <input
                    type="email"
                    placeholder="jouw@email.nl"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    required autoFocus
                  />
                </div>
                <button type="submit" className="ap-submit" disabled={loading}>
                  {loading ? 'Versturen…' : 'Stuur inlogcode'}
                </button>
                <p className="ap-forgot" onClick={() => { setLoginMode('password'); setMsg(null) }}>
                  ← Terug naar wachtwoord
                </p>
              </form>
            )}

            {/* ── Inloggen: OTP code stap ── */}
            {tab === 'login' && loginMode === 'otp' && loginStep === 'otp' && (
              <form className="ap-form" onSubmit={handleLoginOtpVerify}>
                <div className="ap-field">
                  <label>Inlogcode (6 cijfers)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    value={loginOtp}
                    onChange={e => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                    required autoFocus
                  />
                </div>
                <button type="submit" className="ap-submit">Bevestigen</button>
                <p className="ap-forgot" onClick={() => { setLoginStep('email'); setMsg(null) }}>
                  Geen code ontvangen? Opnieuw versturen
                </p>
              </form>
            )}

            {/* ── Registreren ── */}
            {tab === 'register' && (
              <form className="ap-form" onSubmit={handleRegister}>
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
                <div className="ap-field-row">
                  <div className="ap-field">
                    <label>Wachtwoord</label>
                    <input
                      type="password"
                      placeholder="Min. 6 tekens"
                      value={regPw}
                      onChange={e => setRegPw(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="ap-field">
                    <label>Bevestig wachtwoord</label>
                    <input
                      type="password"
                      placeholder="Min. 6 tekens"
                      value={regPw2}
                      onChange={e => setRegPw2(e.target.value)}
                      minLength={6}
                      required
                    />
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
