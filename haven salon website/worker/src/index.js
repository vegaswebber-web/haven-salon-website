const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data, status = 200) {
  return Response.json(data, { status, headers: CORS })
}

function isAdmin(request, env) {
  const auth = request.headers.get('Authorization') || ''
  return auth === `Bearer ${env.ADMIN_PASSWORD}`
}

// ─── SHA-256 hash ─────────────────────────────────────────────────────────────
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─── Log helper ───────────────────────────────────────────────────────────────
async function writeLog(env, type, data) {
  const ts = Date.now()
  const key = `log:${ts}:${type}`
  await env.HAVEN_KV.put(key, JSON.stringify({
    type,
    timestamp: new Date(ts).toISOString(),
    ...data,
  }), { expirationTtl: 60 * 60 * 24 * 365 * 5 }) // 5 jaar bewaren
}

// ─── Welcome mail ─────────────────────────────────────────────────────────────
async function sendWelcomeEmail(naam, email, env) {
  if (!env.RESEND_API_KEY) return
  const html = `
    <!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><style>
      body{font-family:Georgia,serif;background:#0f0f0f;color:#c8c2bc;margin:0;padding:0}
      .wrap{max-width:520px;margin:40px auto;background:#1a1a1a;border:1px solid rgba(201,169,110,.15);padding:48px 40px}
      .logo{font-size:1.6rem;letter-spacing:3px;color:#c9a96e;margin-bottom:4px}
      .sub{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#555;margin-bottom:32px}
      h2{font-size:1.4rem;color:#f0ece6;margin:0 0 16px}
      p{font-size:14px;line-height:1.8;color:#9e9890;margin:0 0 16px}
      .gold{color:#c9a96e}
      .btn{display:inline-block;padding:14px 32px;background:#c9a96e;color:#0f0f0f;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;margin-top:8px}
      .footer{margin-top:40px;padding-top:24px;border-top:1px solid rgba(201,169,110,.12);font-size:11px;color:#555}
    </style></head>
    <body><div class="wrap">
      <div class="logo">Haven Salon</div>
      <div class="sub">Volendam</div>
      <h2>Welkom, <span class="gold">${naam}</span>!</h2>
      <p>Bedankt voor je registratie bij Haven Salon. Wij zijn blij je te verwelkomen.</p>
      <p>Je kunt nu eenvoudig online een afspraak maken. Wij zorgen voor een look die écht bij jou past.</p>
      <a href="https://havensalon.nl" class="btn">Afspraak maken</a>
      <div class="footer">
        <p>Haven Salon · Volendam<br>
        <a href="mailto:info@havensalon.nl" style="color:#c9a96e">info@havensalon.nl</a></p>
        <p style="color:#444">Dit bericht is verzonden omdat je je hebt geregistreerd op havensalon.nl.</p>
      </div>
    </div></body></html>
  `
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Haven Salon <info@havensalon.nl>', to: [email], subject: `Welkom bij Haven Salon, ${naam}!`, html }),
  }).catch(() => {})
}

// ─── Admin panel HTML ─────────────────────────────────────────────────────────
const ADMIN_HTML = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Haven Salon · Admin</title>
<style>
  :root{--gold:#c9a96e;--gold-l:#e0bc86;--bg:#0f0f0f;--bg2:#1a1a1a;--bg3:#111;--text:#c8c2bc;--muted:#555;--border:rgba(201,169,110,.15)}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
  .logo{font-size:1.4rem;letter-spacing:2px;color:var(--gold);font-weight:300}
  header{display:flex;align-items:center;justify-content:space-between;padding:20px 32px;border-bottom:1px solid var(--border);background:var(--bg3)}
  .btn{padding:10px 22px;border:1px solid var(--border);background:transparent;color:var(--gold);font-size:12px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:.2s}
  .btn:hover{background:var(--gold);color:#0f0f0f;border-color:var(--gold)}
  .btn-danger{border-color:#a03030;color:#e07070}
  .btn-danger:hover{background:#a03030;color:#fff;border-color:#a03030}
  .btn-sm{padding:6px 14px;font-size:11px}
  .btn-success{border-color:#2a7a3a;color:#5dc878}
  .btn-success:hover{background:#2a7a3a;color:#fff;border-color:#2a7a3a}
  main{max-width:960px;margin:0 auto;padding:40px 24px}
  h2{font-size:1rem;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:var(--gold);margin-bottom:20px}
  .card{background:var(--bg2);border:1px solid var(--border);padding:28px;margin-bottom:24px}
  .status-row{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
  .status-badge{font-size:13px;display:flex;align-items:center;gap:8px}
  .dot{width:10px;height:10px;border-radius:50%;background:#555}
  .dot.open{background:#4caf50}.dot.closed{background:#e07070}
  /* Tabs */
  .tabs{display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:28px}
  .tab{padding:12px 24px;background:none;border:none;color:var(--muted);font-size:12px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:.2s}
  .tab.active{color:var(--gold);border-bottom-color:var(--gold)}
  .tab-panel{display:none}.tab-panel.active{display:block}
  /* Cards */
  .item-card{border:1px solid var(--border);padding:18px 22px;margin-bottom:10px;background:var(--bg)}
  .item-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:8px}
  .item-name{font-weight:600;color:#f0ece6;font-size:14px}
  .item-date{font-size:11px;color:var(--muted)}
  .item-sub{font-size:12px;color:var(--muted);margin-bottom:6px}
  .item-msg{font-size:13px;line-height:1.6;background:var(--bg3);padding:10px 14px;border-left:2px solid var(--gold)}
  .empty{text-align:center;padding:48px;color:var(--muted);font-size:14px}
  /* Log badges */
  .log-type{display:inline-block;padding:2px 8px;font-size:10px;letter-spacing:1px;text-transform:uppercase;border-radius:2px;margin-right:8px}
  .log-register{background:rgba(76,175,80,.15);color:#5dc878;border:1px solid rgba(76,175,80,.3)}
  .log-login{background:rgba(201,169,110,.12);color:var(--gold);border:1px solid rgba(201,169,110,.25)}
  .log-otp{background:rgba(100,150,255,.12);color:#7aabff;border:1px solid rgba(100,150,255,.25)}
  .log-booking{background:rgba(180,100,255,.12);color:#c57fff;border:1px solid rgba(180,100,255,.25)}
  .log-contact{background:rgba(255,180,50,.12);color:#ffc060;border:1px solid rgba(255,180,50,.25)}
  .log-admin{background:rgba(224,112,112,.12);color:#e07070;border:1px solid rgba(224,112,112,.3)}
  /* Login */
  #login{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
  .login-box{width:100%;max-width:360px;background:var(--bg2);border:1px solid var(--border);padding:48px 36px;text-align:center}
  .login-title{font-size:1.4rem;color:#f0ece6;margin-bottom:8px}
  .login-sub{font-size:13px;color:var(--muted);margin-bottom:32px}
  .login-input{width:100%;padding:13px 16px;background:var(--bg);border:1px solid var(--border);color:#f0ece6;font-size:14px;outline:none;margin-bottom:14px;text-align:center}
  .login-input:focus{border-color:var(--gold)}
  .login-btn{width:100%;padding:13px;background:var(--gold);border:none;color:#0f0f0f;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer}
  .login-btn:hover{background:var(--gold-l)}
  .error-msg{font-size:12px;color:#e07070;margin-top:10px}
  .hidden{display:none!important}
  .logout-btn{background:none;border:none;color:var(--muted);font-size:12px;cursor:pointer;letter-spacing:1px}
  .logout-btn:hover{color:var(--gold)}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
  .stat{background:var(--bg2);border:1px solid var(--border);padding:20px;text-align:center}
  .stat-num{font-size:2rem;font-weight:700;color:var(--gold);display:block}
  .stat-label{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-top:4px;display:block}
</style>
</head>
<body>

<div id="login">
  <div class="login-box">
    <div class="login-title">Haven Salon</div>
    <div class="login-sub">Admin Panel</div>
    <input class="login-input" type="password" id="pw" placeholder="Wachtwoord" onkeydown="if(event.key==='Enter')doLogin()">
    <button class="login-btn" onclick="doLogin()">Inloggen</button>
    <div class="error-msg hidden" id="login-err">Verkeerd wachtwoord</div>
  </div>
</div>

<div id="dashboard" class="hidden">
  <header>
    <span class="logo">HAVEN SALON · ADMIN</span>
    <div style="display:flex;gap:12px;align-items:center">
      <button class="btn" style="font-size:11px;padding:8px 16px" onclick="load()">↻ Vernieuwen</button>
      <button class="logout-btn" onclick="logout()">Uitloggen</button>
    </div>
  </header>

  <main>
    <!-- Stats -->
    <div class="stats">
      <div class="stat"><span class="stat-num" id="st-users">–</span><span class="stat-label">Gebruikers</span></div>
      <div class="stat"><span class="stat-num" id="st-appts">–</span><span class="stat-label">Afspraken</span></div>
      <div class="stat"><span class="stat-num" id="st-logs">–</span><span class="stat-label">Activiteiten</span></div>
      <div class="stat"><span class="stat-num" id="st-status" style="font-size:1rem;padding-top:6px">–</span><span class="stat-label">Site Status</span></div>
    </div>

    <!-- Site status -->
    <div class="card">
      <h2>Website Status</h2>
      <div class="status-row">
        <div class="status-badge"><div class="dot" id="status-dot"></div><span id="status-text">–</span></div>
        <div style="display:flex;gap:10px">
          <button class="btn" id="toggle-btn" onclick="toggleStatus()">–</button>
          <a href="/?preview=1" target="_blank" class="btn" style="text-decoration:none">Preview ↗</a>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab active" onclick="switchTab('appts',this)">Afspraken <span id="tab-appts-count"></span></button>
      <button class="tab" onclick="switchTab('users',this)">Gebruikers <span id="tab-users-count"></span></button>
      <button class="tab" onclick="switchTab('logs',this)">Activiteiten log <span id="tab-logs-count"></span></button>
    </div>

    <div id="panel-appts" class="tab-panel active">
      <div id="appts-list"><div class="empty">Laden…</div></div>
    </div>

    <div id="panel-users" class="tab-panel">
      <div id="users-list"><div class="empty">Laden…</div></div>
    </div>

    <div id="panel-logs" class="tab-panel">
      <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
        <button class="btn btn-sm" onclick="filterLogs('')">Alles</button>
        <button class="btn btn-sm" onclick="filterLogs('register')">Registraties</button>
        <button class="btn btn-sm" onclick="filterLogs('login')">Logins</button>
        <button class="btn btn-sm" onclick="filterLogs('otp')">OTP</button>
        <button class="btn btn-sm" onclick="filterLogs('booking')">Afspraken</button>
        <button class="btn btn-sm" onclick="filterLogs('contact')">Contact</button>
      </div>
      <div id="logs-list"><div class="empty">Laden…</div></div>
    </div>
  </main>
</div>

<script>
let token = localStorage.getItem('haven_token') || ''
let _allLogs = []
const BASE = location.origin

async function doLogin() {
  token = document.getElementById('pw').value
  const res = await fetch(BASE + '/api/appointments', { headers: { Authorization: 'Bearer ' + token } })
  if (res.ok) {
    localStorage.setItem('haven_token', token)
    document.getElementById('login').classList.add('hidden')
    document.getElementById('dashboard').classList.remove('hidden')
    load()
  } else {
    document.getElementById('login-err').classList.remove('hidden')
  }
}

function logout() { localStorage.removeItem('haven_token'); location.reload() }

async function load() {
  await Promise.all([loadStatus(), loadAppointments(), loadUsers(), loadLogs()])
}

function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'))
  btn.classList.add('active')
  document.getElementById('panel-' + name).classList.add('active')
}

async function loadStatus() {
  const r = await fetch(BASE + '/api/status')
  const { status } = await r.json()
  updateStatusUI(status)
  document.getElementById('st-status').textContent = status === 'open' ? '🟢 Open' : '🔴 Gesloten'
}

function updateStatusUI(status) {
  const dot = document.getElementById('status-dot')
  const text = document.getElementById('status-text')
  const btn = document.getElementById('toggle-btn')
  if (status === 'open') {
    dot.className = 'dot open'; text.textContent = 'Website is OPEN'
    btn.textContent = 'Sluiten'; btn.className = 'btn btn-danger'
  } else {
    dot.className = 'dot closed'; text.textContent = 'Coming Soon actief'
    btn.textContent = 'Openen'; btn.className = 'btn btn-success'
  }
}

async function toggleStatus() {
  const r = await fetch(BASE + '/api/toggle', { method: 'POST', headers: { Authorization: 'Bearer ' + token } })
  const { status } = await r.json()
  updateStatusUI(status)
}

async function loadAppointments() {
  const r = await fetch(BASE + '/api/appointments', { headers: { Authorization: 'Bearer ' + token } })
  const { appointments } = await r.json()
  const el = document.getElementById('appts-list')
  document.getElementById('st-appts').textContent = appointments ? appointments.length : 0
  document.getElementById('tab-appts-count').textContent = appointments && appointments.length ? '(' + appointments.length + ')' : ''
  if (!appointments || !appointments.length) { el.innerHTML = '<div class="empty">Nog geen afspraken.</div>'; return }
  const sorted = appointments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  el.innerHTML = sorted.map(a => \`
    <div class="item-card">
      <div class="item-head">
        <span class="item-name">\${esc(a.naam)}</span>
        <span class="item-date">\${fmt(a.timestamp)}</span>
      </div>
      <div class="item-sub">\${a.email !== '-' ? '📧 ' + esc(a.email) : ''}\${a.telefoon ? ' · 📞 ' + esc(a.telefoon) : ''}</div>
      <div class="item-msg">\${esc(a.bericht)}</div>
    </div>
  \`).join('')
}

async function loadUsers() {
  const r = await fetch(BASE + '/api/users', { headers: { Authorization: 'Bearer ' + token } })
  const { users } = await r.json()
  const el = document.getElementById('users-list')
  document.getElementById('st-users').textContent = users ? users.length : 0
  document.getElementById('tab-users-count').textContent = users && users.length ? '(' + users.length + ')' : ''
  if (!users || !users.length) { el.innerHTML = '<div class="empty">Nog geen gebruikers geregistreerd.</div>'; return }
  const sorted = users.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
  el.innerHTML = sorted.map(u => \`
    <div class="item-card">
      <div class="item-head">
        <div>
          <span class="item-name">\${esc(u.naam)}</span>
          <span style="margin-left:10px;font-size:12px;color:var(--muted)">\${esc(u.email)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="item-date">Geregistreerd: \${fmt(u.registeredAt)}</span>
          <button class="btn btn-danger btn-sm" onclick="deleteUser('\${esc(u.email)}')">Verwijderen</button>
        </div>
      </div>
    </div>
  \`).join('')
}

async function deleteUser(email) {
  if (!confirm('Gebruiker ' + email + ' verwijderen?')) return
  await fetch(BASE + '/api/users/' + encodeURIComponent(email), {
    method: 'DELETE', headers: { Authorization: 'Bearer ' + token }
  })
  loadUsers()
}

async function loadLogs() {
  const r = await fetch(BASE + '/api/logs', { headers: { Authorization: 'Bearer ' + token } })
  const { logs } = await r.json()
  _allLogs = logs || []
  document.getElementById('st-logs').textContent = _allLogs.length
  document.getElementById('tab-logs-count').textContent = _allLogs.length ? '(' + _allLogs.length + ')' : ''
  renderLogs(_allLogs)
}

function filterLogs(type) {
  const filtered = type ? _allLogs.filter(l => l.type === type) : _allLogs
  renderLogs(filtered)
}

function renderLogs(logs) {
  const el = document.getElementById('logs-list')
  if (!logs.length) { el.innerHTML = '<div class="empty">Geen activiteiten gevonden.</div>'; return }
  const sorted = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  el.innerHTML = sorted.slice(0, 200).map(l => \`
    <div class="item-card" style="padding:12px 18px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        <div>
          <span class="log-type log-\${l.type}">\${l.type}</span>
          <span style="color:#f0ece6;font-size:13px">\${esc(l.naam || l.email || '–')}</span>
          \${l.email && l.naam ? '<span style="font-size:11px;color:var(--muted);margin-left:8px">' + esc(l.email) + '</span>' : ''}
          \${l.details ? '<span style="font-size:11px;color:var(--muted);margin-left:8px">· ' + esc(l.details) + '</span>' : ''}
        </div>
        <span class="item-date">\${fmt(l.timestamp)}</span>
      </div>
    </div>
  \`).join('')
}

function fmt(ts) { return ts ? new Date(ts).toLocaleString('nl-NL') : '–' }
function esc(s) {
  if (!s) return ''
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

if (token) {
  fetch(BASE + '/api/appointments', { headers: { Authorization: 'Bearer ' + token } })
    .then(r => {
      if (r.ok) {
        document.getElementById('login').classList.add('hidden')
        document.getElementById('dashboard').classList.remove('hidden')
        load()
      }
    })
}
</script>
</body>
</html>`

// ─── Worker ───────────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    if (method === 'OPTIONS') return new Response(null, { headers: CORS })

    // ── Admin panel HTML ──
    if (path === '/' || path === '/admin') {
      return new Response(ADMIN_HTML, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } })
    }

    // ── GET /api/status ──
    if (path === '/api/status' && method === 'GET') {
      const status = (await env.HAVEN_KV.get('site_status')) ?? 'coming_soon'
      return json({ status })
    }

    // ── POST /api/contact ──
    if (path === '/api/contact' && method === 'POST') {
      try {
        const body = await request.json()
        if (!body.naam || !body.bericht) return json({ error: 'Missing fields' }, 400)
        const ts = Date.now()
        await env.HAVEN_KV.put(`appointment:${ts}`, JSON.stringify({ ...body, timestamp: new Date(ts).toISOString() }))
        await writeLog(env, 'booking', { naam: body.naam, email: body.email || '–', details: body.bericht?.slice(0, 80) })
        return json({ success: true })
      } catch { return json({ error: 'Invalid request' }, 400) }
    }

    // ── POST /api/register ──
    if (path === '/api/register' && method === 'POST') {
      try {
        const { naam, email, password } = await request.json()
        if (!naam || !email) return json({ error: 'Missing fields' }, 400)
        const key = `user:${email.toLowerCase()}`
        const existing = await env.HAVEN_KV.get(key)
        if (existing) return json({ error: 'Email already in use' }, 409)
        const hash = password ? await sha256(password) : ''
        await env.HAVEN_KV.put(key, JSON.stringify({
          naam, email: email.toLowerCase(), passwordHash: hash,
          registeredAt: new Date().toISOString(),
        }))
        await writeLog(env, 'register', { naam, email: email.toLowerCase() })
        await sendWelcomeEmail(naam, email, env)
        return json({ success: true })
      } catch { return json({ error: 'Invalid request' }, 400) }
    }

    // ── POST /api/login ──
    if (path === '/api/login' && method === 'POST') {
      try {
        const { email, password } = await request.json()
        if (!email || !password) return json({ error: 'Missing fields' }, 400)
        const key = `user:${email.toLowerCase()}`
        const raw = await env.HAVEN_KV.get(key, 'json')
        if (!raw) return json({ error: 'User not found' }, 404)
        const hash = await sha256(password)
        if (raw.passwordHash && raw.passwordHash !== hash) return json({ error: 'Wrong password' }, 401)
        await writeLog(env, 'login', { naam: raw.naam, email: email.toLowerCase() })
        return json({ success: true, naam: raw.naam, email: raw.email })
      } catch { return json({ error: 'Invalid request' }, 400) }
    }

    // ── POST /api/log ──
    if (path === '/api/log' && method === 'POST') {
      try {
        const body = await request.json()
        await writeLog(env, body.type || 'unknown', {
          naam: body.naam, email: body.email, details: body.details,
        })
        return json({ success: true })
      } catch { return json({ error: 'Invalid request' }, 400) }
    }

    // ── GET /api/users (admin) ──
    if (path === '/api/users' && method === 'GET') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
      const list = await env.HAVEN_KV.list({ prefix: 'user:' })
      const users = await Promise.all(list.keys.map(k => env.HAVEN_KV.get(k.name, 'json')))
      return json({ users: users.filter(Boolean).map(u => ({ naam: u.naam, email: u.email, registeredAt: u.registeredAt })) })
    }

    // ── DELETE /api/users/:email (admin) ──
    if (path.startsWith('/api/users/') && method === 'DELETE') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
      const email = decodeURIComponent(path.replace('/api/users/', '')).toLowerCase()
      await env.HAVEN_KV.delete(`user:${email}`)
      await writeLog(env, 'admin', { details: `User deleted: ${email}` })
      return json({ success: true })
    }

    // ── GET /api/logs (admin) ──
    if (path === '/api/logs' && method === 'GET') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
      const list = await env.HAVEN_KV.list({ prefix: 'log:' })
      const logs = await Promise.all(list.keys.map(k => env.HAVEN_KV.get(k.name, 'json')))
      return json({ logs: logs.filter(Boolean) })
    }

    // ── GET /api/appointments (admin) ──
    if (path === '/api/appointments' && method === 'GET') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
      const list = await env.HAVEN_KV.list({ prefix: 'appointment:' })
      const appointments = await Promise.all(list.keys.map(k => env.HAVEN_KV.get(k.name, 'json')))
      return json({ appointments: appointments.filter(Boolean) })
    }

    // ── POST /api/toggle (admin) ──
    if (path === '/api/toggle' && method === 'POST') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
      const current = (await env.HAVEN_KV.get('site_status')) ?? 'coming_soon'
      const next = current === 'open' ? 'coming_soon' : 'open'
      await env.HAVEN_KV.put('site_status', next)
      await writeLog(env, 'admin', { details: `Site status changed to: ${next}` })
      return json({ status: next })
    }

    return new Response('Not found', { status: 404, headers: CORS })
  },
}
