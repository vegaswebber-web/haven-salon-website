import './About.css'

const highlights = [
  { icon: '✂️', title: 'Knippen & Stylen', desc: 'Van klassiek tot modern — we knippen precies wat bij jou past.' },
  { icon: '🎨', title: 'Kleuren', desc: 'Highlights, balayage, volledig verven. Wij werken met topkwaliteit producten.' },
  { icon: '💆', title: 'Behandelingen', desc: 'Voedende haarmaskers en hoofdhuidbehandelingen voor gezond, stralend haar.' },
  { icon: '👰', title: 'Bruidswerk', desc: 'Jouw mooiste dag verdient de mooiste look. Bruidsstyling op maat.' },
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
                alt="Haven Salon — Halim"
                className="about-photo"
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="about-img-placeholder" style={{ display: 'none' }}>
                <span>Haven Salon</span>
              </div>
            </div>
            <div className="about-img-accent">
              <div className="about-img-small-logo">
                <img src="/logo.png" alt="Haven Salon logo" className="about-logo-small" />
              </div>
            </div>
            <div className="about-years">
              <span className="years-num">7+</span>
              <span className="years-label">jaar<br />ervaring</span>
            </div>
          </div>

          <div className="about-content">
            <span className="section-label">Over ons</span>
            <h2 className="section-title">Welkom bij Haven Salon</h2>
            <div className="divider" />
            <p className="section-subtitle">
              Haven Salon is meer dan een kapper — het is een plek waar je jezelf kunt zijn.
              In het gezellige Volendam verwelkom ik elke klant met aandacht, vakmanschap
              en een kopje koffie. Ik sta klaar om jou op je best te laten voelen.
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
