import './Testimonials.css'

const reviews = [
  {
    name: 'Yusuf A.',
    rating: 5,
    text: 'Abdulla heeft mijn haar en baard prachtig verzorgd. Echte vakman, luistert goed en levert altijd top resultaat. Absoluut aanrader!',
    date: 'Mei 2026',
  },
  {
    name: 'Mohammed E.',
    rating: 5,
    text: 'Al jaren ga ik naar Abdulla. Altijd tevreden, vriendelijk en snel. Haven Salon is een echte aanwinst voor Volendam!',
    date: 'Mei 2026',
  },
  {
    name: 'Karim B.',
    rating: 5,
    text: 'Perfecte fade en een strakke baard. Abdulla weet precies wat je bedoelt zonder dat je het twee keer hoeft uit te leggen.',
    date: 'April 2026',
  },
  {
    name: 'Lisa de V.',
    rating: 5,
    text: 'Mijn haar ziet er geweldig uit. Fijne sfeer in de salon, Abdulla is professioneel en vriendelijk. Ga zeker terug!',
    date: 'April 2026',
  },
]

function Stars({ count }) {
  return (
    <div className="review-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < count ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <span className="section-label">Wat klanten zeggen</span>
          <h2 className="section-title">Reviews</h2>
          <div className="divider" />
        </div>

        <div className="reviews-grid">
          {reviews.map(r => (
            <div key={r.name} className="review-card">
              <Stars count={r.rating} />
              <p className="review-text">"{r.text}"</p>
              <div className="review-footer">
                <span className="review-name">{r.name}</span>
                <span className="review-date">{r.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="reviews-cta">
          <p>Tevreden klant? Laat een review achter op Google.</p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Haven+Salon+Burgstraat+1+Volendam"
            target="_blank"
            rel="noreferrer"
            className="btn-outline"
          >
            Review schrijven
          </a>
        </div>
      </div>
    </section>
  )
}
