import './About.css'

const IconScissors = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
)

const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="3"/>
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
    <circle cx="17" cy="7" r="3" opacity=".5"/>
    <path d="M21 21v-2a4 4 0 0 0-3-3.87" opacity=".5"/>
  </svg>
)

const IconRazor = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
    <line x1="7" y1="8" x2="7" y2="14"/><line x1="10" y1="8" x2="10" y2="14"/>
    <line x1="13" y1="8" x2="13" y2="14"/><line x1="16" y1="8" x2="16" y2="14"/>
    <path d="M6 14h12l-1.5 7H7.5L6 14z"/>
  </svg>
)

const IconLeaf = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
)

const highlights = [
  { icon: <IconScissors />, title: 'Knippen & Stylen', desc: 'Van een strakke fade tot een klassieke coupe — Abdulla luistert naar wat jij wilt en levert elke keer het resultaat dat bij jou past.' },
  { icon: <IconUsers />, title: 'Dames & Heren', desc: 'Zowel dames- als herenkapsels behoren tot het vakgebied van Abdulla. Iedereen is welkom bij Haven Salon.' },
  { icon: <IconRazor />, title: 'Baardverzorging', desc: 'Een goed verzorgde baard maakt het geheel compleet. Abdulla shapt, trimt en finisht je baard tot in de puntjes.' },
  { icon: <IconLeaf />, title: 'Behandelingen', desc: 'Met voedende maskers en gerichte hoofdhuidverzorging geef je haar de extra aandacht die het verdient.' },
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
