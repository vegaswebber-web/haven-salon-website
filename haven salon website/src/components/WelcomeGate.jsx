import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './WelcomeGate.css'

export default function WelcomeGate({ onGuest }) {
  const [mode, setMode] = useState('login') // login | register | otp-email | otp-code | welcome

  const [email, setEmail]         = useState('')
  const [pw, setPw]               = useState('')
  const [naam, setNaam]           = useState('')
  const [pw2, setPw2]             = useState('')
  const [code, setCode]           = useState('')
  const [welcomeNaam, setWelcomeNaam] = useState('')

  const [msg, setMsg]         = useState(null)
  const [loading, setLoading] = useState(false)

  const { login, register, finalizeLogin, requestLoginOtp, verifyOtp } = useAuth()

  function go(m) { setMode(m); setMsg(null) }

  // ── Login met wachtwoord ───────────────────────────────────────────────────
  function handleLogin(e) {
    e.preventDefault()
    const res = login(email, pw)
    if (res.error) setMsg({ type: 'error', text: res.error })
  }

  // ── Registreren ───────────────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault()
    if (pw !== pw2) return setMsg({ type: 'error', text: 'Wachtwoorden komen niet overeen.' })
    const res = await register(naam, email, pw)
    if (res.error) {
      setMsg({ type: 'error', text: res.error })
    } else {
      setWelcomeNaam(res.naam || naam)
      go('welcome')
    }
  }

  // ── OTP: versturen ────────────────────────────────────────────────────────
  async function handleOtpSend(e) {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const res = await requestLoginOtp(email)
    setLoading(false)
    if (res.error) setMsg({ type: 'error', text: res.error })
    else { go('otp-code'); setMsg({ type: 'success', text: `Code verstuurd naar ${email}.` }) }
  }

  // ── OTP: bevestigen ───────────────────────────────────────────────────────
  function handleOtpVerify(e) {
    e.preventDefault()
    const res = verifyOtp(email, code)
    if (res.error) setMsg({ type: 'error', text: res.error })
  }

  return (
    <div className="wg-overlay">
      <div className="wg-card">
        {/* Brand */}
        <div className="wg-brand">
          <img
            src="/logo.png"
            alt="Haven Salon"
            className="wg-logo"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
          />
          <span className="wg-logo-text" style={{ display: 'none' }}>Haven Salon</span>
          <span className="wg-sub">Volendam</span>
        </div>

        {msg && <div className={`wg-msg wg-msg--${msg.type}`}>{msg.text}</div>}

        {/* ── Welkom ── */}
        {mode === 'welcome' && (
          <div className="wg-welcome">
            <div className="wg-welcome-icon">✓</div>
            <h2 className="wg-title">Welkom, {welcomeNaam}!</h2>
            <p className="wg-note" style={{ marginBottom: '24px' }}>
              Je account is aangemaakt. Geniet van Haven Salon.
            </p>
            <button
              className="wg-btn-primary"
              onClick={() => finalizeLogin(welcomeNaam, email)}
            >
              Ga verder →
            </button>
          </div>
        )}

        {/* ── Login ── */}
        {mode === 'login' && (
          <>
            <h2 className="wg-title">Welkom terug</h2>
            <form className="wg-form" onSubmit={handleLogin}>
              <div className="wg-field">
                <label>E-mailadres</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="jouw@email.nl" required autoFocus />
              </div>
              <div className="wg-field">
                <label>Wachtwoord</label>
                <input type="password" value={pw} onChange={e => setPw(e.target.value)}
                  placeholder="••••••••" required />
              </div>
              <button type="submit" className="wg-btn-primary">Inloggen</button>
              <p className="wg-link" onClick={() => go('otp-email')}>
                Wachtwoord vergeten? Inloggen met code →
              </p>
            </form>

            <div className="wg-sep"><span>of</span></div>
            <button className="wg-btn-outline" onClick={() => go('register')}>
              Nieuw account aanmaken
            </button>
          </>
        )}

        {/* ── Registreren ── */}
        {mode === 'register' && (
          <>
            <h2 className="wg-title">Account aanmaken</h2>
            <form className="wg-form" onSubmit={handleRegister}>
              <div className="wg-field">
                <label>Volledige naam</label>
                <input type="text" value={naam} onChange={e => setNaam(e.target.value)}
                  placeholder="Jan de Vries" required autoFocus />
              </div>
              <div className="wg-field">
                <label>E-mailadres</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="jouw@email.nl" required />
              </div>
              <div className="wg-field-row">
                <div className="wg-field">
                  <label>Wachtwoord</label>
                  <input type="password" value={pw} onChange={e => setPw(e.target.value)}
                    placeholder="Min. 6 tekens" minLength={6} required />
                </div>
                <div className="wg-field">
                  <label>Bevestig</label>
                  <input type="password" value={pw2} onChange={e => setPw2(e.target.value)}
                    placeholder="Min. 6 tekens" minLength={6} required />
                </div>
              </div>
              <button type="submit" className="wg-btn-primary">Account aanmaken</button>
              <p className="wg-link" onClick={() => go('login')}>← Terug naar inloggen</p>
            </form>
          </>
        )}

        {/* ── OTP: e-mail ── */}
        {mode === 'otp-email' && (
          <>
            <h2 className="wg-title">Inlogcode aanvragen</h2>
            <form className="wg-form" onSubmit={handleOtpSend}>
              <p className="wg-note">Vul uw e-mailadres in en ontvang een inlogcode.</p>
              <div className="wg-field">
                <label>E-mailadres</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="jouw@email.nl" required autoFocus />
              </div>
              <button type="submit" className="wg-btn-primary" disabled={loading}>
                {loading ? 'Versturen…' : 'Stuur inlogcode'}
              </button>
              <p className="wg-link" onClick={() => go('login')}>← Terug</p>
            </form>
          </>
        )}

        {/* ── OTP: code ── */}
        {mode === 'otp-code' && (
          <>
            <h2 className="wg-title">Code invoeren</h2>
            <form className="wg-form" onSubmit={handleOtpVerify}>
              <div className="wg-field">
                <label>Inlogcode (6 cijfers)</label>
                <input
                  type="text" inputMode="numeric" placeholder="123456" maxLength={6}
                  value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  required autoFocus
                />
              </div>
              <button type="submit" className="wg-btn-primary">Bevestigen</button>
              <p className="wg-link" onClick={() => go('otp-email')}>
                Geen code ontvangen? Opnieuw versturen
              </p>
            </form>
          </>
        )}

        {/* Gast knop — verberg op welkom scherm */}
        {mode !== 'welcome' && (
          <button className="wg-guest-btn" onClick={onGuest}>
            Verder gaan als gast
          </button>
        )}
      </div>
    </div>
  )
}
