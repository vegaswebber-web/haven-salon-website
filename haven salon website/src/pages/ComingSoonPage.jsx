import { useEffect, useState } from 'react'
import { useBooking } from '../contexts/BookingContext'
import BookingModal from '../components/BookingModal'
import './ComingSoonPage.css'

export default function ComingSoonPage() {
  const { open: bookingOpen, openBooking } = useBooking()

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const target = new Date('2026-06-13T00:00:00+02:00').getTime()
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
            <span>Brugstraat 1, Volendam</span>
          </div>
          <div className="cs-info-item">
            <span>📞</span>
            <a href="tel:+31299235355">+31 299 235 355</a>
          </div>
          <div className="cs-info-item">
            <span>📧</span>
            <a href="mailto:info@havensalon.nl">info@havensalon.nl</a>
          </div>
        </div>

        <div className="cs-social">
          <a href="https://www.instagram.com/haven_salon122/" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </div>

      {bookingOpen && <BookingModal />}
    </div>
  )
}
