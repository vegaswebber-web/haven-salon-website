import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminWidget from '../components/AdminWidget'
import './ComingSoonPage.css'

export default function ComingSoonPage() {
  const [form, setForm] = useState({ naam: '', telefoon: '' })
  const [sent, setSent] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminPw, setAdminPw] = useState('')
  const [pwVisible, setPwVisible] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const { isAdmin, adminLogin } = useAuth()
  const API_URL = import.meta.env.VITE_API_URL || ''

  async function handleSubmit(e) {
    e.preventDefault()
    if (API_URL) {
      await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, bericht: 'Notificatie bij opening', email: '-' }),
      }).catch(() => {})
    }
    setSent(true)
  }

  async function handleAdminLogin(e) {
    e.preventDefault()
    setLoading(true)
    setPwMsg(null)
    const res = await adminLogin(adminPw)
    setLoading(false)
    if (res.error) {
      setPwMsg(res.error)
    } else {
      setPwVisible(false)
      setAdminOpen(true)
    }
  }

  return (
    <div className="cs-page">
      <div className="cs-glow" />

      <div className="cs-content">
        <img
          src="/logo.png"
          alt="Haven Salon"
          className="cs-logo"
          onError={e => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'block'
          }}
        />
        <h1 className="cs-logo-fallback" style={{ display: 'none' }}>Haven Salon</h1>

        <span className="cs-label">Binnenkort geopend</span>
        <h2 className="cs-title">We zijn er bijna</h2>
        <p className="cs-text">
          Haven Salon Volendam opent binnenkort haar deuren.
          Laat je naam en telefoonnummer achter en wij bellen je als we open zijn.
        </p>

        <div className="cs-info">
          <div className="cs-info-item">
            <span>📍</span>
            <span>Kerkstraat 12, Volendam</span>
          </div>
          <div className="cs-info-item">
            <span>📞</span>
            <a href="tel:+31299123456">+31 (0)299 123 456</a>
          </div>
          <div className="cs-info-item">
            <span>📧</span>
            <a href="mailto:info@havensalon.nl">info@havensalon.nl</a>
          </div>
        </div>

        {sent ? (
          <div className="cs-sent">
            ✓ Bedankt! We bellen je zodra we open zijn.
          </div>
        ) : (
          <form className="cs-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Jouw naam"
              value={form.naam}
              onChange={e => setForm(f => ({ ...f, naam: e.target.value }))}
              required
            />
            <input
              type="tel"
              placeholder="Telefoonnummer"
              value={form.telefoon}
              onChange={e => setForm(f => ({ ...f, telefoon: e.target.value }))}
              required
            />
            <button type="submit" className="btn-primary">Houd me op de hoogte</button>
          </form>
        )}

        <div className="cs-social">
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          <span>·</span>
          <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
        </div>
      </div>

      {/* Hidden admin access — bottom right corner */}
      <div className="cs-admin-corner">
        {isAdmin ? (
          <button className="cs-admin-gear" onClick={() => setAdminOpen(true)} title="Admin beheer">
            ⚙
          </button>
        ) : (
          <button className="cs-admin-gear" onClick={() => setPwVisible(v => !v)} title="Admin">
            ⚙
          </button>
        )}

        {pwVisible && !isAdmin && (
          <form className="cs-admin-form" onSubmit={handleAdminLogin}>
            <input
              type="password"
              placeholder="Admin wachtwoord"
              value={adminPw}
              onChange={e => setAdminPw(e.target.value)}
              autoFocus
              required
            />
            {pwMsg && <span className="cs-admin-err">{pwMsg}</span>}
            <button type="submit" disabled={loading}>
              {loading ? '…' : 'Inloggen'}
            </button>
          </form>
        )}
      </div>

      {adminOpen && <AdminWidget onClose={() => setAdminOpen(false)} />}
    </div>
  )
}
