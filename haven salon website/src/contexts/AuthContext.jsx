import { createContext, useContext, useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || ''

const SERVICE_ID     = import.meta.env.VITE_EMAILJS_SERVICE_ID
const OTP_TEMPLATE   = import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID
const PUBLIC_KEY     = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('haven_user')) } catch { return null }
  })
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('haven_admin_token') || '')
  const [isAdmin, setIsAdmin] = useState(false)
  const [siteStatus, setSiteStatus] = useState(() => {
    if (!API_URL) return localStorage.getItem('haven_site_status') || 'open'
    return null
  })

  // Fetch site status from API on mount + poll every 15 seconds
  useEffect(() => {
    if (!API_URL) return
    function checkStatus() {
      fetch(`${API_URL}/api/status`)
        .then(r => r.json())
        .then(d => setSiteStatus(d.status || 'open'))
        .catch(() => setSiteStatus('open'))
    }
    checkStatus()
    const interval = setInterval(checkStatus, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!adminToken) return
    const LOCAL_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'haven2024'
    if (!API_URL) {
      if (adminToken === LOCAL_ADMIN_PASSWORD) {
        setIsAdmin(true)
      } else {
        setAdminToken('')
        localStorage.removeItem('haven_admin_token')
      }
      return
    }
    fetch(`${API_URL}/api/appointments`, { headers: { Authorization: `Bearer ${adminToken}` } })
      .then(r => {
        if (r.ok) {
          setIsAdmin(true)
          fetch(`${API_URL}/api/status`).then(sr => sr.json()).then(d => setSiteStatus(d.status)).catch(() => {})
        } else {
          setAdminToken('')
          localStorage.removeItem('haven_admin_token')
        }
      })
      .catch(() => {})
  }, [])

  // ─── Password login ────────────────────────────────────────────────────────

  function login(email, password) {
    const users = JSON.parse(localStorage.getItem('haven_users') || '[]')
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!found) return { error: 'E-mail of wachtwoord is onjuist.' }
    const safe = { naam: found.naam, email: found.email }
    setUser(safe)
    localStorage.setItem('haven_user', JSON.stringify(safe))
    return { success: true }
  }

  async function register(naam, email, password) {
    const users = JSON.parse(localStorage.getItem('haven_users') || '[]')
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'Dit e-mailadres is al in gebruik.' }
    }
    const newUser = { naam, email, password }
    users.push(newUser)
    localStorage.setItem('haven_users', JSON.stringify(users))
    const safe = { naam, email }
    setUser(safe)
    localStorage.setItem('haven_user', JSON.stringify(safe))
    if (API_URL) {
      fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam, email }),
      }).catch(() => {})
    }
    return { success: true }
  }

  // ─── OTP helpers ───────────────────────────────────────────────────────────

  async function _sendOtp(email, naam, isRegistration) {
    const code    = generateOtp()
    const expires = Date.now() + 10 * 60 * 1000   // 10 minutes
    localStorage.setItem('haven_otp', JSON.stringify({ email, code, expires, naam, isRegistration }))

    try {
      await emailjs.send(SERVICE_ID, OTP_TEMPLATE, {
        'to-email': email,
        naam:       naam || 'Klant',
        otp_code:   code,
      }, PUBLIC_KEY)
      return { success: true }
    } catch {
      localStorage.removeItem('haven_otp')
      return { error: 'Kon e-mail niet versturen. Probeer het opnieuw.' }
    }
  }

  async function requestLoginOtp(email) {
    const users = JSON.parse(localStorage.getItem('haven_users') || '[]')
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!found) return { error: 'Geen account gevonden met dit e-mailadres.' }
    return _sendOtp(email, found.naam, false)
  }

  async function requestRegisterOtp(naam, email) {
    const users = JSON.parse(localStorage.getItem('haven_users') || '[]')
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'Dit e-mailadres is al in gebruik.' }
    }
    return _sendOtp(email, naam, true)
  }

  function verifyOtp(email, code) {
    const raw = localStorage.getItem('haven_otp')
    if (!raw) return { error: 'Geen code gevonden. Vraag een nieuwe aan.' }
    const otpData = JSON.parse(raw)

    if (otpData.email.toLowerCase() !== email.toLowerCase()) {
      return { error: 'Ongeldig verzoek.' }
    }
    if (Date.now() > otpData.expires) {
      localStorage.removeItem('haven_otp')
      return { error: 'Code verlopen. Vraag een nieuwe aan.' }
    }
    if (otpData.code !== String(code).trim()) {
      return { error: 'Onjuiste code. Controleer uw e-mail.' }
    }

    localStorage.removeItem('haven_otp')

    const users = JSON.parse(localStorage.getItem('haven_users') || '[]')
    let found = users.find(u => u.email.toLowerCase() === email.toLowerCase())

    if (!found && otpData.isRegistration) {
      found = { naam: otpData.naam, email }
      users.push(found)
      localStorage.setItem('haven_users', JSON.stringify(users))
      // Send welcome email via Worker if configured
      if (API_URL) {
        fetch(`${API_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ naam: found.naam, email }),
        }).catch(() => {})
      }
    }

    if (!found) return { error: 'Account niet gevonden.' }

    const safe = { naam: found.naam, email: found.email }
    setUser(safe)
    localStorage.setItem('haven_user', JSON.stringify(safe))
    return { success: true }
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  async function adminLogin(password) {
    const LOCAL_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'haven2024'
    if (!API_URL) {
      if (password === LOCAL_ADMIN_PASSWORD) {
        setAdminToken(password)
        setIsAdmin(true)
        localStorage.setItem('haven_admin_token', password)
        return { success: true }
      }
      return { error: 'Verkeerd wachtwoord' }
    }
    try {
      const r = await fetch(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${password}` },
      })
      if (r.ok) {
        setAdminToken(password)
        setIsAdmin(true)
        localStorage.setItem('haven_admin_token', password)
        const sr = await fetch(`${API_URL}/api/status`)
        const sd = await sr.json()
        setSiteStatus(sd.status)
        return { success: true }
      }
      return { error: 'Verkeerd wachtwoord' }
    } catch {
      return { error: 'Verbindingsfout. Controleer de Worker URL.' }
    }
  }

  // ─── Site status ───────────────────────────────────────────────────────────

  async function fetchSiteStatus() {
    if (!API_URL) {
      const local = localStorage.getItem('haven_site_status') || 'open'
      setSiteStatus(local)
      return
    }
    try {
      const r = await fetch(`${API_URL}/api/status`)
      const d = await r.json()
      setSiteStatus(d.status)
    } catch {}
  }

  function setStatusLocal(status) {
    setSiteStatus(status)
    localStorage.setItem('haven_site_status', status)
  }

  async function toggleSiteStatus() {
    if (!API_URL) {
      const next = siteStatus === 'open' ? 'coming_soon' : 'open'
      setStatusLocal(next)
      return next
    }
    if (!adminToken) return null
    try {
      const r = await fetch(`${API_URL}/api/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const d = await r.json()
      setSiteStatus(d.status)
      return d.status
    } catch {
      return null
    }
  }

  async function setRemoteStatus(status) {
    if (!API_URL) {
      setStatusLocal(status)
      return status
    }
    if (siteStatus !== status) {
      return toggleSiteStatus()
    }
    return status
  }

  // ─── Session ───────────────────────────────────────────────────────────────

  function logout() {
    setUser(null)
    localStorage.removeItem('haven_user')
  }

  function adminLogout() {
    setAdminToken('')
    setIsAdmin(false)
    localStorage.removeItem('haven_admin_token')
  }

  return (
    <AuthContext.Provider value={{
      user, isAdmin, siteStatus,
      login, register,
      requestLoginOtp, requestRegisterOtp, verifyOtp,
      adminLogin,
      logout, adminLogout,
      fetchSiteStatus, toggleSiteStatus, setRemoteStatus,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
