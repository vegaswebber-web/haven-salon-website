import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import ComingSoonPage from './pages/ComingSoonPage'
import './App.css'

function SiteContent() {
  const { siteStatus, isAdmin } = useAuth()
  const { open: bookingOpen } = useBooking()

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
      <Navbar />
      <main>
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/over-ons"  element={<OverOnsPage />} />
          <Route path="/prijzen"   element={<PrijzenPage />} />
          <Route path="/team"      element={<TeamPage />} />
          <Route path="/contact"   element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
      {bookingOpen && <BookingModal />}
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
