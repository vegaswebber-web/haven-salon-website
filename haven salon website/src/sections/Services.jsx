import { Link } from 'react-router-dom'
import './Services.css'

const services = [
  {
    title: 'Knippen',
    items: ['Dames knippen', 'Heren knippen', 'Kinderknippen', 'Pony bijknippen'],
    icon: '✂️',
  },
  {
    title: 'Styling',
    items: ['Föhnen & stylen', 'Steil maken', 'Kroezen & curls', 'Opsteken'],
    icon: '💅',
  },
  {
    title: 'Behandelingen',
    items: ['Keratine behandeling', 'Haarmasker', 'Hoofdhuid massage', 'Voedende verzorging'],
    icon: '✨',
  },
  {
    title: 'Bruidsstyling',
    items: ['Bruidskapsel', 'Proefkapsel', 'Bruidsmeisjes', 'Bruidsgroep korting'],
    icon: '👰',
  },
  {
    title: 'Haarextensions',
    items: ['Tape extensions', 'Clip-in extensions', 'Keratine bonding', 'Advies & plaatsing'],
    icon: '💇',
  },
]

export default function Services() {
  return (
    <section id="diensten" className="services">
      <div className="container">
        <div className="services-header">
          <span className="section-label">Wat wij bieden</span>
          <h2 className="section-title">Onze diensten</h2>
          <div className="divider" />
          <p className="section-subtitle">
            Van een snelle knipbeurt tot een complete transformatie — bij Haven Salon
            vind je alles wat je nodig hebt voor jouw perfecte look.
          </p>
        </div>

        <div className="services-grid">
          {services.map(s => (
            <div key={s.title} className="service-card">
              <div className="service-icon">{s.icon}</div>
              <h3 className="service-title">{s.title}</h3>
              <ul className="service-list">
                {s.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link to="/prijzen" className="service-link">
                Bekijk prijzen →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
