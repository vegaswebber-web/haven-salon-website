import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { BookingProvider, useBooking } from './contexts/BookingContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BookingModal from './components/BookingModal'
import HomePage from './pages/HomePage'
import OverOnsPage from './pages/OverOnsPage'
import PrijzenPage from './pages/PrijzenPage'
import TeamPage from './pages/TeamPage'
import ContactPage from './pages/ContactPage'
import GaleriePage from './pages/GaleriePage'
import FAQPage from './pages/FAQPage'
import DienstenPage from './pages/DienstenPage'
import ComingSoonPage from './pages/ComingSoonPage'
import NotFoundPage from './pages/NotFoundPage'
import WhatsAppButton from './components/WhatsAppButton'
import WelcomeGate from './components/WelcomeGate'
import './App.css'

function ScrollReveal() {
  const location = useLocation()
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('section'))
    sections.slice(1).forEach(s => s.classList.add('reveal'))
    const cards = document.querySelectorAll('.pricing-card, .highlight-item, .team-card-large, .about-grid, .service-card, .gallery-item, .faq-item, .team-card')
    cards.forEach(c => c.classList.add('reveal'))

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) }
      })
    }, { threshold: 0.08 })

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [location.pathname])
  return null
}

function SiteContent() {
  const location = useLocation()
  const { siteStatus, isAdmin, user } = useAuth()
  const { open: bookingOpen } = useBooking()
  const [isGuest, setIsGuest] = useState(() => !!sessionStorage.getItem('_hxg'))

  function handleGuest() { sessionStorage.setItem('_hxg', '1'); setIsGuest(true) }

  // Admin can always preview the full site via ?preview=1
  const params = new URLSearchParams(window.location.search)
  const preview = params.get('preview') === '1'

  if (siteStatus === null) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-3)',
        color: 'var(--gold)',
        fontFamily: 'Poppins',
        fontSize: '13px',
        letterSpacing: '2px',
      }}>
        HAVEN SALON
      </div>
    )
  }

  if (siteStatus === 'coming_soon' && !preview) {
    return <ComingSoonPage />
  }

  return (
    <>
      {!user && !isGuest && <WelcomeGate onGuest={handleGuest} />}
      <ScrollReveal />
      <Navbar />
      <main key={location.pathname} className="page-fade">
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/over-ons"  element={<OverOnsPage />} />
          <Route path="/diensten"  element={<DienstenPage />} />
          <Route path="/prijzen"   element={<PrijzenPage />} />
          <Route path="/team"      element={<TeamPage />} />
          <Route path="/galerie"   element={<GaleriePage />} />
          <Route path="/faq"       element={<FAQPage />} />
          <Route path="/contact"   element={<ContactPage />} />
          <Route path="*"          element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      {bookingOpen && <BookingModal />}
      <WhatsAppButton />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookingProvider>
          <BrowserRouter>
            <SiteContent />
          </BrowserRouter>
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
