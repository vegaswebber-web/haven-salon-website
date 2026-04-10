import { useBooking } from '../contexts/BookingContext'
import './BookingModal.css'

// ─────────────────────────────────────────────────────────────────────
// Vul hier jouw Salonhub booking-URL in (via .env: VITE_SALONHUB_URL)
// Voorbeeld: https://www.salonhub.nl/boek/haven-salon-volendam
// ─────────────────────────────────────────────────────────────────────
const SALONHUB_URL = import.meta.env.VITE_SALONHUB_URL || ''

export default function BookingModal() {
  const { closeBooking } = useBooking()

  return (
    <div className="bm-overlay" onClick={closeBooking}>
      <div className="bm-modal" onClick={e => e.stopPropagation()}>

        <div className="bm-header">
          <div className="bm-header-left">
            <span className="bm-logo">Haven Salon</span>
            <span className="bm-header-title">Afspraak maken</span>
          </div>
          <button className="bm-close" onClick={closeBooking} aria-label="Sluiten">✕</button>
        </div>

        {SALONHUB_URL ? (
          <iframe
            src={SALONHUB_URL}
            title="Afspraak maken – Haven Salon"
            className="bm-frame"
            allow="payment"
          />
        ) : (
          <div className="bm-setup">
            <div className="bm-setup-icon">✂</div>
            <h3>Afspraak maken</h3>
            <p>
              Neem contact op via telefoon, WhatsApp of e-mail en
              we plannen jouw afspraak zo snel mogelijk in.
            </p>
            <div className="bm-contact-options">
              <a href="https://wa.me/31684700480" target="_blank" rel="noreferrer" className="bm-contact-btn bm-contact-btn--wa">
                WhatsApp
              </a>
              <a href="tel:+31684700480" className="bm-contact-btn">
                +31 (0)6 847 004 80
              </a>
              <a href="mailto:info@havensalon.nl" className="bm-contact-btn">
                info@havensalon.nl
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
