import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
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
import NotFoundPage from './pages/NotFoundPage'
import WhatsAppButton from './components/WhatsAppButton'
import TopBanner from './components/TopBanner'
import CookieConsent from './components/CookieConsent'
import OpeningConfetti from './components/OpeningConfetti'
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
  const { open: bookingOpen } = useBooking()

  return (
    <>
      {location.pathname === '/' && <TopBanner />}
      <ScrollReveal />
      <OpeningConfetti />
      <Navbar />
      <main key={location.pathname} className="page-fade">
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/over-ons" element={<OverOnsPage />} />
          <Route path="/prijzen"  element={<PrijzenPage />} />
          <Route path="/team"     element={<TeamPage />} />
          <Route path="/galerie"  element={<GaleriePage />} />
          <Route path="/faq"      element={<FAQPage />} />
          <Route path="/contact"  element={<ContactPage />} />
          <Route path="*"         element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      {bookingOpen && <BookingModal />}
      <WhatsAppButton />
      <CookieConsent />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BookingProvider>
        <BrowserRouter>
          <SiteContent />
        </BrowserRouter>
      </BookingProvider>
    </ThemeProvider>
  )
}
