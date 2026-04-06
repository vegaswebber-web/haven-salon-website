import { Link } from 'react-router-dom'
import Hero from '../sections/Hero'
import { useBooking } from '../contexts/BookingContext'
import './HomePage.css'

export default function HomePage() {
  const { openBooking } = useBooking()
  return (
    <>
      <Hero />

      {/* About teaser */}
      <section className="home-about">
        <div className="container home-about-inner">
          <div className="home-about-visual">
            <div className="home-about-img">
              <span>Haven Salon</span>
            </div>
            <div className="home-about-badge">
              <span className="badge-num">7+</span>
              <span className="badge-label">Jaar<br/>ervaring</span>
            </div>
          </div>
          <div className="home-about-content">
            <span className="section-label">Over ons</span>
            <h2 className="section-title">Vakmanschap met een persoonlijk tintje</h2>
            <div className="divider" />
            <p className="section-subtitle">
              Bij Haven Salon staat persoonlijke aandacht en vakmanschap centraal.
              Halim staat klaar met zijn jarenlange ervaring en liefde voor het vak —
              midden in het gezellige Volendam.
            </p>
            <Link to="/over-ons" className="btn-primary" style={{ marginTop: '28px' }}>
              Meer over ons
            </Link>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="home-cta">
        <div className="container home-cta-inner">
          <div>
            <h2>Klaar voor een nieuwe look?</h2>
            <p>Maak vandaag nog een afspraak bij Haven Salon in Volendam.</p>
          </div>
          <button className="btn-primary" onClick={openBooking}>Afspraak maken</button>
        </div>
      </section>
    </>
  )
}
