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
            <h3>Salonhub nog niet gekoppeld</h3>
            <p>
              Maak een gratis account aan op{' '}
              <strong>salonhub.nl</strong> en voeg daarna jouw
              booking-URL toe aan het project:
            </p>
            <div className="bm-setup-code">
              <code>VITE_SALONHUB_URL=https://www.salonhub.nl/boek/JOUW-SALON</code>
            </div>
            <ol className="bm-setup-steps">
              <li>Ga naar <strong>salonhub.nl</strong> en maak een account</li>
              <li>Kopieer jouw persoonlijke booking-link</li>
              <li>Maak een <strong>.env</strong> bestand in de projectmap</li>
              <li>
                Voeg toe:{' '}
                <code>VITE_SALONHUB_URL=https://www.salonhub.nl/boek/haven-salon</code>
              </li>
              <li>Run <code>npm run build</code> en deploy opnieuw</li>
            </ol>
            <p className="bm-setup-contact">
              In de tussentijd kun je bellen of mailen:{' '}
              <a href="tel:+31684700480">+31 (0)6 847 004 80</a>
              {' '}·{' '}
              <a href="mailto:info@havensalon.nl">info@havensalon.nl</a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
