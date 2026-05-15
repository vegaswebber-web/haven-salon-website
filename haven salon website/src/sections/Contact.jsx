import { useState } from 'react'
import './Contact.css'

const _OW = 'https://haven-otp-worker.vegaswebber.workers.dev'

export default function Contact() {
  const [form, setForm] = useState({
    naam:     '',
    email:    '',
    telefoon: '',
    bericht:  '',
  })
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const datum = new Date().toLocaleString('nl-NL')
    fetch(`${_OW}/send-contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, datum }),
    }).catch(() => {})
    setStatus('success')
  }

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="contact-grid">
          <div className="contact-info">
            <span className="section-label">Contact</span>
            <h2 className="section-title">Maak een afspraak</h2>
            <div className="divider" />
            <p className="section-subtitle">
              Bel ons of vul het formulier in.
              We nemen zo snel mogelijk contact met je op.
            </p>

            <div className="contact-details">
              <div className="contact-detail">
                <span className="detail-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-8-6.5-8-12a8 8 0 1 1 16 0c0 5.5-8 12-8 12z"/><circle cx="12" cy="9" r="2.5"/></svg>
                </span>
                <div>
                  <strong>Adres</strong>
                  <p>Brugstraat 1, Volendam</p>
                </div>
              </div>
              <div className="contact-detail">
                <span className="detail-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.82 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.09 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
                </span>
                <div>
                  <strong>Telefoon</strong>
                  <p><a href="tel:+31299235355">+31 299 235 355</a></p>
                </div>
              </div>
              <div className="contact-detail">
                <span className="detail-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
                </span>
                <div>
                  <strong>E-mail</strong>
                  <p><a href="mailto:info@havensalon.nl">info@havensalon.nl</a></p>
                </div>
              </div>
              <div className="contact-detail">
                <span className="detail-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </span>
                <div>
                  <strong>Openingstijden</strong>
                  <p>Maandag: Gesloten</p>
                  <p>Dinsdag t/m Zaterdag: 09:00 – 18:00</p>
                  <p>Zondag: 11:00 – 17:00</p>
                </div>
              </div>
            </div>

            <div className="contact-map">
              <iframe
                title="Haven Salon locatie"
                src="https://maps.google.com/maps?q=52.4983,5.0753&output=embed&z=17"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="contact-social">
              <a href="https://instagram.com/abdula_kapper" target="_blank" rel="noreferrer" className="social-btn">Instagram</a>
              <a href="https://www.google.com/maps/place/Haven+Salon/@52.4942643,5.076066,17z/data=!4m6!3m5!1s0x47c6056207d742a3:0x92a26ddfa75c4d4!8m2!3d52.4942643!4d5.076066!16s%2Fg%2F11nbw6zbl7" target="_blank" rel="noreferrer" className="social-btn">Google Reviews</a>
            </div>
          </div>

          <div className="contact-form-wrap">
            {status === 'success' ? (
              <div className="contact-success">
                <div className="success-icon">✓</div>
                <h3>Bedankt!</h3>
                <p>We nemen zo snel mogelijk contact met je op.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="naam">Naam *</label>
                  <input id="naam" name="naam" type="text" value={form.naam} onChange={handleChange} required placeholder="Jouw naam" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">E-mail *</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jouw@email.nl" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="telefoon">Telefoon</label>
                    <input id="telefoon" name="telefoon" type="tel" value={form.telefoon} onChange={handleChange} placeholder="06 12 34 56 78" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="bericht">Gewenste dienst / bericht *</label>
                  <textarea id="bericht" name="bericht" value={form.bericht} onChange={handleChange} required placeholder="Bijv: knippen + baard, zaterdag ochtend" rows={5} />
                </div>
                <button type="submit" className="btn-primary">
                  Verstuur aanvraag
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
