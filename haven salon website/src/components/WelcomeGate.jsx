import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import PasswordChecklist from './PasswordChecklist'
import VoorwaardenModal from './VoorwaardenModal'
import './WelcomeGate.css'

const _OW = 'https://haven-otp-worker.vegaswebber.workers.dev'

function validatePassword(pw) {
  if (pw.length < 8) return 'Minimaal 8 tekens vereist.'
  if (!/[A-Z]/.test(pw)) return 'Minimaal 1 hoofdletter vereist.'
  if (!/[0-9]/.test(pw)) return 'Minimaal 1 cijfer vereist.'
  if (!/[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?]/.test(pw)) return 'Minimaal 1 symbool vereist (!@#$…).'
  return null
}

async function validateEmail(email) {
  const fmt = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!fmt.test(email)) return 'Ongeldig e-mailformaat.'
  try {
    const res = await fetch(`${_OW}/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (!data.valid) return data.reason || 'Dit e-mailadres bestaat niet.'
  } catch {}
  return null
}

function CloseBtn({ onClick }) {
  return (
    <button className="wg-close" onClick={onClick} aria-label="Sluiten">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round"/>
      </svg>
    </button>
  )
}

export default function WelcomeGate({ onGuest }) {
  // modes: login | register | otp-email | otp-code | otp-reset | otp-newpw | welcome
  const [mode, setMode] = useState('login')
  const [otpPurpose, setOtpPurpose] = useState('forgot') // 'forgot' | 'login'

  const [email, setEmail]             = useState('')
  const [pw, setPw]                   = useState('')
  const [voornaam, setVoornaam]       = useState('')
  const [achternaam, setAchternaam]   = useState('')
  const [pw2, setPw2]                 = useState('')
  const [code, setCode]               = useState('')
  const [newPw, setNewPw]             = useState('')
  const [newPw2, setNewPw2]           = useState('')
  const [welcomeNaam, setWelcomeNaam] = useState('')
  const [resetNaam, setResetNaam]     = useState('')

  const [akkoord, setAkkoord]         = useState(false)
  const [nieuwsbrief, setNieuwsbrief] = useState(false)
  const [voorwaardenOpen, setVoorwaardenOpen] = useState(false)

  const [msg, setMsg]         = useState(null)
  const [loading, setLoading] = useState(false)

  const { login, register, finalizeLogin, requestLoginOtp, verifyOtp, verifyOtpNoLogin, resetPassword } = useAuth()

  function go(m) { setMode(m); setMsg(null) }

  // ── Login ─────────────────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault()
    const res = await login(email, pw)
    if (res.error) setMsg({ type: 'error', text: res.error })
  }

  // ── Registreren ───────────────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault()
    if (pw !== pw2) return setMsg({ type: 'error', text: 'Wachtwoorden komen niet overeen.' })
    const pwErr = validatePassword(pw)
    if (pwErr) return setMsg({ type: 'error', text: pwErr })
    setLoading(true); setMsg(null)
    const emailErr = await validateEmail(email)
    if (emailErr) { setLoading(false); return setMsg({ type: 'error', text: emailErr }) }
    const res = await register(`${voornaam} ${achternaam}`.trim(), email, pw, nieuwsbrief)
    setLoading(false)
    if (res.error) {
      setMsg({ type: 'error', text: res.error })
    } else {
      setWelcomeNaam(res.naam || voornaam)
      go('welcome')
    }
  }

  // ── OTP versturen ─────────────────────────────────────────────────────────
  async function handleOtpSend(e) {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const emailErr = await validateEmail(email)
    if (emailErr) { setLoading(false); return setMsg({ type: 'error', text: emailErr }) }
    const res = await requestLoginOtp(email)
    setLoading(false)
    if (res.error) setMsg({ type: 'error', text: res.error })
    else { go('otp-code'); setMsg({ type: 'success', text: `Code verstuurd naar ${email}.` }) }
  }

  // ── OTP bevestigen ────────────────────────────────────────────────────────
  function handleOtpVerify(e) {
    e.preventDefault()
    if (otpPurpose === 'forgot') {
      // Verify without logging in → go to reset screen
      const res = verifyOtpNoLogin(email, code)
      if (res.error) { setMsg({ type: 'error', text: res.error }); return }
      setResetNaam(res.naam)
      go('otp-reset')
    } else {
      const res = verifyOtp(email, code)
      if (res.error) setMsg({ type: 'error', text: res.error })
    }
  }

  // ── Nieuw wachtwoord instellen ────────────────────────────────────────────
  async function handleNewPw(e) {
    e.preventDefault()
    if (newPw !== newPw2) return setMsg({ type: 'error', text: 'Wachtwoorden komen niet overeen.' })
    const pwErr = validatePassword(newPw)
    if (pwErr) return setMsg({ type: 'error', text: pwErr })
    const res = await resetPassword(email, newPw)
    if (res.error) setMsg({ type: 'error', text: res.error })
  }

  return (
    <>
    {voorwaardenOpen && <VoorwaardenModal onClose={() => setVoorwaardenOpen(false)} />}
    <div className="wg-overlay">
      <div className="wg-card">
        <CloseBtn onClick={onGuest} />

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

        {/* ── Welkom na registratie ── */}
        {mode === 'welcome' && (
          <div className="wg-welcome">
            <div className="wg-welcome-icon">✓</div>
            <h2 className="wg-title">Welkom, {welcomeNaam}!</h2>
            <p className="wg-note" style={{ marginBottom: '24px' }}>
              Je account is aangemaakt. Geniet van Haven Salon.
            </p>
            <button className="wg-btn-primary" onClick={() => finalizeLogin(welcomeNaam, email)}>
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
              <p className="wg-link" onClick={() => { setOtpPurpose('forgot'); go('otp-email') }}>
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
              <div className="wg-field-row">
                <div className="wg-field">
                  <label>Voornaam</label>
                  <input type="text" value={voornaam} onChange={e => setVoornaam(e.target.value)}
                    placeholder="Jan" required autoFocus />
                </div>
                <div className="wg-field">
                  <label>Achternaam</label>
                  <input type="text" value={achternaam} onChange={e => setAchternaam(e.target.value)}
                    placeholder="de Vries" required />
                </div>
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
                    placeholder="Min. 8 tekens" required />
                  <PasswordChecklist password={pw} />
                </div>
                <div className="wg-field">
                  <label>Bevestig</label>
                  <input type="password" value={pw2} onChange={e => setPw2(e.target.value)}
                    placeholder="Min. 8 tekens" required />
                </div>
              </div>
              <div className="wg-checks">
                <label className="wg-check-label">
                  <input type="checkbox" checked={akkoord} onChange={e => setAkkoord(e.target.checked)} />
                  <span>
                    Ik ga akkoord met de{' '}
                    <span className="wg-check-link" onClick={e => { e.preventDefault(); setVoorwaardenOpen(true) }}>
                      Algemene voorwaarden
                    </span>
                  </span>
                </label>
                <label className="wg-check-label">
                  <input type="checkbox" checked={nieuwsbrief} onChange={e => setNieuwsbrief(e.target.checked)} />
                  <span>Ik ontvang graag updates en aanbiedingen van Haven Salon</span>
                </label>
              </div>
              <button type="submit" className="wg-btn-primary" disabled={loading || !akkoord}>
                {loading ? 'Bezig…' : 'Account aanmaken'}
              </button>
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

        {/* ── OTP reset: keuze ── */}
        {mode === 'otp-reset' && (
          <div className="wg-welcome">
            <div className="wg-welcome-icon">✓</div>
            <h2 className="wg-title">Code bevestigd, {resetNaam}!</h2>
            <p className="wg-note" style={{ marginBottom: '24px' }}>
              Kies hoe je verder wilt gaan.
            </p>
            <button className="wg-btn-primary" style={{ marginBottom: '12px' }} onClick={() => go('otp-newpw')}>
              Nieuw wachtwoord instellen
            </button>
            <button className="wg-btn-outline" onClick={() => finalizeLogin(resetNaam, email)}>
              Verder gaan zonder nieuw wachtwoord
            </button>
          </div>
        )}

        {/* ── Nieuw wachtwoord ── */}
        {mode === 'otp-newpw' && (
          <>
            <h2 className="wg-title">Nieuw wachtwoord</h2>
            <form className="wg-form" onSubmit={handleNewPw}>
              <div className="wg-field">
                <label>Nieuw wachtwoord</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder="Min. 8 tekens" required autoFocus />
                <PasswordChecklist password={newPw} />
              </div>
              <div className="wg-field">
                <label>Bevestig wachtwoord</label>
                <input type="password" value={newPw2} onChange={e => setNewPw2(e.target.value)}
                  placeholder="Min. 8 tekens" required />
              </div>
              <button type="submit" className="wg-btn-primary">Opslaan & inloggen</button>
              <p className="wg-link" onClick={() => go('otp-reset')}>← Terug</p>
            </form>
          </>
        )}

        {/* Gast knop */}
        {!['welcome', 'otp-reset', 'otp-newpw'].includes(mode) && (
          <div className="wg-guest-wrap">
            <span className="wg-guest-label">Geen account?</span>
            <button className="wg-guest-btn" onClick={onGuest}>
              Verder gaan als gast →
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
