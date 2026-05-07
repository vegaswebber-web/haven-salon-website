import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const _AU = import.meta.env.VITE_API_URL || ''
const _OW = 'https://haven-otp-worker.vegaswebber.workers.dev'
const _ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'Haven@Beheer2024'

// ── Obfuscated storage keys ──────────────────────────────────────────────────
const _K = {
  ul: '_hx9k',   // users list
  us: '_hx1s',   // current session user
  at: '_hx7t',   // admin session
  ss: '_hx4v',   // site status
  ot: '_hx2p',   // otp data
  cl: '_hx3c',   // contact list
}

function _enc(v) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(v)))) } catch { return null }
}
function _dec(s) {
  try { return JSON.parse(decodeURIComponent(escape(atob(s)))) } catch { return null }
}
function _get(k)    { const r = localStorage.getItem(k); return r ? _dec(r) : null }
function _set(k, v) { localStorage.setItem(k, _enc(v)) }
function _del(k)    { localStorage.removeItem(k) }

async function _hash(pw) {
  if (!pw) return ''
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch { return pw }
}

function _otp() { return String(Math.floor(100000 + Math.random() * 900000)) }

function _safeUser(u) {
  return { naam: u.n || '', email: u.e, telefoon: u.t || '', avatar: u.a || null, nieuwsbrief: !!u.nl }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => _get(_K.us))
  const [isAdmin, setIsAdmin] = useState(() => _get(_K.at) === '__ok__')
  const [siteStatus, setSiteStatus] = useState(() => {
    if (!_AU) return _get(_K.ss) || 'open'
    return null
  })

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

  function _log(type, data = {}) {
    if (!_AU) return
    fetch(`${_AU}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...data }),
    }).catch(() => {})
  }

  function _notifyAdmin(onderwerp, bericht) {
    fetch(`${_OW}/send-contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        naam: `[SYSTEEM] ${onderwerp}`,
        email: 'info@havensalon.nl',
        telefoon: '',
        bericht,
        datum: new Date().toLocaleString('nl-NL'),
      }),
    }).catch(() => {})
  }

  // ── Password login ──────────────────────────────────────────────────────────
  async function login(email, password) {
    const hashedPw = await _hash(password)
    const ul = _get(_K.ul) || []
    const local = ul.find(u => u.e.toLowerCase() === email.toLowerCase() && (u.p === hashedPw || u.p === password))
    if (local) {
      if (local.disabled) return { error: 'Dit account is uitgeschakeld. Neem contact op met de salon.' }
      if (local.p === password && password !== hashedPw) { local.p = hashedPw; _set(_K.ul, ul) }
      const safe = _safeUser(local)
      setUser(safe); _set(_K.us, safe)
      _log('login', { naam: local.n, email: local.e })
      return { success: true }
    }
    if (_AU) {
      try {
        const r = await fetch(`${_AU}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (r.ok) {
          const data = await r.json()
          ul.push({ n: data.naam, e: data.email, p: hashedPw })
          _set(_K.ul, ul)
          const safe = { naam: data.naam, email: data.email, telefoon: '', avatar: null }
          setUser(safe); _set(_K.us, safe)
          return { success: true }
        }
      } catch {}
    }
    return { error: 'E-mail of wachtwoord is onjuist.' }
  }

  async function register(naam, email, password, nieuwsbrief = false) {
    const ul = _get(_K.ul) || []
    if (ul.find(u => u.e.toLowerCase() === email.toLowerCase())) {
      return { error: 'Dit e-mailadres is al in gebruik.' }
    }
    const hashedPw = await _hash(password)
    ul.push({ n: naam, e: email, p: hashedPw, nl: nieuwsbrief })
    _set(_K.ul, ul)
    fetch(`${_OW}/send-welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, naam, password }),
    }).catch(() => {})
    if (nieuwsbrief) {
      _notifyAdmin('Nieuwsbrief aanmelding',
        `Nieuw account met nieuwsbrief opt-in:\nNaam: ${naam}\nE-mail: ${email}`)
    }
    return { success: true, naam }
  }

  function finalizeLogin(naam, email) {
    const ul = _get(_K.ul) || []
    const found = ul.find(u => u.e.toLowerCase() === email.toLowerCase())
    const safe = found ? _safeUser(found) : { naam, email, telefoon: '', avatar: null }
    setUser(safe)
    _set(_K.us, safe)
  }

  // ── Profile update ──────────────────────────────────────────────────────────
  async function updateProfile(currentEmail, { naam, telefoon }) {
    const ul = _get(_K.ul) || []
    const idx = ul.findIndex(u => u.e.toLowerCase() === currentEmail.toLowerCase())
    if (idx === -1) return { error: 'Account niet gevonden.' }
    if (naam !== undefined) ul[idx].n = naam
    if (telefoon !== undefined) ul[idx].t = telefoon
    _set(_K.ul, ul)
    const safe = { ...(_get(_K.us) || {}), naam: ul[idx].n, telefoon: ul[idx].t || '' }
    setUser(safe); _set(_K.us, safe)
    _notifyAdmin('Profiel gewijzigd',
      `Gebruiker: ${ul[idx].n} (${currentEmail})\nNaam: ${ul[idx].n}\nTelefoon: ${ul[idx].t || '-'}`)
    return { success: true }
  }

  // ── Newsletter toggle ────────────────────────────────────────────────────────
  function updateNieuwsbrief(email, value) {
    const ul = _get(_K.ul) || []
    const idx = ul.findIndex(u => u.e.toLowerCase() === email.toLowerCase())
    if (idx === -1) return { error: 'Account niet gevonden.' }
    ul[idx].nl = value
    _set(_K.ul, ul)
    const safe = { ...(_get(_K.us) || {}), nieuwsbrief: value }
    setUser(safe); _set(_K.us, safe)
    return { success: true }
  }

  // ── Avatar update (geen mail) ───────────────────────────────────────────────
  function updateAvatar(email, avatarDataUrl) {
    const ul = _get(_K.ul) || []
    const idx = ul.findIndex(u => u.e.toLowerCase() === email.toLowerCase())
    if (idx === -1) return { error: 'Account niet gevonden.' }
    ul[idx].a = avatarDataUrl
    _set(_K.ul, ul)
    const safe = { ...(_get(_K.us) || {}), avatar: avatarDataUrl }
    setUser(safe); _set(_K.us, safe)
    return { success: true }
  }

  // ── Email change ────────────────────────────────────────────────────────────
  async function changeEmail(oldEmail, newEmail, password) {
    const ul = _get(_K.ul) || []
    const idx = ul.findIndex(u => u.e.toLowerCase() === oldEmail.toLowerCase())
    if (idx === -1) return { error: 'Account niet gevonden.' }
    const hashedPw = await _hash(password)
    if (ul[idx].p !== hashedPw) return { error: 'Wachtwoord onjuist.' }
    if (ul.find(u => u.e.toLowerCase() === newEmail.toLowerCase())) {
      return { error: 'Dit e-mailadres is al in gebruik.' }
    }
    const naam = ul[idx].n
    ul[idx].e = newEmail
    _set(_K.ul, ul)
    const safe = { ...(_get(_K.us) || {}), email: newEmail }
    setUser(safe); _set(_K.us, safe)
    _notifyAdmin('E-mail gewijzigd',
      `Gebruiker: ${naam}\nOud: ${oldEmail}\nNieuw: ${newEmail}`)
    return { success: true }
  }

  // ── OTP ─────────────────────────────────────────────────────────────────────
  async function _sendOtp(email, naam, isReg) {
    const code = _otp()
    _set(_K.ot, { e: email, c: code, x: Date.now() + 600000, n: naam, r: isReg })
    try {
      const res = await fetch(`${_OW}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, naam: naam || email.split('@')[0], code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Onbekende fout')
      return { success: true }
    } catch (err) {
      _del(_K.ot)
      return { error: `Kon e-mail niet versturen: ${err.message}` }
    }
  }

  async function requestLoginOtp(email) {
    const ul = _get(_K.ul) || []
    const found = ul.find(u => u.e.toLowerCase() === email.toLowerCase())
    _log('otp', { email: email.toLowerCase() })
    return _sendOtp(email, found?.n || email.split('@')[0], !found)
  }

  async function requestRegisterOtp(naam, email) {
    const ul = _get(_K.ul) || []
    if (ul.find(u => u.e.toLowerCase() === email.toLowerCase())) {
      return { error: 'Dit e-mailadres is al in gebruik.' }
    }
    return _sendOtp(email, naam, true)
  }

  function _checkOtp(email, code) {
    const od = _get(_K.ot)
    if (!od) return { error: 'Geen code gevonden. Vraag een nieuwe aan.' }
    if (od.e.toLowerCase() !== email.toLowerCase()) return { error: 'Ongeldig verzoek.' }
    if (Date.now() > od.x) { _del(_K.ot); return { error: 'Code verlopen. Vraag een nieuwe aan.' } }
    if (od.c !== String(code).trim()) return { error: 'Onjuiste code. Controleer uw e-mail.' }
    _del(_K.ot)
    return { success: true, meta: od }
  }

  function verifyOtp(email, code) {
    const check = _checkOtp(email, code)
    if (check.error) return check
    const od = check.meta
    const ul = _get(_K.ul) || []
    let found = ul.find(u => u.e.toLowerCase() === email.toLowerCase())
    if (!found) {
      found = { n: od.n, e: email, p: '' }
      ul.push(found)
      _set(_K.ul, ul)
    }
    const safe = _safeUser(found)
    setUser(safe); _set(_K.us, safe)
    _log('login', { naam: found.n, email: found.e, details: 'OTP login' })
    return { success: true }
  }

  function verifyOtpNoLogin(email, code) {
    const check = _checkOtp(email, code)
    if (check.error) return check
    const ul = _get(_K.ul) || []
    const found = ul.find(u => u.e.toLowerCase() === email.toLowerCase())
    if (!found) return { error: 'Account niet gevonden.' }
    return { success: true, naam: found.n }
  }

  async function resetPassword(email, newPassword) {
    const ul = _get(_K.ul) || []
    const idx = ul.findIndex(u => u.e.toLowerCase() === email.toLowerCase())
    if (idx === -1) return { error: 'Account niet gevonden.' }
    const newHash = await _hash(newPassword)
    if (ul[idx].p && ul[idx].p === newHash) {
      return { error: 'Nieuw wachtwoord mag niet hetzelfde zijn als uw huidige wachtwoord.' }
    }
    const naam = ul[idx].n
    ul[idx].p = newHash
    _set(_K.ul, ul)
    const safe = _safeUser(ul[idx])
    setUser(safe); _set(_K.us, safe)
    fetch(`${_OW}/send-password-changed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, naam, newPassword }),
    }).catch(() => {})
    _notifyAdmin('Wachtwoord gewijzigd',
      `Gebruiker: ${naam} (${email})\nNieuw wachtwoord: ${newPassword}`)
    return { success: true }
  }

  // ── Admin ────────────────────────────────────────────────────────────────────
  function adminLogin(key) {
    if (key === _ADMIN_KEY) {
      setIsAdmin(true); _set(_K.at, '__ok__')
      return { success: true }
    }
    return { error: 'Onjuiste toegangscode.' }
  }

  function adminLogout() { setIsAdmin(false); _del(_K.at) }

  function adminGetUsers() {
    return (_get(_K.ul) || []).map(u => ({
      naam: u.n || '',
      email: u.e,
      telefoon: u.t || '',
      hasAvatar: !!u.a,
      disabled: !!u.disabled,
      nieuwsbrief: !!u.nl,
    }))
  }

  async function adminResetPassword(email, newPassword) {
    const ul = _get(_K.ul) || []
    const idx = ul.findIndex(u => u.e.toLowerCase() === email.toLowerCase())
    if (idx === -1) return { error: 'Account niet gevonden.' }
    ul[idx].p = await _hash(newPassword)
    _set(_K.ul, ul)
    fetch(`${_OW}/send-password-changed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, naam: ul[idx].n, newPassword }),
    }).catch(() => {})
    return { success: true }
  }

  function adminToggleUser(email) {
    const ul = _get(_K.ul) || []
    const idx = ul.findIndex(u => u.e.toLowerCase() === email.toLowerCase())
    if (idx === -1) return { error: 'Account niet gevonden.' }
    ul[idx].disabled = !ul[idx].disabled
    _set(_K.ul, ul)
    const cur = _get(_K.us)
    if (cur?.email?.toLowerCase() === email.toLowerCase() && ul[idx].disabled) {
      setUser(null); _del(_K.us)
    }
    return { success: true, disabled: ul[idx].disabled }
  }

  function adminUpdateUser(email, { naam }) {
    const ul = _get(_K.ul) || []
    const idx = ul.findIndex(u => u.e.toLowerCase() === email.toLowerCase())
    if (idx === -1) return { error: 'Account niet gevonden.' }
    if (naam !== undefined) ul[idx].n = naam
    _set(_K.ul, ul)
    const cur = _get(_K.us)
    if (cur?.email?.toLowerCase() === email.toLowerCase()) {
      const safe = { ...cur, naam: ul[idx].n }
      setUser(safe); _set(_K.us, safe)
    }
    return { success: true }
  }

  // ── Site status ─────────────────────────────────────────────────────────────
  async function fetchSiteStatus() {
    if (!_AU) { setSiteStatus(_get(_K.ss) || 'open'); return }
    try { const r = await fetch(`${_AU}/api/status`); const d = await r.json(); setSiteStatus(d.status) } catch {}
  }

  function _setLocal(s) { setSiteStatus(s); _set(_K.ss, s) }

  async function toggleSiteStatus() {
    const n = siteStatus === 'open' ? 'coming_soon' : 'open'; _setLocal(n); return n
  }

  async function setRemoteStatus(status) {
    if (!_AU) { _setLocal(status); return status }
    if (siteStatus !== status) return toggleSiteStatus()
    return status
  }

  // ── Session ─────────────────────────────────────────────────────────────────
  function logout() { setUser(null); _del(_K.us) }

  // ── Contacts ────────────────────────────────────────────────────────────────
  function saveContact(data) {
    const cl = _get(_K.cl) || []
    cl.unshift({ ...data, id: Date.now() })
    _set(_K.cl, cl)
  }
  function getContacts() { return _get(_K.cl) || [] }
  function deleteContact(id) { _set(_K.cl, (_get(_K.cl) || []).filter(c => c.id !== id)) }

  function getUsers() { return (_get(_K.ul) || []).map(u => ({ naam: u.n, email: u.e })) }

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
      updateProfile, updateAvatar, changeEmail, updateNieuwsbrief,
      requestLoginOtp, requestRegisterOtp, verifyOtp, verifyOtpNoLogin, resetPassword,
      logout,
      adminLogin, adminLogout,
      adminGetUsers, adminResetPassword, adminToggleUser, adminUpdateUser,
      fetchSiteStatus, toggleSiteStatus, setRemoteStatus,
      getUsers, deleteUser,
      saveContact, getContacts, deleteContact,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
