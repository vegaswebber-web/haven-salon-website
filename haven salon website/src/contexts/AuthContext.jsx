import { createContext, useContext, useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'

const AuthContext = createContext(null)
const _AU = import.meta.env.VITE_API_URL || ''

// ── Obfuscated storage keys ──────────────────────────────────────────────────
const _K = {
  ul: '_hx9k',   // users list
  us: '_hx1s',   // current session user
  at: '_hx7t',   // admin token
  ss: '_hx4v',   // site status
  ot: '_hx2p',   // otp data
}

// ── Encode / decode (base64 + URI) ───────────────────────────────────────────
function _enc(v) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(v)))) } catch { return null }
}
function _dec(s) {
  try { return JSON.parse(decodeURIComponent(escape(atob(s)))) } catch { return null }
}
function _get(k)     { const r = localStorage.getItem(k); return r ? _dec(r) : null }
function _set(k, v)  { localStorage.setItem(k, _enc(v)) }
function _del(k)     { localStorage.removeItem(k) }

// ── EmailJS ───────────────────────────────────────────────────────────────────
const _SID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const _TID = import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID
const _WID = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID
const _PK  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

function _otp() { return String(Math.floor(100000 + Math.random() * 900000)) }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => _get(_K.us))
  const [_at, _setAt]   = useState(() => {
    const t = localStorage.getItem(_K.at)
    return t ? _dec(t) : ''
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const [siteStatus, setSiteStatus] = useState(() => {
    if (!_AU) return _get(_K.ss) || 'open'
    return null
  })

  // Poll site status
  useEffect(() => {
    if (!_AU) return
    function _cs() {
      fetch(`${_AU}/api/status`)
        .then(r => r.json())
        .then(d => setSiteStatus(d.status || 'open'))
        .catch(() => setSiteStatus('open'))
    }
    _cs()
    const _iv = setInterval(_cs, 15000)
    return () => clearInterval(_iv)
  }, [])

  // Verify admin token on load
  useEffect(() => {
    if (!_at) return
    const _lp = import.meta.env.VITE_ADMIN_PASSWORD || 'haven2024'
    if (!_AU) {
      if (_at === _lp) { setIsAdmin(true) }
      else { _setAt(''); _del(_K.at) }
      return
    }
    fetch(`${_AU}/api/appointments`, { headers: { Authorization: `Bearer ${_at}` } })
      .then(r => {
        if (r.ok) {
          setIsAdmin(true)
          fetch(`${_AU}/api/status`).then(sr => sr.json()).then(d => setSiteStatus(d.status)).catch(() => {})
        } else { _setAt(''); _del(_K.at) }
      })
      .catch(() => {})
  }, [])

  // ── Password login ──────────────────────────────────────────────────────────
  function login(email, password) {
    const ul = _get(_K.ul) || []
    const found = ul.find(u => u.e.toLowerCase() === email.toLowerCase() && u.p === password)
    if (!found) return { error: 'E-mail of wachtwoord is onjuist.' }
    const safe = { naam: found.n, email: found.e }
    setUser(safe)
    _set(_K.us, safe)
    return { success: true }
  }

  async function register(naam, email, password) {
    const ul = _get(_K.ul) || []
    if (ul.find(u => u.e.toLowerCase() === email.toLowerCase())) {
      return { error: 'Dit e-mailadres is al in gebruik.' }
    }
    ul.push({ n: naam, e: email, p: password })
    _set(_K.ul, ul)
    if (_AU) {
      fetch(`${_AU}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam, email }),
      }).catch(() => {})
    }
    // Send welcome email
    if (_WID) {
      emailjs.send(_SID, _WID, {
        'to-email': email,
        naam,
      }, _PK).catch(() => {})
    }
    // Don't auto-login — WelcomeGate shows welcome screen first
    return { success: true, naam }
  }

  function finalizeLogin(naam, email) {
    const safe = { naam, email }
    setUser(safe)
    _set(_K.us, safe)
  }

  // ── OTP ─────────────────────────────────────────────────────────────────────
  async function _sendOtp(email, naam, isReg) {
    const code = _otp()
    _set(_K.ot, { e: email, c: code, x: Date.now() + 600000, n: naam, r: isReg })
    try {
      await emailjs.send(_SID, _TID, {
        'to-email': email,
        naam:       naam || 'Klant',
        otp_code:   code,
      }, _PK)
      return { success: true }
    } catch {
      _del(_K.ot)
      return { error: 'Kon e-mail niet versturen. Probeer het opnieuw.' }
    }
  }

  async function requestLoginOtp(email) {
    const ul = _get(_K.ul) || []
    const found = ul.find(u => u.e.toLowerCase() === email.toLowerCase())
    // If no account found, still send OTP — will create account on verify
    return _sendOtp(email, found?.n || 'Klant', !found)
  }

  async function requestRegisterOtp(naam, email) {
    const ul = _get(_K.ul) || []
    if (ul.find(u => u.e.toLowerCase() === email.toLowerCase())) {
      return { error: 'Dit e-mailadres is al in gebruik.' }
    }
    return _sendOtp(email, naam, true)
  }

  function verifyOtp(email, code) {
    const od = _get(_K.ot)
    if (!od) return { error: 'Geen code gevonden. Vraag een nieuwe aan.' }
    if (od.e.toLowerCase() !== email.toLowerCase()) return { error: 'Ongeldig verzoek.' }
    if (Date.now() > od.x) { _del(_K.ot); return { error: 'Code verlopen. Vraag een nieuwe aan.' } }
    if (od.c !== String(code).trim()) return { error: 'Onjuiste code. Controleer uw e-mail.' }
    _del(_K.ot)
    const ul = _get(_K.ul) || []
    let found = ul.find(u => u.e.toLowerCase() === email.toLowerCase())
    if (!found && od.r) {
      found = { n: od.n, e: email, p: '' }
      ul.push(found)
      _set(_K.ul, ul)
      if (_AU) {
        fetch(`${_AU}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ naam: od.n, email }),
        }).catch(() => {})
      }
    }
    if (!found) return { error: 'Account niet gevonden.' }
    const safe = { naam: found.n, email: found.e }
    setUser(safe)
    _set(_K.us, safe)
    return { success: true }
  }

  // ── Admin ───────────────────────────────────────────────────────────────────
  async function adminLogin(password) {
    const _lp = import.meta.env.VITE_ADMIN_PASSWORD || 'haven2024'
    if (!_AU) {
      if (password === _lp) {
        _setAt(password); setIsAdmin(true); _set(_K.at, password)
        return { success: true }
      }
      return { error: 'Verkeerd wachtwoord' }
    }
    try {
      const r = await fetch(`${_AU}/api/appointments`, {
        headers: { Authorization: `Bearer ${password}` },
      })
      if (r.ok) {
        _setAt(password); setIsAdmin(true); _set(_K.at, password)
        const sr = await fetch(`${_AU}/api/status`)
        const sd = await sr.json()
        setSiteStatus(sd.status)
        return { success: true }
      }
      return { error: 'Verkeerd wachtwoord' }
    } catch {
      return { error: 'Verbindingsfout. Controleer de Worker URL.' }
    }
  }

  // ── Site status ─────────────────────────────────────────────────────────────
  async function fetchSiteStatus() {
    if (!_AU) { setSiteStatus(_get(_K.ss) || 'open'); return }
    try { const r = await fetch(`${_AU}/api/status`); const d = await r.json(); setSiteStatus(d.status) } catch {}
  }

  function _setLocal(s) { setSiteStatus(s); _set(_K.ss, s) }

  async function toggleSiteStatus() {
    if (!_AU) { const n = siteStatus === 'open' ? 'coming_soon' : 'open'; _setLocal(n); return n }
    if (!_at) return null
    try {
      const r = await fetch(`${_AU}/api/toggle`, { method: 'POST', headers: { Authorization: `Bearer ${_at}` } })
      const d = await r.json(); setSiteStatus(d.status); return d.status
    } catch { return null }
  }

  async function setRemoteStatus(status) {
    if (!_AU) { _setLocal(status); return status }
    if (siteStatus !== status) return toggleSiteStatus()
    return status
  }

  // ── Session ─────────────────────────────────────────────────────────────────
  function logout() { setUser(null); _del(_K.us) }

  function adminLogout() { _setAt(''); setIsAdmin(false); _del(_K.at) }

  // ── Read users for admin panel ───────────────────────────────────────────────
  function getUsers() { return (_get(_K.ul) || []).map(u => ({ naam: u.n, email: u.e, password: u.p })) }

  function deleteUser(email) {
    const ul = (_get(_K.ul) || []).filter(u => u.e !== email)
    _set(_K.ul, ul)
    const cur = _get(_K.us)
    if (cur?.email === email) { setUser(null); _del(_K.us) }
  }

  return (
    <AuthContext.Provider value={{
      user, isAdmin, siteStatus,
      login, register, finalizeLogin,
      requestLoginOtp, requestRegisterOtp, verifyOtp,
      adminLogin,
      logout, adminLogout,
      fetchSiteStatus, toggleSiteStatus, setRemoteStatus,
      getUsers, deleteUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
