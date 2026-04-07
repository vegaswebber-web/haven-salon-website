import './About.css'

const highlights = [
  { icon: '✂️', title: 'Knippen & Stylen', desc: 'Of je nu een strakke fade of een klassieke coupe wilt — ik luister naar wat jij mooi vindt en knip precies dat.' },
  { icon: '💆', title: 'Behandelingen', desc: 'Soms heeft je haar gewoon wat extra liefde nodig. Met voedende maskers en hoofdhuidverzorging geef ik je haar nieuwe glans.' },
  { icon: '🧔', title: 'Baardverzorging', desc: 'Een goed verzorgde baard maakt het geheel. Ik shape, trim en finish je baard zodat hij er elke dag strak uitziet.' },
]

export default function About() {
  return (
    <section id="over-ons" className="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-visual">
            <div className="about-img-main">
              <img
                src="/logo.png"
                alt="Haven Salon"
                className="about-photo about-photo--logo"
              />
            </div>
            <div className="about-img-accent">
              <div className="about-img-small-logo">
                <img src="/logo.png" alt="Haven Salon logo" className="about-logo-small" />
              </div>
            </div>
          </div>

          <div className="about-content">
            <span className="section-label">Over ons</span>
            <h2 className="section-title">Welkom bij Haven Salon</h2>
            <div className="divider" />
            <p className="section-subtitle">
              Bij Haven Salon staat persoonlijke aandacht en vakmanschap centraal.
              Abdulla staat klaar met zijn jarenlange ervaring en liefde voor het vak —
              midden in het gezellige Volendam.
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
