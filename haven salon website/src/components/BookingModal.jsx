import { useBooking } from '../contexts/BookingContext'
import './BookingModal.css'

function CloseBtn({ onClick }) {
  return (
    <button className="bm-close" onClick={onClick} aria-label="Sluiten">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round"/>
      </svg>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Vul hier jouw Salonhub booking-URL in (via .env: VITE_SALONHUB_URL)
// Voorbeeld: https://www.salonhub.nl/boek/haven-salon-volendam
// ─────────────────────────────────────────────────────────────────────
const SALONHUB_URL = 'https://afspraak.salonhub.nl/havensalon/edam'

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
          <CloseBtn onClick={closeBooking} />
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
              Neem contact op via telefoon of e-mail en
              we plannen jouw afspraak zo snel mogelijk in.
            </p>
            <div className="bm-contact-options">
              <a href="tel:+31299235355" className="bm-contact-btn">
                +31 299 235 355
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
