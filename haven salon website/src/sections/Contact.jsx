import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { useAuth } from '../contexts/AuthContext'
import './Contact.css'

const _SID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const _CTD = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID
const _PK  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export default function Contact() {
  const { user, saveContact } = useAuth()
  const [form, setForm] = useState({
    naam:     user?.naam  || '',
    email:    user?.email || '',
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
    saveContact({ ...form, datum })
    if (_SID && _CTD && _PK) {
      try {
        await emailjs.send(_SID, _CTD, {
          from_naam:     form.naam,
          from_email:    form.email,
          telefoon:      form.telefoon || '—',
          bericht:       form.bericht,
          datum,
        }, { publicKey: _PK })
      } catch (err) {
        console.error('[EmailJS contact error]', err)
      }
    }
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
              Bel ons, stuur een WhatsApp of vul het formulier in.
              We nemen zo snel mogelijk contact met je op.
            </p>

            <div className="contact-details">
              <div className="contact-detail">
                <span className="detail-icon">📍</span>
                <div>
                  <strong>Adres</strong>
                  <p>Burgstraat 1, Volendam</p>
                </div>
              </div>
              <div className="contact-detail">
                <span className="detail-icon">📞</span>
                <div>
                  <strong>Telefoon / WhatsApp</strong>
                  <p>
                    <a href="tel:+31684700480">+31 (0)6 847 004 80</a>
                    {' · '}
                    <a href="https://wa.me/31684700480" target="_blank" rel="noreferrer">WhatsApp</a>
                  </p>
                </div>
              </div>
              <div className="contact-detail">
                <span className="detail-icon">📧</span>
                <div>
                  <strong>E-mail</strong>
                  <p><a href="mailto:info@havensalon.nl">info@havensalon.nl</a></p>
                </div>
              </div>
              <div className="contact-detail">
                <span className="detail-icon">🕐</span>
                <div>
                  <strong>Openingstijden</strong>
                  <p>Ma t/m vr: 09:00 – 18:00</p>
                  <p>Zaterdag: 09:00 – 17:00</p>
                  <p>Zondag: Gesloten</p>
                </div>
              </div>
            </div>

            <div className="contact-social">
              <a href="https://instagram.com/abdula_kapper" target="_blank" rel="noreferrer" className="social-btn">Instagram</a>
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
