import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useBooking } from '../contexts/BookingContext'
import PasswordChecklist from './PasswordChecklist'
import VoorwaardenModal from './VoorwaardenModal'
import './AuthPanel.css'

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

const TABS = [
  { id: 'login',    label: 'Inloggen' },
  { id: 'register', label: 'Registreren' },
]

function displayNaam(user) {
  if (!user) return ''
  if (user.naam && user.naam !== 'Klant') return user.naam
  return user.email?.split('@')[0] || 'Klant'
}

export default function AuthPanel({ onClose, onSettings }) {
  const [tab, setTab] = useState('login')

  // Login
  const [loginEmail, setLoginEmail]   = useState('')
  const [loginPw, setLoginPw]         = useState('')
  const [loginMode, setLoginMode]     = useState('password')  // 'password' | 'otp'
  const [loginStep, setLoginStep]     = useState('email')     // 'email' | 'otp'
  const [loginOtp, setLoginOtp]       = useState('')

  // Register
  const [voornaam, setVoornaam]       = useState('')
  const [achternaam, setAchternaam]   = useState('')
  const [regEmail, setRegEmail]       = useState('')
  const [regPw, setRegPw]             = useState('')
  const [regPw2, setRegPw2]           = useState('')
  const [regAkkoord, setRegAkkoord]   = useState(false)
  const [regNl, setRegNl]             = useState(false)
  const [voorwaardenOpen, setVoorwaardenOpen] = useState(false)

  const [msg, setMsg]       = useState(null)
  const [loading, setLoading] = useState(false)

  const {
    user,
    login, register,
    requestLoginOtp, verifyOtp,
    logout,
  } = useAuth()
  const { openBooking } = useBooking()

  function switchTab(t) {
    setTab(t); setMsg(null)
    setLoginMode('password'); setLoginStep('email')
    setLoginOtp(''); setLoginPw('')
  }

  // ── LOGIN: wachtwoord ─────────────────────────────────────────────────────
  async function handleLoginPw(e) {
    e.preventDefault()
    const res = await login(loginEmail, loginPw)
    if (res.error) setMsg({ type: 'error', text: res.error })
    else setTimeout(onClose, 700)
  }

  // ── LOGIN: OTP stap 1 ─────────────────────────────────────────────────────
  async function handleLoginOtpRequest(e) {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const emailErr = await validateEmail(loginEmail)
    if (emailErr) { setLoading(false); return setMsg({ type: 'error', text: emailErr }) }
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
    const pwErr = validatePassword(regPw)
    if (pwErr) return setMsg({ type: 'error', text: pwErr })
    setLoading(true); setMsg(null)
    const emailErr = await validateEmail(regEmail)
    if (emailErr) { setLoading(false); return setMsg({ type: 'error', text: emailErr }) }
    const res = await register(`${voornaam} ${achternaam}`.trim(), regEmail, regPw, regNl)
    setLoading(false)
    if (res.error) setMsg({ type: 'error', text: res.error })
    else { setMsg({ type: 'success', text: 'Account aangemaakt! Welkom bij Haven Salon.' }); setTimeout(onClose, 1200) }
  }

  function bookAndClose() { onClose(); openBooking() }

  const naam = displayNaam(user)

  return (
    <>
    {voorwaardenOpen && <VoorwaardenModal onClose={() => setVoorwaardenOpen(false)} />}
    <div className="ap-overlay">
      <div className="ap-modal">

        <div className="ap-accent" />

        {/* Sabit header — nooit scrollt weg */}
        <div className="ap-header">
          <span className="ap-brand-name">Haven Salon</span>
          <span className="ap-brand-sub">Volendam</span>
          <button className="ap-close" onClick={onClose} aria-label="Sluiten">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Scrollbaar gedeelte */}
        <div className="ap-body">

          {/* ─── Ingelogd als gebruiker ──────────────────────────────────────── */}
          {user && (
            <div className="ap-logged">
              <div className="ap-avatar">{naam[0]?.toUpperCase()}</div>
              <p className="ap-welcome-name">{naam}</p>
              <p className="ap-welcome-email">{user.email}</p>
              <button className="ap-book-btn" onClick={bookAndClose}>
                <span className="ap-book-icon">✂</span>
                Afspraak maken
              </button>
              <div className="ap-actions-row">
                {onSettings && (
                  <button className="ap-link-btn" onClick={onSettings}>Instellingen</button>
                )}
                <button className="ap-link-btn" onClick={() => { logout(); onClose() }}>Uitloggen</button>
              </div>
            </div>
          )}

          {/* ─── Niet ingelogd ───────────────────────────────────────────────── */}
          {!user && (
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
                    ← Terug / Opnieuw versturen
                  </p>
                </form>
              )}

              {/* ── Registreren ── */}
              {tab === 'register' && (
                <form className="ap-form" onSubmit={handleRegister}>
                  <div className="ap-field-row">
                    <div className="ap-field">
                      <label>Voornaam</label>
                      <input
                        type="text"
                        placeholder="Jan"
                        value={voornaam}
                        onChange={e => setVoornaam(e.target.value)}
                        required autoFocus
                      />
                    </div>
                    <div className="ap-field">
                      <label>Achternaam</label>
                      <input
                        type="text"
                        placeholder="de Vries"
                        value={achternaam}
                        onChange={e => setAchternaam(e.target.value)}
                        required
                      />
                    </div>
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
                        placeholder="Min. 8 tekens"
                        value={regPw}
                        onChange={e => setRegPw(e.target.value)}
                        required
                      />
                      <PasswordChecklist password={regPw} />
                    </div>
                    <div className="ap-field">
                      <label>Bevestig wachtwoord</label>
                      <input
                        type="password"
                        placeholder="Min. 8 tekens"
                        value={regPw2}
                        onChange={e => setRegPw2(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="ap-checks">
                    <label className="ap-check-label">
                      <input type="checkbox" checked={regAkkoord} onChange={e => setRegAkkoord(e.target.checked)} />
                      <span>
                        Ik ga akkoord met de{' '}
                        <span className="ap-check-link" onClick={e => { e.preventDefault(); setVoorwaardenOpen(true) }}>
                          Algemene voorwaarden
                        </span>
                      </span>
                    </label>
                    <label className="ap-check-label">
                      <input type="checkbox" checked={regNl} onChange={e => setRegNl(e.target.checked)} />
                      <span>Ik ontvang graag updates en aanbiedingen van Haven Salon</span>
                    </label>
                  </div>
                  <button type="submit" className="ap-submit" disabled={loading || !regAkkoord}>
                    {loading ? 'Bezig…' : 'Account aanmaken'}
                  </button>
                  <p className="ap-switch">
                    Al een account?{' '}
                    <span onClick={() => switchTab('login')}>Inloggen</span>
                  </p>
                </form>
              )}

            </>
          )}

          {!user && (
            <div className="ap-booking-strip">
              <span>Of boek direct zonder account</span>
              <button className="ap-strip-btn" onClick={bookAndClose}>Afspraak maken →</button>
            </div>
          )}

        </div>
      </div>
    </div>
    </>
  )
}
