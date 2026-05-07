import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useBooking } from '../contexts/BookingContext'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { openBooking } = useBooking()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    if (location.hash) {
      setTimeout(() => {
        const el = document.querySelector(location.hash)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.pathname, location.hash])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = [
    { label: 'Home',     to: '/' },
    { label: 'Over Ons', to: '/over-ons' },
    { label: 'Tarieven', to: '/prijzen' },
    { label: 'Team',     to: '/team' },
    { label: 'Galerie',  to: '/galerie' },
    { label: 'FAQ',      to: '/faq' },
    { label: 'Contact',  to: '/contact' },
  ]

  function closeMenu() { setMenuOpen(false) }

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner container">
          <Link to="/" className="navbar-logo">
            <img
              src="/logo.png"
              alt="Haven Salon"
              className="logo-img"
              onError={e => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <span className="logo-text" style={{ display: 'none' }}>
              <span className="logo-haven">Haven</span>
              <span className="logo-salon">Salon</span>
            </span>
          </Link>

          <nav className="navbar-links">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={location.pathname === l.to ? 'active' : ''}
              >
                {l.label}
              </Link>
            ))}
            <ThemeToggle />
            <button className="btn-primary navbar-cta" onClick={openBooking}>
              Afspraak maken
            </button>
          </nav>

          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu openen"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <button className="mobile-menu-close" onClick={closeMenu} aria-label="Sluiten">✕</button>
        <nav className="mobile-menu-links">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={location.pathname === l.to ? 'active' : ''}
              onClick={closeMenu}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-menu-actions">
          <ThemeToggle />
        </div>
        <button
          className="btn-primary mobile-menu-cta"
          onClick={() => { openBooking(); closeMenu() }}
        >
          Afspraak maken
        </button>
      </div>
    </>
  )
}
