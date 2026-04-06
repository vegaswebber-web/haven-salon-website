import { Link } from 'react-router-dom'
import { useBooking } from '../contexts/BookingContext'
import './Hero.css'

export default function Hero() {
  const { openBooking } = useBooking()
  return (
    <section id="home" className="hero">
      <div className="hero-glow" />
      <div className="container hero-inner">
        <div className="hero-content">
          <span className="section-label">Kappersalon · Volendam</span>
          <h1 className="hero-title">
            Jouw haar,<br />
            <em>onze passie</em>
          </h1>
          <div className="divider" />
          <p className="hero-text">
            Bij Haven Salon in het hart van Volendam staan vakmanschap,
            persoonlijke aandacht en stijl centraal. Wij zorgen voor een
            look die écht bij jou past.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={openBooking}>Afspraak maken</button>
            <Link to="/prijzen" className="btn-outline">Bekijk tarieven</Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-img-wrap">
            <img
              src="/halimm.jpg"
              alt="Halim — Haven Salon"
              className="hero-photo"
            />
            <div className="hero-photo-gradient" />
          </div>
        </div>
      </div>

      <div className="hero-scroll-hint"><span /></div>
    </section>
  )
}
