import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useBooking } from '../contexts/BookingContext'
import AdminWidget from '../components/AdminWidget'
import BookingModal from '../components/BookingModal'
import './ComingSoonPage.css'

export default function ComingSoonPage() {
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminPw, setAdminPw] = useState('')
  const [pwVisible, setPwVisible] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const { isAdmin, adminLogin } = useAuth()
  const { open: bookingOpen, openBooking } = useBooking()

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const target = new Date('2026-05-10T00:00:00+02:00').getTime()
    function tick() {
      const diff = target - Date.now()
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setCountdown({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

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

        <div className="cs-countdown">
          {[
            { value: countdown.days,    label: 'Dagen' },
            { value: countdown.hours,   label: 'Uren' },
            { value: countdown.minutes, label: 'Minuten' },
            { value: countdown.seconds, label: 'Seconden' },
          ].map(({ value, label }) => (
            <div key={label} className="cs-countdown-block">
              <span className="cs-countdown-num">{String(value).padStart(2, '0')}</span>
              <span className="cs-countdown-label">{label}</span>
            </div>
          ))}
        </div>

        <p className="cs-text">
          Haven Salon Volendam opent binnenkort haar deuren.
          Wil je alvast een afspraak inplannen? Dat kan nu al!
        </p>

        <button className="btn-primary cs-booking-btn" onClick={openBooking}>
          Afspraak maken
        </button>

        <div className="cs-info">
          <div className="cs-info-item">
            <span>📍</span>
            <span>Burgstraat 1, Volendam</span>
          </div>
          <div className="cs-info-item">
            <span>📞</span>
            <a href="tel:+31684700480">+31 (0)6 847 004 80</a>
          </div>
          <div className="cs-info-item">
            <span>📧</span>
            <a href="mailto:info@havensalon.nl">info@havensalon.nl</a>
          </div>
        </div>

        <div className="cs-social">
          <a href="https://instagram.com/abdula_kapper" target="_blank" rel="noreferrer">Instagram</a>
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
      {bookingOpen && <BookingModal />}
    </div>
  )
}
