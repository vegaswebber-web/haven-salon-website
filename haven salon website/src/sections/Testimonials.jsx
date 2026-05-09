import './Testimonials.css'

function GoogleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function Stars() {
  return (
    <div className="google-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
          <h2 className="section-title">Google Reviews</h2>
          <div className="divider" />
        </div>

        <div className="google-review-card">
          <div className="google-review-top">
            <GoogleIcon />
            <div className="google-review-info">
              <span className="google-review-label">Haven Salon</span>
              <Stars />
            </div>
          </div>

          <p className="google-review-desc">
            Tevreden over uw bezoek? Laat een review achter op Google en help anderen Haven Salon te vinden.
          </p>

          <div className="google-review-actions">
            <a
              href="https://www.google.com/maps/place/Haven+Salon/@52.4942643,5.076066,17z/data=!4m8!3m7!1s0x47c6056207d742a3:0x92a26ddfa75c4d4!8m2!3d52.4942643!4d5.076066!9m1!1b1!16s%2Fg%2F11nbw6zbl7"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              Review schrijven
            </a>
            <a
              href="https://www.google.com/maps/place/Haven+Salon/@52.4942643,5.076066,17z/data=!4m6!3m5!1s0x47c6056207d742a3:0x92a26ddfa75c4d4!8m2!3d52.4942643!4d5.076066!16s%2Fg%2F11nbw6zbl7"
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              Reviews bekijken
            </a>
          </div>

          <p className="google-review-note">
            Reviews worden weergegeven via Google Maps
          </p>
        </div>
      </div>
    </section>
  )
}
