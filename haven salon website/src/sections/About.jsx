import './About.css'

const highlights = [
  { icon: '✂️', title: 'Knippen & Stylen', desc: 'Van een strakke fade tot een klassieke coupe — Abdulla luistert naar wat jij wilt en levert elke keer het resultaat dat bij jou past.' },
  { icon: '👩', title: 'Dames & Heren', desc: 'Zowel dames- als herenkapsels behoren tot het vakgebied van Abdulla. Iedereen is welkom bij Haven Salon.' },
  { icon: '🧔', title: 'Baardverzorging', desc: 'Een goed verzorgde baard maakt het geheel compleet. Abdulla shapt, trimt en finisht je baard tot in de puntjes.' },
  { icon: '💆', title: 'Behandelingen', desc: 'Met voedende maskers en gerichte hoofdhuidverzorging geef je haar de extra aandacht die het verdient.' },
]

export default function About() {
  return (
    <section id="over-ons" className="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-visual">
            <div className="about-img-main">
              <img
                src="/halimmm.jpg"
                alt="Haven Salon — Abdulla"
                className="about-photo"
              />
            </div>
            <div className="about-years">
              <span className="years-num">10+</span>
              <span className="years-label">Jaar ervaring</span>
            </div>
            <div className="about-img-accent">
              <div className="about-img-small-logo">
                <img src="/logo.png" alt="Haven Salon logo" className="about-logo-small" />
              </div>
            </div>
          </div>

          <div className="about-content">
            <span className="section-label">Over ons</span>
            <h2 className="section-title">Het verhaal achter Haven Salon</h2>
            <div className="divider" />

            <p className="about-text">
              Abdulla werkt al meer dan <strong>10 jaar</strong> met hart en ziel in de kappersbranche.
              Wat begon als een passie voor het vak groeide uit tot een diepgeworteld ambacht —
              van klassieke heerenkapsels en strakke fades tot het verzorgen van dameshaar.
              Zijn vakmanschap kent geen grenzen: zowel heren als dames zijn bij hem in goede handen.
            </p>

            <p className="about-text">
              Al jaren koesterde Abdulla één grote droom: <strong>een eigen salon</strong> — een plek
              waar hij volledig op zijn eigen manier kan werken, waar elke klant persoonlijk wordt
              ontvangen en waar kwaliteit altijd centraal staat. Die droom wordt nu werkelijkheid.
            </p>

            <p className="about-text about-text--opening">
              Op <strong>12 juni 2026</strong> opent Haven Salon officieel haar deuren in het
              gezellige hart van Volendam. Wil je er zeker van zijn dat jij er bij bent? Plan
              alvast een afspraak — dat kan nu al!
            </p>

            <div className="about-highlights">
              {highlights.map(h => (
                <div key={h.title} className="highlight-item">
                  <div className="highlight-icon">{h.icon}</div>
                  <div>
                    <h4 className="highlight-title">{h.title}</h4>
                    <p className="highlight-desc">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
