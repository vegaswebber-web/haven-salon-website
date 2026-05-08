import { useState, useEffect } from 'react'
import './CookieConsent.css'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('haven-cookies')) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('haven-cookies', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('haven-cookies', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-overlay">
      <div className="cookie-modal">
        <img src="/logo.png" alt="Haven Salon" className="cookie-logo" onError={e => { e.target.style.display = 'none' }} />
        <h3 className="cookie-title">Wij gebruiken cookies</h3>
        <p className="cookie-text">
          Haven Salon gebruikt functionele cookies om de website goed te laten werken,
          en analytische cookies om te zien hoe bezoekers de site gebruiken.
          Mogen wij alle cookies plaatsen?
        </p>
        <div className="cookie-actions">
          <button className="btn-primary cookie-accept" onClick={accept}>
            Ja, accepteren
          </button>
          <button className="cookie-decline" onClick={decline}>
            Nee
          </button>
        </div>
      </div>
    </div>
  )
}
