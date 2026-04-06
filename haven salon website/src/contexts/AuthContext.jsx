import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || ''

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('haven_user')) } catch { return null }
  })
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('haven_admin_token') || '')
  const [isAdmin, setIsAdmin] = useState(false)
  const [siteStatus, setSiteStatus] = useState(() => {
    // Local mode: read from localStorage; API mode: will be fetched
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
      // Local mode: verify stored token against local password
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

  function login(email, password) {
    const users = JSON.parse(localStorage.getItem('haven_users') || '[]')
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (found) {
      const safe = { naam: found.naam, email: found.email }
      setUser(safe)
      localStorage.setItem('haven_user', JSON.stringify(safe))
      return { success: true }
    }
    return { error: 'E-mail of wachtwoord is onjuist' }
  }

  async function register(naam, email, password) {
    const users = JSON.parse(localStorage.getItem('haven_users') || '[]')
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'Dit e-mailadres is al in gebruik' }
    }
    users.push({ naam, email, password })
    localStorage.setItem('haven_users', JSON.stringify(users))
    const safe = { naam, email }
    setUser(safe)
    localStorage.setItem('haven_user', JSON.stringify(safe))
    // Send welcome email via Worker (if configured)
    if (API_URL) {
      try {
        await fetch(`${API_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ naam, email }),
        })
      } catch {}
    }
    return { success: true }
  }

  async function adminLogin(password) {
    const LOCAL_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'haven2024'
    // Local mode: no API configured
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
    // If API is available, use toggle until we reach desired status
    if (siteStatus !== status) {
      return toggleSiteStatus()
    }
    return status
  }

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
      login, register, adminLogin,
      logout, adminLogout,
      fetchSiteStatus, toggleSiteStatus, setRemoteStatus,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
