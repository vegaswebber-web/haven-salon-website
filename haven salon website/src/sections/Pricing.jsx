import './Pricing.css'

const IconScissors = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
)

const IconRazor = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="6" rx="1"/>
    <line x1="6" y1="9" x2="6" y2="15"/><line x1="9" y1="9" x2="9" y2="15"/>
    <line x1="12" y1="9" x2="12" y2="15"/><line x1="15" y1="9" x2="15" y2="15"/>
    <line x1="18" y1="9" x2="18" y2="15"/>
    <path d="M5 15h14l-1.5 6H6.5L5 15z"/>
  </svg>
)

const IconStar = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconFlower = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 3a3 3 0 0 1 3 3v1a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z"/>
    <path d="M12 21a3 3 0 0 1-3-3v-1a3 3 0 0 1 6 0v1a3 3 0 0 1-3 3z"/>
    <path d="M3 12a3 3 0 0 1 3-3h1a3 3 0 0 1 0 6H6a3 3 0 0 1-3-3z"/>
    <path d="M21 12a3 3 0 0 1-3 3h-1a3 3 0 0 1 0-6h1a3 3 0 0 1 3 3z"/>
  </svg>
)

const IconPlus = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
)

const categories = [
  {
    name: 'Heren',
    icon: <IconScissors />,
    items: [
      { label: 'Knippen',                          price: '€ 27,50' },
      { label: 'Knippen + wassen',                 price: '€ 32,00' },
      { label: 'Knippen + baard stylen of scheren', price: '€ 42,50' },
      { label: 'Knippen met tondeuse',             price: '€ 18,50' },
      { label: 'Kaal scheren',                     price: '€ 15,00' },
    ],
  },
  {
    name: 'Baardverzorging',
    icon: <IconRazor />,
    items: [
      { label: 'Baard stylen of scheren', price: '€ 15,00' },
    ],
  },
  {
    name: 'Jonge Heren',
    icon: <IconStar />,
    items: [
      { label: 'Knippen t/m 13 jaar',               price: '€ 15,00' },
      { label: 'Knippen + stylen (wax) t/m 13 jaar', price: '€ 22,50' },
    ],
  },
  {
    name: 'Vrouwen',
    icon: <IconFlower />,
    items: [
      { label: 'Knippen (kort / medium haar)',  price: '€ 27,00' },
      { label: 'Knippen + föhnen (lang haar)',  price: '€ 45,00' },
      { label: 'Wenkbrouwen epileren',          price: '€ 15,00' },
      { label: 'Wenkbrouwen epileren + verfen', price: '€ 22,00' },
      { label: 'Hele gezicht epileren',         price: '€ 25,00' },
    ],
  },
]

export default function Pricing() {
  return (
    <section id="prijzen" className="pricing">
      <div className="pricing-glow" />
      <div className="container">
        <div className="pricing-header">
          <span className="section-label">Tarieven</span>
          <h2 className="section-title">Prijslijst</h2>
          <div className="divider" />
          <p className="section-subtitle">
            Eerlijke prijzen, geen verrassingen. Alle vermelde tarieven zijn inclusief BTW.
          </p>
        </div>

        <div className="pricing-grid">
          {categories.map(cat => (
            <div key={cat.name} className="pricing-card">
              <div className="pricing-card-icon">{cat.icon}</div>
              <h3 className="pricing-cat-title">{cat.name}</h3>
              <ul className="pricing-list">
                {cat.items.map(item => (
                  <li key={item.label} className="pricing-row">
                    <span className="pricing-label">{item.label}</span>
                    <span className="pricing-dots" />
                    <span className="pricing-price">{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="pricing-note">
          * Prijzen kunnen variëren op basis van haarlengte en haardikte. Neem contact op voor een persoonlijk advies.
        </p>
      </div>
    </section>
  )
}
