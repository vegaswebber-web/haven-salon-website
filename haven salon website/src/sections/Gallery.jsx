import './Gallery.css'

const photos = [
  { src: '/gallery/g1.jpg', alt: 'Knipwerk Haven Salon' },
  { src: '/gallery/g2.jpg', alt: 'Knipwerk Haven Salon' },
  { src: '/gallery/g3.jpg', alt: 'Knipwerk Haven Salon' },
  { src: '/gallery/g4.jpg', alt: 'Knipwerk Haven Salon' },
  { src: '/gallery/g5.jpg', alt: 'Knipwerk Haven Salon' },
  { src: '/gallery/g6.jpg', alt: 'Knipwerk Haven Salon' },
]

export default function Gallery() {
  return (
    <section id="galerie" className="gallery">
      <div className="container">
        <div className="gallery-header">
          <span className="section-label">Ons werk</span>
          <h2 className="section-title">Galerie</h2>
          <div className="divider" />
          <p className="section-subtitle">
            Een beeld zegt meer dan duizend woorden. Bekijk een selectie van ons werk.
          </p>
        </div>

        <div className="gallery-grid">
          {photos.map((photo, i) => (
            <div key={i} className="gallery-item">
              <img
                src={photo.src}
                alt={photo.alt}
                className="gallery-img"
                loading="lazy"
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="gallery-placeholder-inner" style={{ display: 'none' }}>
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
