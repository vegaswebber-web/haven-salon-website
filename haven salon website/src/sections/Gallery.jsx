import './Gallery.css'

export default function Gallery() {
  return (
    <section id="galerie" className="gallery">
      <div className="container">
        <div className="gallery-header">
          <span className="section-label">Ons werk</span>
          <h2 className="section-title">Galerie</h2>
          <div className="divider" />
          <p className="section-subtitle">
            Een beeld zegt meer dan duizend woorden. Binnenkort vind je hier
            een selectie van ons werk.
          </p>
        </div>

        <div className="gallery-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="gallery-placeholder">
              <div className="gallery-placeholder-inner">
                <span className="gallery-placeholder-icon">✂</span>
                <span className="gallery-placeholder-text">Foto binnenkort</span>
              </div>
            </div>
          ))}
        </div>

        <p className="gallery-note">
          Volg ons op{' '}
          <a
            href="https://instagram.com/abdula_kapper"
            target="_blank"
            rel="noreferrer"
          >
            @abdula_kapper
          </a>{' '}
          voor de laatste foto's.
        </p>
      </div>
    </section>
  )
}
