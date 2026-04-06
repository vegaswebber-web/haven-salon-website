import './Pricing.css'

const categories = [
  {
    name: 'Heren',
    items: [
      { label: 'Knippen + stylen (wax)', price: '€ 27' },
      { label: 'Knippen + baard stylen of scheren', price: '€ 35,5' },
      { label: 'Knippen + wassen', price: '€ 29' },
      { label: 'Alles één lengte / kaalscheren (GEEN overloop)', price: '€ 18,5' },
    ],
  },
  {
    name: 'Baardverzorging',
    items: [
      { label: 'Baard stylen of scheren', price: '€ 15' },
    ],
  },
  {
    name: 'Jonge Heren',
    items: [
      { label: 'Knippen + stylen (wax) t/m 13 jaar', price: '€ 19,5' },
    ],
  },
  {
    name: 'Vrouwen',
    items: [
      { label: 'Lang haar knippen + föhnen', price: '€ 45' },
      { label: 'Kort / medium haar knippen', price: '€ 27' },
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
