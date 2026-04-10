import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img
                src="/logo.png"
                alt="Haven Salon"
                className="logo-img-footer"
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <span className="logo-text-footer" style={{ display: 'none' }}>
                <span className="logo-haven">Haven</span>
                <span className="logo-salon">Salon</span>
              </span>
            </Link>
            <p className="footer-tagline">
              Jouw haar, onze passie.<br />
              Kappersalon in het hart van Volendam.
            </p>
          </div>

          <div className="footer-col">
            <h4>Navigatie</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/over-ons">Over Ons</Link></li>
              <li><Link to="/prijzen">Tarieven</Link></li>
              <li><Link to="/team">Team</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Openingstijden</h4>
            <ul className="hours-list">
              <li><span>Ma – Vr</span><span>09:00 – 18:00</span></li>
              <li><span>Zaterdag</span><span>09:00 – 17:00</span></li>
              <li><span>Zondag</span><span>Gesloten</span></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>Burgstraat 1, Volendam</li>
              <li><a href="tel:+31684700480">+31 (0)6 847 004 80</a></li>
              <li><a href="mailto:info@havensalon.nl">info@havensalon.nl</a></li>
            </ul>
            <div className="footer-social">
              <a href="https://instagram.com/abdula_kapper" target="_blank" rel="noreferrer">IG</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} Haven Salon Volendam. Alle rechten voorbehouden.</p>
          <div className="footer-links">
            <a href="#">Privacybeleid</a>
            <a href="#">Algemene voorwaarden</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
