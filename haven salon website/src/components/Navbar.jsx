import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import AuthPanel from './AuthPanel'
import AdminWidget from './AdminWidget'
import { useAuth } from '../contexts/AuthContext'
import { useBooking } from '../contexts/BookingContext'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const location = useLocation()
  const { user, isAdmin } = useAuth()
  const { openBooking } = useBooking()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Over Ons', to: '/over-ons' },
    { label: 'Tarieven', to: '/prijzen' },
    { label: 'Team', to: '/team' },
    { label: 'Galerie', to: '/#galerie', hash: true },
    { label: 'FAQ', to: '/#faq', hash: true },
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

          {/* Desktop nav */}
          <nav className="navbar-links">
            {links.map(l => l.hash ? (
              <a key={l.to} href={l.to}>{l.label}</a>
            ) : (
              <Link
                key={l.to}
                to={l.to}
                className={location.pathname === l.to ? 'active' : ''}
              >
                {l.label}
              </Link>
            ))}
            <ThemeToggle />

            {isAdmin && (
              <button
                className="navbar-admin-btn"
                onClick={() => setAdminOpen(v => !v)}
                title="Admin beheer"
              >
                ⚙
              </button>
            )}

            <button
              className="navbar-auth-btn"
              onClick={() => setAuthOpen(true)}
              title={user ? `Ingelogd als ${user.naam}` : 'Inloggen'}
            >
              {user
                ? <span className="navbar-user-initial">{user.naam?.[0]?.toUpperCase()}</span>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              }
            </button>

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

      {/* Mobile menu — rendered OUTSIDE header to avoid z-index stacking context */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <button className="mobile-menu-close" onClick={closeMenu} aria-label="Sluiten">✕</button>
        <nav className="mobile-menu-links">
          {links.map(l => l.hash ? (
            <a key={l.to} href={l.to} onClick={closeMenu}>{l.label}</a>
          ) : (
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
          {isAdmin && (
            <button
              className="navbar-admin-btn"
              onClick={() => { setAdminOpen(v => !v); closeMenu() }}
            >⚙</button>
          )}
          <button
            className="navbar-auth-btn"
            onClick={() => { setAuthOpen(true); closeMenu() }}
          >
            {user
              ? <span className="navbar-user-initial">{user.naam?.[0]?.toUpperCase()}</span>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            }
          </button>
        </div>
        <button
          className="btn-primary mobile-menu-cta"
          onClick={() => { openBooking(); closeMenu() }}
        >
          Afspraak maken
        </button>
      </div>

      {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} />}
      {adminOpen && <AdminWidget onClose={() => setAdminOpen(false)} />}
    </>
  )
}
