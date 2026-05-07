import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import PasswordChecklist from './PasswordChecklist'
import './SettingsModal.css'

const _OW = 'https://haven-otp-worker.vegaswebber.workers.dev'

function validatePassword(pw) {
  if (pw.length < 8) return 'Minimaal 8 tekens vereist.'
  if (!/[A-Z]/.test(pw)) return 'Minimaal 1 hoofdletter vereist.'
  if (!/[0-9]/.test(pw)) return 'Minimaal 1 cijfer vereist.'
  if (!/[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?]/.test(pw)) return 'Minimaal 1 symbool vereist (!@#$…).'
  return null
}

async function compressAvatar(file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 150; canvas.height = 150
        const ctx = canvas.getContext('2d')
        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2
        ctx.drawImage(img, sx, sy, side, side, 0, 0, 150, 150)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

function splitNaam(naam) {
  if (!naam || naam === 'Klant') return { voornaam: '', achternaam: '' }
  const parts = naam.trim().split(' ')
  return { voornaam: parts[0] || '', achternaam: parts.slice(1).join(' ') || '' }
}

export default function SettingsModal({ onClose }) {
  const { user, updateProfile, updateAvatar, changeEmail, resetPassword, updateNieuwsbrief } = useAuth()
  const [tab, setTab] = useState('profiel')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const { voornaam: initVn, achternaam: initAn } = splitNaam(user?.naam)
  const [voornaam, setVoornaam]     = useState(initVn)
  const [achternaam, setAchternaam] = useState(initAn)
  const [telefoon, setTelefoon]     = useState(user?.telefoon || '')
  const [avatar, setAvatar]         = useState(user?.avatar || null)

  const [nieuwsbrief, setNieuwsbrief] = useState(user?.nieuwsbrief || false)

  const [newEmail, setNewEmail]     = useState('')
  const [emailPw, setEmailPw]       = useState('')

  const [curPw, setCurPw]           = useState('')
  const [newPw, setNewPw]           = useState('')
  const [newPw2, setNewPw2]         = useState('')

  const fileRef = useRef()

  function setOk(text)  { setMsg({ type: 'success', text }) }
  function setErr(text) { setMsg({ type: 'error',   text }) }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return setErr('Afbeelding mag maximaal 5 MB zijn.')
    const compressed = await compressAvatar(file)
    setAvatar(compressed)
    const res = updateAvatar(user.email, compressed)
    if (res.error) setErr(res.error)
    else setOk('Profielfoto bijgewerkt.')
  }

  async function handleProfielSave(e) {
    e.preventDefault()
    const naam = `${voornaam} ${achternaam}`.trim()
    if (!voornaam) return setErr('Voornaam is verplicht.')
    setLoading(true); setMsg(null)
    const res = await updateProfile(user.email, { naam, telefoon })
    setLoading(false)
    if (res.error) setErr(res.error)
    else setOk('Profiel opgeslagen.')
  }

  async function handleEmailChange(e) {
    e.preventDefault()
    if (!newEmail) return setErr('Voer een nieuw e-mailadres in.')
    setLoading(true); setMsg(null)
    const res = await changeEmail(user.email, newEmail, emailPw)
    setLoading(false)
    if (res.error) setErr(res.error)
    else { setOk('E-mailadres gewijzigd.'); setNewEmail(''); setEmailPw('') }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    if (newPw !== newPw2) return setErr('Wachtwoorden komen niet overeen.')
    const pwErr = validatePassword(newPw)
    if (pwErr) return setErr(pwErr)
    setLoading(true); setMsg(null)
    const res = await resetPassword(user.email, newPw)
    setLoading(false)
    if (res.error) setErr(res.error)
    else { setOk('Wachtwoord gewijzigd.'); setCurPw(''); setNewPw(''); setNewPw2('') }
  }

  const displayNaam = user?.naam && user.naam !== 'Klant'
    ? user.naam
    : user?.email?.split('@')[0] || ''

  return (
    <div className="sm-overlay">
      <div className="sm-modal">
        <div className="sm-accent" />

        <div className="sm-header">
          <span className="sm-title">Instellingen</span>
          <button className="sm-close" onClick={onClose} aria-label="Sluiten">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="sm-tabs">
          {['profiel', 'beveiliging'].map(t => (
            <button
              key={t}
              className={`sm-tab ${tab === t ? 'active' : ''}`}
              onClick={() => { setTab(t); setMsg(null) }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {msg && <div className={`sm-msg sm-msg--${msg.type}`}>{msg.text}</div>}

        <div className="sm-body">

          {/* ── Profiel ── */}
          {tab === 'profiel' && (
            <form className="sm-form" onSubmit={handleProfielSave}>
              {/* Avatar */}
              <div className="sm-avatar-wrap">
                <div className="sm-avatar" onClick={() => fileRef.current?.click()}>
                  {avatar
                    ? <img src={avatar} alt="avatar" className="sm-avatar-img" />
                    : <span className="sm-avatar-initial">{displayNaam[0]?.toUpperCase() || '?'}</span>
                  }
                  <div className="sm-avatar-overlay">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                {avatar && (
                  <button type="button" className="sm-avatar-remove" onClick={() => {
                    setAvatar(null); updateAvatar(user.email, null)
                  }}>
                    Foto verwijderen
                  </button>
                )}
              </div>

              <div className="sm-email-display">
                <span className="sm-email-label">E-mailadres</span>
                <span className="sm-email-value">{user?.email}</span>
              </div>

              <div className="sm-field-row">
                <div className="sm-field">
                  <label>Voornaam</label>
                  <input type="text" value={voornaam} onChange={e => setVoornaam(e.target.value)}
                    placeholder="Jan" required />
                </div>
                <div className="sm-field">
                  <label>Achternaam</label>
                  <input type="text" value={achternaam} onChange={e => setAchternaam(e.target.value)}
                    placeholder="de Vries" />
                </div>
              </div>

              <div className="sm-field">
                <label>Telefoonnummer</label>
                <input type="tel" value={telefoon} onChange={e => setTelefoon(e.target.value)}
                  placeholder="+31 6 12345678" />
              </div>

              <label className="sm-check-label">
                <input
                  type="checkbox"
                  checked={nieuwsbrief}
                  onChange={e => { setNieuwsbrief(e.target.checked); updateNieuwsbrief(user.email, e.target.checked) }}
                />
                <span>Ik ontvang graag updates en aanbiedingen van Haven Salon</span>
              </label>

              <button type="submit" className="sm-btn-primary" disabled={loading}>
                {loading ? 'Opslaan…' : 'Opslaan'}
              </button>
            </form>
          )}

          {/* ── Beveiliging ── */}
          {tab === 'beveiliging' && (
            <div className="sm-security">

              <div className="sm-section">
                <h3 className="sm-section-title">E-mailadres wijzigen</h3>
                <form className="sm-form" onSubmit={handleEmailChange}>
                  <div className="sm-field">
                    <label>Nieuw e-mailadres</label>
                    <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                      placeholder="nieuw@email.nl" required />
                  </div>
                  <div className="sm-field">
                    <label>Bevestig met wachtwoord</label>
                    <input type="password" value={emailPw} onChange={e => setEmailPw(e.target.value)}
                      placeholder="••••••••" required />
                  </div>
                  <button type="submit" className="sm-btn-outline" disabled={loading}>
                    {loading ? 'Opslaan…' : 'E-mail wijzigen'}
                  </button>
                </form>
              </div>

              <div className="sm-divider" />

              <div className="sm-section">
                <h3 className="sm-section-title">Wachtwoord wijzigen</h3>
                <form className="sm-form" onSubmit={handlePasswordChange}>
                  <div className="sm-field">
                    <label>Nieuw wachtwoord</label>
                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                      placeholder="Min. 8 tekens" required />
                    <PasswordChecklist password={newPw} />
                  </div>
                  <div className="sm-field">
                    <label>Bevestig wachtwoord</label>
                    <input type="password" value={newPw2} onChange={e => setNewPw2(e.target.value)}
                      placeholder="Min. 8 tekens" required />
                  </div>
                  <button type="submit" className="sm-btn-outline" disabled={loading}>
                    {loading ? 'Opslaan…' : 'Wachtwoord wijzigen'}
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
